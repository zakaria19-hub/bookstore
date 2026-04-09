import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import type { Category } from '../types/api';
import './Pages.css';

function getCategoriesData(res: { data?: { data?: Category[] } }): Category[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

export function CategoriesPage() {
  const api = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then((res) => setCategories(getCategoriesData(res as { data?: { data?: Category[] } })))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;

  return (
    <Layout>
      <div className="page">
        <h1>Categories</h1>
        {categories.length === 0 ? (
          <p className="empty">No categories yet.</p>
        ) : (
          <ul className="card-grid">
            {categories.map((c) => (
              <li key={c._id} className="card-item category-card">
                <Link to={`/categories/${c._id}`} className="card-title">
                  Name: {c.name}
                </Link>
                {Array.isArray(c.books) && c.books.length > 0 && (
                  <p className="card-meta"> {c.books.length} book(s)</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
