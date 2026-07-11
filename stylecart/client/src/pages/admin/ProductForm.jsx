import { useParams } from 'react-router-dom';

const ProductForm = () => {
  const { id } = useParams();
  return (
    <section className="page">
      <h1>{id ? 'Edit Product' : 'New Product'}</h1>
    </section>
  );
};

export default ProductForm;
