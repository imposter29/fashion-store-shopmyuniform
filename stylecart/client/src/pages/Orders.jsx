import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  formatPrice,
  formatDate,
  shortId,
  statusBadgeClass,
  getErrorMessage,
} from '../utils/format';
import './orders.css';

const PLACEHOLDER = 'https://picsum.photos/seed/stylecart/200/200';

const Orders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/orders');
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) showToast(getErrorMessage(err), 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showToast]);

  if (loading) return <Loader message="Loading your orders…" fullPage />;

  if (!orders.length) {
    return (
      <section className="orders">
        <header className="orders__header">
          <h1 className="page-title">My Orders</h1>
        </header>
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className="empty-state__title">No orders yet</div>
          <p>When you place an order it will show up here.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="orders">
      <header className="orders__header">
        <h1 className="page-title">My Orders</h1>
        <p className="orders__count">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </header>

      <div className="orders__list">
        {orders.map((order) => {
          const itemCount = (order.items || []).reduce(
            (sum, i) => sum + (i.quantity || 0),
            0
          );
          const thumb = order.items?.[0]?.image || PLACEHOLDER;

          return (
            <article className="order-card" key={order._id}>
              <img
                className="order-card__thumb"
                src={thumb}
                alt="Order item"
                loading="lazy"
              />

              <div className="order-card__info">
                <div className="order-card__head">
                  <span className="order-card__ref">{shortId(order._id)}</span>
                  <span className={`badge ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-card__meta">
                  <span>{formatDate(order.createdAt)}</span>
                  <span className="order-card__dot">•</span>
                  <span>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <div className="order-card__side">
                <span className="order-card__total">
                  {formatPrice(order.totalAmount)}
                </span>
                <Link
                  to={`/orders/${order._id}`}
                  className="btn btn-outline btn-sm order-card__view"
                >
                  View Details
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Orders;
