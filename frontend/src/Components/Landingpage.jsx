import React from 'react'

function Landingpage() {
  return (
    <div>Landingpage</div>
  )
}

export default Landingpage




import { Outlet, NavLink } from "react-router-dom";

function UserLayout() {
  return (
    <div className="min-h-screen bg-lime-100">
      {/* Navbar */}
      <header className="bg-lime-200 shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-lime-700">
            LandEase
          </h1>

          {/* Navigation */}
          <nav className="flex gap-6">
            <NavLink
              to="/user"
              className="text-lime-700 font-medium hover:text-lime-900"
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/user/properties"
              className="text-lime-700 font-medium hover:text-lime-900"
            >
              Properties
            </NavLink>

            <NavLink
              to="/user/bookings"
              className="text-lime-700 font-medium hover:text-lime-900"
            >
              Bookings
            </NavLink>

            <NavLink
              to="/user/profile"
              className="text-lime-700 font-medium hover:text-lime-900"
            >
              Profile
            </NavLink>
          </nav>

          {/* User */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-lime-600 text-white flex items-center justify-center font-semibold">
              A
            </div>

            <button className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;

//  {nav.map((n) => (
//                             <NavLink key={n.to}to={n.to} end={n.end}
//                                 className={({ isActive }) =>
//                                     `rounded-lg px-4 py-2 text-sm font-medium transition ${isActive
//                                         ? "bg-lime-100 text-lime-700"
//                                         : "text-gray-600 hover:bg-green-50 hover:text-lime-700"
//                                     }` } >
//                                 {n.label}
//                             </NavLink>
//                         ))}