import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { useAuth } from "../../contexts/AuthContext";

function Register() {
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    try {
      const user = await register({ fullName, email, phone, password, role });
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/user');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative hidden lg:block">
        <img src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1000&q=70"
          alt="Land" className="absolute inset-0 h-full w-full object-cover"/>

        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <h2 className="text-3xl font-semibold">Share land. Create opportunities.  </h2>

          <p className="mt-2 max-w-sm">Connect landowners with people who need land for farming, gardening and temporary projects.</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="mb-2 text-2xl font-semibold text-lime-500"> Create Account </h1>

          <p className="mb-6 text-sm text-gray-500"> Join LandEase today </p>
          
          {errorMsg && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setRole("user")}
                className={`rounded-xl border-2 p-3 text-left ${role === 'user' ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-lime-300'}`} 
              >
                <span className="font-semibold">Land Seeker</span>
                <span className="mt-1 block text-xs text-gray-500"> I want to lease land </span>
              </button>

              <button 
                type="button" 
                onClick={() => setRole("owner")}
                className={`rounded-xl border-2 p-3 text-left ${role === 'owner' ? 'border-lime-500 bg-lime-50' : 'border-gray-200 hover:border-lime-300'}`}
              >
                <span className="font-semibold">Land Owner</span>
                <span className="mt-1 block text-xs text-gray-500">I want to list land </span>
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-lime-700">Full Name</label>
              <input 
                type="text" 
                // placeholder="Your Name" 
                className="w-full rounded-lg border p-2 text-sm" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-lime-700"> Email</label>
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
              <label className="mb-2 block text-sm font-medium text-lime-700">Phone</label>
              <input 
                type="text" 
                placeholder="" 
                className="w-full rounded-lg border p-2 text-sm" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-lime-700">Password</label>
              <input 
                type="password" 
                // placeholder="At least 6 characters" 
                className="w-full rounded-lg border p-2 text-sm " 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={3}
              />
            </div>

            {/* Create Account */}

            <Button type="submit" disabled={isLoading} className="w-full rounded-lg bg-lime-500 py-2 text-white hover:bg-lime-700">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-lime-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline"> Sign In </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;