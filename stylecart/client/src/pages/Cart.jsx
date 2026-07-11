import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatPrice, getErrorMessage } from '../utils/format';
import './cart.css';

const PLACEHOLDER = 'https://picsum.photos/seed/stylecart/400/500';
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

const Cart = () => {
  const { cartItems, cartTotal, loading, updateQuantity, removeFromCart } =
    useCart();
  const { showToast } = useToast();

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = cartTotal + shipping;
  const isEmpty = cartItems.length === 0;

  const handleQuantity = async (item, nextQty) => {
    const stock = item.product?.stock ?? 0;
    if (nextQty < 1 || nextQty > stock) return;
    try {
      await updateQuantity(item._id, nextQty);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item._id);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading && isEmpty) {
    return (
      <div className="container">
        <Loader message="Loading your cart…" />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <header className="cart-header">
        <h1 className="page-title cart-header__title">Shopping Bag</h1>
        {!isEmpty && (
          <span className="cart-header__count label-caps">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </header>

      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <h2 className="empty-state__title">Your bag is empty</h2>
          <p>Looks like you haven’t added anything yet.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cartItems.map((item) => {
              const product = item.product || {};
              const image = product.images?.[0] || PLACEHOLDER;
              const stock = product.stock ?? 0;
              const lineTotal = (product.price || 0) * item.quantity;

              return (
                <article className="cart-item" key={item._id}>
                  <Link
                    to={`/products/${product._id}`}
                    className="cart-item__thumb"
                  >
                    <img src={image} alt={product.name} loading="lazy" />
                  </Link>

                  <div className="cart-item__info">
                    <Link
                      to={`/products/${product._id}`}
                      className="cart-item__name"
                    >
                      {product.name}
                    </Link>
                    <span className="cart-item__size">Size: {item.size}</span>
                  </div>

                  <div className="cart-item__qty" data-label="Quantity">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="qty-stepper__btn"
                        onClick={() => handleQuantity(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="qty-stepper__value">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="qty-stepper__btn"
                        onClick={() => handleQuantity(item, item.quantity + 1)}
                        disabled={item.quantity >= stock}
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                    {item.quantity >= stock && (
                      <span className="cart-item__stock">
                        Max {stock} in stock
                      </span>
                    )}
                  </div>

                  <div className="cart-item__price" data-label="Price">
                    {formatPrice(product.price)}
                  </div>

                  <div className="cart-item__total" data-label="Total">
                    {formatPrice(lineTotal)}
                  </div>

                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() => handleRemove(item)}
                    aria-label={`Remove ${product.name} from cart`}
                    title="Remove"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <div className="cart-summary__card">
              <h2 className="cart-summary__title">Order Summary</h2>
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="cart-summary__free">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="cart-summary__hint">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)} more for
                  free shipping.
                </p>
              )}
              <div className="cart-summary__row cart-summary__row--total">
                <span>Order Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
              <Link
                to="/checkout"
                className={`btn btn-primary btn-block${
                  isEmpty ? ' is-disabled' : ''
                }`}
                aria-disabled={isEmpty}
                tabIndex={isEmpty ? -1 : undefined}
              >
                Proceed to Checkout
              </Link>
              <Link to="/products" className="cart-summary__continue">
                Continue Shopping
              </Link>
              <p className="cart-summary__secure">
                <span className="material-symbols-outlined">lock</span>
                Secure Checkout
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
