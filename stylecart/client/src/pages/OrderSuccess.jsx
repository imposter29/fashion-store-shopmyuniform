import { useParams } from 'react-router-dom';

const OrderSuccess = () => {
  const { id } = useParams();
  return (
    <section className="page">
      <h1>Order Success Page</h1>
      <p>Order ID: {id}</p>
    </section>
  );
};

export default OrderSuccess;
