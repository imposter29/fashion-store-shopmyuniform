const Loader = ({ message = 'Loading…', fullPage = false }) => {
  return (
    <div
      className={fullPage ? 'loader loader--full' : 'loader'}
      role="status"
      aria-live="polite"
    >
      <div className="loader__spinner" />
      <span className="loader__message">{message}</span>
    </div>
  );
};

export default Loader;
