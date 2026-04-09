import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../contexts/ApiContext';
import { Layout } from '../components/Layout';
import type { Order } from '../types/api';
import './Pages.css';

function getOrdersData(res: { data?: { data?: Order[] } }): Order[] {
  const d = res?.data?.data;
  return Array.isArray(d) ? d : [];
}

export function OrdersPage() {
  const api = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getOrders()
      .then((res) => setOrders(getOrdersData(res as { data?: { data?: Order[] } })))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <Layout><div className="page"><p>Loading...</p></div></Layout>;

  return (
    <Layout>
      <div className="page">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : (
          <ul className="card-grid">
            {orders.map((o) => {
              const date = o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-';
              return (
                <li key={o._id} className={`card-item order-card order-card--${o.status}`}>
                  <Link to={`/orders/${o._id}`} className="card-title">
                    Order #{o._id.slice(-6).toUpperCase()}
                  </Link>
                  <p className="card-meta">{date}</p>
                  <p className="card-price">${o.total.toFixed(2)}</p>
                  <span className={`order-status order-status--${o.status}`}>{o.status}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
