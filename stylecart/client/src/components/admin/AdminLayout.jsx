import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__content">
        <header className="admin-layout__header">
          <Link to="/">← Back to store</Link>
        </header>
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
