import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { getErrorMessage } from '../../utils/format';
import './manage-categories.css';

const emptyForm = { name: '', description: '' };

const ManageCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited or null
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing._id}`, payload);
        showToast('Category updated', 'success');
      } else {
        await api.post('/admin/categories', payload);
        showToast('Category created', 'success');
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/admin/categories/${toDelete._id}`);
      showToast('Category deleted', 'success');
      setToDelete(null);
      fetchCategories();
    } catch (err) {
      // 400 → category has products (or any other error).
      showToast(getErrorMessage(err), 'error');
      setToDelete(null);
    }
  };

  return (
    <section className="manage-categories">
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (showForm && !editing ? closeForm() : openAdd())}
        >
          {showForm && !editing ? (
            'Close'
          ) : (
            <>
              <span className="material-symbols-outlined">add</span>
              Add Category
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form className="category-form card card--pad-lg" onSubmit={handleSubmit} noValidate>
          <h2 className="category-form__title">
            {editing ? 'Edit Category' : 'New Category'}
          </h2>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">
              Name
            </label>
            <input
              id="cat-name"
              type="text"
              className={`form-input ${error ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setError('');
              }}
            />
            {error && <span className="form-error">{error}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cat-desc">
              Description
            </label>
            <textarea
              id="cat-desc"
              className="form-textarea"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="category-form__buttons">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-outline" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loader message="Loading categories…" />
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">category</span>
          </div>
          <div className="empty-state__title">No categories yet</div>
          <p>Create your first category to organize products.</p>
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Category
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.productCount ?? 0}</td>
                  <td>
                    <div className="manage-categories__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => openEdit(category)}
                        title="Edit"
                        aria-label="Edit category"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => setToDelete(category)}
                        title="Delete"
                        aria-label="Delete category"
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
        title="Delete category?"
        message={
          toDelete
            ? `"${toDelete.name}" will be permanently removed.`
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

export default ManageCategories;
