import React, { useState } from 'react';
import loginImage from '../assets/loginpage.png';
import '../styles/Login.css';

/**
 * Professional Split-Screen Login Page (src/Pages/Login.jsx)
 * Left: 100vh Full height edge-to-edge loginpage.png image
 * Right: Centered Dark Navy Card (Fixed 100vh non-scrollable)
 * Credentials: Username: admin | Password: Admin@123
 * Primary Button Color: #2E3192
 */
const Login = ({ onLoginSuccess }) => {
  // Initialized with default credentials: username "admin", password "Admin@123"
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'Admin@123',
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Form Submission & Authentication
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setErrorMessage('Please enter username');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please enter password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Authenticate credentials against admin / Admin@123
    setTimeout(() => {
      setIsLoading(false);
      if (formData.username.trim() === 'admin' && formData.password === 'Admin@123') {
        setSuccessMessage('Authentication successful! Directing to portal...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(formData);
          }
        }, 600);
      } else {
        setErrorMessage('Invalid username or password. Please use admin / Admin@123');
      }
    }, 700);
  };

  return (
    <div className="container-fluid p-0 ml-login-viewport">
      <div className="row g-0 align-items-center h-100">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN: 100vh Full Height Edge-to-Edge Image (loginpage.png) */}
        {/* ------------------------------------------------------------------ */}
        <div className="col-12 col-md-6 col-lg-6 d-none d-md-block ml-left-hero-col">
          <img
            src={loginImage}
            alt="Login Banner"
            className="ml-full-left-image"
          />
          <div className="ml-left-hero-overlay"></div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN: Fixed 100vh Non-Scrollable Centered Dark Navy Card  */}
        {/* ------------------------------------------------------------------ */}
        <div className="col-12 col-md-6 col-lg-6 ml-right-form-container">
          <div className="ml-dark-card">
            {/* Header Titles */}
            <h1 className="ml-card-title">Account Sign In</h1>
            <p className="ml-card-subtitle">
              Enter your credentials to access the Portal
            </p>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success py-2 px-3 mb-3 small rounded-3" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMessage}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Username Field */}
              <div className="ml-field-group">
                <label htmlFor="username" className="ml-field-label">
                  Username <span className="ml-req-star">*</span>
                </label>
                <div className="ml-white-input-wrap">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control ml-white-input"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleInputChange}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="ml-field-group">
                <label htmlFor="password" className="ml-field-label">
                  Password <span className="ml-req-star">*</span>
                </label>
                <div className="ml-white-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control ml-white-input"
                    placeholder="Enter password"
                    style={{ paddingRight: '2.5rem' }}
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="ml-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-end mb-4">
                <a
                  href="#forgot-password"
                  className="ml-gold-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button styled in #2E3192 */}
              <button
                type="submit"
                className="btn btn-ml-primary-action mb-4"
                disabled={isLoading}
                style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Footer Copyright inside Dark Card */}
              <div className="text-center mt-3 pt-2">
                <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  &copy; {new Date().getFullYear()} Media Logic / Sonocare Corporation Ltd.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
