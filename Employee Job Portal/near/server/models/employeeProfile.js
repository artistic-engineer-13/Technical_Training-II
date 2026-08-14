import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  link: { type: String },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: String },
  expirationDate: { type: String },
  credentialId: { type: String },
  credentialUrl: { type: String },
});

const employeeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      title: { type: String, default: '' }, // e.g. "Full Stack Developer"
      bio: { type: String, default: '' },   // summary
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    summary: { type: String, default: '' },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String }],
    projects: [projectSchema],
    certifications: [certificationSchema],
    achievements: [{ type: String }],
    languages: [{ type: String }],
    jobPreferences: {
      desiredRoles: [{ type: String }],
      jobTypes: [{ type: String }], // 'Full-time', 'Part-time', etc.
      workSettings: [{ type: String }], // 'Remote', 'Hybrid', 'On-site'
      preferredLocation: { type: String, default: '' },
      expectedSalary: { type: String, default: '' },
    },
    resumeUrl: { type: String, default: '' },
    resumeFileName: { type: String, default: '' },
    profileCompletion: { type: Number, default: 0 },
    isOnboarded: { type: Boolean, default: false },
    isFresher: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);
export default EmployeeProfile;
