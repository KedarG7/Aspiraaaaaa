import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList, Calendar, Video, Mail, X } from 'lucide-react';
import { fetchCandidateApplications } from '../features/applications/applicationsSlice';

const TrackStatus = () => {
  const dispatch = useDispatch();
  const { applications, loading, error } = useSelector((state) => state.applications);
  const [selectedMail, setSelectedMail] = useState(null);

  useEffect(() => {
    dispatch(fetchCandidateApplications());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <span className="badge badge-applied">Applied</span>;
      case 'reviewing':
        return <span className="badge badge-reviewing">In Review</span>;
      case 'interviewing':
        return <span className="badge badge-interviewing">Interviewing</span>;
      case 'accepted':
        return <span className="badge badge-accepted">Accepted</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-applied">{status}</span>;
    }
  };

  const renderStatusPipeline = (status) => {
    const steps = ['applied', 'reviewing', 'interviewing', 'decision'];
    const currentIndex = steps.indexOf(status === 'accepted' || status === 'rejected' ? 'decision' : status);

    return (
      <div style={styles.pipeline}>
        {steps.map((step, idx) => {
          let label = step.toUpperCase();
          if (step === 'decision') {
            label = status === 'accepted' ? 'ACCEPTED' : status === 'rejected' ? 'REJECTED' : 'DECISION';
          }

          let isDone = idx < currentIndex;
          let isActive = idx === currentIndex;
          let isFuture = idx > currentIndex;

          let stepStyle = styles.stepDot;
          if (isActive) {
            stepStyle = { ...styles.stepDot, ...styles.stepActive };
          } else if (isDone) {
            stepStyle = { ...styles.stepDot, ...styles.stepDone };
          }

          if (step === 'decision' && status === 'rejected') {
            stepStyle = { ...stepStyle, background: 'var(--danger)', borderColor: 'var(--danger)' };
          } else if (step === 'decision' && status === 'accepted') {
            stepStyle = { ...stepStyle, background: 'var(--success)', borderColor: 'var(--success)' };
          }

          return (
            <React.Fragment key={step}>
              <div style={styles.stepItem}>
                <div style={stepStyle}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: isActive ? '#FFF' : isDone ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isActive || isDone ? '600' : '400',
                  }}
                >
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    ...styles.pipelineLine,
                    background: idx < currentIndex ? 'rgba(255,255,255,0.14)' : 'var(--border-color)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving application files...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Track Applications</h1>
        <p style={styles.subtitle}>Check the live status of your job submissions</p>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      {applications.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <ClipboardList size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No applications found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Submit applications for jobs in the Find Jobs section to track status here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {applications.map((app) => (
            <div key={app._id} className="glass-panel" style={styles.appCard}>
              <div style={styles.appHeader}>
                <div>
                  <h2 style={styles.jobTitle}>{app.job?.title || 'Unknown Title'}</h2>
                  <p style={styles.companyName}>{app.job?.company || 'Unknown Company'}</p>
                </div>
                <div style={styles.badgeRow}>
                  {getStatusBadge(app.status)}
                  <span style={styles.appliedDate}>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Visual Pipeline */}
              <div style={styles.pipelineContainer}>
                {renderStatusPipeline(app.status)}
              </div>

              {/* Interview Box */}
              {app.status === 'interviewing' && app.interviewDetails && (
                <div style={styles.interviewBox} className="animate-slide-up">
                  <div style={styles.interviewHeader}>
                    <div style={styles.pulseContainer}>
                      <span className="pulse-dot"></span>
                      <h4 style={styles.interviewTitle}>Interview Scheduled!</h4>
                    </div>
                    <button
                      onClick={() => setSelectedMail(app)}
                      className="btn-primary"
                      style={styles.emailBtn}
                    >
                      <Mail size={16} /> Open Invitation Email
                    </button>
                  </div>

                  <div style={styles.interviewGrid}>
                    <div style={styles.interviewDetailItem}>
<Calendar size={18} color="var(--text-muted)" />
                      <div>
                        <span style={styles.detailLabel}>Date & Time</span>
                        <span style={styles.detailValue}>
                          {new Date(app.interviewDetails.date).toDateString()} at {app.interviewDetails.time}
                        </span>
                      </div>
                    </div>

                    <div style={styles.interviewDetailItem}>
                      <Video size={18} color="var(--success)" />
                      <div>
                        <span style={styles.detailLabel}>Meeting Link</span>
                        <a
                          href={app.interviewDetails.link}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.meetLink}
                        >
                          {app.interviewDetails.link}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style={styles.interviewMsgBox}>
                    <strong>Organizer Note:</strong> "{app.interviewDetails.message}"
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simulated Email Modal Box */}
      {selectedMail && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.emailModal} className="animate-slide-up">
            <div style={styles.emailHeader}>
              <div style={styles.emailHeaderLeft}>
                <div style={styles.emailAvatar}>
                  {selectedMail.job.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={styles.emailSubject}>Interview Invite: {selectedMail.job.title}</h4>
                  <p style={styles.emailMeta}>
                    From: <strong>{selectedMail.job.company} HR Office</strong> &lt;jobs@{selectedMail.job.company.toLowerCase().replace(/\s+/g, '')}.com&gt;
                  </p>
                  <p style={styles.emailMeta}>To: Candidate &lt;{selectedMail.candidate?.email || 'you@candidate.com'}&gt;</p>
                </div>
              </div>
              <button onClick={() => setSelectedMail(null)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.emailBody}>
              <p>Hi there,</p>
              <p>
                Thank you for applying to the <strong>{selectedMail.job.title}</strong> role at <strong>{selectedMail.job.company}</strong>. We reviewed your application and were highly impressed with your experience in <em>{selectedMail.resume?.experience}</em>.
              </p>
              <p>We would love to invite you for an interview. The details of the interview are below:</p>

              <div style={styles.emailDetailsBox}>
                <p><strong>Job Title:</strong> {selectedMail.job.title}</p>
                <p><strong>Date:</strong> {new Date(selectedMail.interviewDetails.date).toDateString()}</p>
                <p><strong>Time:</strong> {selectedMail.interviewDetails.time}</p>
                <p><strong>Video Meet Link:</strong> <a href={selectedMail.interviewDetails.link} target="_blank" rel="noreferrer" style={styles.meetLink}>{selectedMail.interviewDetails.link}</a></p>
              </div>

              {selectedMail.interviewDetails.message && (
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Message from recruiter: "{selectedMail.interviewDetails.message}"
                </p>
              )}

              <p>Please click the meeting link at the scheduled time. Let us know if you need to reschedule.</p>
              <p>Best of luck,</p>
              <p>
                <strong>The Recruiter Team</strong> <br />
                {selectedMail.job.company}
              </p>
            </div>
            <div style={styles.emailFooter}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Aspira Mail Delivery Node</span>
            </div>
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
    marginBottom: '3rem',
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  appCard: {
    padding: '2.5rem',
    border: '1px solid var(--border-color)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  jobTitle: {
    fontSize: '1.5rem',
    color: '#FFF',
    fontWeight: '700',
  },
  companyName: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '0.15rem',
  },
  badgeRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  appliedDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  pipelineContainer: {
    margin: '2.5rem 0 1rem 0',
    padding: '1rem 0',
    overflowX: 'auto',
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '500px',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    zIndex: 2,
  },
  stepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    transition: 'var(--transition)',
  },
  stepDone: {
    borderColor: 'rgba(255,255,255,0.26)',
    background: 'rgba(255,255,255,0.15)',
    color: '#FFF',
  },
  stepActive: {
    borderColor: 'rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.92)',
    boxShadow: '0 0 12px rgba(255, 255, 255, 0.12)',
  },
  stepLabel: {
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  pipelineLine: {
    flex: 1,
    height: '2px',
    margin: '0 -15px 18px -15px',
    zIndex: 1,
    background: 'rgba(255,255,255,0.08)',
  },
  interviewBox: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    marginTop: '2rem',
    boxShadow: '0 10px 40px rgba(255,255,255,0.06)',
  },
  interviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pulseContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  interviewTitle: {
    fontSize: '1.15rem',
    color: '#FFF',
  },
  emailBtn: {
    fontSize: '0.8rem',
    padding: '0.5rem 1rem',
  },
  interviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  interviewDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: '#FFF',
    fontWeight: '600',
  },
  meetLink: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  interviewMsgBox: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    borderLeft: '3px solid rgba(255,255,255,0.18)',
    paddingLeft: '1rem',
    marginTop: '0.5rem',
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
    padding: '1rem',
    backdropFilter: 'blur(5px)',
  },
  emailModal: {
    width: '100%',
    maxWidth: '650px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
    overflow: 'hidden',
  },
  emailHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  emailHeaderLeft: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  emailAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255,255,255,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    border: '1px solid rgba(255, 255, 255, 0.14)',
  },
  emailSubject: {
    color: '#FFF',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  emailMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    transition: 'var(--transition)',
  },
  emailBody: {
    padding: '2.5rem 2rem',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: '1.7',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emailDetailsBox: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '1.25rem',
    margin: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    color: '#FFF',
  },
  emailFooter: {
    padding: '1rem 2rem',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.05)',
    textAlign: 'right',
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
};

export default TrackStatus;
