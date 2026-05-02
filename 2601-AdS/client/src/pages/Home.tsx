import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { AlertCircle, ArrowRight, CheckCircle, Clock, XCircle, Mail } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lógica de bienvenida: solo si es proveedor aprobado y no ha sido saludado en esta sesión
    if (user?.role === 'PROVIDER' && user.providerProfile?.status === 'APPROVED') {
      const welcomed = sessionStorage.getItem(`welcomed_${user.id}`);
      if (!welcomed) {
        setShowWelcome(true);
        sessionStorage.setItem(`welcomed_${user.id}`, 'true');
        const timer = setTimeout(() => {
          setShowWelcome(false);
          navigate('/requests'); // Proveedores aprobados van a sus solicitudes por defecto
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, navigate]);

  if (!user) return <Navigate to="/login" />;

  // 1. Admin siempre va a su dashboard
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;

  // 2. Si es Proveedor Aprobado y no estamos mostrando la bienvenida -> ir a solicitudes
  if (user.role === 'PROVIDER' && user.providerProfile?.status === 'APPROVED' && !showWelcome) {
    return <Navigate to="/requests" />;
  }

  // Pantalla de Bienvenida (5 segundos)
  if (showWelcome) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-bounce">
          <CheckCircle className="h-20 w-20 text-green-500" />
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">¡Bienvenido a Bordo!</h2>
          <p className="text-xl text-gray-600">
            Tu perfil ha sido aprobado. Ya puedes recibir solicitudes.
          </p>
        </div>
      </Layout>
    );
  }

  // Lógica de otros estados de Proveedor
  if (user.role === 'PROVIDER') {
    const profile = user.providerProfile;

    // A. No tiene perfil creado
    if (!profile) {
      return (
        <Layout>
          <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-indigo-600 p-8 text-white text-center">
              <h2 className="text-3xl font-bold italic tracking-tighter">
                ¡Hola, {user.firstName}!
              </h2>
              <p className="mt-2 text-indigo-100">
                Para empezar a trabajar, necesitamos conocerte.
              </p>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full">
                <AlertCircle className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Tu perfil profesional está incompleto
              </h3>
              <p className="text-gray-600">
                Completa tu información para que podamos validar tu cuenta.
              </p>
              <Link
                to="/complete-profile"
                className="inline-flex items-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-105"
              >
                Completar Perfil Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </Layout>
      );
    }

    // B. Pendiente (Amarillo)
    if (profile.status === 'PENDING') {
      return (
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-8 bg-white p-12 rounded-3xl shadow-sm border-t-8 border-yellow-400">
            <Clock className="h-20 w-20 text-yellow-500 mx-auto animate-pulse" />
            <h2 className="text-3xl font-extrabold text-gray-900">Perfil en Revisión</h2>
            <p className="text-lg text-gray-600">
              Estamos validando tu información profesional. Recibirás una notificación pronto.
            </p>
            <div className="pt-4">
              <Link to="/requests" className="text-indigo-600 font-bold hover:underline">
                Ir a Mis Solicitudes
              </Link>
            </div>
          </div>
        </Layout>
      );
    }

    // C. Rechazado (Rojo)
    if (profile.status === 'REJECTED') {
      return (
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-8 bg-white p-12 rounded-3xl shadow-sm border-t-8 border-red-500">
            <XCircle className="h-20 w-20 text-red-600 mx-auto" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Solicitud No Aprobada
            </h2>
            <div className="bg-red-50 p-6 rounded-2xl text-red-800 text-sm border border-red-100">
              <p className="font-bold mb-1 uppercase tracking-wider text-xs">Motivo del rechazo:</p>
              <p className="italic">
                "{profile.rejectionReason || 'No se proporcionó un motivo específico.'}"
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <p className="text-gray-600">Puedes corregir tu información y volver a intentarlo.</p>
              <Link
                to="/complete-profile"
                className="inline-flex items-center px-10 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all hover:scale-105"
              >
                Corregir Perfil y Re-enviar
              </Link>
              <div className="flex items-center justify-center text-xs text-gray-400 mt-8">
                <Mail className="h-3 w-3 mr-1" />
                Dudas: soporte@servimarket.com
              </div>
            </div>
          </div>
        </Layout>
      );
    }
  }

  // 3. Cliente (y Proveedores aprobados que pasaron el filtro anterior)
  return <Navigate to="/categories" />;
};

export default Home;
