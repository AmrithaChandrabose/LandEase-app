import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { IconDashboard, IconSearch, IconRequest, IconLease, IconWallet, IconUser, IconBell } from '../Components/common/Icons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import ThemeToggle from '../Components/common/ThemeToggle.jsx'

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
    const { user, logout } = useAuth();
    const [menu, setMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    let nav = seekerNav;
    if (user?.role === 'owner') nav = ownerNav;
    else if (user?.role === 'admin') nav = adminNav;

    const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

    return (
        <div className="relative">
            {/* Top glass navigation */}
            <header className="sticky top-0 z-30 border-b border-lime-100/80 bg-white/75 backdrop-blur-md shadow-sm transition-all duration-300">
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
                                        : "text-gray-600 hover:bg-lime-50 hover:text-lime-700"
                                    }` } 
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right User Actions */}
                    <div className="flex items-center gap-4">
                        <NavLink 
                            to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'owner' ? '/owner/profile' : '/profile'}
                            className="relative rounded-full p-2 text-gray-500 hover:bg-lime-50 hover:text-lime-600 transition-colors"
                        >
                            <IconBell />
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow"> 0 </span>
                        </NavLink>

                        <ThemeToggle />

                        {/* Profile Link Card */}
                        <NavLink 
                            to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'owner' ? '/owner/profile' : '/profile'}
                            className="flex items-center gap-2 group cursor-pointer"
                        >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-400 text-white flex items-center justify-center font-bold shadow-sm shadow-lime-100 group-hover:scale-105 transition-transform duration-200 uppercase">  
                                {userInitial} 
                            </div>
                            <div className="hidden lg:block text-left">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight group-hover:text-lime-700 transition-colors">{user?.fullName || 'User'}</p>
                              <p className="text-[9px] font-semibold text-lime-600 uppercase tracking-widest leading-none mt-0.5">{user?.role}</p>
                            </div>
                        </NavLink>

                        <button 
                            onClick={handleLogout}
                            className="rounded-xl border border-lime-200 bg-white px-3.5 py-1.5 text-xs font-bold text-lime-700 hover:bg-lime-500 hover:text-white hover:border-lime-500 shadow-sm transition-all duration-300 cursor-pointer"
                        >  
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
        </div>
    )
}
export default UserLayout