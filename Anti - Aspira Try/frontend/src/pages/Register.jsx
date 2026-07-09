import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserPlus, Mail, Key, User, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { clearAuthError, registerUser, sendOtpCode, verifyOtpCode } from '../features/auth/authSlice';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Full Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['candidate', 'employer'], 'Please select a valid role')
    .required('Role is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpResent, setOtpResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: 'candidate',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError('');
    setSuccessMessage('');
    dispatch(clearAuthError());

    const resultAction = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(resultAction) && resultAction.payload?.success) {
      setRegisteredEmail(resultAction.payload.email || values.email.toLowerCase().trim());
      setShowOtpStep(true);
      setRegistrationComplete(false);
      setOtpResent(false);
      setOtpCode('');
      setCooldown(30);
      setSuccessMessage(resultAction.payload.message || 'Verification code sent to your email.');
    } else {
      const payload = resultAction.payload;
      setSubmitError(payload?.validationErrors?.[0]?.message || payload?.message || 'Registration failed. Try a different email.');
    }

    setSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (!registeredEmail || otpCode.length !== 6) {
      setSubmitError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setSubmitError('');
    setSuccessMessage('');
    const resultAction = await dispatch(verifyOtpCode({ email: registeredEmail, code: otpCode, purpose: 'register' }));

    if (verifyOtpCode.fulfilled.match(resultAction) && resultAction.payload?.success) {
      setRegistrationComplete(true);
      setShowOtpStep(false);
      setSuccessMessage(resultAction.payload.message || 'Registration completed successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { message: 'Registration successful. Please sign in with your password.' } }), 2000);
    } else {
      const payload = resultAction.payload;
      setSubmitError(payload?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (!registeredEmail) return;

    setSubmitError('');
    setSuccessMessage('');
    const resultAction = await dispatch(sendOtpCode({ email: registeredEmail, purpose: 'register' }));

    if (sendOtpCode.fulfilled.match(resultAction) && resultAction.payload?.success) {
      setOtpResent(true);
      setOtpCode('');
      setCooldown(30);
      setSuccessMessage('A fresh verification code was sent to your email.');
    } else {
      const payload = resultAction.payload;
      setSubmitError(payload?.message || 'Could not resend the code. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <UserPlus size={24} color="#FFF" />
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Aspira today and explore top talent & positions</p>
        </div>

        {(submitError || error) && (
          <div style={styles.errorBanner}>
            <ShieldAlert size={18} />
            <span>{submitError || error}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form style={showOtpStep || registrationComplete ? { display: 'none' } : undefined}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <div style={styles.inputWrapper}>
                  <User size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                  <Field
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="form-input"
                    style={styles.fieldInput}
                  />
                </div>
                <ErrorMessage name="name" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                  <Field
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="form-input"
                    style={styles.fieldInput}
                  />
                </div>
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <Key size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                  <Field
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="form-input"
                    style={styles.fieldInput}
                  />
                </div>
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="role">
                  I want to join as:
                </label>
                <Field as="select" name="role" className="form-select">
                  <option value="candidate">Candidate (Looking for Jobs)</option>
                  <option value="employer">Employer (Posting Jobs)</option>
                </Field>
                <ErrorMessage name="role" component="div" className="form-error" />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={styles.submitBtn}
              >
                {isSubmitting || loading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>

        {showOtpStep && !registrationComplete && (
          <div style={styles.otpSection}>
            <div style={styles.otpHeader}>Enter the 6-digit OTP sent to your email</div>
            <p style={styles.otpHint}>We sent it to {registeredEmail}</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="form-input"
              style={styles.otpInput}
            />
            <button type="button" className="btn-primary" onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6} style={styles.submitBtn}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleResendOtp} style={styles.resendBtn} disabled={loading || cooldown > 0}>
              <RefreshCw size={16} />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : otpResent ? 'Code resent' : 'Resend OTP'}
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Login
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
    marginBottom: '1rem',
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
    marginBottom: '1rem',
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
  otpSection: {
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  otpHeader: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
  },
  otpHint: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
  },
  otpInput: {
    marginBottom: '0.75rem',
    textAlign: 'center',
    letterSpacing: '0.25rem',
    fontSize: '1rem',
  },
  resendBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.8rem',
    marginTop: '0.5rem',
    gap: '0.4rem',
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

export default Register;
