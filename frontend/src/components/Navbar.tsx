import { Link } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

export function Navbar() {
  const { isAuthenticated, logout } = useApi();
  const { count } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">BookStore</Link>
      </div>
      <ul className="navbar-nav">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/books">Books</Link></li>
        <li><Link to="/categories">Categories</Link></li>
        <li className="nav-cart">
          <Link to="/cart">
            Cart {count > 0 && <span className="nav-badge">{count}</span>}
          </Link>
        </li>
        {isAuthenticated ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li>
              <button type="button" className="nav-logout" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
