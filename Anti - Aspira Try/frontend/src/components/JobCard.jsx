import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Building } from 'lucide-react';

const JobCard = ({ job, showApply = true }) => {
  return (
    <div className="aspira-card" style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{job.title}</h3>
          <div style={styles.companyInfo}>
            <Building size={16} color="var(--text-muted)" />
            <span style={styles.companyName}>{job.company}</span>
          </div>
        </div>
        <span style={styles.typeBadge}>{job.type}</span>
      </div>

      <p style={styles.description}>
        {job.description.length > 140
          ? `${job.description.substring(0, 140)}...`
          : job.description}
      </p>

      <div style={styles.metaGrid}>
        <div style={styles.metaItem}>
          <MapPin size={16} color="var(--text-muted)" />
          <span>{job.location}</span>
        </div>
        <div style={styles.metaItem}>
          <DollarSign size={16} color="var(--text-muted)" />
          <span>{job.salary}</span>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.postedDate}>
          <Clock size={14} />
          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        <div style={styles.actions}>
          <Link to={`/jobs/${job._id}`} style={{ marginRight: showApply ? '10px' : '0' }}>
            <button className="btn-secondary" style={styles.viewBtn}>Details</button>
          </Link>
          {showApply && (
            <Link to={`/jobs/${job._id}/apply`}>
              <button className="btn-primary" style={styles.applyBtn}>Apply Now</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '260px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    color: '#FFF',
    marginBottom: '0.25rem',
    fontWeight: '600',
  },
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  companyName: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  typeBadge: {
    fontSize: '0.75rem',
    background: 'rgba(255,255,255,0.08)',
    color: '#f8fafc',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.14)',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    marginBottom: '1.25rem',
  },
  metaGrid: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.25rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#F3F4F6',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginTop: 'auto',
  },
  postedDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  actions: {
    display: 'flex',
  },
  viewBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  applyBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
};

export default JobCard;
