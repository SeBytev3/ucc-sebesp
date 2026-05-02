import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  User,
  Briefcase,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  requestedAt: string;
  providerResponseNotes: string | null;
  customer: {
    firstName: string;
    lastName: string;
  };
  provider: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  category: {
    nameEs: string;
    nameEn: string;
  };
}

const statusConfig = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="h-4 w-4" />,
    label: 'Pendiente',
  },
  ACCEPTED: {
    color: 'bg-blue-100 text-blue-800',
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Aceptado',
  },
  DECLINED: {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Rechazado',
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Completado',
  },
  CANCELLED: {
    color: 'bg-gray-100 text-gray-800',
    icon: <XCircle className="h-4 w-4" />,
    label: 'Cancelado',
  },
};

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const role = user?.role === 'PROVIDER' ? 'received' : 'sent';
      const response = await api.get(`/requests?role=${role}`);
      setRequests(response.data.requests || []);
    } catch (err: any) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: string, notes?: string) => {
    setActionLoading(id);
    try {
      if (action === 'accept' || action === 'decline') {
        await api.patch(`/requests/${id}/respond`, { action, notes });
      } else if (action === 'complete') {
        await api.patch(`/requests/${id}/complete`);
      } else if (action === 'cancel') {
        await api.patch(`/requests/${id}/cancel`);
      }
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar la acción');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Solicitudes</h1>
            <p className="mt-1 text-gray-500">
              {user?.role === 'PROVIDER'
                ? 'Gestiona los trabajos que te han solicitado los clientes.'
                : 'Sigue el estado de los servicios que has pedido.'}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay solicitudes</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Aún no has {user?.role === 'PROVIDER' ? 'recibido' : 'realizado'} ninguna solicitud de
              servicio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => {
              const config = statusConfig[request.status];
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-100 transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                          {user?.role === 'PROVIDER' ? (
                            <User className="h-6 w-6" />
                          ) : (
                            <Briefcase className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {user?.role === 'PROVIDER'
                                ? `${request.customer.firstName} ${request.customer.lastName}`
                                : `${request.provider.user.firstName} ${request.provider.user.lastName}`}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${config.color}`}
                            >
                              {config.icon}
                              <span>{config.label}</span>
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />{' '}
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center font-semibold text-indigo-600 tracking-tight uppercase text-[10px] bg-indigo-50 px-2 py-0.5 rounded">
                              {request.category.nameEs}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Provider Actions */}
                        {user?.role === 'PROVIDER' && request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(request.id, 'accept')}
                              disabled={actionLoading === request.id}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleAction(request.id, 'decline')}
                              disabled={actionLoading === request.id}
                              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                            >
                              Declinar
                            </button>
                          </>
                        )}

                        {/* Customer Actions */}
                        {user?.role === 'CUSTOMER' && request.status === 'PENDING' && (
                          <button
                            onClick={() => handleAction(request.id, 'cancel')}
                            disabled={actionLoading === request.id}
                            className="px-4 py-2 text-red-600 border border-red-100 bg-red-50 text-sm font-bold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}

                        {/* Common Actions */}
                        {request.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleAction(request.id, 'complete')}
                            disabled={actionLoading === request.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Completado
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 italic">"{request.description}"</p>
                      </div>
                      {request.providerResponseNotes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-indigo-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                              Respuesta del profesional:
                            </p>
                            <p className="text-sm text-gray-600 italic">
                              "{request.providerResponseNotes}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Simple helper for missing icon
const ClipboardList = ({ className }: { className: string }) => (
  <div className={className}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  </div>
);

export default MyRequests;
