import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  Menu,
  LayoutDashboard,
  Search,
  ClipboardList,
  Briefcase,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600 tracking-tight italic">
                ServiMarket
              </span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {user?.role !== 'PROVIDER' && (
                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <Search className="h-4 w-4 mr-1" />
                  Explorar Servicios
                </NavLink>
              )}

              <NavLink
                to="/requests"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all ${
                    isActive
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                <Briefcase className="h-4 w-4 mr-1" />
                Mis Solicitudes
              </NavLink>

              {user?.role === 'PROVIDER' && (
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Mi Panel
                </NavLink>
              )}

              {user?.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  Admin Queue
                </NavLink>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-6">
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-1.5 rounded-2xl border border-gray-100">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-900 leading-tight">
                  {user?.firstName}
                </span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                  {user?.role === 'PROVIDER'
                    ? 'Profesional'
                    : user?.role === 'ADMIN'
                      ? 'Admin'
                      : 'Cliente'}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center space-x-1.5 text-sm font-bold text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none ring-2 ring-indigo-500">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
