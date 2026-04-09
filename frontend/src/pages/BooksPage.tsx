import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { useCart } from '../contexts/CartContext';
import { Layout } from '../components/Layout';
import type { Book } from '../types/api';
import './Pages.css';

function getBooksData(res: { data?: { data?: Book[] } }): Book[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

export function BooksPage() {
  const api = useApi();
  const cart = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBooks()
      .then((res) => setBooks(getBooksData(res as { data?: { data?: Book[] } })))
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false));
  }, [api]);

  const handleAddToCart = (book: Book) => {
    cart.addItem(book);
    toast.success(`"${book.title}" added to cart`);
  };

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;

  return (
    <Layout>
      <div className="page">
        <h1>Books</h1>
        {books.length === 0 ? (
          <p className="empty">No books yet.</p>
        ) : (
          <ul className="card-grid">
            {books.map((b) => (
              <li key={b._id} className="card-item">
                <Link to={`/books/${b._id}`} className="card-title">
                  {b.title}
                </Link>
                <p className="card-meta">{b.author}</p>
                <p className="card-price">${b.price}</p>
                <p className="card-meta">In stock: {b.quantity}</p>
                <div className="card-footer">
                  <span />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToCart(b)}
                    disabled={b.quantity < 1}
                  >
                    Add to cart
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
