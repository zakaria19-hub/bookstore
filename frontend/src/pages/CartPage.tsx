import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import './Pages.css';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const api = useApi();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!api.isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    try {
      await api.createOrder({
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
      });
      clearCart();
      toast.success('Order placed successfully');
      navigate('/orders');
    } catch {
      // toaster in ApiContext
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="page">
          <h1>Cart</h1>
          <p className="empty">Your cart is empty.</p>
          <Link to="/books" className="btn btn-primary">Browse Books</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <div className="bill">
          <header className="bill-header">
            <h1 className="bill-title">Order Bill</h1>
            <p className="bill-date">{date}</p>
          </header>

          <table className="bill-table">
            <thead>
              <tr>
                <th className="bill-th-num">#</th>
                <th className="bill-th-desc">Description</th>
                <th className="bill-th-qty">Qty</th>
                <th className="bill-th-price">Unit Price</th>
                <th className="bill-th-amount">Amount</th>
                <th className="bill-th-actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.bookId} className="bill-row">
                  <td className="bill-td-num">{idx + 1}</td>
                  <td className="bill-td-desc">
                    <Link to={`/books/${item.bookId}`} className="bill-item-title">
                      {item.title}
                    </Link>
                    <span className="bill-item-author">{item.author}</span>
                  </td>
                  <td className="bill-td-qty">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.bookId, Math.max(1, +e.target.value || 1))}
                      className="bill-qty-input"
                    />
                  </td>
                  <td className="bill-td-price">${item.price.toFixed(2)}</td>
                  <td className="bill-td-amount">${(item.price * item.quantity).toFixed(2)}</td>
                  <td className="bill-td-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm bill-remove"
                      onClick={() => removeItem(item.bookId)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bill-totals">
            <div className="bill-total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="bill-total-row bill-total-final">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="bill-actions">
            <button type="button" className="btn btn-secondary" onClick={clearCart}>
              Clear cart
            </button>
            {api.isAuthenticated ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={api.status === 'loading'}
              >
                {api.status === 'loading' ? 'Placing order...' : 'Confirm order'}
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary">Login to order</Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
