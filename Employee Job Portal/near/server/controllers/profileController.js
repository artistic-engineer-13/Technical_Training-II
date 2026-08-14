import fs from 'fs';
import pdfParse from 'pdf-parse';
import EmployeeProfile from '../models/employeeProfile.js';
import Company from '../models/company.js';
import { parseResumeText } from '../services/resumeParser.js';

// Helper to calculate profile completion details
export const calculateProfileCompletion = (profile) => {
  const sections = {
    personal: false,
    summary: false,
    education: false,
    skills: false,
    experience: false,
    projects: false,
    certifications: false,
    achievements: false,
    socialLinks: false,
    resume: false
  };

  const missingSections = [];

  // 1. Personal Info (15%) - name, email, phone, location
  const pi = profile.personalInfo || {};
  if (pi.name && pi.email && pi.phone && pi.location) {
    sections.personal = true;
  } else {
    missingSections.push('Add name, email, phone, and location in Personal Details');
  }

  // 2. Summary (10%) - bio or summary
  if (profile.summary || pi.bio) {
    sections.summary = true;
  } else {
    missingSections.push('Add a Professional Summary');
  }

  // 3. Education (15%) - at least one entry with degree, school, fieldOfStudy, and startYear/endYear
  const hasValidEdu = profile.education && profile.education.length > 0 && profile.education.some(edu => edu.degree && edu.school && edu.fieldOfStudy);
  if (hasValidEdu) {
    sections.education = true;
  } else {
    missingSections.push('Add at least one Education entry with degree and school');
  }

  // 4. Skills (15%) - at least 3 skills
  if (profile.skills && profile.skills.length >= 3) {
    sections.skills = true;
  } else {
    missingSections.push('Add at least 3 skills');
  }

  // 5. Experience (15%) - at least 1 entry OR isFresher === true
  const hasValidExp = profile.experience && profile.experience.length > 0 && profile.experience.some(exp => exp.company && exp.title);
  if (hasValidExp || profile.isFresher === true) {
    sections.experience = true;
  } else {
    missingSections.push('Add at least one Experience entry or select "Fresher / No Experience"');
  }

  // 6. Projects (10%) - at least 1 project with title and description
  const hasValidProj = profile.projects && profile.projects.length > 0 && profile.projects.some(proj => proj.title && proj.description);
  if (hasValidProj) {
    sections.projects = true;
  } else {
    missingSections.push('Add at least one Project with title and description');
  }

  // 7. Social Links (5%) - at least one social profile link
  const sl = profile.socialLinks || {};
  if (sl.linkedin || sl.github || sl.portfolio) {
    sections.socialLinks = true;
  } else {
    missingSections.push('Add at least one social link (GitHub, LinkedIn, or Portfolio)');
  }

  // 8. Resume (5%) - resume uploaded or generated
  if (profile.resumeUrl) {
    sections.resume = true;
  } else {
    missingSections.push('Upload your resume PDF or generate one');
  }

  // Optional fields contributions
  const hasCerts = profile.certifications && profile.certifications.length > 0;
  sections.certifications = hasCerts;
  const hasAchs = profile.achievements && profile.achievements.length > 0;
  sections.achievements = hasAchs;

  // Compute total percentage based on weights
  let percent = 0;
  if (sections.personal) percent += 15;
  if (sections.summary) percent += 10;
  if (sections.education) percent += 15;
  if (sections.skills) percent += 15;
  if (sections.experience) percent += 15;
  if (sections.projects) percent += 10;
  if (sections.socialLinks) percent += 5;
  if (sections.resume) percent += 5;

  if (hasCerts) percent += 5;
  if (hasAchs) percent += 5;

  // Checks required fields completeness
  const requiredComplete = sections.personal && sections.summary && sections.education && sections.skills && sections.experience && sections.projects && sections.socialLinks && sections.resume;

  if (requiredComplete) {
    percent = 100;
  } else {
    percent = Math.min(95, percent); // caps at 95% if required sections are missing
  }

  return {
    percentage: percent,
    sections,
    missingSections
  };
};

