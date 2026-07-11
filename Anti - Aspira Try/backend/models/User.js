import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['candidate', 'employer'],
    required: [true, 'Please select a role'],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: String,
  city: String,
  state: String,
  country: String,
  location: String,
  linkedin: String,
  about: String,
  bio: String,
  headline: String,
  skills: {
    type: [String],
    default: [],
  },
  experience: String,
  portfolioUrl: String,
  companyName: String,
  companyWebsite: String,
  companyAddress: String,
  companyPhone: String,
  companyDescription: String,
  companyIndustry: String,
  employeeCount: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    select: false,
  },
  otpExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }

  if (await bcrypt.compare(enteredPassword, this.password).catch(() => false)) {
    return true;
  }

  if (this.password === enteredPassword) {
    this.password = enteredPassword;
    await this.save({ validateBeforeSave: false });
    return true;
  }

  return false;
};

export default mongoose.model('User', UserSchema);
