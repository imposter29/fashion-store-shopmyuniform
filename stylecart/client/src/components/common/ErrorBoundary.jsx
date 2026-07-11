import { Component } from 'react';

/**
 * App-wide error boundary. Prevents a render-time error (e.g. an API returning
 * an unexpected shape) from producing a completely blank page — shows a
 * recoverable fallback instead.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface it for debugging; a real app would report to a logging service.
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#1c1b1b',
            background: '#fdf8f8',
          }}
        >
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#444748', maxWidth: '28rem' }}>
            The page failed to load. Please refresh, or head back to the
            homepage.
          </p>
          <a
            href="/"
            style={{
              background: '#111',
              color: '#fff',
              padding: '0.85rem 1.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Reload
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
