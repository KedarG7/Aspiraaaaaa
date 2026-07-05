import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, DollarSign, Clock, Building, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { fetchJobById, clearCurrentJob } from '../features/jobs/jobsSlice';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJob: job, loading, error } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchJobById(id));
    return () => dispatch(clearCurrentJob());
  }, [dispatch, id]);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving listing details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={styles.centerContainer}>
        <h2 style={{ color: 'var(--danger)' }}>Job Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'The job listing you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/jobs')} className="btn-secondary">
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={styles.backBtn}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.companyBadge}>
            <Building size={32} color="#f8fafc" />
          </div>
          <div style={styles.headerText}>
            <div style={styles.titleRow}>
              <h1 style={styles.title}>{job.title}</h1>
              <span style={styles.typeBadge}>{job.type}</span>
            </div>
            <p style={styles.companyName}>{job.company}</p>
          </div>
        </div>

        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <MapPin size={18} color="var(--text-muted)" />
            <span>{job.location}</span>
          </div>
          <div style={styles.metaItem}>
            <DollarSign size={18} color="var(--text-muted)" />
            <span>{job.salary}</span>
          </div>
          <div style={styles.metaItem}>
            <Clock size={18} color="var(--text-muted)" />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>Job Description</h3>
          <p style={styles.description}>{job.description}</p>
        </div>

        <div style={styles.contentSection}>
          <h3 style={styles.sectionTitle}>Key Requirements</h3>
          <ul style={styles.requirementsList}>
            {job.requirements.map((req, idx) => (
              <li key={idx} style={styles.requirementItem}>
                <CheckCircle size={16} color="#f8fafc" style={{ flexShrink: 0 }} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.actionRow}>
          {!isAuthenticated ? (
            <div style={styles.alertBox}>
              <p>Please <Link to="/login" style={styles.alertLink}>sign in</Link> or <Link to="/register" style={styles.alertLink}>register</Link> as a Candidate to apply for this job listing.</p>
            </div>
          ) : user && user.role === 'candidate' ? (
            <Link to={`/jobs/${job._id}/apply`} style={{ width: '100%' }}>
              <button className="btn-primary" style={styles.applyBtn}>
                <Send size={18} /> Apply for this Job
              </button>
            </Link>
          ) : (
            <div style={styles.alertBox}>
              <p>You are logged in as an <strong>Employer</strong>. Only Candidates can apply to jobs.</p>
            </div>
          )}
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
  card: {
    padding: '3rem',
    boxShadow: '0 15px 45px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  companyBadge: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    color: '#FFF',
    fontWeight: '700',
  },
  typeBadge: {
    fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.08)',
    color: '#f8fafc',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  companyName: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '0.25rem',
  },
  metaRow: {
    display: 'flex',
    gap: '2.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#FFF',
    fontWeight: '500',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '2rem 0',
  },
  contentSection: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#FFF',
    marginBottom: '1rem',
  },
  description: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    lineHeight: '1.7',
    whiteSpace: 'pre-line',
  },
  requirementsList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  actionRow: {
    marginTop: '3rem',
    display: 'flex',
    justifyContent: 'center',
  },
  applyBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '1rem',
    fontSize: '1.1rem',
  },
  alertBox: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
  },
  alertLink: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
  centerContainer: {
    textAlign: 'center',
    padding: '6rem 2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.12)',
    borderTop: '3px solid #f8fafc',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};

export default JobDetails;
