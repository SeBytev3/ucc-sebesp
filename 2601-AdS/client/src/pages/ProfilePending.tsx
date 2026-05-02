import React from 'react';
import Layout from '../components/Layout';
import { Clock, ShieldCheck, Mail } from 'lucide-react';

const ProfilePending: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 text-center space-y-8 bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-50 rounded-full">
          <Clock className="h-16 w-16 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Perfil en Revisión</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          ¡Gracias por unirte a ServiMarket! Un administrador revisará tu perfil en las próximas
          24-48 horas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-8">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-start space-x-3">
            <ShieldCheck className="h-6 w-6 text-indigo-500 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Verificación de datos</h4>
              <p className="text-xs text-gray-500">
                Aseguramos la calidad de nuestros proveedores.
              </p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl flex items-start space-x-3">
            <Mail className="h-6 w-6 text-indigo-500 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Notificación vía App</h4>
              <p className="text-xs text-gray-500">
                Recibirás un aviso cuando tu cuenta sea aprobada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePending;
