import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import api from '../api/axios';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Loader from '../components/common/Loader.jsx';
import { getErrorMessage, ALL_SIZES } from '../utils/format';
import './products.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Products = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Derived, URL-backed filter values -------------------------------------
  const selectedCategories = searchParams.getAll('category');
  const activeSize = searchParams.get('size') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  // Local mirrors for text/number inputs (committed on submit/blur) --------
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Keep local inputs in sync when the URL changes (e.g. Clear Filters,
  // browser back/forward).
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  // Load categories once for the sidebar filter ---------------------------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data || []);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
      }
    };
    loadCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch products whenever any URL param changes -------------------------
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        if (!params.get('sort')) params.set('sort', 'newest');
        params.set('limit', String(PAGE_SIZE));
        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data?.products || []);
        setTotalPages(data?.totalPages || 1);
        setTotalProducts(data?.totalProducts || 0);
      } catch (err) {
        showToast(getErrorMessage(err), 'error');
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Param helpers ---------------------------------------------------------
  const commit = (mutate, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const setParam = (key, value) =>
    commit((p) => {
      if (value === '' || value == null) p.delete(key);
      else p.set(key, value);
    });

  const toggleCategory = (slug) =>
    commit((p) => {
      const current = p.getAll('category');
      p.delete('category');
      const next = current.includes(slug)
        ? current.filter((c) => c !== slug)
        : [...current, slug];
      next.forEach((c) => p.append('category', c));
    });

  const toggleSize = (size) =>
    commit((p) => {
      if (p.get('size') === size) p.delete('size');
      else p.set('size', size);
    });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
  };

  const changePage = (n) =>
    commit((p) => p.set('page', String(n)), { resetPage: false });

  const clearFilters = () => {
    setSearchParams({});
    setShowFilters(false);
  };

  const hasFilters = [...searchParams.keys()].some((k) => k !== 'page');

  return (
    <section className="products-page">
      <h1 className="page-title">Shop All Products</h1>

      {/* Search bar --------------------------------------------------- */}
      <form className="products-search" onSubmit={handleSearchSubmit}>
        <span className="material-symbols-outlined products-search__icon">search</span>
        <input
          type="text"
          className="products-search__input"
          placeholder="Search the collection…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-dark products-search__btn">
          Search
        </button>
      </form>

      {/* Mobile filters toggle --------------------------------------- */}
      <button
        type="button"
        className="btn btn-outline products-filters-toggle"
        onClick={() => setShowFilters((v) => !v)}
        aria-expanded={showFilters}
      >
        <span className="material-symbols-outlined">tune</span>
        {showFilters ? 'Hide Filters' : 'Filters'}
      </button>

      <div className="products-layout">
        {/* Sidebar filters ------------------------------------------- */}
        <aside className={`products-sidebar ${showFilters ? 'is-open' : ''}`}>
          <div className="filter-block filter-block--plain">
            <span className="filter-block__label label-caps">Sort By</span>
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-block">
            <h3 className="filter-block__title">Category</h3>
            {categories.length === 0 ? (
              <p className="filter-block__empty">No categories</p>
            ) : (
              <ul className="filter-checklist">
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <label
                      className={`filter-check ${
                        selectedCategories.includes(cat.slug) ? 'is-active' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => toggleCategory(cat.slug)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="filter-block">
            <h3 className="filter-block__title">Price</h3>
            <div className="filter-price">
              <input
                type="number"
                min="0"
                className="filter-price__input"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => setParam('minPrice', minPrice)}
                aria-label="Minimum price"
              />
              <span className="filter-price__sep">–</span>
              <input
                type="number"
                min="0"
                className="filter-price__input"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => setParam('maxPrice', maxPrice)}
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className="filter-block">
            <h3 className="filter-block__title">Size</h3>
            <div className="filter-sizes">
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`filter-size ${activeSize === size ? 'is-active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-block filter-clear"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Clear Filters
          </button>
        </aside>

        {/* Main product area ----------------------------------------- */}
        <div className="products-main">
          {loading ? (
            <Loader message="Loading products…" />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <p className="empty-state__title">No products found</p>
              <p>Try adjusting your filters or search terms.</p>
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="products-count">
                Showing {totalProducts}{' '}
                {totalProducts === 1 ? 'result' : 'results'}
              </p>
              <div className="product-grid products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="products-pagination">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
