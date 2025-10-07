import React, { useState } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { login, register, logout, user, isAuthenticated } = useKindeAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full z-30  backdrop-blur-md  shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4" >
        {/* Logo */}
        <h1
          onClick={() => navigate('/docs')}
          className="md:text-2xl sm:text-xl font-extrabold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors duration-300 ml-3   "
        >
          Vscribe
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6">
          {!isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={login}
                  className="rounded bg-white-100 px-6 py-2 text-base font-semibold text-black shadow-lg transition duration-300 transform hover:scale-105 hover:bg-blue-100 focus:outline-none focus:ring-2  focus:ring-offset-2"
                >
                  Login
                </button>
              </li>
            
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={logout}
                  className="rounded-full bg-red-300 px-6 py-2 text-base font-semibold text-black shadow-lg transition duration-300 transform hover:scale-105 hover:bg-red-400 focus:outline-none focus:ring-2  focus:ring-offset-2"
                >
                  Logout
                </button>
              </li>
              <li>
                <span className="text-gray-900 text-lg font-medium">
                  Welcome, <span className="font-bold">{user?.givenName || user?.name}</span>
                </span>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-900 hover:text-gray-700 focus:outline-none transition-colors duration-300"
            aria-label="Toggle navigation menu cursor-pointer"
          >
            {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden w-full bg-white/80 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden cursor-pointer'
        }`}
      >
        <ul className="flex flex-col items-center space-y-4">
          {!isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={() => { login(); setIsOpen(false); }}
                  className="w-48 rounded-full bg-blue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => { register(); setIsOpen(false); }}
                  className="w-48 rounded-full bg-green-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Register
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-48 rounded-full bg-red-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Logout
                </button>
              </li>
              <li>
                <span className="text-gray-900 text-center text-lg font-medium">
                  Welcome, <br /><span className="font-bold">{user?.givenName || user?.name}</span>
                </span>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
