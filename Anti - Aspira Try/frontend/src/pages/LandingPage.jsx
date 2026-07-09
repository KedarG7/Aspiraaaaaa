import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ArrowRight, Star } from 'lucide-react';
import { api } from '../utils/api';
import JobCard from '../components/JobCard';

const LandingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('aspira_token');
  const user = localStorage.getItem('aspira_user') ? JSON.parse(localStorage.getItem('aspira_user')) : null;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (searchVal = '', locVal = '') => {
    setLoading(true);
    try {
      let queryStr = '';
      const params = [];
      if (searchVal) params.push(`search=${searchVal}`);
      if (locVal) params.push(`location=${locVal}`);
      if (params.length) queryStr = `?${params.join('&')}`;

      if (!queryStr) {
        queryStr = '?limit=6';
      } else {
        queryStr += '&limit=6';
      }

      const res = await api.get(`/jobs${queryStr}`);
      if (res.success) {
        setJobs(res.jobs.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch jobs from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(search, location);
  };

  return (
    <div className="animate-fade-in" style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroContent} className="animate-slide-up">
            <div style={styles.badgeContainer}>
              <Star size={14} color="var(--text-muted)" />
              <span style={styles.heroBadge}>The Minimalist Job Connect Platform</span>
            </div>
            <h1 style={styles.heroTitle}>
              Unlock Your Next Career <span className="gradient-text">Aspiration</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Connect with top-tier employers and find jobs that match your skillset. Built for developers, designers, and modern professionals.
            </p>

            {!token && (
              <div style={styles.ctaButtons}>
                <Link to="/register" className="btn-primary" style={styles.btnLarge}>
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary" style={styles.btnLarge}>
                  Sign In
                </Link>
              </div>
            )}

            {user && (
              <div style={styles.ctaButtons}>
                {user.role === 'candidate' ? (
                  <Link to="/applications" className="btn-primary" style={styles.btnLarge}>
                    Go to Applicant Dashboard
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/employer" className="btn-primary" style={styles.btnLarge}>
                    Go to Employer Dashboard
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Find Jobs Search Area */}
      <section style={styles.searchSection}>
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="glass-panel" style={styles.searchForm}>
            <div style={styles.inputWrapper}>
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Job Title, Skills, or Keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.divider}></div>
            <div style={styles.inputWrapper}>
              <MapPin size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="City, State, or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button type="submit" className="btn-primary" style={styles.searchBtn}>
              Find Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Display Jobs Section */}
      <section style={styles.jobsSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Featured Opportunities</h2>
            <Link to="/jobs" style={styles.seeAllLink}>
              View All Jobs <ArrowRight size={16} />
            </Link>
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching available jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div style={styles.emptyState}>
              <Briefcase size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>No jobs found matching your criteria</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Try modifying your keywords or location search.</p>
            </div>
          ) : (
            <div style={styles.jobsGrid}>
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} showApply={user ? user.role === 'candidate' : true} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    paddingBottom: '4rem',
  },
  hero: {
    padding: '6rem 0 3rem 0',
    textAlign: 'center',
  },
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '800px',
  },
  badgeContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    padding: '0.4rem 1rem',
    borderRadius: '50px',
    marginBottom: '2rem',
  },
  heroBadge: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    marginBottom: '1.5rem',
    color: '#FFF',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '2.5rem',
    fontWeight: '400',
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.25rem',
  },
  btnLarge: {
    padding: '0.9rem 2rem',
    fontSize: '1.05rem',
    borderRadius: 'var(--radius-sm)',
  },
  searchSection: {
    margin: '2rem 0',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    gap: '1rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: '250px',
    padding: '0.5rem',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#FFF',
    fontSize: '1.05rem',
    width: '100%',
    outline: 'none',
  },
  divider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'var(--border-color)',
  },
  searchBtn: {
    padding: '0.8rem 2rem',
    fontSize: '1rem',
    borderRadius: 'var(--radius-sm)',
    marginLeft: 'auto',
  },
  jobsSection: {
    marginTop: '4rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    color: '#FFF',
    fontWeight: '700',
  },
  seeAllLink: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.95rem',
    transition: 'var(--transition)',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  errorMessage: {
    color: 'var(--danger)',
    textAlign: 'center',
    margin: '2rem 0',
    fontWeight: '500',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem 0',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.12)',
    borderTop: '3px solid rgba(255,255,255,0.92)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 0',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
};

export default LandingPage;
