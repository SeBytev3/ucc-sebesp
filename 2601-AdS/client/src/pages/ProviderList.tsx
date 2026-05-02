import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { Star, MapPin, Loader2, ArrowLeft, User } from 'lucide-react';

interface Provider {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
  bio: string;
  locationCity: string;
  locationRegion: string;
  averageRating: string;
  totalReviews: number;
}

const ProviderList: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/providers?categoryId=${categoryId}`);
        // El backend devuelve { providers: [...], pagination: {...} }
        const providersData = response.data.providers || [];
        setProviders(providersData);

        if (providersData.length > 0) {
          setCategoryName(providersData[0].category.name || providersData[0].category.nameEs);
        }
      } catch (err: any) {
        setError('No se pudieron cargar los proveedores.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchProviders();
  }, [categoryId]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/categories" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">{categoryName || 'Proveedores'}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">{error}</div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay proveedores disponibles</h3>
            <p className="text-gray-500">Aún no hay profesionales aprobados en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                to={`/providers/${provider.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-48 h-48 bg-gray-100 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-200">
                  <User className="h-16 w-16 text-gray-300" />
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {provider.user.firstName} {provider.user.lastName}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {provider.locationCity}, {provider.locationRegion}
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-bold text-yellow-700">
                        {parseFloat(provider.averageRating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600 text-sm line-clamp-3 italic">"{provider.bio}"</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{provider.totalReviews} reseñas</span>
                    <span className="text-indigo-600 font-semibold text-sm">
                      Ver perfil completo
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProviderList;
