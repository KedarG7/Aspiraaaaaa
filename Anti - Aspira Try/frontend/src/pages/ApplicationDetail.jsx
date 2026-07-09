import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchEmployerApplications, updateApplicationStatus } from '../features/applications/applicationsSlice';
import { api } from '../utils/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employerApplications: applications, loading, error } = useSelector((state) => state.applications);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!applications.length) dispatch(fetchEmployerApplications());
  }, [applications.length, dispatch]);

  const application = applications.find((a) => a._id === id);

  const handleStatusUpdate = async (status) => {
    setSubmitting(true);
    try {
      const payload = { status };
      const resultAction = await dispatch(updateApplicationStatus({ applicationId: id, payload }));
      if (updateApplicationStatus.fulfilled.match(resultAction)) {
        // refresh or navigate back
        navigate('/employer');
      } else {
        alert(resultAction.payload?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !application) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container animate-fade-in" style={styles.container}>
        <div className="glass-panel" style={styles.card}>
          <h2 style={styles.title}>Application Not Found</h2>
          <p style={styles.subtitle}>This application may have been removed.</p>
          <div style={styles.errorBanner}>{error || 'Application not available'}</div>
          <Link to="/employer">
            <button className="btn-secondary" style={styles.backBtn}>Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{application.candidate?.name}'s Application</h1>
          <p style={styles.subtitle}>For: {application.job?.title}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/employer">
            <button className="btn-secondary">Back</button>
          </Link>
          <button className="btn-primary" disabled={submitting} onClick={() => handleStatusUpdate('reviewing')}>
            Mark Reviewing
          </button>
        </div>
      </div>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.detailGrid}>
          <div style={styles.detailBlock}>
            <h3 style={styles.sectionTitle}>Contact</h3>
            <p style={styles.detailText}><strong>Name:</strong> {application.candidate?.name}</p>
            <p style={styles.detailText}><strong>Email:</strong> {application.candidate?.email}</p>
            {application.resume?.portfolioUrl && (
              <p style={styles.detailText}>
                <strong>Portfolio:</strong>{' '}
                <a href={application.resume.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {application.resume.portfolioUrl}
                </a>
              </p>
            )}
          </div>

          <div style={styles.detailBlock}>
            <h3 style={styles.sectionTitle}>Job</h3>
            <p style={styles.detailText}><strong>Title:</strong> {application.job?.title}</p>
            <p style={styles.detailText}><strong>Company:</strong> {application.job?.company}</p>
            <p style={styles.detailText}><strong>Location:</strong> {application.job?.location}</p>
            <p style={styles.detailText}><strong>Status:</strong> {application.status}</p>
            {application.status === 'interviewing' && application.interviewDetails && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={styles.detailText}><strong>Interview:</strong> {new Date(application.interviewDetails.date).toDateString()} at {application.interviewDetails.time}</p>
                <p style={styles.detailText}><strong>Link:</strong> <a href={application.interviewDetails.link} target="_blank" rel="noreferrer">{application.interviewDetails.link}</a></p>
                {application.interviewDetails.message && <p style={styles.detailText}><strong>Note:</strong> {application.interviewDetails.message}</p>}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={styles.sectionTitle}>Cover Letter</h3>
          <p style={styles.modalTextArea}>{application.coverLetter}</p>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={styles.sectionTitle}>Resume</h3>
          <div style={styles.resumeBox}>{application.resume?.resumeText}</div>
          {application.resume?.file && (
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-primary"
                style={{ marginTop: '0.5rem' }}
                onClick={async () => {
                  try {
                    const blob = await api.getBlob(`/applications/${application._id}/resume`);
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 15000);
                  } catch (err) {
                    alert(err.message || 'Unable to fetch resume.');
                  }
                }}
              >
                View / Download Resume (PDF)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { paddingTop: '3rem', paddingBottom: '5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', color: '#FFF' },
  subtitle: { fontSize: '0.95rem', color: 'var(--text-muted)' },
  card: { padding: '1.5rem', boxShadow: '0 12px 30px rgba(0,0,0,0.3)' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' },
  detailBlock: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', padding: '1rem' },
  sectionTitle: { fontSize: '0.95rem', color: '#FFF', marginBottom: '0.5rem' },
  detailText: { color: 'var(--text-muted)', lineHeight: '1.6' },
  modalTextArea: { fontSize: '0.92rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: '1.6' },
  resumeBox: { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'pre-line', maxHeight: '420px', overflowY: 'auto' },
  backBtn: { padding: '0.6rem 0.9rem' },
  errorBanner: { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '6px' },
  center: { textAlign: 'center', padding: '6rem 2rem' },
  spinner: { width: '40px', height: '40px', border: '3px solid rgba(255, 255, 255, 0.12)', borderTop: '3px solid rgba(255,255,255,0.92)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' },
};

export default ApplicationDetail;
