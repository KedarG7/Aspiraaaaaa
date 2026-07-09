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
    <div className="animate-fade-in" style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <LogIn size={24} color="#FFF" />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to access your Aspira workspace</p>
        </div>

        {(submitError || error) && (
          <div style={styles.errorBanner}>
            <AlertTriangle size={18} />
            <span>{submitError || error}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
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
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                  <Field type="email" name="email" placeholder="you@example.com" className="form-input" style={styles.fieldInput} />
                </div>
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              {!useOtp && (
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" htmlFor="password">Password</label>
                  <div style={styles.inputWrapper}>
                    <Key size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                    <Field type="password" name="password" placeholder="••••••••" className="form-input" style={styles.fieldInput} />
                  </div>
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>
              )}

              {useOtp && otpSent && (
                <div className="form-group">
                  <label className="form-label">Enter OTP Code</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" className="form-input" />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting || loading} style={styles.submitBtn}>
                  {isSubmitting || loading ? 'Working...' : useOtp ? (otpSent ? 'Verify Code' : 'Send OTP') : 'Sign In'}
                </button>

                {/* <button type="button" className="btn-secondary" onClick={() => { setUseOtp(!useOtp); setOtpSent(false); setCode(''); }}>
                  {useOtp ? 'Use Password' : 'Use TP'}
                </button> */}
              </div>
            </Form>
          )}
        </Formik>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4rem 1rem',
    minHeight: 'calc(100vh - 120px)',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '2.5rem',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconContainer: {
    display: 'inline-flex',
    background: 'rgba(255,255,255,0.08)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: '1.75rem',
    color: '#FFF',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    color: '#bbf7d0',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  fieldInput: {
    paddingLeft: '40px',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.85rem',
    fontSize: '1rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  link: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
};

export default Login;
