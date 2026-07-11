import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatPrice,
  formatDateTime,
  shortId,
  statusBadgeClass,
  getErrorMessage,
  ORDER_STATUSES,
} from '../utils/format';
import './order-detail.css';

const PLACEHOLDER = 'https://picsum.photos/seed/stylecart/200/200';

// The linear fulfilment steps shown in the stepper (excludes 'cancelled').
const STEPS = ['placed', 'processing', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (active) setOrder(data);
      } catch (err) {
        if (active) {
          setOrder(null);
          showToast(getErrorMessage(err), 'error');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, showToast]);

  if (loading) return <Loader message="Loading order…" fullPage />;

  if (!order) {
    return (
      <section className="order-detail">
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className="empty-state__title">Order not found</div>
          <p>We couldn't find that order.</p>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  const cancelled = order.status === 'cancelled';
  const currentIndex = ORDER_STATUSES.indexOf(order.status);
  const address = order.shippingAddress || {};

  return (
    <section className="order-detail">
      <div className="order-detail__top">
        <Link to="/orders" className="order-detail__back">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Orders
        </Link>
        <h1 className="page-title">Order {shortId(order._id)}</h1>
      </div>

      {cancelled ? (
        <div className="order-cancelled" role="alert">
          <span className="order-cancelled__icon">
            <span className="material-symbols-outlined">close</span>
          </span>
          <div>
            <strong>Order Cancelled</strong>
            <p>This order has been cancelled.</p>
          </div>
        </div>
      ) : (
        <ol className="stepper">
          {STEPS.map((step, idx) => {
            const done = currentIndex >= ORDER_STATUSES.indexOf(step);
            const active = order.status === step;
            return (
              <li
                key={step}
                className={`stepper__step${done ? ' is-complete' : ''}${
                  active ? ' is-current' : ''
                }`}
              >
                <span className="stepper__dot">
                  {done ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="stepper__label">{step}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="order-detail__grid">
        <div className="order-detail__main">
          <div className="card order-summary">
            <div className="order-summary__row">
              <span>Order Reference</span>
              <strong>{shortId(order._id)}</strong>
            </div>
            <div className="order-summary__row">
              <span>Date Placed</span>
              <strong>{formatDateTime(order.createdAt)}</strong>
            </div>
            <div className="order-summary__row">
              <span>Payment Method</span>
              <strong>{order.paymentMethod}</strong>
            </div>
            <div className="order-summary__row">
              <span>Status</span>
              <span className={`badge ${statusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <h2 className="order-detail__heading">Items</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={item._id || item.product || idx}>
                    <td>
                      <div className="order-item">
                        <img
                          className="table__thumb"
                          src={item.image || PLACEHOLDER}
                          alt={item.name}
                          loading="lazy"
                        />
                        <span className="order-item__name">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.size}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="order-detail__aside">
          <div className="card shipping-block">
            <h2 className="order-detail__heading">Shipping Address</h2>
            <p className="shipping-block__name">{address.fullName}</p>
            <p>{address.address}</p>
            <p>
              {address.city}
              {address.city && (address.state || address.zipCode) ? ', ' : ''}
              {address.state} {address.zipCode}
            </p>
            {address.phone && (
              <p className="shipping-block__phone">
                <span className="material-symbols-outlined">call</span>
                {address.phone}
              </p>
            )}
          </div>

          <div className="card order-total-block">
            <span>Order Total</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default OrderDetail;
