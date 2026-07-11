import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../utils/format';
import './wishlist.css';

const Wishlist = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Ensure the wishlist is fresh (populated products) when the page opens.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshUser();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      await refreshUser();
      showToast('Removed from wishlist', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Loader message="Loading your wishlist…" fullPage />;

  const wishlist = user?.wishlist || [];

  if (!wishlist.length) {
    return (
      <section className="wishlist">
        <header className="wishlist__header">
          <h1 className="page-title">My Wishlist</h1>
        </header>
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">favorite</span>
          </div>
          <div className="empty-state__title">Your wishlist is empty</div>
          <p>Save items you love and find them here later.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlist">
      <header className="wishlist__header">
        <h1 className="page-title">My Wishlist</h1>
        <p className="wishlist__count">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for
          later.
        </p>
      </header>

      <div className="product-grid">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            actions={
              <div className="wishlist__actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm wishlist__remove"
                  onClick={() => handleRemove(product._id)}
                  disabled={removingId === product._id}
                  aria-label="Remove from wishlist"
                >
                  <span className="material-symbols-outlined is-filled wishlist__heart">
                    favorite
                  </span>
                  Remove
                </button>
                <Link
                  to={`/products/${product._id}`}
                  className="btn btn-primary btn-sm"
                >
                  Add to Cart
                </Link>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
};

export default Wishlist;
