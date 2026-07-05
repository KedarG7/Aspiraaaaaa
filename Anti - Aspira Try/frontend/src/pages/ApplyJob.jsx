import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, CheckCircle, Briefcase, FileText, Send, Code } from 'lucide-react';
import { fetchJobById, clearCurrentJob } from '../features/jobs/jobsSlice';
import { submitApplication } from '../features/applications/applicationsSlice';

const ApplySchema = Yup.object().shape({
  coverLetter: Yup.string()
    .min(10, 'Cover letter must be at least 10 characters')
    .required('Cover letter is required'),
  experience: Yup.string()
    .min(5, 'Please provide more details about your experience')
    .required('Experience description is required'),
  skills: Yup.string().required('Please list your core skills'),
  portfolioUrl: Yup.string().url('Please enter a valid URL').nullable(),
  resumeText: Yup.string()
    .min(20, 'Please enter details of your resume (education, jobs, etc.)')
    .required('Resume contents are required'),
});

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJob: job, loading, error } = useSelector((state) => state.jobs);
  const [submitError, setSubmitError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
    return () => dispatch(clearCurrentJob());
  }, [dispatch, id]);

  const initialValues = {
    coverLetter: '',
    experience: '',
    skills: '',
    portfolioUrl: '',
    resumeText: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError('');
    try {
      const form = new FormData();
      form.append('coverLetter', values.coverLetter);
      form.append('experience', values.experience);
      form.append('skills', values.skills);
      if (values.portfolioUrl) form.append('portfolioUrl', values.portfolioUrl);
      if (values.resumeText) form.append('resumeText', values.resumeText);
      if (resumeFile) form.append('resumeFile', resumeFile);

      const resultAction = await dispatch(submitApplication({ jobId: id, formData: form }));
      if (submitApplication.fulfilled.match(resultAction) && resultAction.payload?.success) {
        setIsSubmitted(true);
      } else {
        throw resultAction.payload || new Error('Error submitting application.');
      }
    } catch (err) {
      console.error(err);
      // handle possible validationErrors from server
      if (err && err.message) setSubmitError(err.message);
      else setSubmitError('Error submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading application framework...</p>
      </div>
    );
  }

  if ((submitError || error) && !job) {
    return (
      <div style={styles.centerContainer}>
        <h2 style={{ color: 'var(--danger)' }}>Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{submitError || error}</p>
        <button onClick={() => navigate('/jobs')} className="btn-secondary">
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container animate-fade-in" style={styles.container}>
        <div className="glass-panel" style={styles.errorCard}>
          <h2 style={styles.formTitle}>We couldn’t load this job</h2>
          <p style={styles.formSubtitle}>{submitError || error || 'Please try again in a moment.'}</p>
          <button onClick={() => navigate('/jobs')} className="btn-secondary" style={styles.backBtn}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container animate-fade-in" style={styles.container}>
        <div className="glass-panel" style={styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={48} color="var(--success)" />
          </div>
          <h1 style={styles.successTitle}>Application Submitted!</h1>
          <p style={styles.successSubtitle}>
            Your application for the <strong>{job?.title || 'this position'}</strong> role at <strong>{job?.company || 'the company'}</strong> was delivered successfully.
          </p>

          <div style={styles.divider}></div>

          <p style={styles.infoText}>
            The employer has been notified. You can track the status of this application in your candidate workspace.
          </p>

          <div style={styles.successActions}>
            <Link to="/applications">
              <button className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                Track Status & Applications
              </button>
            </Link>
            <Link to="/jobs">
              <button className="btn-secondary" style={{ padding: '0.85rem 2rem' }}>
                Find More Jobs
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={styles.backBtn}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={styles.layout}>
        {/* Form Column */}
        <div style={styles.formCol}>
          <div className="glass-panel" style={styles.card}>
            <h2 style={styles.formTitle}>Submit Application</h2>
            <p style={styles.formSubtitle}>Complete the application details below carefully</p>

            {submitError && (
              <div style={styles.errorBanner}>
                <span>{submitError}</span>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={ApplySchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label className="form-label" htmlFor="coverLetter">
                      Cover Letter
                    </label>
                    <Field
                      as="textarea"
                      name="coverLetter"
                      rows={5}
                      placeholder="Explain why you are the perfect fit for this position..."
                      className="form-textarea"
                    />
                    <ErrorMessage name="coverLetter" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="experience">
                      Work Experience Summary
                    </label>
                    <Field
                      as="textarea"
                      name="experience"
                      rows={4}
                      placeholder="Outline your work history, projects, and career highlights..."
                      className="form-textarea"
                    />
                    <ErrorMessage name="experience" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="skills">
                      Core Skills
                    </label>
                    <div style={styles.inputWrapper}>
                      <Code size={18} color="var(--text-muted)" style={styles.fieldIcon} />
                      <Field
                        type="text"
                        name="skills"
                        placeholder="React, Express, Node.js, CSS, MongoDB..."
                        className="form-input"
                        style={styles.fieldInput}
                      />
                    </div>
                    <ErrorMessage name="skills" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="portfolioUrl">
                      Portfolio / Website URL (Optional)
                    </label>
                    <Field
                      type="text"
                      name="portfolioUrl"
                      placeholder="https://yourportfolio.dev"
                      className="form-input"
                    />
                    <ErrorMessage name="portfolioUrl" component="div" className="form-error" />
                  </div>

                  <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                    <label className="form-label" htmlFor="resumeText">
                      Full Resume Details (Text Format)
                    </label>
                    <Field
                      as="textarea"
                      name="resumeText"
                      rows={8}
                      placeholder="Paste your plain-text resume here (Education, Experience, Links, etc.)..."
                      className="form-textarea"
                    />
                    <ErrorMessage name="resumeText" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="resumeFile">Upload Single-page PDF Resume</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f && f.type !== 'application/pdf') {
                          setSubmitError('Only PDF resumes are allowed.');
                          setResumeFile(null);
                          return;
                        }
                        setSubmitError('');
                        setResumeFile(f || null);
                      }}
                      className="form-input"
                    />
                    <small style={{ color: 'var(--text-muted)' }}>Maximum 5MB. Must be a single page PDF. Server will validate pages.</small>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={styles.submitBtn}
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Submitting Application...' : 'Send Application'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Side Info Column */}
        <div style={styles.infoCol}>
          <div className="glass-panel" style={styles.infoCard}>
            <h3 style={styles.infoCardTitle}>Applying For</h3>
            <div style={styles.jobBrief}>
              <Briefcase size={20} color="var(--text-muted)" />
              <div>
                <h4 style={styles.jobTitle}>{job?.title || 'Position details unavailable'}</h4>
                <p style={styles.jobCompany}>{job?.company || 'Company details unavailable'}</p>
              </div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.guidelines}>
              <h4 style={styles.guideTitle}>Submission Guidelines</h4>
              <ul style={styles.guideList}>
                <li>Ensure your contact info is updated.</li>
                <li>Write a concise and professional cover letter.</li>
                <li>List skills relevant to this specific role.</li>
                <li>Verify links are public and working.</li>
              </ul>
            </div>
          </div>
        </div>
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
  layout: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: '2 1 600px',
  },
  infoCol: {
    flex: '1 1 300px',
  },
  card: {
    padding: '2.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  errorCard: {
    padding: '2.5rem',
    textAlign: 'center',
    maxWidth: '560px',
    margin: '3rem auto 0 auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  formTitle: {
    fontSize: '1.75rem',
    color: '#FFF',
    marginBottom: '0.25rem',
  },
  formSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '2rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
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
  infoCard: {
    padding: '2rem',
  },
  infoCardTitle: {
    fontSize: '1.15rem',
    color: '#FFF',
    marginBottom: '1rem',
  },
  jobBrief: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: '1.1rem',
    color: '#FFF',
  },
  jobCompany: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1.5rem 0',
  },
  guidelines: {
    marginTop: '1.5rem',
  },
  guideTitle: {
    fontSize: '0.95rem',
    color: '#FFF',
    marginBottom: '0.75rem',
  },
  guideList: {
    paddingLeft: '1.25rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
  successCard: {
    padding: '4rem 3rem',
    textAlign: 'center',
    maxWidth: '650px',
    margin: '3rem auto 0 auto',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  successIcon: {
    display: 'inline-flex',
    background: 'rgba(255, 255, 255, 0.12)',
    padding: '1rem',
    borderRadius: '50%',
    marginBottom: '1.5rem',
  },
  successTitle: {
    fontSize: '2rem',
    color: '#FFF',
    marginBottom: '0.5rem',
  },
  successSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  infoText: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    margin: '1.5rem 0 2.5rem 0',
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  centerContainer: {
    textAlign: 'center',
    padding: '6rem 2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.12)',
    borderTop: '3px solid var(--text-main)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};

export default ApplyJob;
