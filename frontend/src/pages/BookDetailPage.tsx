import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { useCart } from '../contexts/CartContext';
import { Layout } from '../components/Layout';
import type { Book } from '../types/api';
import './Pages.css';

function getBookData(res: { data?: { data?: Book[] } }): Book | null {
  const arr = res?.data?.data;
  return Array.isArray(arr) && arr[0] ? arr[0] : null;
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const cart = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    api
      .getBook(id)
      .then((res) => setBook(getBookData(res as { data?: { data?: Book[] } })))
      .catch(() => toast.error('Failed to load book'))
      .finally(() => setLoading(false));
  }, [id, api]);

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;
  if (!book) return <Layout><div className="page"><p>Book not found.</p><Link to="/books">← Back to Books</Link></div></Layout>;

  const cat = book.category as { name?: string } | undefined;
  const categoryName = typeof cat === 'object' && cat?.name ? cat.name : null;

  const handleAddToCart = () => {
    cart.addItem(book, qty);
    toast.success(`"${book.title}" (×${qty}) added to cart`);
  };

  return (
    <Layout>
      <div className="page">
        <Link to="/books" className="back-link">← Back to Books</Link>
        <div className="detail-card">
          <h1>{book.title}</h1>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Price:</strong> ${book.price}</p>
          <p><strong>In stock:</strong> {book.quantity}</p>
          {categoryName && <p><strong>Category:</strong> {categoryName}</p>}
          {book.quantity > 0 && (
            <div className="detail-add-cart">
              <input
                type="number"
                min="1"
                max={book.quantity}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(book.quantity, +e.target.value || 1)))}
              />
              <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
