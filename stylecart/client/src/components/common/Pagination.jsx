import './pagination.css';

/**
 * Simple numbered pagination.
 *
 * Props:
 *  - page: current page (1-based)
 *  - totalPages: total number of pages
 *  - onPageChange: (page) => void
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ‹ Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__page ${p === page ? 'is-active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next ›
      </button>
    </nav>
  );
};

export default Pagination;
