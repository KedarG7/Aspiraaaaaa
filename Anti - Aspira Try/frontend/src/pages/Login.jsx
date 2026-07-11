import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LogIn, Key, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clearAuthError, loginUser, sendOtpCode, verifyOtpCode } from '../features/auth/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError('');
    dispatch(clearAuthError());

    try {
      let resultAction;
      if (useOtp) {
        if (!otpSent) {
          resultAction = await dispatch(sendOtpCode({ email: values.email }));
          if (sendOtpCode.fulfilled.match(resultAction)) {
            setOtpSent(true);
            setSubmitError('OTP sent to your email. Enter the 6-digit code below.');
            setSubmitting(false);
            return;
          }
        } else {
          resultAction = await dispatch(verifyOtpCode({ email: values.email, code }));
        }
      } else {
        resultAction = await dispatch(loginUser(values));
      }

      if (resultAction?.type?.endsWith('/fulfilled')) {
        if (useOtp && otpSent && resultAction.payload?.success) {
          navigate(resultAction.payload.user.role === 'employer' ? '/employer' : '/jobs');
        } else if (!useOtp && resultAction.payload?.success) {
          navigate(resultAction.payload.user.role === 'employer' ? '/employer' : '/jobs');
        }
      } else if (resultAction?.type?.endsWith('/rejected')) {
        setSubmitError(resultAction.payload?.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="icon">
            <LogIn size={24} color="#FFF" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to access your Aspira workspace</p>
        </div>

        {(submitError || error) && (
          <div className="alert-banner alert-error">
            <AlertTriangle size={18} />
            <span>{submitError || error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-banner alert-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <Formik initialValues={initialValues} validationSchema={LoginSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-with-icon">
                  <Mail className="field-icon" size={18} color="var(--text-muted)" />
                  <Field type="email" name="email" placeholder="you@example.com" className="form-input" />
                </div>
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              {!useOtp && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <Key className="field-icon" size={18} color="var(--text-muted)" />
                    <Field type="password" name="password" placeholder="••••••••" className="form-input" />
                  </div>
                  <ErrorMessage name="password" component="div" className="form-error" />
                  <div className="forgot-link">
                    <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                  </div>
                </div>
              )}

              {useOtp && otpSent && (
                <div className="form-group">
                  <label className="form-label">Enter OTP Code</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="form-input" />
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? 'Working...' : useOtp ? (otpSent ? 'Verify Code' : 'Send OTP') : 'Sign In'}
                </button>

              </div>
            </Form>
          )}
        </Formik>

        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
