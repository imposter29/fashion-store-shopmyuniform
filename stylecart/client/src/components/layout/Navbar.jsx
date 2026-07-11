import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './navbar.css';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Add a shadow once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the user dropdown when clicking outside of it.
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    showToast('Logged out', 'info');
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar__inner">
        <button
          type="button"
          className="navbar__hamburger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="material-symbols-outlined">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <Link to="/" className="navbar__brand" onClick={closeMenus}>
          STYLECART
        </Link>

        <nav className={`navbar__links ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={closeMenus} className="navbar__link">
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMenus} className="navbar__link">
            Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenus} className="navbar__link">
              Admin
            </NavLink>
          )}
          {!isAuthenticated && (
            <div className="navbar__links-auth">
              <NavLink to="/login" onClick={closeMenus} className="navbar__link">
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenus}
                className="btn btn-primary btn-sm"
              >
                Register
              </NavLink>
            </div>
          )}
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/wishlist"
                className="navbar__icon"
                onClick={closeMenus}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <span className="material-symbols-outlined">favorite</span>
              </NavLink>
              <NavLink
                to="/cart"
                className="navbar__icon"
                onClick={closeMenus}
                aria-label="Cart"
                title="Cart"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="navbar__badge">{cartCount}</span>
                )}
              </NavLink>

              <div className="navbar__user" ref={dropdownRef}>
                <button
                  type="button"
                  className="navbar__user-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  aria-label="Account"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>
                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <span className="navbar__dropdown-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <Link to="/orders" onClick={closeMenus}>
                      My Orders
                    </Link>
                    <Link to="/wishlist" onClick={closeMenus}>
                      Wishlist
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={closeMenus}>
                        Admin Panel
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/cart"
                className="navbar__icon"
                onClick={closeMenus}
                aria-label="Cart"
                title="Cart"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="navbar__badge">{cartCount}</span>
                )}
              </NavLink>
              <NavLink
                to="/login"
                className="navbar__icon navbar__icon--auth"
                onClick={closeMenus}
                aria-label="Login"
                title="Login"
              >
                <span className="material-symbols-outlined">person</span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
