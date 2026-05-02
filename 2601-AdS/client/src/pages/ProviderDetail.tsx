import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Star,
  MapPin,
  Loader2,
  ArrowLeft,
  User,
  MessageCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface ProviderProfile {
  id: string;
  serviceCategoryId: string;
  bio: string;
  locationCity: string;
  locationRegion: string;
  averageRating: string;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
}

const ProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await api.get(`/providers/${id}`);
        setProvider(response.data.profile);
      } catch (err: any) {
        setError('No se pudo encontrar el perfil del proveedor.');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/requests', {
        providerId: provider?.id,
        categoryId: provider?.serviceCategoryId,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setSuccess(false);
        setDescription('');
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      </Layout>
    );

  if (error || !provider)
    return (
      <Layout>
        <div className="bg-red-50 p-4 rounded-xl text-red-700">
          {error || 'Proveedor no encontrado'}
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Volver al listado
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end space-x-4">
                <div className="h-24 w-24 bg-white p-1 rounded-2xl shadow-md">
                  <div className="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    <User className="h-12 w-12" />
                  </div>
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                    {provider.user.firstName} {provider.user.lastName}
                  </h1>
                  <p className="text-indigo-600 font-bold uppercase tracking-wider text-sm">
                    {provider.category.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 self-start sm:self-auto">
                <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
                <span className="text-lg font-black text-yellow-700">
                  {parseFloat(provider.averageRating).toFixed(1)}
                </span>
                <span className="text-sm text-yellow-600 ml-2">
                  ({provider.totalReviews} reseñas)
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Sobre mí</h3>
                  <p className="text-gray-600 leading-relaxed italic">"{provider.bio}"</p>
                </div>
                <div className="flex items-center text-gray-500 bg-gray-50 p-4 rounded-2xl w-fit">
                  <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                  <span className="font-medium">
                    {provider.locationCity}, {provider.locationRegion}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {user?.role === 'CUSTOMER' && (
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 text-center">
                      ¿Necesitas este servicio?
                    </h4>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Send className="h-5 w-5" />
                      <span>Solicitar Servicio</span>
                    </button>
                    <button className="w-full mt-3 py-4 border-2 border-indigo-200 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2 text-sm">
                      <MessageCircle className="h-5 w-5" />
                      <span>Enviar Mensaje</span>
                    </button>
                  </div>
                )}
                {user?.id === provider.id && (
                  <div className="p-4 bg-gray-100 rounded-2xl text-center text-gray-500 text-sm font-medium">
                    Estás viendo tu propio perfil profesional
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Solicitud */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {success ? (
              <div className="p-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">¡Solicitud Enviada!</h3>
                <p className="text-gray-600">
                  El profesional ha sido notificado y responderá pronto.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-indigo-600 p-6 text-white">
                  <h3 className="text-xl font-bold">Solicitar a {provider.user.firstName}</h3>
                  <p className="text-indigo-100 text-sm">
                    Describe brevemente lo que necesitas para que el profesional pueda darte un
                    presupuesto.
                  </p>
                </div>
                <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Detalles del trabajo
                    </label>
                    <textarea
                      required
                      autoFocus
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                      placeholder="Ej: Necesito arreglar una canilla que gotea en la cocina..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !description.trim()}
                      className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Enviar Solicitud</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProviderDetail;
