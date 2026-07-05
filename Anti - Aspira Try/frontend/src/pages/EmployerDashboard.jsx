import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, Users, FileText, Trash2, X, Mail, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchEmployerJobs, deleteJobById } from '../features/jobs/jobsSlice';
import { fetchEmployerApplications, updateApplicationStatus } from '../features/applications/applicationsSlice';

const EmployerDashboard = () => {
  const dispatch = useDispatch();
  const { jobs, loading: loadingJobs, error: jobsError } = useSelector((state) => state.jobs);
  const { applications, loading: loadingApps, error: appsError } = useSelector((state) => state.applications);
  const [activeTab, setActiveTab] = useState('jobs');

  // Modals / Overlay States
  const [schedulingApp, setSchedulingApp] = useState(null); // application for scheduling
  const [viewingResume, setViewingResume] = useState(null); // application for resume view

  // Form states for scheduling
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLink, setInterviewLink] = useState('https://meet.jit.si/aspira-job-interview');
  const [interviewMsg, setInterviewMsg] = useState('We enjoyed reviewing your application and would like to schedule an interview.');

  useEffect(() => {
    dispatch(fetchEmployerJobs());
    dispatch(fetchEmployerApplications());
  }, [dispatch]);

  // simple upcoming interview dates (next 14 days)
  const upcomingDates = () => {
    const days = [];
    const start = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

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
      const app = applications.find((a) => a._id === appId);
      setSchedulingApp(app);
      return;
    }

    const resultAction = await dispatch(updateApplicationStatus({ applicationId: appId, payload: { status: newStatus } }));
    if (!updateApplicationStatus.fulfilled.match(resultAction)) {
      alert(resultAction.payload?.message || 'Failed to update status.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      alert('Please fill in both date and time.');
      return;
    }

    try {
      const payload = {
        status: 'interviewing',
        interviewDetails: {
          date: interviewDate,
          time: interviewTime,
          link: interviewLink,
          message: interviewMsg,
        },
      };

      const resultAction = await dispatch(updateApplicationStatus({ applicationId: schedulingApp._id, payload }));
      if (updateApplicationStatus.fulfilled.match(resultAction)) {
        setSchedulingApp(null);
        setInterviewDate('');
        setInterviewTime('');
        setInterviewMsg('We enjoyed reviewing your application and would like to schedule an interview.');
      } else {
        alert(resultAction.payload?.message || 'Failed to schedule interview.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to schedule interview.');
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

      {/* Simple Calendar Strip: upcoming 14 days with interview counts */}
      <div style={styles.calendarStrip}>
        {upcomingDates().map((d) => {
          const dateKey = d.toISOString().slice(0, 10);
          const matches = applications.filter((a) => a.interviewDetails && a.interviewDetails.date && a.interviewDetails.date.slice(0, 10) === dateKey);
          return (
            <div key={dateKey} style={{ ...styles.calendarDay, opacity: matches.length ? 1 : 0.55 }}>
              <div style={styles.calendarDayLabel}>{d.toLocaleString(undefined, { weekday: 'short' })}</div>
              <div style={styles.calendarDayNum}>{d.getDate()}</div>
              {matches.length > 0 && <div style={styles.calendarBadge}>{matches.length}</div>}
            </div>
          );
        })}
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
          <Users size={18} /> Candidate Applications ({applications.length})
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
                  <Link to={`/jobs/${job._id}`} style={{ width: '100%' }}>
                    <button className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem 0' }}>
                      View Live Posting <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                    </button>
                  </Link>
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
        ) : applications.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Applications Received</h3>
            <p style={{ color: 'var(--text-muted)' }}>When candidates apply to your job listings, they will show up here.</p>
          </div>
        ) : (
          <div style={styles.appsList}>
            {applications.map((app) => (
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
                  <div className="form-group" style={{ marginBottom: '0.5rem', width: '100%' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>
                      APPLICATION STATUS
                    </label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="form-select"
                      style={styles.statusSelect}
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div style={styles.actionButtonsRow}>
                    <button
                      onClick={() => setViewingResume(app)}
                      className="btn-secondary"
                      style={styles.appBtn}
                    >
                      <FileText size={14} /> Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Resume/Application Detail Modal */}
      {viewingResume && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.resumeModal} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{viewingResume.candidate?.name}'s Application</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>For: {viewingResume.job?.title}</p>
              </div>
              <button onClick={() => setViewingResume(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Contact Information</h4>
                <p style={styles.modalText}><strong>Email:</strong> {viewingResume.candidate?.email}</p>
                {viewingResume.resume?.portfolioUrl && (
                  <p style={styles.modalText}>
                    <strong>Portfolio:</strong>{' '}
                    <a
                      href={viewingResume.resume.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'rgba(255,255,255,0.92)', textDecoration: 'underline' }}
                    >
                      {viewingResume.resume.portfolioUrl} <ExternalLink size={12} style={{ display: 'inline' }} />
                    </a>
                  </p>
                )}
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Cover Letter</h4>
                <p style={styles.modalTextArea}>{viewingResume.coverLetter}</p>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Core Skills</h4>
                <p style={styles.modalText}>{viewingResume.resume?.skills}</p>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Experience Summary</h4>
                <p style={styles.modalTextArea}>{viewingResume.resume?.experience}</p>
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.modalSecTitle}>Full Resume Text</h4>
                <div style={styles.resumeBox}>
                  {viewingResume.resume?.resumeText}
                </div>
                {viewingResume.resume?.file && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <a
                      href={`http://localhost:5000/api/applications/${viewingResume._id}/resume`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className="btn-primary" style={{ marginTop: '0.5rem' }}>
                        View / Download Uploaded Resume (PDF)
                      </button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleScheduleSubmit} className="glass-panel" style={styles.scheduleModal} className="animate-slide-up">
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Schedule Interview</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Candidate: {schedulingApp.candidate?.name}</p>
              </div>
              <button type="button" onClick={() => setSchedulingApp(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Interview Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM (EST)"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Video Call Link</label>
                <div style={styles.inputIconWrapper}>
                  <Video size={16} color="var(--text-muted)" style={styles.modalFieldIcon} />
                  <input
                    type="url"
                    required
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Personal Message to Candidate</label>
                <textarea
                  rows={4}
                  value={interviewMsg}
                  onChange={(e) => setInterviewMsg(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={styles.mailNotice}>
                <Mail size={16} color="#f8fafc" style={{ flexShrink: 0 }} />
                <span>Saving this updates status to **Interviewing** and triggers a simulated email to the applicant.</span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setSchedulingApp(null)} className="btn-secondary" style={{ marginRight: '10px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Send Invitation
              </button>
            </div>
          </form>
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
  appRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
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
  },
  statusSelect: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
  },
  actionButtonsRow: {
    display: 'flex',
    width: '100%',
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
    maxWidth: '750px',
    maxHeight: '85vh',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
    overflowY: 'auto',
  },
  scheduleModal: {
    width: '100%',
    maxWidth: '550px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
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
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    whiteSpace: 'pre-line',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  modalFieldIcon: {
    position: 'absolute',
    left: '12px',
  },
  mailNotice: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
  },
  modalFooter: {
    padding: '1.25rem 2rem',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'flex-end',
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
  calendarStrip: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    overflowX: 'auto',
    padding: '0.5rem 0',
  },
  calendarDay: {
    minWidth: '72px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.6rem',
    textAlign: 'center',
    position: 'relative',
  },
  calendarDayLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  calendarDayNum: {
    fontSize: '1.05rem',
    color: '#FFF',
    fontWeight: '700',
  },
  calendarBadge: {
    position: 'absolute',
    right: '6px',
    top: '6px',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '999px',
    padding: '2px 7px',
    fontSize: '0.75rem',
  },
};

export default EmployerDashboard;
