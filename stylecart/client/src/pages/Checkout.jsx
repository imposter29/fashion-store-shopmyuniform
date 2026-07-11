import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, getErrorMessage } from '../utils/format';
import './checkout.css';

const PLACEHOLDER = 'https://picsum.photos/seed/stylecart/400/500';
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

const EMPTY_FORM = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
};

const FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text' },
  { name: 'address', label: 'Address', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'zipCode', label: 'ZIP Code', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'tel' },
];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEmpty = cartItems.length === 0;

  // Nothing to check out — send the user back to the cart.
  useEffect(() => {
    if (isEmpty) navigate('/cart');
  }, [isEmpty, navigate]);

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = cartTotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    FIELDS.forEach(({ name, label }) => {
      if (!form[name].trim()) next[name] = `${label} is required`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data: order } = await api.post('/orders', {
        shippingAddress: {
          fullName: form.fullName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
          phone: form.phone.trim(),
        },
        paymentMethod: 'COD',
      });
      await clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/order-success/' + order._id);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmpty) return null;

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <section className="checkout-form">
          <div className="checkout-section">
            <h2 className="checkout-section__title">Shipping Address</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className={`form-input${errors.fullName ? ' is-invalid' : ''}`}
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
              {errors.fullName && (
                <p className="form-error">{errors.fullName}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className={`form-input${errors.address ? ' is-invalid' : ''}`}
                value={form.address}
                onChange={handleChange}
                placeholder="123 Market Street"
              />
              {errors.address && <p className="form-error">{errors.address}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className={`form-input${errors.city ? ' is-invalid' : ''}`}
                  value={form.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                />
                {errors.city && <p className="form-error">{errors.city}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  className={`form-input${errors.state ? ' is-invalid' : ''}`}
                  value={form.state}
                  onChange={handleChange}
                  placeholder="CA"
                />
                {errors.state && <p className="form-error">{errors.state}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="zipCode">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  className={`form-input${errors.zipCode ? ' is-invalid' : ''}`}
                  value={form.zipCode}
                  onChange={handleChange}
                  placeholder="94103"
                />
                {errors.zipCode && (
                  <p className="form-error">{errors.zipCode}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-input${errors.phone ? ' is-invalid' : ''}`}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>

          </div>

          <div className="checkout-section">
            <h2 className="checkout-section__title">Payment Method</h2>
            <div className="checkout-payment__option">
              <span className="material-symbols-outlined">payments</span>
              <span>Cash on Delivery (COD)</span>
              <span className="material-symbols-outlined checkout-payment__check">
                check_circle
              </span>
            </div>
          </div>
        </section>

        <aside className="checkout-summary">
          <div className="checkout-card">
            <h2 className="checkout-card__title">Order Summary</h2>

            <ul className="checkout-items">
              {cartItems.map((item) => {
                const product = item.product || {};
                const image = product.images?.[0] || PLACEHOLDER;
                return (
                  <li className="checkout-item" key={item._id}>
                    <img
                      className="checkout-item__thumb"
                      src={image}
                      alt={product.name}
                      loading="lazy"
                    />
                    <div className="checkout-item__info">
                      <span className="checkout-item__name">
                        {product.name}
                      </span>
                      <span className="checkout-item__meta">
                        Size {item.size} · Qty {item.quantity}
                      </span>
                    </div>
                    <span className="checkout-item__price">
                      {formatPrice((product.price || 0) * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="checkout-summary__free">FREE</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-block"
              disabled={submitting}
            >
              {submitting ? 'Placing Order…' : 'Place Order'}
            </button>

            <p className="checkout-summary__secure">
              <span className="material-symbols-outlined">lock</span>
              Secure Checkout
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
