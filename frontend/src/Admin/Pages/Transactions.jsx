import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../services/api';
import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { Button } from 'flowbite-react';

function Transactions() {
  const { transactions, loading, error, fetchTransactions } = useAdmin();
  const { token } = useAuth();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTransactions({ status, page, limit: 10 });
  }, [fetchTransactions, status, page]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const data = await apiFetch(`/api/admin/transactions?status=${status}&limit=10000`, { token });
      
      const doc = new jsPDF();
      
      // Header branding
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(101, 163, 13); // Lime 600
      doc.text("LandEase", 14, 20);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Land Leasing Platform - Administration", 14, 25);
      
      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Transaction Report", 14, 38);
      
      // Details
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      const timestamp = new Date().toLocaleString();
      doc.text(`Generated on: ${timestamp}`, 14, 44);
      doc.text(`Status Filter: ${status ? status.toUpperCase() : 'ALL'}`, 14, 49);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 54, 196, 54);
      
      const tableHeaders = [
        ["Transaction ID", "User Name", "Land Title", "Amount", "Method", "Status", "Date"]
      ];
      
      const tableRows = (data.data || []).map(t => [
        t.transactionReference || t._id,
        t.payerId?.fullName || "N/A",
        t.leaseId?.landId?.title || "N/A",
        `₹${t.amount?.toLocaleString()}`,
        t.paymentMethod?.toUpperCase() || "DEMO",
        t.status?.toUpperCase() || "PENDING",
        new Date(t.createdAt).toLocaleDateString()
      ]);
      
    autoTable(doc,{
        startY: 60,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [101, 163, 13],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [247, 254, 231]
        },
        margin: { left: 14, right: 14 },
        styles: {
          overflow: 'linebreak',
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 45 },
          3: { cellWidth: 20 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 18 }
        }
      });
      
      doc.save(`transaction_report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      alert(err.message || 'Export to PDF failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Transactions Ledger</h1>
            <p className="text-sm text-gray-500">Monitor all transactions and revenue processed on the platform.</p>
          </div>
          <div className="rounded-xl border border-lime-200 bg-lime-100 p-4 text-right shadow-sm">
            <p className="text-xs font-semibold text-lime-800 uppercase">Total Revenue (Filtered)</p>
            <p className="text-2xl font-bold text-lime-700">₹{transactions.totalSuccessAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-lime-500 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <Button
            onClick={handleExportPDF}
            disabled={exporting || transactions.data.length === 0}
            className="bg-lime-600 hover:bg-lime-700 text-white font-semibold flex items-center justify-center shadow-sm"
          >
            {exporting ? 'Exporting...' : 'Export PDF Report'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          {loading ? (
            <div className="py-10 text-center text-lime-600">Loading transactions...</div>
          ) : transactions.data.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No transactions found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-lime-100 text-xs uppercase text-lime-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Txn Reference</th>
                  <th className="px-4 py-3 font-semibold">Gateway Order ID</th>
                  <th className="px-4 py-3 font-semibold">Gross Amount</th>
                  <th className="px-4 py-3 font-semibold">Platform Cut (Rev)</th>
                  <th className="px-4 py-3 font-semibold">Owner Payout</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.data.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{t.transactionReference}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.gatewayOrderId}</td>
                    <td className="px-4 py-3 text-gray-600">₹{t.amount}</td>
                    <td className="px-4 py-3 font-bold text-lime-600">₹{t.commissionAmount || 0} ({t.commissionPercent || 0}%)</td>
                    <td className="px-4 py-3 font-medium text-gray-900">₹{t.netOwnerAmount != null ? t.netOwnerAmount : t.amount}</td>
                    <td className="px-4 py-3 capitalize">{t.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.status === 'success' ? 'bg-green-100 text-green-800' :
                        t.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && transactions.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {transactions.page} of {transactions.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={transactions.page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={transactions.page === transactions.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;