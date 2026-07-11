import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format';
import './login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__split">
        <aside className="auth__aside" aria-hidden="true">
          <div className="auth__aside-inner">
            <span className="auth__brand">StyleCart</span>
            <p className="auth__tagline">
              Editorial fashion, curated for the modern wardrobe.
            </p>
          </div>
        </aside>

        <div className="auth__panel">
          <div className="auth__form-wrap">
            <span className="auth__kicker label-caps">StyleCart</span>
            <h1 className="auth__title">Welcome Back</h1>
            <p className="auth__subtitle">Sign in to your account to continue.</p>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="hello@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth__submit"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <p className="auth__switch">
              Don't have an account? <Link to="/register">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
