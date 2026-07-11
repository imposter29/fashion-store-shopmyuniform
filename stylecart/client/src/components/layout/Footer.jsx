import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <Link to="/" className="footer__brand">
          STYLECART
        </Link>
        <nav className="footer__links">
          <Link to="/products">Shop</Link>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#shipping">Shipping &amp; Returns</a>
          <a href="#contact">Contact Us</a>
        </nav>
        <div className="footer__copy">
          © {new Date().getFullYear()} STYLECART. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
