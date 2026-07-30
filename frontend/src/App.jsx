import { Route, Routes } from 'react-router-dom'
import './App.css'

import Landing from './Pages/Public/Landing'
import Login from './Pages/Auth/Login'
import Register from './Pages/Auth/Register'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import MyLands from './Owner/Pages/MyLands'
import LandForm from './Owner/Pages/LandForm'
import OwnerRequests from './Owner/Pages/OwnerRequests'
import OwnerLeases from './Owner/Pages/OwnerLeases'
import Earnings from './Owner/Pages/Earnings'

import BrowseLands from './User/Pages/BrowseLands.jsx'
import LandDetails from './User/Pages/LandDetails.jsx'
import LeaseRequests from './User/Pages/LeaseRequests.jsx'
import ActiveLeases from './User/Pages/ActiveLeases.jsx'
import PaymentHistory from './User/Pages/PaymentHistory.jsx'
import Notifications from './User/Pages/Notifications.jsx'
import Profile from './Pages/shared/Profile.jsx'

import UsersManagement from './Admin/Pages/UsersManagement.jsx'
import OwnersManagement from './Admin/Pages/OwnersManagement.jsx'
import LandListingsManagement from './Admin/Pages/LandListingsManagement.jsx'
import Transactions from './Admin/Pages/Transactions.jsx'
import Reports from './Admin/Pages/Reports.jsx'
import Settings from './Admin/Pages/Settings.jsx'

import AdminDashboard from './Admin/Pages/Dashboard.jsx'
import OwnerDashboard from './Owner/Pages/Dashboard.jsx'
import SeekerDashboard from './User/Pages/Dashboard.jsx'

import ProtectedRoute from './Components/common/ProtectedRoute'

function App() {

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/*<Route path="/redirect" element={<RoleRedirect />} /> */}

        {/* Admin */}
        <Route path="/Admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersManagement /></ProtectedRoute>} />
        <Route path="admin/owners" element={<ProtectedRoute allowedRoles={['admin']}><OwnersManagement /></ProtectedRoute>} />
        <Route path="admin/listings" element={<ProtectedRoute allowedRoles={['admin']}><LandListingsManagement /></ProtectedRoute>} />
        <Route path="admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><Transactions /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><Profile /></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/Owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="owner/lands" element={<ProtectedRoute allowedRoles={['owner']}><MyLands /></ProtectedRoute>} />
        <Route path="owner/lands/new" element={<ProtectedRoute allowedRoles={['owner']}><LandForm mode="create" /></ProtectedRoute>} />
        <Route path="owner/lands/:id/edit" element={<ProtectedRoute allowedRoles={['owner']}><LandForm mode="edit" /></ProtectedRoute>} />
        <Route path="owner/requests" element={<ProtectedRoute allowedRoles={['owner']}><OwnerRequests /></ProtectedRoute>} />
        <Route path="owner/leases" element={<ProtectedRoute allowedRoles={['owner']}><OwnerLeases /></ProtectedRoute>} />
        <Route path="owner/earnings" element={<ProtectedRoute allowedRoles={['owner']}><Earnings /></ProtectedRoute>} />
        <Route path="owner/profile" element={<ProtectedRoute allowedRoles={['owner']}><Profile /></ProtectedRoute>} />

        {/* Land seeker (user) */}
        <Route path='user' element={<ProtectedRoute allowedRoles={['user']}><SeekerDashboard /></ProtectedRoute>} />
        <Route path="user/browse" element={<ProtectedRoute allowedRoles={['user']}><BrowseLands /></ProtectedRoute>} />
        {/* Public can view land details, or maybe only users? The API docs say GET /api/lands/:id is public. Let's leave lands/:id public or user. */}
        <Route path="lands/:id" element={<LandDetails />} />
        <Route path="user/requests" element={<ProtectedRoute allowedRoles={['user']}><LeaseRequests /></ProtectedRoute>} />
        <Route path="user/leases" element={<ProtectedRoute allowedRoles={['user']}><ActiveLeases /></ProtectedRoute>} />
        <Route path="user/payments" element={<ProtectedRoute allowedRoles={['user']}><PaymentHistory /></ProtectedRoute>} />
        <Route path="user/notifications" element={<ProtectedRoute allowedRoles={['user', 'owner', 'admin']}><Notifications /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute allowedRoles={['user', 'owner', 'admin']}><Profile /></ProtectedRoute>} />

      </Routes>
    </>
  )
}

export default App
