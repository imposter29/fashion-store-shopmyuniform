const Loader = ({ message = 'Loading…' }) => {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spinner" />
      <span className="loader__message">{message}</span>
    </div>
  );
};

export default Loader;
