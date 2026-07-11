import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import {
  formatPrice,
  formatDate,
  shortId,
  statusBadgeClass,
  getErrorMessage,
  ORDER_STATUSES,
} from '../../utils/format';
import './manage-orders.css';

const TABS = ['all', ...ORDER_STATUSES];

const ManageOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', {
        params: {
          status: status === 'all' ? '' : status,
          page,
        },
      });
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [status, page, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const selectTab = (tab) => {
    setStatus(tab);
    setPage(1);
  };

  const changeStatus = async (order, newStatus) => {
    const previous = order.status;
    if (newStatus === previous) return;
    setUpdatingId(order._id);
    // Optimistic update.
    setOrders((list) =>
      list.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o))
    );
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: newStatus });
      showToast('Order status updated', 'success');
    } catch (err) {
      // Roll back.
      setOrders((list) =>
        list.map((o) =>
          o._id === order._id ? { ...o, status: previous } : o
        )
      );
      showToast(getErrorMessage(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="manage-orders">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p className="manage-orders__lead">
            Review and manage recent store transactions.
          </p>
        </div>
      </div>

      <div className="order-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={status === tab}
            className={`order-tab ${status === tab ? 'is-active' : ''}`}
            onClick={() => selectTab(tab)}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader message="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className="empty-state__title">No orders found</div>
          <p>
            {status === 'all'
              ? 'Orders placed by customers will appear here.'
              : `No ${status} orders right now.`}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{shortId(order._id)}</td>
                    <td>
                      <div className="order-customer">
                        <span className="order-customer__name">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : '—'}
                        </span>
                        {order.user?.email && (
                          <span className="order-customer__email">
                            {order.user.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items?.length ?? 0}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <select
                        className={`form-select order-status-select ${statusBadgeClass(
                          order.status
                        )}`}
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => changeStatus(order, e.target.value)}
                        aria-label="Change order status"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
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

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
};

export default ManageOrders;
