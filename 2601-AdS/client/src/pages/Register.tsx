import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, Loader2, User, Briefcase } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'PROVIDER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.error?.details) {
        // Zod validation errors from backend
        const details = err.response.data.error.details;
        const messages = details.map((d: any) => d.message).join('. ');
        setError(messages);
      } else {
        setError(err.response?.data?.message || 'Error al crear la cuenta. Revisa los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crea tu cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                formData.role === 'CUSTOMER'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <User className="h-8 w-8 mb-2" />
              <span className="text-sm font-bold">Soy Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                formData.role === 'PROVIDER'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <Briefcase className="h-8 w-8 mb-2" />
              <span className="text-sm font-bold">Soy Proveedor</span>
            </button>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-2 gap-0">
              <input
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tl-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tr-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <input
              name="email"
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="px-3 py-2 bg-gray-50 border-x border-gray-300 text-[10px] text-gray-500 space-y-1">
              <p className="font-semibold">La contraseña debe tener:</p>
              <ul className="grid grid-cols-2 gap-x-2">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  • Mín. 8 caracteres
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  • Una mayúscula
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  • Una minúscula
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  • Un número
                </li>
              </ul>
            </div>
            <input
              name="phone"
              type="tel"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Teléfono (opcional)"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {loading ? (
                  <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                )}
              </span>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
