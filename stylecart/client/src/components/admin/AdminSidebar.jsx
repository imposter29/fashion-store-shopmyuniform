import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/categories', label: 'Categories', icon: 'category' },
  { to: '/admin/orders', label: 'Orders', icon: 'receipt_long' },
];

const AdminSidebar = ({ onNavigate }) => {
  return (
    <ul className="admin-sidebar__nav">
      {links.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? 'admin-sidebar__link is-active' : 'admin-sidebar__link'
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default AdminSidebar;
