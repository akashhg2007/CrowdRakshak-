import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('crowdmind_token');
  const role = localStorage.getItem('crowdmind_role');

  const handleSignOut = () => {
    localStorage.removeItem('crowdmind_token');
    localStorage.removeItem('crowdmind_role');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wider transition-colors ${
      isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/15 bg-black/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <Link to="/" className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-signal-blue" />
          <span className="font-mono text-sm font-bold tracking-widest text-white">
            CROWDMIND AI <span className="text-neutral-500">· v1.0</span>
          </span>
        </Link>



        {/* Right Section */}
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="hidden text-xs font-mono text-neutral-400 sm:inline-block">
                {role === 'admin' ? 'sysadmin@crowdmind.ai' : 'operator@crowdmind.ai'}
              </span>
              <button 
                onClick={handleSignOut}
                className="rounded border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-white/5"
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="rounded border border-signal-blue bg-signal-blue/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-signal-blue transition-colors hover:bg-signal-blue hover:text-white"
            >
              SYSTEM LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
