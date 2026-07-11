import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          StyleCart
        </Link>

        <nav className="navbar__links">
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart ({itemCount})</Link>

          {isAuthenticated ? (
            <>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/orders">Orders</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button type="button" onClick={logout} className="navbar__logout">
                Logout ({user?.firstName})
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
