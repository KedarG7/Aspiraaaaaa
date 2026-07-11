import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, Users, FileText, Trash2, X, ExternalLink, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchEmployerJobs, deleteJobById } from '../features/jobs/jobsSlice';
import { fetchEmployerApplications, updateApplicationStatus } from '../features/applications/applicationsSlice';

const EmployerDashboard = () => {
  const dispatch = useDispatch();
  const { jobs, loading: loadingJobs, error: jobsError } = useSelector((state) => state.jobs);
  const { employerApplications, loading: loadingApps, error: appsError, employerPagination } = useSelector((state) => state.applications);
  const [activeTab, setActiveTab] = useState('jobs');
  const navigate = useNavigate();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [applicationsPage, setApplicationsPage] = useState(1);
  const applicationsPerPage = employerPagination.limit || 5;

  // Modal / Overlay States
  const [viewingResume, setViewingResume] = useState(null); // application for resume view
  const [openStatusApp, setOpenStatusApp] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployerJobs({ page: 1, limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEmployerApplications({ page: applicationsPage, limit: applicationsPerPage }));
  }, [dispatch, applicationsPage, applicationsPerPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.status-dropdown')) {
        setOpenStatusApp(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const upcomingDates = () => {
    const days = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const calendarDays = upcomingDates();
  const selectedDateLabel = selectedCalendarDate ? new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a day';
  const selectedDayInterviews = employerApplications.filter((app) => app.interviewDetails && app.interviewDetails.date && app.interviewDetails.date.slice(0, 10) === selectedCalendarDate);
  const totalApplicationsPages = employerPagination.pages || 1;
  const visibleApplications = employerApplications;

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? All associated applications might become orphaned.')) {
      return;
    }
    const resultAction = await dispatch(deleteJobById(jobId));
    if (!deleteJobById.fulfilled.match(resultAction)) {
      alert(resultAction.payload?.message || 'Failed to delete job.');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    if (newStatus === 'interviewing') {
      setOpenStatusApp(null);
      navigate(`/employer/schedule-interview/${appId}`);
      return;
    }

    setOpenStatusApp(null);
    const resultAction = await dispatch(updateApplicationStatus({ applicationId: appId, payload: { status: newStatus } }));
    if (!updateApplicationStatus.fulfilled.match(resultAction)) {
      alert(resultAction.payload?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employer Panel</h1>
          <p style={styles.subtitle}>Manage your openings and candidate applications</p>
        </div>
        <Link to="/employer/post-job">
          <button className="btn-primary">
            <Briefcase size={16} /> Post new Job
          </button>
        </Link>
      </div>

      <div className="glass-panel" style={styles.calendarPanel}>
        <div style={styles.calendarPanelHeader}>
          <div>
            <p style={styles.calendarEyebrow}>Interview planning</p>
            <h2 style={styles.calendarTitle}>Dedicated Interview Calendar</h2>
          </div>
          <p style={styles.calendarHint}>Click a day to review scheduled interviews.</p>
        </div>

        <div style={styles.calendarGrid}>
          {calendarDays.map((d) => {
            const dateKey = toDateKey(d);
            const matches = employerApplications.filter((a) => a.interviewDetails && a.interviewDetails.date && a.interviewDetails.date.slice(0, 10) === dateKey);
            const isSelected = selectedCalendarDate === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedCalendarDate(dateKey)}
                style={{ ...styles.calendarDay, ...(isSelected ? styles.selectedCalendarDay : {}) }}
              >
                <div style={styles.calendarDayLabel}>{d.toLocaleString(undefined, { weekday: 'short' })}</div>
                <div style={styles.calendarDayNum}>{d.getDate()}</div>
                {matches.length > 0 && <div style={styles.calendarBadge}>{matches.length}</div>}
              </button>
            );
          })}
        </div>

        <div style={styles.calendarDetails}>
          <div style={styles.calendarDetailsHeader}>Scheduled interviews for {selectedDateLabel}</div>
          {selectedDayInterviews.length === 0 ? (
            <p style={styles.calendarEmpty}>No interviews are scheduled for this day yet.</p>
          ) : (
            <div style={styles.interviewList}>
              {selectedDayInterviews.map((app) => (
                <div key={app._id} style={styles.interviewEntry}>
                  <div>
                    <p style={styles.interviewCandidate}>{app.candidate?.name || 'Deleted Account'}</p>
                    <p style={styles.interviewMeta}>{app.job?.title || 'Unknown Job'}</p>
                  </div>
                  <div style={styles.interviewTimeBox}>
                    <p style={styles.interviewTime}>{app.interviewDetails?.time || 'Time pending'}</p>
                    <p style={styles.interviewLink}>{app.interviewDetails?.link ? 'Video link ready' : 'Link pending'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(jobsError || appsError) && <p style={styles.errorText}>{jobsError || appsError}</p>}

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            ...styles.tabButton,
            borderBottom: activeTab === 'jobs' ? '3px solid rgba(255,255,255,0.24)' : '3px solid transparent',
            color: activeTab === 'jobs' ? '#FFF' : 'var(--text-muted)',
            fontWeight: activeTab === 'jobs' ? '700' : '500',
          }}
        >
          <Briefcase size={18} /> My Job Openings ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          style={{
            ...styles.tabButton,
            borderBottom: activeTab === 'apps' ? '3px solid rgba(255,255,255,0.24)' : '3px solid transparent',
            color: activeTab === 'apps' ? '#FFF' : 'var(--text-muted)',
            fontWeight: activeTab === 'apps' ? '700' : '500',
          }}
        >
          <Users size={18} /> Candidate Applications ({employerApplications.length})
        </button>
      </div>

      {/* Main Panel Content */}
      {activeTab === 'jobs' ? (
        loadingJobs ? (
          <div style={styles.center}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving your postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <Briefcase size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Jobs Posted Yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click the 'Post new Job' button above to create a listing.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((job) => (
              <div key={job._id} className="aspira-card" style={styles.jobCard}>
                <div style={styles.jobCardHeader}>
                  <div>
                    <h3 style={styles.jobTitleText}>{job.title}</h3>
                    <p style={styles.jobLocationText}>{job.location} • {job.type}</p>
                  </div>
                  <button onClick={() => handleDeleteJob(job._id)} style={styles.deleteBtn} title="Delete listing">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={styles.divider}></div>
                <div style={styles.jobCardBody}>
                  <p style={styles.jobSalary}><strong>Salary:</strong> {job.salary}</p>
                  <p style={styles.jobDesc}>
                    {job.description.substring(0, 100)}...
                  </p>
                </div>
                <div style={styles.jobCardFooter}>
                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                    <Link to={`/jobs/${job._id}`} style={{ width: '100%' }}>
                      <button className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem 0' }}>
                        View Live Posting <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                      </button>
                    </Link>
                    <Link to={`/employer/edit-job/${job._id}`} style={{ width: '100%' }}>
                      <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem 0' }}>
                        Edit Job
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        loadingApps ? (
          <div style={styles.center}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving candidate files...</p>
          </div>
        ) : employerApplications.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Applications Received</h3>
            <p style={{ color: 'var(--text-muted)' }}>When candidates apply to your job listings, they will show up here.</p>
          </div>
        ) : (
          <div style={styles.appsList}>
            <div style={styles.paginationInfo}>
              Showing {visibleApplications.length} of {employerPagination.total || employerApplications.length} applicants
            </div>
            {visibleApplications.map((app) => (
              <div key={app._id} className="glass-panel" style={styles.appRow}>
                <div style={styles.appMainInfo}>
                  <div>
                    <h3 style={styles.appName}>{app.candidate?.name || 'Deleted Account'}</h3>
                    <p style={styles.appContact}>{app.candidate?.email || 'No email available'}</p>
                    <p style={styles.appRoleLabel}>Applied for: <strong>{app.job?.title || 'Unknown Job'}</strong></p>
                  </div>

                  <div style={styles.appMetrics}>
                    <p style={styles.appSkills}><strong>Skills:</strong> {app.resume?.skills}</p>
                    <p style={styles.appExp}><strong>Experience:</strong> {app.resume?.experience.substring(0, 80)}...</p>
                  </div>
                </div>

                <div style={styles.appActionsBlock}>
                  {/* Status update select */}
                  <div className="status-dropdown" style={{ position: 'relative', marginBottom: '0.5rem', width: '100%' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                      APPLICATION STATUS
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenStatusApp(openStatusApp === app._id ? null : app._id)}
                      style={styles.dropdownButtonSmall}
                    >
                      <span style={{ textTransform: 'capitalize' }}>{app.status}</span>
                      <ChevronDown size={16} />
                    </button>
                    {openStatusApp === app._id && (
                      <div style={styles.statusDropdownList}>
                        {['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'].map((status) => (
                          <div
                            key={status}
                            role="button"
                            tabIndex={0}
                            style={styles.statusDropdownItem}
                            onClick={() => handleStatusChange(app._id, status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.actionButtonsRow}>
                    <button
                      onClick={() => navigate(`/employer/application/${app._id}`)}
                      className="btn-secondary"
                      style={styles.appBtn}
                    >
                      <FileText size={14} /> Full Details
                    </button>
                    <button
                      onClick={() => navigate(`/employer/schedule-interview/${app._id}`)}
                      className="btn-primary"
                      style={styles.appBtn}
                    >
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {totalApplicationsPages > 1 && (
              <div style={styles.paginationBar}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setApplicationsPage((page) => Math.max(1, page - 1))}
                  disabled={applicationsPage === 1}
                  style={{ ...styles.paginationButton, opacity: applicationsPage === 1 ? 0.6 : 1 }}
                >
                  Previous
                </button>
                <span style={styles.paginationStatus}>Page {applicationsPage} of {totalApplicationsPages}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setApplicationsPage((page) => Math.min(totalApplicationsPages, page + 1))}
                  disabled={applicationsPage === totalApplicationsPages}
                  style={{ ...styles.paginationButton, opacity: applicationsPage === totalApplicationsPages ? 0.6 : 1 }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* Application details are now on a dedicated page */}

    </div>
  );
};

const styles = {
  container: {
    paddingTop: '3rem',
    paddingBottom: '5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2.25rem',
    color: '#FFF',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  tabsRow: {
    display: 'flex',
    gap: '2rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '2.5rem',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 0',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'var(--transition)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  jobCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
  },
  jobCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitleText: {
    fontSize: '1.15rem',
    color: '#FFF',
  },
  jobLocationText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  deleteBtn: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: 'var(--danger)',
    padding: '0.4rem',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    transition: 'var(--transition)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '1rem 0',
  },
  jobCardBody: {
    flex: 1,
    marginBottom: '1rem',
  },
  jobSalary: {
    fontSize: '0.85rem',
    color: '#FFF',
    marginBottom: '0.25rem',
  },
  jobDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  appsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  paginationInfo: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textAlign: 'right',
  },
  paginationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '0.5rem',
    flexWrap: 'wrap',
  },
  paginationStatus: {
    color: '#FFF',
    fontWeight: '600',
  },
  paginationButton: {
    minWidth: '110px',
    justifyContent: 'center',
  },
  appRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
    zIndex:'1'
  },
  appMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: '2 1 450px',
  },
  appName: {
    fontSize: '1.25rem',
    color: '#FFF',
  },
  appContact: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  appRoleLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    marginTop: '0.25rem',
  },
  appMetrics: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    borderLeft: '2px solid var(--border-color)',
    paddingLeft: '1rem',
  },
  appSkills: {
    marginBottom: '0.25rem',
  },
  appActionsBlock: {
    flex: '1 1 250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.75rem',
    height:'320px' || 'fit-content'
  },
  statusSelect: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
  },
  dropdownButtonSmall: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    // zIndex:'999',
    // position:'absolute',
  },
  statusDropdownList: {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    left: 0,
    width: '100%',
    background: 'rgba(13, 14, 21, 0.98)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
    zIndex: 999,
    overflow: 'hidden',
  },
  statusDropdownItem: {
    padding: '0.85rem 1rem',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  actionButtonsRow: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  appBtn: {
    width: '100%',
    padding: '0.5rem 0',
    fontSize: '0.85rem',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backdropFilter: 'blur(5px)',
  },
  resumeModal: {
    width: '100%',
    maxWidth: '880px',
    maxHeight: '92vh',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: '#FFF',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
  },
  modalBody: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  modalSecTitle: {
    fontSize: '0.95rem',
    color: '#FFF',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  modalText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  modalTextArea: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  resumeBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '1.25rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    whiteSpace: 'pre-line',
    minHeight: '220px',
    maxHeight: '420px',
    overflowY: 'auto',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 2rem',
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
  calendarPanel: {
    padding: '1.5rem',
    marginBottom: '1.75rem',
    width:'110%'
  },
  calendarPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  calendarEyebrow: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.3rem',
  },
  calendarTitle: {
    fontSize: '1.2rem',
    color: '#FFF',
  },
  calendarHint: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
    gap: '0.6rem',
    marginBottom: '1rem',
  },
  calendarDay: {
    minHeight: '78px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '0.65rem',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    color: '#FFF',
  },
  selectedCalendarDay: {
    background: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  calendarDayLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  calendarDayNum: {
    fontSize: '1.08rem',
    color: '#FFF',
    fontWeight: '700',
    marginTop: '0.15rem',
  },
  calendarBadge: {
    position: 'absolute',
    right: '6px',
    top: '6px',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    borderRadius: '999px',
    padding: '2px 7px',
    fontSize: '0.72rem',
  },
  calendarDetails: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem 1.1rem',
  },
  calendarDetailsHeader: {
    color: '#FFF',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  calendarEmpty: {
    color: 'var(--text-muted)',
    fontSize: '0.92rem',
  },
  interviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  interviewEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.8rem 0.95rem',
  },
  interviewCandidate: {
    color: '#FFF',
    fontWeight: '600',
  },
  interviewMeta: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginTop: '0.2rem',
  },
  interviewTimeBox: {
    textAlign: 'right',
  },
  interviewTime: {
    color: '#FFF',
    fontWeight: '600',
  },
  interviewLink: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    marginTop: '0.1rem',
  },
};

export default EmployerDashboard;
