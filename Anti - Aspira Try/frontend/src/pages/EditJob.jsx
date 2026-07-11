import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import { fetchJobById, updateJob } from '../features/jobs/jobsSlice';

const EditJobSchema = Yup.object().shape({
  title: Yup.string().required('Job title is required'),
  company: Yup.string().required('Company name is required'),
  location: Yup.string().required('Location is required'),
  salary: Yup.string().required('Salary range is required'),
  type: Yup.string()
    .oneOf(['Full-time', 'Part-time', 'Remote', 'Internship'], 'Invalid job type')
    .required('Job type is required'),
  description: Yup.string().min(20, 'Provide a comprehensive job description').required('Description is required'),
  requirementsText: Yup.string().required('Requirements list is required'),
  category: Yup.string().required('Category is required'),
  skillsText: Yup.string().required('At least one skill is required'),
});

const EditJob = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob, loading, error } = useSelector((state) => state.jobs);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Internship'];

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError('');
    try {
      const requirements = values.requirementsText
        .split('\n')
        .map((req) => req.trim())
        .filter((req) => req.length > 0);

      const skills = values.skillsText
        .split(/[\n,]+/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const payload = {
        title: values.title,
        company: values.company,
        location: values.location,
        salary: values.salary,
        type: values.type,
        category: values.category,
        skills,
        description: values.description,
        requirements,
      };

      const resultAction = await dispatch(updateJob({ jobId: id, payload }));
      if (updateJob.fulfilled.match(resultAction) && resultAction.payload?.success) {
        setIsSuccess(true);
        setTimeout(() => navigate('/employer'), 1200);
      } else {
        throw resultAction.payload || new Error('Failed to update job.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to update job.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentJob) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading job details...</p>
      </div>
    );
  }

  if (error && !currentJob) {
    return (
      <div className="container animate-fade-in" style={styles.container}>
        <p style={styles.errorText}>{error || 'Unable to load job details.'}</p>
      </div>
    );
  }

  const initialValues = {
    title: currentJob?.title || '',
    company: currentJob?.company || '',
    location: currentJob?.location || '',
    salary: currentJob?.salary || '',
    type: currentJob?.type || 'Full-time',
    category: currentJob?.category || '',
    skillsText: currentJob?.skills?.join(', ') || '',
    description: currentJob?.description || '',
    requirementsText: currentJob?.requirements?.join('\n') || '',
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <button onClick={() => navigate('/employer')} className="btn-secondary" style={styles.backBtn}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Edit Job Listing</h2>
            <p style={styles.subtitle}>Update the details for this published job</p>
          </div>
        </div>

        {submitError && (
          <div style={styles.errorBanner}>
            <span>{submitError}</span>
          </div>
        )}

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={EditJobSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">
                    Job Title
                  </label>
                  <Field type="text" name="title" placeholder="e.g. Lead React Developer" className="form-input" />
                  <ErrorMessage name="title" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="company">
                    Company Name
                  </label>
                  <Field type="text" name="company" placeholder="e.g. Acme Tech Inc." className="form-input" />
                  <ErrorMessage name="company" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location
                  </label>
                  <Field type="text" name="location" placeholder="e.g. Remote / New York, NY" className="form-input" />
                  <ErrorMessage name="location" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="salary">
                    Salary Range / Package
                  </label>
                  <Field type="text" name="salary" placeholder="e.g. $120,000 - $140,000 / year" className="form-input" />
                  <ErrorMessage name="salary" component="div" className="form-error" />
                </div>

                <div className="form-group" style={styles.typeFieldWrapper} ref={typeDropdownRef}>
                  <label className="form-label" htmlFor="type">
                    Job Type
                  </label>
                  <Field type="hidden" name="type" />
                  <button
                    type="button"
                    onClick={() => setIsTypeMenuOpen((prev) => !prev)}
                    style={styles.dropdownButton}
                    aria-haspopup="listbox"
                    aria-expanded={isTypeMenuOpen}
                  >
                    <span>{values.type || 'Select job type'}</span>
                    <ChevronDown size={18} />
                  </button>
                  {isTypeMenuOpen && (
                    <div style={styles.dropdownList} role="listbox">
                      {jobTypes.map((jobType) => (
                        <div
                          key={jobType}
                          style={styles.dropdownItem}
                          role="option"
                          aria-selected={values.type === jobType}
                          onClick={() => {
                            setFieldValue('type', jobType);
                            setIsTypeMenuOpen(false);
                          }}
                        >
                          {jobType}
                        </div>
                      ))}
                    </div>
                  )}
                  <ErrorMessage name="type" component="div" className="form-error" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category
                  </label>
                  <Field type="text" name="category" placeholder="e.g. Web Development" className="form-input" />
                  <ErrorMessage name="category" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="skillsText">
                    Skills (comma or newline separated)
                  </label>
                  <Field type="text" name="skillsText" placeholder="e.g. ReactJS, Node.js, Python" className="form-input" />
                  <ErrorMessage name="skillsText" component="div" className="form-error" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Job Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={6}
                  placeholder="Provide an overview of the role, team, and day-to-day responsibilities..."
                  className="form-textarea"
                />
                <ErrorMessage name="description" component="div" className="form-error" />
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label" htmlFor="requirementsText">
                  Key Requirements (One requirement per line)
                </label>
                <Field
                  as="textarea"
                  name="requirementsText"
                  rows={6}
                  placeholder="e.g.\n3+ years of experience with React\nFamiliarity with MongoDB and Node.js\nExcellent communication skills"
                  className="form-textarea"
                />
                <ErrorMessage name="requirementsText" component="div" className="form-error" />
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={styles.submitBtn}>
                Save Changes
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const styles = {
  container: {
    paddingTop: '2.5rem',
    paddingBottom: '5rem',
  },
  backBtn: {
    marginBottom: '2rem',
    padding: '0.5rem 1rem',
  },
  card: {
    padding: '2.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    color: '#FFF',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1rem',
  },
  typeFieldWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  dropdownButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition)',
    outline: 'none',
  },
  dropdownList: {
    position: 'absolute',
    top: 'calc(100% + 0.6rem)',
    left: 0,
    right: 0,
    background: 'rgba(13, 14, 21, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)',
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownItem: {
    padding: '0.85rem 1.25rem',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '0.85rem',
    fontSize: '1rem',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.85rem',
  },
  center: {
    textAlign: 'center',
    padding: '6rem 2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.12)',
    borderTop: '3px solid rgba(255,255,255,0.92)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  errorText: {
    color: 'var(--danger)',
    textAlign: 'center',
    margin: '2rem 0',
    fontWeight: '500',
  },
};

export default EditJob;
