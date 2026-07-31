import React, { useEffect, useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// import 'jspdf-autotable';



function Reports() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [landsBreakdown, setLandsBreakdown] = useState(null);
  const [topOwners, setTopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [sumData, landsData, ownersData] = await Promise.all([
          apiFetch('/api/admin/reports/summary', { token }),
          apiFetch('/api/admin/reports/lands', { token }),
          apiFetch('/api/admin/reports/top-owners', { token })
        ]);
        setSummary(sumData);
        setLandsBreakdown(landsData);
        setTopOwners(ownersData?.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadReports();
    }
  }, [token]);

  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const data = await apiFetch('/api/admin/transactions?limit=10000', { token });
      
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
      doc.text(`Status Filter: ALL`, 14, 49);
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-lime-700 font-medium">Loading reports and analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lime-50">
        <UserLayout />
        <div className="mx-auto max-w-7xl p-6">
          <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime-50">
      <UserLayout />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-lime-700">Platform Reports</h1>
            <p className="text-sm text-gray-500">View performance indicators and system diagnostics.</p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-700 transition disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export Transactions (PDF)'}
          </button>
        </div>

        {/* Section 1: KPI Panels */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.users?.total || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.users?.owners || 0} Owners · {summary?.users?.seekers || 0} Seekers
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Lands Listing</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.lands?.total || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.lands?.available || 0} Available · {summary?.lands?.leased || 0} Leased
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Active Leases</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.leases?.active || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              Completed leases: {summary?.leases?.completed || 0}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Gross Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-lime-600">₹{summary?.payments?.revenue?.toLocaleString() || 0}</p>
            <div className="mt-2 text-xs text-gray-500">
              {summary?.payments?.successfulPayments || 0} successful transfers
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Breakdowns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lands by Location */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Lands by Location</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Total Listings</th>
                    <th className="px-4 py-2">Average Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {landsBreakdown?.byLocation?.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-sm">No locations mapped.</td>
                    </tr>
                  ) : (
                    landsBreakdown?.byLocation?.map((loc, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-900 font-medium">📍 {loc.location}</td>
                        <td className="px-4 py-2">{loc.count} listings</td>
                        <td className="px-4 py-2 font-semibold">₹{loc.avgPrice?.toLocaleString()}/mo</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Owners */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Top Earning Landowners</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {topOwners.length === 0 ? (
                  <p className="py-4 text-sm text-gray-500">No earnings logged.</p>
                ) : (
                  topOwners.map((owner) => (
                    <li key={owner.ownerId} className="py-3 flex justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{owner.fullName}</p>
                        <p className="text-xs text-gray-500">{owner.email} · {owner.payments} payouts</p>
                      </div>
                      <span className="text-sm font-bold text-lime-600">₹{owner.earnings?.toLocaleString()}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Reports;