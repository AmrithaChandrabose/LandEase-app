import { Button } from 'flowbite-react';
import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../Components/common/ThemeToggle.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/user');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleEmail) => {
    setEmail(roleEmail);
    setPassword('pass123'); // assuming standard demo password
  };

  return (
    <>
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

  {/* Left Side */}
  <div className="relative hidden lg:block">
    <img src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1000&q=70"
      alt="Land" className="absolute inset-0 h-full w-full object-cover"/>
    <div className="absolute inset-0 bg-black/50" />
    <div className="absolute bottom-10 left-10 right-10 text-white">
      <h2 className="text-3xl font-semibold">Land that works while it waits. </h2>
      <p className="mt-2 max-w-sm"> List idle acres or find the right plot for your next season. </p>
    </div>
  </div>

  {/* Right Side */}
  <div className="flex items-center justify-center px-4 py-10 sm:px-8">
    <div className="w-full max-w-sm">

      <h1 className="mb-2 text-2xl text-lime-500 font-semibold"> Welcome back</h1>
      <p className="mb-6 text-sm text-gray-500">Sign in to your LandEase account</p>
      
      {errorMsg && (
        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 ">
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <div >
          <label className="mb-2 block text-lime-700 text-sm font-medium"> Email </label>
          <input 
            type="email" 
            // placeholder="you@example.com"  
            className="w-full rounded-lg border p-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-lime-700 text-sm font-medium"> Password</label>
          <input 
            type="password"  
            // placeholder="••••••••" 
            className="w-full rounded-lg border p-2 text-sm" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password"  className="text-sm text-lime-600 hover:underline" >Forgot password? </Link>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full rounded-lg bg-lime-500 py-2 text-white hover:bg-lime-700"> 
          {isLoading ? 'Signing in...' : 'Sign In'} 
        </Button>
      </form>

        {/* <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">Quick demo logins</p>
        <div className="flex gap-2">
            <button type="button" onClick={() => demoLogin('admin@demo.com')} className="flex-1 rounded-lg bg-lime-100 px-2 py-1.5 text-xs font-medium text-dark ring-1  hover:bg-lime-200">Admin</button>
            <button type="button" onClick={() => demoLogin('owner@demo.com')} className="flex-1 rounded-lg bg-lime-100 px-2 py-1.5 text-xs font-medium text-dark ring-1 hover:bg-lime-200">Owner</button>
            <button type="button" onClick={() => demoLogin('user@demo.com')} className="flex-1 rounded-lg bg-lime-100 px-2 py-1.5 text-xs font-medium text-dark ring-1 hover:bg-lime-200">User</button>
        </div>
      </div>
      <br /> */}
       <p className='text-center text-lime-600 mt-2'> New here? <Link to="/register" className="font-semibold  hover:underline">Create an account</Link></p>
    </div>
  </div>

</div>
    </>
  )
}

export default Login
