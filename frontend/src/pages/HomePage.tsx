import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import './Pages.css';

export function HomePage() {
  return (
    <Layout>
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Curated reading, warmer design</span>
          <h1>Discover books in a storefront that feels like a modern library.</h1>
          <p className="page-lead">
            Explore standout titles, browse by category, and build your next order with a calmer,
            richer reading experience.
          </p>
          <div className="page-actions">
            <Link to="/books" className="btn btn-primary">Browse Collection</Link>
            <Link to="/categories" className="btn btn-secondary">Explore Shelves</Link>
          </div>
        </div>

        <div className="home-hero-card">
          <p className="home-hero-label">This week</p>
          <h2>Fresh arrivals across fiction, technology, and business.</h2>
          <div className="home-stats">
            <div>
              <strong>3+</strong>
              <span>curated categories</span>
            </div>
            <div>
              <strong>Fast</strong>
              <span>cart and order flow</span>
            </div>
            <div>
              <strong>Local</strong>
              <span>dev-ready API</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-feature-grid">
        <article className="feature-panel">
          <span className="feature-kicker">Browse</span>
          <h3>Readable cards with stronger hierarchy</h3>
          <p>Book and category listings are easier to scan, with clearer pricing, metadata, and actions.</p>
        </article>
        <article className="feature-panel">
          <span className="feature-kicker">Shop</span>
          <h3>Smoother cart and order experience</h3>
          <p>The checkout flow stays familiar while the interface feels cleaner and more polished.</p>
        </article>
        <article className="feature-panel">
          <span className="feature-kicker">Manage</span>
          <h3>Dashboard that matches the storefront</h3>
          <p>Admin actions now sit inside the same visual system instead of feeling disconnected.</p>
        </article>
      </section>
    </Layout>
  );
}
