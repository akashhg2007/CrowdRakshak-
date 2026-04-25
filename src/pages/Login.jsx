import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Users, Shield } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.role=admin`;
    localStorage.setItem('crowdmind_token', fakeJwt);
    localStorage.setItem('crowdmind_role', 'admin');
    
    navigate('/admin');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#050505] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-black to-black pointer-events-none"></div>
      
      <div className="w-full max-w-md border border-white/10 bg-black/80 backdrop-blur-md p-8 relative z-10 rounded-xl">
        <div className="flex flex-col items-center mb-8">
          <Shield className="h-10 w-10 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold uppercase tracking-widest text-white">SYSTEM ADMIN</h2>
          <p className="text-sm text-neutral-500 font-mono mt-2">AUTHORIZATION REQUIRED</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-400">ADMIN ID</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-red-600 font-mono rounded"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-neutral-400">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-red-600 font-mono tracking-widest rounded"
              required
            />
          </div>

          <button 
            type="submit" 
            className="group flex items-center justify-center gap-2 hover:bg-opacity-80 transition-colors py-3 mt-4 text-sm font-bold uppercase tracking-wider bg-red-600 rounded"
          >
            <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  );
}
