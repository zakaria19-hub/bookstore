import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import './Pages.css';

export function HomePage() {
  return (
    <Layout>
      <div className="page">
        <h1>Welcome to BookStore</h1>
        <p className="page-lead">Browse books, explore categories, and place orders.</p>
        <div className="page-actions">
          <Link to="/books" className="btn btn-primary">Browse Books</Link>
          <Link to="/categories" className="btn btn-secondary">View Categories</Link>
        </div>
      </div>
    </Layout>
  );
}
