// frontend/src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold">GAI</span>
          </div>
          <h1 className="text-xl font-bold text-white">GuardianAI</h1>
        </Link>

        <nav className="hidden md:flex space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link to="/cameras" className="hover:text-blue-400 transition-colors">Cameras</Link>
              <Link to="/incidents" className="hover:text-blue-400 transition-colors">Incidents</Link>
              <Link to="/notifications" className="hover:text-blue-400 transition-colors">Notifications</Link>
              <Link to="/reports" className="hover:text-blue-400 transition-colors">Reports</Link>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
          )}
        </nav>

        {isAuthenticated && (
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Logout
          </button>
        )}

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
