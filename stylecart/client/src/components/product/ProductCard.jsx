import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating.jsx';
import { formatPrice } from '../../utils/format';
import './product-card.css';

const PLACEHOLDER = 'https://picsum.photos/seed/stylecart/400/500';

/**
 * Reusable product tile — editorial 3:4 imagery, Playfair title.
 * Props:
 *  - product: the product document
 *  - actions: optional node rendered in a footer (e.g. wishlist buttons)
 */
const ProductCard = ({ product, actions }) => {
  if (!product) return null;

  const image = product.images?.[0] || PLACEHOLDER;
  const categoryName =
    typeof product.category === 'object' ? product.category?.name : undefined;
  const outOfStock = product.stock === 0;

  return (
    <div className={`product-card ${outOfStock ? 'is-sold-out' : ''}`}>
      <Link to={`/products/${product._id}`} className="product-card__media">
        <img src={image} alt={product.name} loading="lazy" />
        {outOfStock && <span className="product-card__badge">Sold Out</span>}
        {!outOfStock && (
          <span className="product-card__quickadd">View Product</span>
        )}
      </Link>

      <div className="product-card__body">
        {categoryName && (
          <span className="product-card__category">{categoryName}</span>
        )}
        <Link to={`/products/${product._id}`} className="product-card__name">
          {product.name}
        </Link>

        {product.numReviews > 0 && (
          <StarRating
            rating={product.avgRating || 0}
            count={product.numReviews}
            size="sm"
          />
        )}

        <div className="product-card__price">{formatPrice(product.price)}</div>

        {actions && <div className="product-card__actions">{actions}</div>}
      </div>
    </div>
  );
};

export default ProductCard;