// @desc    Get current employee profile
// @route   GET /api/profile
// @access  Private (Employee)
export const getProfile = async (req, res) => {
  try {
    let profile = await EmployeeProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await EmployeeProfile.create({
        user: req.user._id,
        personalInfo: {
          name: req.user.name,
          email: req.user.email
        }
      });
    }
    
    // Inject calculated completion details to JSON response
    const completionDetails = calculateProfileCompletion(profile);
    res.json({
      ...profile.toObject(),
      completionDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving employee profile' });
  }
};

// @desc    Update employee profile & calculate completion percentage
// @route   PUT /api/profile
// @access  Private (Employee)
export const updateProfile = async (req, res) => {
  try {
    let profile = await EmployeeProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new EmployeeProfile({ user: req.user._id });
    }

    const {
      personalInfo,
      socialLinks,
      summary,
      education,
      experience,
      skills,
      projects,
      certifications,
      achievements,
      languages,
      jobPreferences,
      resumeUrl,
      resumeFileName,
      isOnboarded,
      isFresher
    } = req.body;

    // Map body variables
    if (personalInfo) profile.personalInfo = personalInfo;
    if (socialLinks) profile.socialLinks = socialLinks;
    if (summary !== undefined) {
      profile.summary = summary;
      if (profile.personalInfo) {
        profile.personalInfo.bio = summary;
      }
    }
    if (education) profile.education = education;
    if (experience) profile.experience = experience;
    if (skills) profile.skills = skills;
    if (projects) profile.projects = projects;
    if (certifications) profile.certifications = certifications;
    if (achievements) profile.achievements = achievements;
    if (languages) profile.languages = languages;
    if (jobPreferences) profile.jobPreferences = jobPreferences;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    if (resumeFileName !== undefined) profile.resumeFileName = resumeFileName;
    if (isOnboarded !== undefined) profile.isOnboarded = isOnboarded;
    if (isFresher !== undefined) profile.isFresher = isFresher;

    // Calculate completion details and save raw percentage
    const completionDetails = calculateProfileCompletion(profile);
    profile.profileCompletion = completionDetails.percentage;

    await profile.save();
    
    res.json({
      ...profile.toObject(),
      completionDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating employee profile' });
  }
};

// @desc    Upload resume PDF & parse text into editable JSON
// @route   POST /api/profile/upload-resume
// @access  Private (Employee)
export const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Parse text from PDF
    const parsedPdf = await pdfParse(fileBuffer);
    const rawText = parsedPdf.text;

    // Extract structured data from raw text
    const extractedData = parseResumeText(rawText);

    // Provide file paths so client can submit them back inside PUT /api/profile
    extractedData.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    extractedData.resumeFileName = req.file.originalname;

    res.json({
      message: 'Resume parsed successfully. Please review and confirm the extracted data.',
      data: extractedData
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ message: `Failed to parse resume: ${error.message}` });
  }
};

// @desc    Get company profile
// @route   GET /api/profile/recruiter/company
// @access  Private (Recruiter)
export const getCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      company = await Company.create({
        recruiter: req.user._id,
        name: `${req.user.name}'s Company`
      });
    }
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving company details' });
  }
};

// @desc    Update company profile
// @route   PUT /api/profile/recruiter/company
// @access  Private (Recruiter)
export const updateCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      company = new Company({ recruiter: req.user._id });
    }

    const { name, logo, website, description, location, industry, employeesCount } = req.body;

    if (name) company.name = name;
    if (logo !== undefined) company.logo = logo;
    if (website !== undefined) company.website = website;
    if (description !== undefined) company.description = description;
    if (location !== undefined) company.location = location;
    if (industry !== undefined) company.industry = industry;
    if (employeesCount !== undefined) company.employeesCount = employeesCount;

    await company.save();
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating company details' });
  }
};
