import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
];

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <h2 className="admin-sidebar__title">Admin</h2>
      <nav className="admin-sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'admin-sidebar__link is-active' : 'admin-sidebar__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
