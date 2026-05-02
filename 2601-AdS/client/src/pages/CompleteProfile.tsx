import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Briefcase, MapPin, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

const CompleteProfile: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    serviceCategoryId: '',
    bio: '',
    locationCity: '',
    locationRegion: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-cargar datos si ya existen (caso de REJECTED)
    if (user?.providerProfile) {
      // Necesitaríamos obtener los datos completos del perfil si no están en el context
      // Por ahora, solo permitimos que el usuario vuelva a llenar el form
    }

    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.categories || []);
      } catch (err) {
        setError('Error al cargar categorías');
      } finally {
        setFetching(false);
      }
    };
    fetchCategories();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceCategoryId) {
      setError('Por favor selecciona una categoría');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/providers/register', formData);
      await checkAuth(); // Crucial: Actualizar el estado global del usuario
      navigate('/'); // Redirigir a Home, que ahora mostrará el estado PENDING
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-3xl font-bold">Completa tu Perfil Profesional</h2>
          <p className="mt-2 text-indigo-100 italic">
            Cuéntanos sobre tus servicios para que el administrador pueda aprobar tu cuenta.
          </p>
        </div>

        {user?.providerProfile?.status === 'REJECTED' && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <div className="flex items-center space-x-2 text-red-700 font-bold mb-1">
              <AlertTriangle className="h-5 w-5" />
              <span>Motivo del rechazo anterior:</span>
            </div>
            <p className="text-red-600 text-sm italic">"{user.providerProfile.rejectionReason}"</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-indigo-500" />
              ¿Qué servicio ofreces?
            </label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.serviceCategoryId}
              onChange={(e) => setFormData({ ...formData, serviceCategoryId: e.target.value })}
            >
              <option value="">Selecciona una especialidad...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                Ciudad
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ej: Buenos Aires"
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                Región/Estado
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ej: CABA"
                value={formData.locationRegion}
                onChange={(e) => setFormData({ ...formData, locationRegion: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-500" />
              Biografía / Experiencia
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Describe tus años de experiencia, especialidades y por qué los clientes deberían elegirte..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Re-enviar Solicitud de Aprobación
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
