import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import JobCard from '../components/JobCard';
import { Search, MapPin, SlidersHorizontal, Info } from 'lucide-react';
import { fetchJobs, clearJobError } from '../features/jobs/jobsSlice';

const FindJobs = () => {
  const dispatch = useDispatch();
  const { jobs, loading, error, pagination } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const typeDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  const jobTypes = ['Full-time', 'Part-time', 'Remote', 'Internship'];
  const jobCategories = ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'DevOps', 'Cybersecurity', 'Cloud Computing', 'Product Management'];

  useEffect(() => {
    dispatch(fetchJobs({ page: 1, limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeMenuOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const loadJobs = (page = 1) => {
    dispatch(clearJobError());
    setCurrentPage(page);
    dispatch(fetchJobs({ search: keyword, location, type, category, skills, page, limit: 6 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setType('');
    setCategory('');
    setSkills('');
    setTypeMenuOpen(false);
    setCategoryMenuOpen(false);
    setCurrentPage(1);
    dispatch(clearJobError());
    dispatch(fetchJobs({ page: 1, limit: 6 }));
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Opportunities in the Tech World</h1>
        <p style={styles.subtitle}>Discover your next career path with tailored criteria filters</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearch} className="glass-panel" style={styles.filterBar}>
        <div style={styles.filterGrid}>
          <div style={styles.filterCard}>
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
          </div>

          <div style={styles.filterCard}>
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
          </div>

          <div style={styles.filterCard} ref={typeDropdownRef}>
            <div style={styles.inputWrapper}>
              <SlidersHorizontal size={18} color="var(--text-muted)" />
              <button
                type="button"
                onClick={() => setTypeMenuOpen((prev) => !prev)}
                style={styles.dropdownButton}
                aria-haspopup="listbox"
                aria-expanded={typeMenuOpen}
              >
                {type || 'All Job Types'}
              </button>
              {typeMenuOpen && (
                <div style={styles.dropdownList} role="listbox">
                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      setType('');
                      setTypeMenuOpen(false);
                    }}
                    role="option"
                    aria-selected={type === ''}
                  >
                    All Job Types
                  </div>
                  {jobTypes.map((jobType) => (
                    <div
                      key={jobType}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setType(jobType);
                        setTypeMenuOpen(false);
                      }}
                      role="option"
                      aria-selected={type === jobType}
                    >
                      {jobType}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.filterCard} ref={categoryDropdownRef}>
            <div style={styles.inputWrapper}>
              <SlidersHorizontal size={18} color="var(--text-muted)" />
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                style={styles.dropdownButton}
                aria-haspopup="listbox"
                aria-expanded={categoryMenuOpen}
              >
                {category || 'All Categories'}
              </button>
              {categoryMenuOpen && (
                <div style={styles.dropdownList} role="listbox">
                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      setCategory('');
                      setCategoryMenuOpen(false);
                    }}
                    role="option"
                    aria-selected={category === ''}
                  >
                    All Categories
                  </div>
                  {jobCategories.map((jobCategory) => (
                    <div
                      key={jobCategory}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setCategory(jobCategory);
                        setCategoryMenuOpen(false);
                      }}
                      role="option"
                      aria-selected={category === jobCategory}
                    >
                      {jobCategory}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.filterCard}>
            <div style={styles.inputWrapper}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Skills: ReactJS, Python..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.actionsRow} className="form-actions">
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
          <div style={styles.resultsHeader}>
           <p style={styles.resultsCount}>Found {pagination.total || jobs.length} job listing{(pagination.total || jobs.length) !== 1 ? 's' : ''}</p>
           {pagination.pages > 1 && (
             <div style={styles.paginationBar}>
               <button type="button" className="btn-secondary" onClick={() => loadJobs(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ ...styles.paginationButton, opacity: currentPage === 1 ? 0.6 : 1 }}>
                 Previous
               </button>
               <span style={styles.paginationStatus}>Page {currentPage} of {pagination.pages}</span>
               <button type="button" className="btn-secondary" onClick={() => loadJobs(Math.min(pagination.pages, currentPage + 1))} disabled={currentPage === pagination.pages} style={{ ...styles.paginationButton, opacity: currentPage === pagination.pages ? 0.6 : 1 }}>
                 Next
               </button>
             </div>
           )}
          </div>

          <div className="jobs-grid" style={{ gap: '1.5rem' }}>
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
    paddingTop: "3rem",
    paddingBottom: "5rem",
  },
  header: {
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "2.25rem",
    color: "#FFF",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "var(--text-muted)",
  },
  filterBar: {
    display: "flex",
    flexDirection: "column",
    padding: "1.1rem",
    gap: "1rem",
    marginBottom: "3rem",
    position: "relative",
    overflow: "visible",
    zIndex: 2,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.85rem",
  },
  filterCard: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "var(--radius-sm)",
    padding: "0.75rem 0.9rem",
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    minHeight: "38px",
    position: "relative",
    zIndex: 3,
  },
  input: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#FFF",
    fontSize: "0.95rem",
    width: "100%",
  },
  dropdownButton: {
    width: "100%",
    fontSize: "0.92rem",
    fontWeight: "600",
    color: "var(--text-main)",
    background: "transparent",
    border: "none",
    padding: "0",
    outline: "none",
    cursor: "pointer",
    transition: "var(--transition)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
  },
  dropdownList: {
    position: "absolute",
    top: "calc(100% + 0.6rem)",
    left: 0,
    right: 0,
    minWidth: "220px",
    background: "rgba(13, 14, 21, 0.98)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
    overflow: "hidden",
    zIndex: 9999,
  },
  dropdownItem: {
    padding: "0.85rem 1.25rem",
    color: "var(--text-main)",
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "0.25rem",
  },
  filterBtn: {
    padding: "0.6rem 1.5rem",
    fontSize: "0.9rem",
  },
  resetBtn: {
    padding: "0.6rem 1.25rem",
    fontSize: "0.9rem",
  },
  loader: {
    textAlign: "center",
    padding: "5rem 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255, 255, 255, 0.12)",
    borderTop: "3px solid rgba(255,255,255,0.92)",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  noResults: {
    textAlign: "center",
    padding: "5rem 2rem",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  resultsCount: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  paginationStatus: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  paginationButton: {
    minWidth: "110px",
    justifyContent: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  errorText: {
    color: "var(--danger)",
    textAlign: "center",
    margin: "2rem 0",
    fontWeight: "500",
  },
};

export default FindJobs;
