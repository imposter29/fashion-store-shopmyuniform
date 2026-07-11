import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  return (
    <section className="page">
      <h1>Product Detail Page</h1>
      <p>Product ID: {id}</p>
    </section>
  );
};

export default ProductDetail;
