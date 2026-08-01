import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { IconDashboard, IconSearch, IconRequest, IconLease, IconWallet, IconUser, IconBell } from '../Components/common/Icons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import ThemeToggle from '../Components/common/ThemeToggle.jsx'
import { apiFetch } from '../services/api'

const seekerNav = [
    { to: '/user', label: 'Dashboard', icon: <IconDashboard />, end: true },
    { to: '/user/browse', label: 'Browse Lands', icon: <IconSearch /> },
    { to: '/user/requests', label: 'My Requests', icon: <IconRequest /> },
    { to: '/user/leases', label: 'Active Leases', icon: <IconLease /> },
    { to: '/user/payments', label: 'Payments', icon: <IconWallet /> },
];

const ownerNav = [
    { to: '/owner', label: 'Dashboard', icon: <IconDashboard />, end: true },
    { to: '/owner/lands', label: 'My Lands', icon: <IconSearch /> },
    { to: '/owner/requests', label: 'Lease Requests', icon: <IconRequest /> },
    { to: '/owner/leases', label: 'Active Leases', icon: <IconLease /> },
    { to: '/owner/earnings', label: 'Earnings Log', icon: <IconWallet /> },
];

const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
    { to: '/admin/users', label: 'Users', icon: <IconUser /> },
    { to: '/admin/owners', label: 'Owners', icon: <IconUser /> },
    { to: '/admin/listings', label: 'Listings', icon: <IconSearch /> },
    { to: '/admin/transactions', label: 'Transactions', icon: <IconWallet /> },
    { to: '/admin/reports', label: 'Reports & KPIs', icon: <IconRequest /> },
    { to: '/admin/settings', label: 'Settings', icon: <IconUser /> },
];

function UserLayout() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [menu, setMenu] = useState(false);

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        async function loadNotifications() {
            if (!token) return;
            try {
                const res = await apiFetch('/api/notifications', { token });
                const list = res.data || [];
                setNotifications(list);
                setUnreadCount(list.filter(n => !n.isRead).length);
            } catch (err) {
                console.error("Failed to load notifications:", err);
            }
        }
        loadNotifications();
    }, [token]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.notif-container')) {
                setNotifOpen(false);
            }
            if (!e.target.closest('.profile-container')) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT', token });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await apiFetch('/api/notifications/read-all', { method: 'PUT', token });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    let nav = seekerNav;
    if (user?.role === 'owner') nav = ownerNav;
    else if (user?.role === 'admin') nav = adminNav;

    const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative">
            {/* Top glass navigation */}
            <header className="sticky top-0 z-30 border-b border-lime-100/80 bg-white/75 backdrop-blur-md shadow-sm transition-all duration-300 dark:border-gray-800">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                    {/* Logo branding */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(user?.role === 'admin' ? '/admin' : user?.role === 'owner' ? '/owner' : '/user')}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-lime-600 to-emerald-500 text-white font-bold shadow-md shadow-lime-200">
                        LE
                      </div>
                      <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-lime-700 to-emerald-600 bg-clip-text text-transparent">
                          LandEase
                      </span>
                    </div>

                    {/* Desktop nav links */}
                    <nav className="hidden items-center gap-1.5 md:flex">
                        {nav.map((n) => (
                            <NavLink 
                                key={n.to} 
                                to={n.to} 
                                end={n.end}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${isActive
                                        ? "bg-lime-500 text-white shadow-sm shadow-lime-100"
                                        : "text-gray-600 hover:bg-lime-50 hover:text-lime-700 dark:text-gray-300"
                                    }` } 
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right User Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications Dropdown */}
                        <div className="relative notif-container">
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifOpen(!notifOpen);
                                  setProfileOpen(false);
                                }}
                                className="relative rounded-full p-2 text-gray-500 hover:bg-lime-50 hover:text-lime-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <IconBell />
                                {unreadCount > 0 && (
                                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow"> 
                                    {unreadCount} 
                                  </span>
                                )}
                            </button>

                            {notifOpen && (
                              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-4 shadow-xl z-50 dark:bg-gray-900 dark:border-gray-800">
                                <div className="mb-2 flex items-center justify-between border-b pb-2 dark:border-gray-800">
                                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Notifications</h3>
                                  {unreadCount > 0 && (
                                    <button 
                                      onClick={handleMarkAllAsRead}
                                      className="text-[10px] font-bold text-lime-600 hover:underline dark:text-lime-400"
                                    >
                                      Mark all read
                                    </button>
                                  )}
                                </div>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                  {notifications.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-gray-400">No notifications</p>
                                  ) : (
                                    notifications.slice(0, 5).map((n) => (
                                      <div 
                                        key={n._id} 
                                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                        className={`flex flex-col p-2 rounded-lg text-left text-xs transition cursor-pointer ${n.isRead ? 'opacity-60 hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-lime-50 hover:bg-lime-100 text-lime-900 dark:bg-slate-800 dark:text-lime-100'}`}
                                      >
                                        <p className="font-semibold">{n.message}</p>
                                        <span className="mt-1 text-[9px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                                <div className="mt-2 border-t pt-2 text-center dark:border-gray-800">
                                  <NavLink 
                                    to="/user/notifications"
                                    onClick={() => setNotifOpen(false)}
                                    className="text-xs font-semibold text-lime-600 hover:underline dark:text-lime-400"
                                  >
                                    View all notifications
                                  </NavLink>
                                </div>
                              </div>
                            )}
                        </div>

                        <ThemeToggle />

                        {/* Profile Dropdown */}
                        <div className="relative profile-container">
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProfileOpen(!profileOpen);
                                  setNotifOpen(false);
                                }}
                                className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                            >
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-400 text-white flex items-center justify-center font-bold shadow-sm shadow-lime-100 group-hover:scale-105 transition-transform duration-200 uppercase">  
                                    {userInitial} 
                                </div>
                                <div className="hidden lg:block text-left">
                                  <p className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight group-hover:text-lime-700 transition-colors dark:text-gray-300 dark:group-hover:text-lime-400">{user?.fullName || 'User'}</p>
                                  <p className="text-[9px] font-semibold text-lime-600 uppercase tracking-widest leading-none mt-0.5">{user?.role}</p>
                                </div>
                            </button>

                            {profileOpen && (
                              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl z-50 dark:bg-gray-900 dark:border-gray-800">
                                <div className="px-4 py-2 border-b dark:border-gray-800">
                                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{user?.fullName}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                                </div>
                                <NavLink 
                                  to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'owner' ? '/owner/profile' : '/profile'}
                                  onClick={() => setProfileOpen(false)}
                                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-lime-50 hover:text-lime-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-lime-400"
                                >
                                  My Profile
                                </NavLink>
                                <button 
                                  onClick={() => {
                                    setProfileOpen(false);
                                    handleLogout();
                                  }}
                                  className="w-full text-left block px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800"
                                >
                                  Sign Out
                                </button>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}
export default UserLayout