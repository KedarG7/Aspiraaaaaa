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

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav} className="glass-panel nav-entrance">
      <div style={styles.navContainer} className="container">
        <Link to="/" style={styles.logo}>
          <Briefcase size={24} color="#f8fafc" />
          <span style={styles.logoText}>Aspira</span>
        </Link>

        <div style={styles.navLinks} className="nav-links">
          <Link
            to="/jobs"
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
                style={{
                  ...styles.link,
                  color: isActive('/employer') ? '#f8fafc' : '#94a3b8',
                }}
              >
                Employer Dashboard
              </Link>
              <Link
                to="/employer/post-job"
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
        </div>

        <div style={styles.authSection}>
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
