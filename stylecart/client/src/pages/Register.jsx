import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format';
import './register.css';

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.password) {
      next.password = 'Password is required';
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__split auth__split--reverse">
        <aside className="auth__aside" aria-hidden="true">
          <div className="auth__aside-inner">
            <span className="auth__brand">StyleCart</span>
            <p className="auth__tagline">
              Join for exclusive access to editorial collections.
            </p>
          </div>
        </aside>

        <div className="auth__panel">
          <div className="auth__form-wrap">
            <span className="auth__kicker label-caps">StyleCart</span>
            <h1 className="auth__title">Create Account</h1>
            <p className="auth__subtitle">
              Join StyleCart for exclusive editorial collections.
            </p>

            {apiError && (
              <div className="alert alert-error" role="alert">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={`form-input${errors.firstName ? ' is-invalid' : ''}`}
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <span className="form-error">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={`form-input${errors.lastName ? ' is-invalid' : ''}`}
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <span className="form-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input${errors.email ? ' is-invalid' : ''}`}
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input${errors.password ? ' is-invalid' : ''}`}
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-input${
                errors.confirmPassword ? ' is-invalid' : ''
              }`}
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

              <button
                type="submit"
                className="btn btn-primary btn-block auth__submit"
                disabled={submitting}
              >
                {submitting ? 'Creating account…' : 'Create Account'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <p className="auth__switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
