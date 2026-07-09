import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchEmployerApplications, updateApplicationStatus } from '../features/applications/applicationsSlice';

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const previousMonthDate = new Date(year, month, i - firstDay.getDay() + 1);
    days.push(previousMonthDate);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    const nextMonthDate = new Date(year, month + 1, days.length % 7);
    days.push(nextMonthDate);
  }

  return days;
};

const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

const ScheduleInterview = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employerApplications: applications, loading, error } = useSelector((state) => state.applications);
  const [interviewDate, setInterviewDate] = useState(() => toLocalDateValue(new Date()));
  const [interviewTime, setInterviewTime] = useState('10:00 AM');
  const [interviewLink, setInterviewLink] = useState('https://meet.jit.si/aspira-job-interview');
  const [interviewMsg, setInterviewMsg] = useState('We enjoyed reviewing your application and would like to schedule an interview.');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    if (!applications.length) {
      dispatch(fetchEmployerApplications());
    }
  }, [applications.length, dispatch]);

  const application = applications.find((app) => app._id === id);
  const monthDays = getMonthDays(viewMonth);
  const selectedDateLabel = interviewDate ? new Date(`${interviewDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Choose a date';

  const handleDateSelect = (date) => {
    setInterviewDate(toLocalDateValue(date));
    setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!interviewDate || !interviewTime) {
      setSubmitError('Please provide both interview date and time.');
      return;
    }

    setSubmitting(true);

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

      const resultAction = await dispatch(updateApplicationStatus({ applicationId: id, payload }));

      if (updateApplicationStatus.fulfilled.match(resultAction)) {
        navigate('/employer');
      } else {
        setSubmitError(resultAction.payload?.message || 'Unable to schedule the interview.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Unable to schedule the interview.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !application) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container animate-fade-in" style={styles.container}>
        <div className="glass-panel" style={styles.card}>
          <h2 style={styles.title}>Interview Scheduling</h2>
          <p style={styles.subtitle}>Unable to find that application.</p>
          <div style={styles.errorBanner}>{error || 'The selected application may no longer exist.'}</div>
          <Link to="/employer">
            <button className="btn-secondary" style={styles.backBtn}>Return to Employer Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Schedule Interview</h1>
          <p style={styles.subtitle}>Set up a dedicated interview for {application.candidate?.name}</p>
        </div>
        <Link to="/employer">
          <button className="btn-secondary">Back to Dashboard</button>
        </Link>
      </div>

      <div className="glass-panel" style={styles.card}>
        <div style={styles.detailGrid}>
          <div style={styles.detailBlock}>
            <h3 style={styles.sectionTitle}>Candidate</h3>
            <p style={styles.detailText}><strong>Name:</strong> {application.candidate?.name}</p>
            <p style={styles.detailText}><strong>Email:</strong> {application.candidate?.email}</p>
          </div>
          <div style={styles.detailBlock}>
            <h3 style={styles.sectionTitle}>Job</h3>
            <p style={styles.detailText}><strong>Title:</strong> {application.job?.title}</p>
            <p style={styles.detailText}><strong>Company:</strong> {application.job?.company}</p>
            <p style={styles.detailText}><strong>Location:</strong> {application.job?.location}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formWrapper}>
          <div style={styles.calendarSection}>
            <div style={styles.calendarCard}>
              <div style={styles.calendarHeader}>
                <div>
                  <p style={styles.eyebrow}>Interview calendar</p>
                  <h3 style={styles.sectionTitle}>Pick a date</h3>
                </div>
                <div style={styles.monthSwitch}>
                  <button type="button" style={styles.navButton} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>←</button>
                  <span style={styles.monthLabel}>{viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  <button type="button" style={styles.navButton} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>→</button>
                </div>
              </div>

              <div style={styles.weekDaysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} style={styles.weekDay}>{day}</div>
                ))}
              </div>

              <div style={styles.calendarGrid}>
                {monthDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
                  const isSelected = toLocalDateValue(day) === interviewDate;
                  const isToday = toLocalDateValue(day) === toLocalDateValue(new Date());

                  return (
                    <button
                      key={`${day}-${index}`}
                      type="button"
                      disabled={!isCurrentMonth}
                      onClick={() => handleDateSelect(day)}
                      style={{
                        ...styles.calendarCell,
                        ...(isSelected ? styles.selectedCalendarCell : {}),
                        ...(isCurrentMonth ? {} : styles.inactiveCalendarCell),
                        ...(isToday && !isSelected ? styles.todayCalendarCell : {}),
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.clockCard}>
              <div style={styles.clockHeader}>
                <p style={styles.eyebrow}>Circular clock</p>
                <h3 style={styles.sectionTitle}>Pick a time</h3>
              </div>
              <div style={styles.clockFace}>
                <div style={styles.clockCenter} />
                {timeSlots.map((slot, index) => {
                  const angle = (index / timeSlots.length) * 360 - 90;
                  const x = 50 + 38 * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + 38 * Math.sin((angle * Math.PI) / 180);
                  const isSelected = interviewTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setInterviewTime(slot)}
                      style={{
                        ...styles.clockSlot,
                        left: `${x}%`,
                        top: `${y}%`,
                        ...(isSelected ? styles.selectedClockSlot : {}),
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div style={styles.timeSummary}>Selected time: <strong>{interviewTime}</strong></div>
            </div>
          </div>

          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>Interview Preview</div>
            <div style={styles.previewGrid}>
              <div>
                <p style={styles.previewLabel}>Date</p>
                <p style={styles.previewValue}>{selectedDateLabel}</p>
              </div>
              <div>
                <p style={styles.previewLabel}>Time</p>
                <p style={styles.previewValue}>{interviewTime}</p>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Video Call Link</label>
            <input
              type="url"
              required
              value={interviewLink}
              onChange={(e) => setInterviewLink(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message to Candidate</label>
            <textarea
              rows={4}
              value={interviewMsg}
              onChange={(e) => setInterviewMsg(e.target.value)}
              className="form-textarea"
            />
          </div>

          {submitError && <div style={styles.errorBanner}>{submitError}</div>}

          <div style={styles.buttonRow}>
            <button type="button" onClick={() => navigate('/employer')} className="btn-secondary" style={{ marginRight: '0.75rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Send Interview Invitation'}
            </button>
          </div>
        </form>
      </div>
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
    gap: '1rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    color: '#FFF',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  backBtn: {
    padding: '0.75rem 1rem',
  },
  card: {
    padding: '2rem',
    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.75rem',
  },
  detailBlock: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-sm)',
    padding: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: '#FFF',
    marginBottom: '0.75rem',
  },
  detailText: {
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '0.5rem',
  },
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  calendarSection: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.9fr',
    gap: '1.25rem',
  },
  calendarCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
  },
  clockCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  eyebrow: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  monthSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF',
    borderRadius: '999px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
  },
  monthLabel: {
    color: '#FFF',
    fontSize: '0.95rem',
    minWidth: '140px',
    textAlign: 'center',
  },
  weekDaysRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: '0.35rem',
    marginBottom: '0.5rem',
  },
  weekDay: {
    color: 'var(--text-muted)',
    textAlign: 'center',
    fontSize: '0.77rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: '0.35rem',
  },
  calendarCell: {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#FFF',
    padding: '0.7rem 0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  selectedCalendarCell: {
    background: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.28)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
  },
  todayCalendarCell: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inactiveCalendarCell: {
    opacity: '0.35',
    cursor: 'not-allowed',
  },
  clockHeader: {
    width: '100%',
  },
  clockFace: {
    position: 'relative',
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
  },
  clockCenter: {
    position: 'absolute',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#FFF',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  clockSlot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#FFF',
    padding: '0.4rem 0.6rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  selectedClockSlot: {
    background: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timeSummary: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  previewCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem 1.1rem',
  },
  previewHeader: {
    color: '#FFF',
    fontWeight: '700',
    marginBottom: '0.6rem',
  },
  previewGrid: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  previewLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.15rem',
  },
  previewValue: {
    color: '#FFF',
    fontSize: '0.95rem',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'var(--danger)',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-sm)',
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
};

export default ScheduleInterview;
