import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { Wrench, Zap, Lock, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Plomero: <Wrench className="h-8 w-8" />,
  Electricista: <Zap className="h-8 w-8" />,
  Cerrajero: <Lock className="h-8 w-8" />,
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        console.log('API Response:', response.data);
        // El backend devuelve { categories: [...] }
        setCategories(response.data.categories || []);
      } catch (err: any) {
        setError('No se pudieron cargar las categorías. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold text-gray-900">Categorías de Servicios</h1>
          <p className="mt-2 text-lg text-gray-600">
            Encuentra al profesional adecuado para tus necesidades en el hogar o negocio.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(categories) &&
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}/providers`}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {categoryIcons[category.name] || <Wrench className="h-8 w-8" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Servicios profesionales</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600 text-sm line-clamp-2">{category.description}</p>
                  <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm">
                    Ver proveedores
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
