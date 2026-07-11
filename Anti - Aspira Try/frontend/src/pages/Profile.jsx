import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, updateProfile } from '../features/auth/authSlice';

const Field = ({ label, value, onChange, name, type = 'text' }) => (
  <label style={styles.field}>
    <div style={styles.label}>{label}</div>
    <input name={name} value={value || ''} onChange={onChange} style={styles.input} type={type} />
  </label>
);

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await dispatch(updateProfile(form));
    setEditing(false);
  };

  if (!user) return <div style={styles.container}>Please login to view profile.</div>;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U';

  return (
    <div style={styles.container} className="glass-panel">
      <div style={styles.header}>
        <div style={styles.avatarLarge}>{initials}</div>
        <div>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <div style={styles.role}>{user.role}</div>
        </div>
      </div>

      {!editing ? (
        <div style={styles.infoGrid}>
          <div>
            <h3>Contact</h3>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.phone || '-'}</div>
            <div><strong>Location:</strong> {([user.address, user.city, user.state, user.country].filter(Boolean).join(', ') || '-')}</div>
            <div><strong>LinkedIn:</strong> {user.linkedin || '-'}</div>
            <div style={{ marginTop: 8 }}><strong>About:</strong><div>{user.about || '-'}</div></div>
          </div>

          {user.role === 'employer' && (
            <div>
              <h3>Company</h3>
              <div><strong>Name:</strong> {user.companyName || '-'}</div>
              <div><strong>Website:</strong> {user.companyWebsite || '-'}</div>
              <div><strong>Phone:</strong> {user.companyPhone || '-'}</div>
              <div><strong>Address:</strong> {user.companyAddress || '-'}</div>
              <div style={{ marginTop: 8 }}><strong>Description:</strong><div>{user.companyDescription || '-'}</div></div>
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        </div>
      ) : (
        <div style={styles.form}>
          <h3>Edit Profile</h3>
          <div style={styles.formGrid}>
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} />
            <Field label="City" name="city" value={form.city} onChange={handleChange} />
            <Field label="State" name="state" value={form.state} onChange={handleChange} />
            <Field label="Country" name="country" value={form.country} onChange={handleChange} />
            <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} />
            <label style={styles.field}>
              <div style={styles.label}>About</div>
              <textarea name="about" value={form.about || ''} onChange={handleChange} style={{ ...styles.input, minHeight: 80 }} />
            </label>

            {user.role === 'employer' && (
              <>
                <Field label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
                <Field label="Company Website" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} />
                <Field label="Company Phone" name="companyPhone" value={form.companyPhone} onChange={handleChange} />
                <label style={styles.field}>
                  <div style={styles.label}>Company Description</div>
                  <textarea name="companyDescription" value={form.companyDescription || ''} onChange={handleChange} style={{ ...styles.input, minHeight: 80 }} />
                </label>
              </>
            )}

          </div>

          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button  className='btn-primary'onClick={() => setEditing(false)} style={{ marginRight: 8 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "20px auto",
    padding: 20,
  },
  header: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "transparent",   
    border: "1px solid var(--border-color)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 800,
  },
  role: { textTransform: "uppercase", fontSize: 12, color: "#94a3b8" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  form: {},
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: 13, marginBottom: 6, color: "#94a3b8" },
  input: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    background: "transparent",
    color: "var(--text-main)",
  },
};

export default Profile;
