import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../features/auth/authSlice';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const resultAction = await dispatch(forgotPassword({ email: values.email }));
      if (resultAction?.type?.endsWith('/fulfilled')) {
        // redirect to login with message
        navigate('/login', { state: { message: 'Password reset email sent. Check your inbox.' } });
      }
    } catch (err) {
      // handled by slice
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '0.25rem' }}>Forgot your password?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Enter the email associated with your account and we'll send a link to reset your password.</p>

        {(error) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <Formik initialValues={{ email: '' }} validationSchema={ForgotSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
                  <Field type="email" name="email" placeholder="you@example.com" className="form-input" style={{ paddingLeft: 40 }} />
                </div>
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting || loading} style={{ width: '100%', padding: '0.85rem' }}>
                  {isSubmitting || loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

      </div>
    </div>
  );
};

export default ForgotPassword;
