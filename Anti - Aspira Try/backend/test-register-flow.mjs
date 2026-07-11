import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const testEmail = `test-reg-${Date.now()}@example.com`;

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteOne({ email: testEmail });

  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'test123', role: 'candidate' }),
  });
  const data = await res.json();
  console.log('REGISTER:', res.status, JSON.stringify(data));

  const user = await User.findOne({ email: testEmail }).select('+otpCode +otpExpires');
  console.log('DB OTP:', user?.otpCode, 'verified:', user?.isVerified);

  if (!user?.otpCode) {
    throw new Error('No OTP stored after registration');
  }

  const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: user.otpCode, purpose: 'register' }),
  });
  const verifyData = await verifyRes.json();
  console.log('VERIFY:', verifyRes.status, JSON.stringify(verifyData));

  const updated = await User.findOne({ email: testEmail });
  console.log('After verify isVerified:', updated?.isVerified);

  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'test123' }),
  });
  const loginData = await loginRes.json();
  console.log('LOGIN:', loginRes.status, loginData.success ? 'success with token' : JSON.stringify(loginData));

  await User.deleteOne({ email: testEmail });
  await mongoose.disconnect();
}

test().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
