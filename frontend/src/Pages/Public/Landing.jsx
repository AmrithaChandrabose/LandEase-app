import React from 'react'
import { Link } from "react-router-dom";
import ThemeToggle from '../../Components/common/ThemeToggle.jsx';

const features = [
  {
    title: "Verified parcels",
    body: "Every listing contains clear area, type and lease terms."
  },
  {
    title: "Lease, not buy",
    body: "Lease land for months or years and manage everything in one place."
  },
  {
    title: "Owners earn",
    body: "Convert unused land into income by listing it easily."
  }
];

function Landing() {
  return (
    <> 
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-lime-100 to-lime-300">
      {/* Header */}
      <header className=" mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <h1 className="text-3xl font-bold text-lime-700">Land Sharing & Leasing Platform</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="rounded-lg border border-lime-500 px-5 py-2 text-green-700 hover:bg-green-100" >
            Sign In </Link>
          <Link to="/register" className="rounded-lg bg-lime-500 px-5 py-2 text-white hover:bg-lime-600" >Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          
          {/* Left */}
          <div>
            {/* <span className="rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">Land Sharing & Leasing Platform </span> */}
            
            <h1 className="mt-6 text-5xl font-extrabold  leading-tight text-gray-800" >
              Find land to use. <br /> 
              Or share the land you own. </h1>
            <p className="mt-6 max-w-lg text-gray-500"> Connect landowners with people who need land for farming,
              gardening, construction, storage or temporary projects. </p>

            <div className="mt-8 flex gap-4">
              <Link to="/register" className="rounded-lg bg-lime-500 px-6 py-3 text-white hover:bg-lime-600" > Browse Lands </Link>
              <Link to="/register" className="rounded-lg border border-green-700 px-6 py-3 text-green-700 hover:bg-green-100"> List Your Land  </Link>
            </div>
            <div className="mt-10 flex gap-10">
              <div>
                <h2 className="text-3xl font-bold text-lime-700">  1200+ </h2>
                <p className="text-gray-500"> Acres Listed </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-lime-700">340 </h2>
                <p className="text-gray-500">Active Leases </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-lime-700"> 14</h2>
                <p className="text-gray-500">Districts</p>
              </div>
            </div>
          </div>

          {/* Right */}

          <div className="relative">
            <img
              src="https://media.istockphoto.com/id/1437629749/photo/land-plot-in-aerial-view-in-chiang-mai-of-thailand.jpg?s=2048x2048&w=is&k=20&c=Vh0kDWc6kurcb8NMNlskicCClcAWtIt9Wd7e1KVG0Ic="
              alt="land"
              className="h-[450px] w-full rounded-3xl object-cover shadow-lg" />

            <div className="absolute bottom-5 left-5 rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Riverside Paddy Field </p>
              <h2 className="text-2xl font-bold text-lime-700"> ₹18,000/month</h2>
              <p className="text-sm text-gray-500"> Thrissur • 2 Acres </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-8 shadow">
              <h3 className="text-2xl font-bold text-lime-700"> {item.title}
              </h3>
              <p className="mt-4 text-gray-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/* <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-teal-300 to-cyan-200 text-gray-900 px-10 py-14 text-center text-white">
          <h2 className="text-4xl font-bold">Ready to get started? </h2>
          <p className="mt-4">Create an account as a User or Land Owner. </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register" className="rounded-lg bg-white px-6 py-3 text-lime-700 hover:bg-gray-100">Create Account </Link>

            <Link to="/login"  className="rounded-lg border border-white px-6 py-3 hover:bg-lime-500" > Sign In </Link>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t py-6 text-center text-gray-500">
        © {new Date().getFullYear()} LandEase. All Rights Reserved.
      </footer>
    </div>
    </>
  )
}

export default Landing