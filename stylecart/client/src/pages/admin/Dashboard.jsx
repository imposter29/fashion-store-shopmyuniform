import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import {
  formatPrice,
  formatDate,
  shortId,
  statusBadgeClass,
  getErrorMessage,
} from '../../utils/format';
import './dashboard.css';

const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/stats');
        if (active) setStats(data);
      } catch (err) {
        if (active) showToast(getErrorMessage(err), 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader message="Loading dashboard…" fullPage />;

  const {
    products = 0,
    orders = 0,
    users = 0,
    revenue = 0,
    recentOrders = [],
  } = stats || {};

  const cards = [
    { icon: 'inventory_2', value: products, label: 'Total Products' },
    { icon: 'receipt_long', value: orders, label: 'Total Orders' },
    { icon: 'group', value: users, label: 'Total Customers' },
    { icon: 'payments', value: formatPrice(revenue), label: 'Total Revenue' },
  ];

  return (
    <section className="dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard__lead">
            Welcome back. Here&rsquo;s what&rsquo;s happening today.
          </p>
        </div>
      </div>

      <div className="stat-cards">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className="stat-card__icon" aria-hidden="true">
              <span className="material-symbols-outlined">{c.icon}</span>
            </span>
            <div className="stat-card__body">
              <span className="stat-card__label">{c.label}</span>
              <span className="stat-card__value">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard__recent">
        <div className="dashboard__panel-head">
          <h2 className="dashboard__section-title">Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div className="empty-state__title">No orders yet</div>
            <p>Orders will show up here once customers start buying.</p>
            <Link to="/admin/products" className="btn btn-primary">
              Manage products
            </Link>
          </div>
        ) : (
          <div className="table-wrap dashboard__table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{shortId(order._id)}</td>
                    <td>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : '—'}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
