import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { useCart } from '../contexts/CartContext';
import { Layout } from '../components/Layout';
import type { Book, Category } from '../types/api';
import './Pages.css';

function getCategoryData(res: { data?: { data?: Category[] } }): Category | null {
  const arr = res?.data?.data;
  return Array.isArray(arr) && arr[0] ? arr[0] : null;
}

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const cart = useCart();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getCategory(id)
      .then((res) => setCategory(getCategoryData(res as { data?: { data?: Category[] } })))
      .catch(() => toast.error('Failed to load category'))
      .finally(() => setLoading(false));
  }, [id, api]);

  const handleAddToCart = (book: Book) => {
    cart.addItem(book);
    toast.success(`"${book.title}" added to cart`);
  };

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;
  if (!category) return <Layout><div className="page"><p>Category not found.</p><Link to="/categories">← Back</Link></div></Layout>;

  const books = category.books ?? [];

  return (
    <Layout>
      <div className="page">
        <Link to="/categories" className="back-link">← Back to Categories</Link>
        <div className="detail-card">
          <h1>{category.name}</h1>
          {books.length === 0 ? (
            <p className="empty">No books in this category.</p>
          ) : (
            <ul className="card-grid" style={{ marginTop: '1rem' }}>
              {books.map((b) => (
                <li key={b._id} className="card-item">
                  <Link to={`/books/${b._id}`} className="card-title">
                    {b.title}
                  </Link>
                  <p className="card-meta">{b.author}</p>
                  <p className="card-price">${b.price}</p>
                  <div className="card-footer">
                    <span />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(b)}
                      disabled={(b.quantity ?? 0) < 1}
                    >
                      Add to cart
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
