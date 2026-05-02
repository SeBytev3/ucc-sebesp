import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, Loader2, User, Clock, AlertTriangle } from 'lucide-react';

interface PendingProvider {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    name: string;
  };
  bio: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Estado para el Modal de Rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/providers/pending');
      setPendingProviders(response.data.profiles || []);
    } catch (err: any) {
      setError('No se pudieron cargar los proveedores pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/providers/${id}/approve`);
      setPendingProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert('Error al aprobar al proveedor');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId) return;

    setActionLoading(rejectingId);
    try {
      await api.patch(`/admin/providers/${rejectingId}/reject`, {
        reason: rejectionReason || 'No cumple con los requisitos mínimos.',
      });
      setPendingProviders((prev) => prev.filter((p) => p.id !== rejectingId));
      setShowRejectModal(false);
    } catch (err: any) {
      alert('Error al rechazar al proveedor');
    } finally {
      setActionLoading(null);
      setRejectingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-lg text-gray-600">
            Gestiona las solicitudes de registro de nuevos proveedores.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>
        ) : pendingProviders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">¡Todo al día!</h3>
            <p className="text-gray-500">
              No hay solicitudes de proveedores pendientes de revisión.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pendingProviders.map((provider) => (
                <li key={provider.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600">
                          {provider.user.firstName} {provider.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{provider.user.email}</div>
                        <div className="mt-1 flex items-center text-xs text-gray-400">
                          <span className="font-bold uppercase mr-2 bg-indigo-50 px-2 py-0.5 rounded text-indigo-700">
                            {provider.category.name}
                          </span>
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(provider.id)}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                      >
                        {actionLoading === provider.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Aprobar
                      </button>
                      <button
                        onClick={() => openRejectModal(provider.id)}
                        disabled={actionLoading === provider.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-4 sm:px-6 ml-16">
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                      "{provider.bio}"
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal de Rechazo Personalizado */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-600 p-6 text-white flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8" />
              <h3 className="text-xl font-bold">Rechazar Solicitud</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Indica el motivo por el cual estás rechazando a este proveedor. Este mensaje será
                visible para el usuario.
              </p>
              <textarea
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                rows={4}
                placeholder="Ej: La biografía no es lo suficientemente detallada..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={actionLoading !== null}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
