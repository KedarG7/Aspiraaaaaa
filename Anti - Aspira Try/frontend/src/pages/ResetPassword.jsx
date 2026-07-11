import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Key, AlertTriangle } from 'lucide-react';
import { resetPassword } from '../features/auth/authSlice';

const ResetSchema = Yup.object().shape({
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // try to read token from query param
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const resultAction = await dispatch(resetPassword({ token, password: values.password }));
      if (resultAction?.type?.endsWith('/fulfilled')) {
        navigate('/login', { state: { message: 'Password reset successful. You can now sign in.' } });
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
        <h2 style={{ color: '#fff', marginBottom: '0.25rem' }}>Reset password</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Set a new password for your account.</p>

        {(error) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <Formik initialValues={{ password: '', confirmPassword: '' }} validationSchema={ResetSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label className="form-label">New password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
                  <Field type="password" name="password" placeholder="••••••••" className="form-input" style={{ paddingLeft: 40 }} />
                </div>
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Confirm password</label>
                <Field type="password" name="confirmPassword" placeholder="••••••••" className="form-input" />
                <ErrorMessage name="confirmPassword" component="div" className="form-error" />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting || loading} style={{ width: '100%', padding: '0.85rem' }}>
                  {isSubmitting || loading ? 'Saving...' : 'Set new password'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

      </div>
    </div>
  );
};

export default ResetPassword;
