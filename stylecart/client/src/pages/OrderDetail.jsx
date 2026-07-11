import { useParams } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  return (
    <section className="page">
      <h1>Order Detail Page</h1>
      <p>Order ID: {id}</p>
    </section>
  );
};

export default OrderDetail;
