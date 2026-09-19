import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let isDispatcherOrAdmin = true;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined") {
      const parsedUser = JSON.parse(storedUser);
      const userRole = String(parsedUser?.role || parsedUser?.roles || parsedUser?.authorities || '').toUpperCase();
      if (userRole.includes('TECHNICIAN') && !userRole.includes('ADMIN') && !userRole.includes('DISPATCHER') && !userRole.includes('MANAGER')) {
        isDispatcherOrAdmin = false;
      }
    }
  } catch (e) {
    console.warn("Couldn't parse user role", e);
  }

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center shadow-2xl">
      <Link to="/dashboard" className="no-underline">
        <Logo />
      </Link>

      <div className="flex items-center gap-6">
        {token ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            
            {isDispatcherOrAdmin && (
              <Link to="/create-order" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                Create Order
              </Link>
            )}

            <Link to="/track" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Track Order
            </Link>

            <button 
              onClick={handleLogoutClick} 
              className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Login
            </Link>
            <Link to="/track" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Track Order
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;