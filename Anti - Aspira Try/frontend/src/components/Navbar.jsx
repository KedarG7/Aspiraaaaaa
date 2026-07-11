import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Briefcase, LogOut, PlusCircle, ClipboardList, User, UserPlus, LogIn } from 'lucide-react';
import { logoutUser } from '../features/auth/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav} className="glass-panel nav-entrance">
      <div style={styles.navContainer} className="container">
        <Link to="/" style={styles.logo}>
          {/* <Briefcase size={24} color="#f8fafc" /> */}
          <span style={styles.logoText}>Aspira</span>
        </Link>

        {/* Mobile toggle button */}
        <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setMobileOpen((s) => !s)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} /></svg>
        </button>

        <div style={styles.navLinks} className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <Link
            to="/jobs"
            onClick={() => setMobileOpen(false)}
            style={{
              ...styles.link,
              color: isActive('/jobs') ? '#f8fafc' : '#94a3b8',
            }}
          >
            Find Jobs
          </Link>

          {user && user.role === 'candidate' && (
            <Link
              to="/applications"
              onClick={() => setMobileOpen(false)}
              style={{
                ...styles.link,
                color: isActive('/applications') ? '#f8fafc' : '#94a3b8',
              }}
            >
              <ClipboardList size={18} />
              Track Applications
            </Link>
          )}

          {user && user.role === 'employer' && (
            <>
              <Link
                to="/employer"
                onClick={() => setMobileOpen(false)}
                style={{
                  ...styles.link,
                  color: isActive('/employer') ? '#f8fafc' : '#94a3b8',
                }}
              >
                Employer Dashboard
              </Link>
              <Link
                to="/employer/post-job"
                onClick={() => setMobileOpen(false)}
                style={{
                  ...styles.link,
                  color: isActive('/employer/post-job') ? '#f8fafc' : '#94a3b8',
                }}
              >
                <PlusCircle size={18} />
                Post Job
              </Link>
            </>
          )}

          {/* Auth area duplicated in mobile menu for easy access (mobile-only) */}
          <div className="auth-mobile" style={{ marginTop: 6 }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={styles.userBadge}>
                    <div style={styles.avatar} title={user.name}>
                      {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
                    </div>
                    <span style={{ marginLeft: '8px' }}>{user.name}</span>
                    <span style={styles.roleLabel}>{user.role}</span>
                  </div>
                </Link>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} style={{ ...styles.logoutBtn, alignSelf: 'flex-start' }} title="Logout">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={styles.loginBtn}>
                  <LogIn size={16} />
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={styles.signupBtn}>
                  <UserPlus size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={styles.authSection} className="auth-desktop">
          {/* Desktop auth area hidden on mobile via CSS */}
          {user ? (
            <div style={styles.userInfo}>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div style={styles.userBadge}>
                  <div style={styles.avatar} title={user.name}>
                    {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
                  </div>
                  <span style={{ marginLeft: '8px' }}>{user.name}</span>
                  <span style={styles.roleLabel}>{user.role}</span>
                </div>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={styles.authButtons} className="authButtons">
              <Link to="/login" style={styles.loginBtn}>
                <LogIn size={16} />
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={styles.signupBtn}>
                <UserPlus size={16} />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 6px 30px rgba(0, 0, 0, 0.24)",
    transition: "var(--transition)",
  },
  navContainer: {
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    color: "#f8fafc",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "var(--transition)",
  },
  authSection: {
    display: "flex",
    alignItems: "center",
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  loginBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "var(--text-main)",
    fontWeight: "500",
    fontSize: "0.95rem",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-sm)",
    transition: "var(--transition)",
  },
  signupBtn: {
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid var(--border-color)",
    padding: "0.4rem 0.8rem",
    borderRadius: "50px",
    fontSize: "0.85rem",
  },
  roleLabel: {
    fontSize: "0.7rem",
    background: "rgba(255,255,255,0.08)",
    color: "#f8fafc",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    marginLeft: "6px",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "transparent",
    border: "1px solid var(--border-color)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    transition: "var(--transition)",
  },
};

export default Navbar;
