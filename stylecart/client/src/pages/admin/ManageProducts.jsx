import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { formatPrice, getErrorMessage } from '../../utils/format';
import './manage-products.css';

const ManageProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const fetchProducts = useCallback(
    async (term = '') => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/products', {
          params: { search: term },
        });
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/admin/products/${toDelete._id}`);
      showToast('Product deleted', 'success');
      setToDelete(null);
      fetchProducts(search.trim());
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setToDelete(null);
    }
  };

  return (
    <section className="manage-products">
      <div className="admin-page-header">
        <h1>Products</h1>
        <div className="manage-products__header-actions">
          <form
            className="manage-products__search"
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts(search.trim());
            }}
          >
            <span className="material-symbols-outlined manage-products__search-icon">
              search
            </span>
            <input
              type="search"
              className="form-input"
              placeholder="Search products by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </form>
          <Link to="/admin/products/new" className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Add New Product
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading products…" />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div className="empty-state__title">No products found</div>
          <p>
            {search
              ? 'Try a different search term.'
              : 'Add your first product to get started.'}
          </p>
          <Link to="/admin/products/new" className="btn btn-primary">
            Add New Product
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      className="table__thumb"
                      src={product.images?.[0] || ''}
                      alt={product.name}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || '—'}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock ?? 0}</td>
                  <td>
                    {product.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="manage-products__actions">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="icon-btn"
                        title="Edit"
                        aria-label="Edit product"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => setToDelete(product)}
                        title="Delete"
                        aria-label="Delete product"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        message={
          toDelete
            ? `"${toDelete.name}" will be removed from the store.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        danger
      />
    </section>
  );
};

export default ManageProducts;
