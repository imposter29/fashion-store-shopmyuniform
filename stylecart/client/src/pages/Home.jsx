import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { getErrorMessage } from '../utils/format';
import './home.css';

// Editorial hero backdrop (static marketing asset).
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop&auto=format';

const Home = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?sort=newest&limit=8'),
        ]);
        setCategories(catRes.data || []);
        setNewArrivals(prodRes.data?.products || []);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="home">
      {/* Hero ------------------------------------------------------------ */}
      <section className="hero">
        <img className="hero__bg" src={HERO_IMAGE} alt="" aria-hidden="true" />
        <div className="hero__overlay" />
        <div className="hero__content">
          <h1 className="hero__title">Discover Your Style</h1>
          <p className="hero__subtitle">
            Curated fashion for every occasion. Experience editorial minimalism
            designed for the discerning individual.
          </p>
          <Link to="/products" className="hero__cta">
            Shop Now
          </Link>
        </div>
      </section>

      {loading ? (
        <Loader message="Loading the storefront…" />
      ) : (
        <>
          {/* Shop by Category ------------------------------------------- */}
          <section className="section home-section">
            <div className="section__head">
              <div>
                <h2 className="section__title">Shop by Category</h2>
                <p className="section__subtitle">
                  Explore our meticulously curated collections.
                </p>
              </div>
              <Link to="/products" className="section__link">
                View all categories
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            {categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🏷️</div>
                <p className="empty-state__title">No categories yet</p>
                <p>Check back soon as we add new collections.</p>
              </div>
            ) : (
              <div className="category-grid">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat.slug}`}
                    className="category-card"
                  >
                    {cat.image && (
                      <img
                        className="category-card__img"
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                      />
                    )}
                    <div className="category-card__overlay" />
                    <div className="category-card__body">
                      <h3 className="category-card__name">{cat.name}</h3>
                      <span className="category-card__count">
                        {cat.productCount || 0}{' '}
                        {cat.productCount === 1 ? 'product' : 'products'}
                      </span>
                      <span className="category-card__explore">
                        Explore
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Brand story ------------------------------------------------ */}
          <section className="brand-story">
            <div className="brand-story__inner">
              <p className="brand-story__eyebrow">Our Philosophy</p>
              <h2 className="brand-story__title">
                Timeless Design, Modern Ethics
              </h2>
              <p className="brand-story__text">
                True luxury lies in intention. Every piece is a testament to
                meticulous craftsmanship and an enduring aesthetic that
                transcends fleeting trends. Buy less, choose well, make it last.
              </p>
              <Link to="/products" className="brand-story__link">
                Read our story
              </Link>
            </div>
          </section>

          {/* New Arrivals ------------------------------------------------ */}
          <section className="section home-section">
            <div className="section__head">
              <h2 className="section__title">New Arrivals</h2>
              <Link to="/products?sort=newest" className="section__link">
                View all
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            {newArrivals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🛍️</div>
                <p className="empty-state__title">No products yet</p>
                <p>Our shelves are being stocked — please check back soon.</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="product-grid">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
