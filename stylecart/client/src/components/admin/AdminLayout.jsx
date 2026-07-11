import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import './admin-layout.css';

const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-sidebar__head">
          <Link to="/" className="admin-sidebar__brand">
            STYLECART
          </Link>
          <p className="admin-sidebar__subtitle">Managing StyleCart</p>
        </div>

        <AdminSidebar onNavigate={() => setOpen(false)} />

        <div className="admin-sidebar__foot">
          <Link to="/" className="admin-sidebar__back">
            Back to Store
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="admin-layout__scrim"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      )}

      <div className="admin-layout__content">
        <header className="admin-layout__topbar">
          <button
            type="button"
            className="admin-layout__toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="admin-layout__title">Admin Panel</span>
        </header>
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
