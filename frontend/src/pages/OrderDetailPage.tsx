import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import type { Order } from '../types/api';
import './Pages.css';

function getOrderData(res: { data?: { data?: Order[] } }): Order | null {
  const arr = res?.data?.data;
  return Array.isArray(arr) && arr[0] ? arr[0] : null;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(id)
      .then((res) => setOrder(getOrderData(res as { data?: { data?: Order[] } })))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id, api]);

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;
  if (!order) return <Layout><div className="page"><p>Order not found.</p><Link to="/orders">← Back</Link></div></Layout>;

  const items = order.orderItems ?? [];
  const date = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-';

  return (
    <Layout>
      <div className="page">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <div className={`detail-card order-detail-card order-detail-card--${order.status}`}>
          <div className="order-detail-header">
            <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
            <span className={`order-status order-status-lg order-status--${order.status}`}>{order.status}</span>
          </div>
          <p className="card-meta"><strong>Date:</strong> {date}</p>
          <p className="card-price" style={{ marginBottom: 0 }}><strong>Total:</strong> ${order.total.toFixed(2)}</p>
          {items.length > 0 && (
            <>
              <h3>Items</h3>
              <ul className="card-grid order-items-grid">
                {items.map((item) => (
                  <li key={item._id} className="card-item order-item-card">
                    <span className="card-title">{item.book?.title}</span>
                    <p className="card-meta">{item.book?.author}</p>
                    <p className="card-meta">
                      ×{item.quantity} — ${((item.book?.price ?? 0) * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
