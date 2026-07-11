import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/common/Loader.jsx';
import { ALL_SIZES, getErrorMessage } from '../../utils/format';
import './product-form.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  images: [''],
  sizes: [],
  stock: '',
  isActive: true,
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // Load categories (and the product when editing).
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const catReq = api.get('/categories');
        const prodReq = isEdit ? api.get(`/products/${id}`) : null;
        const [catRes, prodRes] = await Promise.all([catReq, prodReq]);
        if (!active) return;
        setCategories(catRes.data || []);
        if (prodRes) {
          const p = prodRes.data;
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price ?? '',
            category: p.category?._id || p.category || '',
            images: p.images?.length ? p.images : [''],
            sizes: p.sizes || [],
            stock: p.stock ?? '',
            isActive: p.isActive !== false,
          });
        }
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
  }, [id]);

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  const setImage = (index, value) => {
    setForm((f) => {
      const images = [...f.images];
      images[index] = value;
      return { ...f, images };
    });
  };

  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));

  const removeImage = (index) => {
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== index);
      return { ...f, images: images.length ? images : [''] };
    });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0)
      next.price = 'Enter a valid price (0 or more)';
    if (!form.category) next.category = 'Category is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      images: form.images.map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes,
      stock: form.stock === '' ? 0 : Number(form.stock),
      isActive: form.isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      showToast('Product saved', 'success');
      navigate('/admin/products');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading product…" fullPage />;

  return (
    <section className="product-form">
      <div className="admin-page-header">
        <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        <Link to="/admin/products" className="btn btn-outline">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
      </div>

      <form className="product-form__form card card--pad-lg" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="pf-name">
            Name
          </label>
          <input
            id="pf-name"
            type="text"
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pf-desc">
            Description
          </label>
          <textarea
            id="pf-desc"
            className="form-textarea"
            rows={4}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="pf-price">
              Price
            </label>
            <input
              id="pf-price"
              type="number"
              min="0"
              step="0.01"
              className={`form-input ${errors.price ? 'is-invalid' : ''}`}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-stock">
              Stock
            </label>
            <input
              id="pf-stock"
              type="number"
              min="0"
              step="1"
              className="form-input"
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pf-category">
            Category
          </label>
          <select
            id="pf-category"
            className={`form-select ${errors.category ? 'is-invalid' : ''}`}
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="form-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <span className="form-label">Images (URLs)</span>
          <div className="product-form__images">
            {form.images.map((img, i) => (
              <div className="product-form__image-row" key={i}>
                <span className="material-symbols-outlined product-form__image-icon">
                  link
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://…"
                  value={img}
                  onChange={(e) => setImage(i, e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm product-form__add-image"
            onClick={addImage}
          >
            <span className="material-symbols-outlined">add</span>
            Add image
          </button>
        </div>

        <div className="form-group">
          <span className="form-label">Sizes</span>
          <div className="product-form__sizes">
            {ALL_SIZES.map((size) => (
              <label className="product-form__size" key={size}>
                <input
                  type="checkbox"
                  checked={form.sizes.includes(size)}
                  onChange={() => toggleSize(size)}
                />
                <span>{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="product-form__active">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField('isActive', e.target.checked)}
            />
            <span>Active (visible in store)</span>
          </label>
        </div>

        <div className="product-form__buttons">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Product'}
          </button>
          <Link to="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
};

export default ProductForm;
