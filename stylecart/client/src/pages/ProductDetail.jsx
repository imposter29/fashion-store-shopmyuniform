import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StarRating from '../components/common/StarRating.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatPrice, formatDate, getErrorMessage } from '../utils/format';
import './product-detail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedThisSession, setSubmittedThisSession] = useState(false);

  const fallbackImage = (p) =>
    `https://picsum.photos/seed/${p?.slug || 'stylecart'}/400/500`;

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setNotFound(false);
      const first =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images[0]
          : fallbackImage(data);
      setMainImage(first);
      // Reset quantity within stock bounds.
      setQty((q) => Math.min(Math.max(q, 1), Math.max(data.stock || 1, 1)));
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        showToast(getErrorMessage(err), 'error');
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    setLoading(true);
    setSelectedSize('');
    setQty(1);
    setSubmittedThisSession(false);
    fetchProduct();
    fetchReviews();
  }, [fetchProduct, fetchReviews]);

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const outOfStock = !product || product.stock === 0;
  const inWishlist = Boolean(
    product && user?.wishlist?.some((p) => p._id === product._id)
  );
  const galleryImages =
    product && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product
        ? [fallbackImage(product)]
        : [];

  const decQty = () => setQty((q) => Math.max(1, q - 1));
  const incQty = () =>
    setQty((q) => Math.min(product?.stock || 1, q + 1));

  const handleAddToCart = async () => {
    if (!product) return;
    if (hasSizes && !selectedSize) return;
    const size = hasSizes ? selectedSize : 'One Size';
    setAdding(true);
    try {
      await addToCart(product._id, size, qty);
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setAdding(false);
    }
  };

  // Buy Now: add the selected item to the cart, then jump straight to checkout.
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    if (hasSizes && !selectedSize) return;
    const size = hasSizes ? selectedSize : 'One Size';
    setBuying(true);
    try {
      await addToCart(product._id, size, qty);
      navigate('/checkout');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBuying(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    setWishLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${product._id}`);
      } else {
        await api.post(`/wishlist/${product._id}`);
      }
      await refreshUser();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setWishLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a rating between 1 and 5 stars.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setSubmittedThisSession(true);
      setReviewRating(0);
      setReviewComment('');
      showToast('Review submitted', 'success');
      await Promise.all([fetchReviews(), fetchProduct()]);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading product…" fullPage />;
  }

  if (notFound || !product) {
    return (
      <section className="page">
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <div className="empty-state__title">Product not found</div>
          <p>The product you're looking for doesn't exist or was removed.</p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const category = product.category;
  const avg = product.avgRating || 0;

  return (
    <section className="page product-detail">
      <div className="product-detail__top">
        {/* LEFT: gallery */}
        <div className="pd-gallery">
          <div className="pd-gallery__main">
            <img src={mainImage} alt={product.name} />
          </div>
          {galleryImages.length > 1 && (
            <div className="pd-gallery__thumbs">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`pd-gallery__thumb ${
                    img === mainImage ? 'is-active' : ''
                  }`}
                  onClick={() => setMainImage(img)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: info */}
        <div className="pd-info">
          <nav className="pd-breadcrumb label-caps" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {category && (
              <>
                <span className="material-symbols-outlined pd-breadcrumb__sep">
                  chevron_right
                </span>
                <Link to={`/products?category=${category.slug}`}>
                  {category.name}
                </Link>
              </>
            )}
            <span className="material-symbols-outlined pd-breadcrumb__sep">
              chevron_right
            </span>
            <span className="pd-breadcrumb__current">{product.name}</span>
          </nav>

          <div className="pd-info__head">
            <h1 className="pd-info__name">{product.name}</h1>

            <div className="pd-info__meta">
              <div className="pd-info__price">{formatPrice(product.price)}</div>
              <div className="pd-info__rating">
                <StarRating rating={avg} count={product.numReviews} />
              </div>
            </div>

            <p className="pd-info__desc">{product.description}</p>
          </div>

          {hasSizes && (
            <div className="pd-sizes">
              <span className="pd-sizes__label label-caps">Size</span>
              <div className="pd-sizes__options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`pd-size ${
                      selectedSize === size ? 'is-selected' : ''
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-qty">
            <span className="pd-qty__label label-caps">Quantity</span>
            <div className="pd-qty__stepper">
              <button
                type="button"
                className="pd-qty__btn"
                onClick={decQty}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="pd-qty__value">{qty}</span>
              <button
                type="button"
                className="pd-qty__btn"
                onClick={incQty}
                disabled={qty >= (product.stock || 1)}
                aria-label="Increase quantity"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <div className="pd-stock">
            {product.stock > 0 ? (
              <span className="pd-stock__in label-caps">
                <span className="pd-stock__dot" aria-hidden="true" />
                In Stock ({product.stock} left)
              </span>
            ) : (
              <span className="pd-stock__out label-caps">
                <span className="pd-stock__dot" aria-hidden="true" />
                Out of Stock
              </span>
            )}
          </div>

          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-primary btn-block pd-actions__cart"
              onClick={handleAddToCart}
              disabled={
                adding || outOfStock || (hasSizes && !selectedSize)
              }
            >
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              type="button"
              className="btn btn-accent btn-block pd-actions__buy"
              onClick={handleBuyNow}
              disabled={
                buying || outOfStock || (hasSizes && !selectedSize)
              }
            >
              {buying ? 'Processing…' : 'Buy Now'}
            </button>
            <button
              type="button"
              className={`btn btn-outline btn-block pd-wishlist ${
                inWishlist ? 'is-active' : ''
              }`}
              onClick={handleWishlistToggle}
              disabled={wishLoading}
              aria-label={
                inWishlist ? 'Remove from wishlist' : 'Add to wishlist'
              }
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <span
                className={`material-symbols-outlined ${
                  inWishlist ? 'is-filled' : ''
                }`}
              >
                favorite
              </span>
              {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="section pd-reviews">
        <h2 className="section__title">Reviews</h2>

        <div className="pd-reviews__summary">
          <StarRating rating={avg} size="lg" />
          <span className="pd-reviews__avg">{avg.toFixed(1)}</span>
          <span className="pd-reviews__count">
            ({product.numReviews}{' '}
            {product.numReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Write a review */}
        {isAuthenticated ? (
          !submittedThisSession && (
            <form className="pd-review-form card" onSubmit={handleReviewSubmit}>
              <h3 className="pd-review-form__title">Write a Review</h3>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                <StarRating
                  rating={reviewRating}
                  interactive
                  onChange={setReviewRating}
                  size="lg"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="review-comment">
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  className="form-textarea"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product…"
                />
              </div>
              {reviewError && <div className="form-error">{reviewError}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )
        ) : (
          <p className="pd-review-login">
            <Link to="/login">Please log in</Link> to write a review.
          </p>
        )}

        {/* Review list */}
        {reviewsLoading ? (
          <Loader message="Loading reviews…" />
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <div className="empty-state__title">No reviews yet</div>
            <p>Be the first to review this product.</p>
          </div>
        ) : (
          <ul className="pd-review-list">
            {reviews.map((review) => (
              <li key={review._id} className="pd-review card">
                <div className="pd-review__head">
                  <span className="pd-review__name">
                    {review.user?.firstName} {review.user?.lastName}
                  </span>
                  <span className="pd-review__date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <StarRating rating={review.rating} size="sm" />
                {review.comment && (
                  <p className="pd-review__comment">{review.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProductDetail;
