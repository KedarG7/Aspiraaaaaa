import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JobCard from '../components/JobCard';
import { Search, MapPin, SlidersHorizontal, Info } from 'lucide-react';
import { fetchJobs, clearJobError } from '../features/jobs/jobsSlice';

const FindJobs = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    dispatch(fetchJobs({}));
  }, [dispatch]);

  const loadJobs = () => {
    dispatch(clearJobError());
    dispatch(fetchJobs({ search: keyword, location, type }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setType('');
    setTimeout(() => {
      loadJobs();
    }, 50);
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Opportunities</h1>
        <p style={styles.subtitle}>Discover your next career path with tailored criteria filters</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearch} className="glass-panel" style={styles.filterBar}>
        <div style={styles.inputWrapper}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Title, Company, Keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.divider}></div>

        <div style={styles.inputWrapper}>
          <MapPin size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Location (e.g. Remote, NY)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.divider}></div>

        <div style={styles.inputWrapper}>
          <SlidersHorizontal size={18} color="var(--text-muted)" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={styles.select}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div style={styles.actionButtons}>
          <button type="submit" className="btn-primary" style={styles.filterBtn}>
            Search
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={clearFilters}
            style={styles.resetBtn}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results Display */}
      {error && <p style={styles.errorText}>{error}</p>}

      {loading ? (
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Sifting through jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={styles.noResults}>
          <Info size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No Job Listings Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria or checking back later.</p>
        </div>
      ) : (
        <div>
          <p style={styles.resultsCount}>Found {jobs.length} job listing{jobs.length !== 1 ? 's' : ''}</p>
          <div style={styles.grid}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                showApply={user ? user.role === 'candidate' : true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    paddingTop: '3rem',
    paddingBottom: '5rem',
  },
  header: {
    marginBottom: '2.5rem',
  },
  title: {
    fontSize: '2.25rem',
    color: '#FFF',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    gap: '1rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: '220px',
  },
  input: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#FFF',
    fontSize: '0.95rem',
    width: '100%',
  },
  select: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    width: '100%',
    cursor: 'pointer',
  },
  divider: {
    width: '1px',
    height: '30px',
    backgroundColor: 'var(--border-color)',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.75rem',
    marginLeft: 'auto',
  },
  filterBtn: {
    padding: '0.6rem 1.5rem',
    fontSize: '0.9rem',
  },
  resetBtn: {
    padding: '0.6rem 1.25rem',
    fontSize: '0.9rem',
  },
  loader: {
    textAlign: 'center',
    padding: '5rem 0',
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
  noResults: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  resultsCount: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  errorText: {
    color: 'var(--danger)',
    textAlign: 'center',
    margin: '2rem 0',
    fontWeight: '500',
  },
};

export default FindJobs;
