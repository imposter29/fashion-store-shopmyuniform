import { Link, useParams } from 'react-router-dom';
import { shortId } from '../utils/format';
import './order-success.css';

const OrderSuccess = () => {
  const { id } = useParams();

  return (
    <div className="container order-success">
      <div className="order-success__card">
        <div className="order-success__check" aria-hidden="true">
          <span className="material-symbols-outlined">check_circle</span>
        </div>

        <h1 className="order-success__title">Order Placed Successfully!</h1>
        <p className="order-success__subtitle">
          Thank you for shopping with StyleCart.
        </p>

        <div className="order-success__id">
          <span className="order-success__id-label">Order Reference</span>
          <span className="order-success__id-value">{shortId(id)}</span>
        </div>

        <p className="order-success__delivery">
          <span className="material-symbols-outlined">local_shipping</span>
          Your order will be delivered in 5-7 business days.
        </p>

        <div className="order-success__actions">
          <Link to={`/orders/${id}`} className="btn btn-primary">
            View Order Details
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
