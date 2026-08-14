import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/user.js';
import Company from './models/company.js';
import Job from './models/job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const dummyJobs = [
  {
    title: 'MERN Stack Developer',
    location: 'Bangalore',
    workSetting: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    minExperience: 2,
    salaryDisplay: '₹8,00,000 - ₹12,00,000',
    minSalary: 800000,
    maxSalary: 1200000,
    description: 'We are looking for a MERN Stack Developer responsible for managing the interchange of data between the server and the users, development of all server-side logic, and ensuring high performance.',
    skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript'],
    requirements: ['2+ years experience with MERN', 'Strong JavaScript skills', 'Experience with state management (Redux)'],
    responsibilities: ['Build reusable components', 'Optimize applications for speed', 'Collaborate with frontend developers'],
    benefits: ['Flexible hours', 'Health Insurance', 'Remote stipend'],
    companyName: 'Google India'
  },
  {
    title: 'Java Backend Developer',
    location: 'Hyderabad',
    workSetting: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    minExperience: 5,
    salaryDisplay: '₹14,00,000 - ₹18,00,000',
    minSalary: 1400000,
    maxSalary: 1800000,
    description: 'Join our team as a Java Backend Developer to build robust microservices and secure transaction systems.',
    skills: ['Java', 'Spring Boot', 'Hibernate', 'PostgreSQL', 'Microservices'],
    requirements: ['5+ years Java experience', 'Familiarity with containerization (Docker)', 'Understanding of AWS services'],
    responsibilities: ['Design and deploy microservices', 'Write clean unit tests', 'Integrate third-party APIs'],
    benefits: ['Accident insurance', 'Gym allowance', 'Performance bonuses'],
    companyName: 'TCS'
  },
  {
    title: 'Frontend Developer',
    location: 'Pune',
    workSetting: 'On-site',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    minExperience: 1,
    salaryDisplay: '₹5,00,000 - ₹7,00,000',
    minSalary: 500000,
    maxSalary: 700000,
    description: 'Looking for a Frontend Developer who is passionate about creating pixel-perfect, responsive client applications using React and Tailwind CSS.',
    skills: ['HTML', 'CSS', 'React', 'Tailwind CSS', 'TypeScript'],
    requirements: ['1+ years with React', 'Good eye for detail and design animations', 'Experience with GitHub collaboration'],
    responsibilities: ['Build pages from Figma layouts', 'Implement responsive behaviors', 'Connect user interactions to REST endpoints'],
    benefits: ['Onsite food courts', 'Commute shuttle support', 'Annual team outings'],
    companyName: 'Infosys'
  },
  {
    title: 'Full Stack Developer',
    location: 'Gurgaon',
    workSetting: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Lead/Executive',
    minExperience: 7,
    salaryDisplay: '₹22,00,000 - ₹30,00,000',
    minSalary: 2200000,
    maxSalary: 3000000,
    description: 'Lead a team of engineers, defining architecture standards and coding backend models and responsive frontends.',
    skills: ['Node.js', 'React', 'Python', 'AWS', 'System Design'],
    requirements: ['7+ years experience in Full Stack roles', 'Strong systems planning skills', 'Prior experience leading engineering squads'],
    responsibilities: ['Define technology stack guidelines', 'Mentor junior programmers', 'Architect scalable cloud frameworks'],
    benefits: ['Unlimited PTO', 'Equity shares options', 'Workstation upgrade grants'],
    companyName: 'Wipro'
  },
  {
    title: 'Python Developer',
    location: 'Noida',
    workSetting: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    minExperience: 3,
    salaryDisplay: '₹9,00,000 - ₹13,00,000',
    minSalary: 900000,
    maxSalary: 1300000,
    description: 'Looking for an experienced Python developer to script automation pipelines, build API routers, and process structural data fields.',
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'RESTful APIs'],
    requirements: ['3+ years Python experience', 'Familiarity with SQL optimization', 'Understanding of async processing in Python'],
    responsibilities: ['Develop clean backend API endpoints', 'Implement task queues (Celery)', 'Optimize database queries'],
    benefits: ['Health coverage', 'Broadband internet support', 'Flexible timing'],
    companyName: 'Accenture India'
  },
  {
    title: 'Data Analyst',
    location: 'Chennai',
    workSetting: 'On-site',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    minExperience: 1,
    salaryDisplay: '₹6,00,000 - ₹8,50,000',
    minSalary: 600000,
    maxSalary: 850000,
    description: 'Extract business logic insights from data and compile graphs, reports, and models for managers.',
    skills: ['SQL', 'Python', 'Excel', 'Tableau', 'PowerBI'],
    requirements: ['Degree in Statistics or Finance', 'Experience building visual charts', 'Strong Excel math functions knowledge'],
    responsibilities: ['Generate monthly sales reports', 'Clean database outputs', 'Present charts to management teams'],
    benefits: ['Onsite medical checkups', 'Subsidized lunches', 'Certification assistance'],
    companyName: 'Infosys'
  },
  {
    title: 'DevOps Engineer',
    location: 'Delhi',
    workSetting: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    minExperience: 3,
    salaryDisplay: '₹12,00,000 - ₹16,00,000',
    minSalary: 1200000,
    maxSalary: 1600000,
    description: 'Establish and verify CI/CD pipelines, Docker containerized architectures, and cloud security compliance parameters.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    requirements: ['3+ years DevOps experience', 'Deep knowledge of AWS services', 'Familiarity with Shell scripting'],
    responsibilities: ['Automate code releases', 'Monitor server health metrics', 'Configure VPCs and load balancers'],
    benefits: ['Home office setup budget', 'Premium medical plans', 'Internet allowances'],
    companyName: 'Google India'
  },
  {
    title: 'Cloud Engineer',
    location: 'Mumbai',
    workSetting: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    minExperience: 6,
    salaryDisplay: '₹18,00,000 - ₹24,00,000',
    minSalary: 1800000,
    maxSalary: 2400000,
    description: 'Architect secure cloud infrastructures on Microsoft Azure/AWS and verify network security settings.',
    skills: ['AWS', 'Azure', 'Linux', 'Security', 'Terraform'],
    requirements: ['6+ years cloud engineering', 'Relevant cloud certifications', 'Experience migration workloads'],
    responsibilities: ['Plan secure server migration', 'Configure IAM policies', 'Minimize cloud billing overheads'],
    benefits: ['Gratuity bonuses', 'Life insurance coverage', 'Commuting reimbursements'],
    companyName: 'TCS'
  },
  {
    title: 'AI/ML Engineer',
    location: 'Bangalore',
    workSetting: 'On-site',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    minExperience: 4,
    salaryDisplay: '₹20,00,000 - ₹28,00,000',
    minSalary: 2000000,
    maxSalary: 2800000,
    description: 'Build predictive ML algorithms, clean datasets, and deploy machine learning models to production.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Pandas'],
    requirements: ['Degree in CS / AI', '4+ years machine learning modeling', 'Experience working with large clean datasets'],
    responsibilities: ['Train neural networks', 'Deploy estimators to production APIs', 'Conduct model validation tests'],
    benefits: ['Gym membership', 'Catered meals', 'Education sponsorships'],
    companyName: 'Google India'
  },
  {
    title: 'QA Engineer',
    location: 'Chandigarh',
    workSetting: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    minExperience: 1,
    salaryDisplay: '₹4,50,000 - ₹6,00,000',
    minSalary: 450005,
    maxSalary: 600000,
    description: 'Verify application functionality, report layout bugs, and write selenium automated regression testing scripts.',
    skills: ['Selenium', 'Manual Testing', 'Jira', 'Postman', 'JavaScript'],
    requirements: ['1+ years QA experience', 'Understanding of REST APIs testing', 'Detailed bug reporting skills'],
    responsibilities: ['Log layout bugs in Jira', 'Write automated UI test scripts', 'Test web apps before deployment'],
    benefits: ['Flexible work location', 'Broadband support', 'Health plans'],
    companyName: 'Wipro'
  },
  {
    title: 'UI/UX Designer',
    location: 'Mohali',
    workSetting: 'Hybrid',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    minExperience: 3,
    salaryDisplay: '₹7,00,000 - ₹10,50,000',
    minSalary: 700000,
    maxSalary: 1050000,
    description: 'Design beautiful, premium interface layouts and interactives screens in Figma for Cnear platforms.',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'Wireframing', 'User Research'],
    requirements: ['3+ years in UX/UI roles', 'Provide portfolio link on resume', 'Familiarity with Tailwind classes is a plus'],
    responsibilities: ['Draft wireframes and user flowcharts', 'Build clickable high-fidelity prototypes', 'Design layouts for responsive screens'],
    benefits: ['Workstations allocation', 'Subsidized cafeteria', 'Wellness leaves'],
    companyName: 'Wipro'
  },
  {
    title: 'Android Developer',
    location: 'Chennai',
    workSetting: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid Level',
    minExperience: 3,
    salaryDisplay: '₹10,00,000 - ₹14,00,000',
    minSalary: 1000000,
    maxSalary: 1400000,
    description: 'Develop and verify native Android apps using Kotlin, Jetpack Compose, and Retrofit.',
    skills: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'MVVM', 'Retrofit'],
    requirements: ['3+ years native Android coding', 'Launched apps in Google Play Store', 'Understanding of REST services'],
    responsibilities: ['Write clean Kotlin controllers', 'Develop responsive mobile screen components', 'Optimize app memory footprints'],
    benefits: ['Healthcare plans', 'Performance incentives', 'Broadband stipends'],
    companyName: 'Accenture India'
  },
  {
    title: 'Cyber Security Analyst',
    location: 'Bangalore',
    workSetting: 'On-site',
    jobType: 'Full-time',
    experienceLevel: 'Senior Level',
    minExperience: 5,
    salaryDisplay: '₹16,00,000 - ₹22,00,000',
    minSalary: 1600000,
    maxSalary: 2200000,
    description: 'Audit network security, setup firewalls, run penetration tests, and verify system compliance indicators.',
    skills: ['Security Audits', 'Penetration Testing', 'Linux', 'Wireshark', 'Cryptography'],
    requirements: ['5+ years Cyber Security experience', 'Security certifications (CEH, CISSP)', 'Prior experience auditing server networks'],
    responsibilities: ['Conduct monthly vulnerability audits', 'Respond to firewall flags', 'Establish secure password policies'],
    benefits: ['Onsite dining halls', 'Fitness centers access', 'Medical coverages'],
    companyName: 'Google India'
  },
  {
    title: 'Software Developer Intern',
    location: 'Remote',
    workSetting: 'Remote',
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    minExperience: 0,
    salaryDisplay: '₹25,000 - ₹35,000 / month',
    minSalary: 25000,
    maxSalary: 35000,
    description: 'Gain hands-on coding experience working alongside senior engineers building web portals using React.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'GitHub'],
    requirements: ['Enrolled in CS / IT degree programs', 'Understanding of OOP and Javascript loops', 'Eager to clean and write code'],
    responsibilities: ['Fix alignment bugs', 'Write code comments', 'Participate in team daily standups'],
    benefits: ['Full remote work', 'Flexible hours', 'Job offer conversion option'],
    companyName: 'Infosys'
  },
  {
    title: 'Data Science Intern',
    location: 'Hyderabad',
    workSetting: 'Hybrid',
    jobType: 'Internship',
    experienceLevel: 'Entry Level',
    minExperience: 0,
    salaryDisplay: '₹30,000 - ₹45,000 / month',
    minSalary: 30000,
    maxSalary: 45000,
    description: 'Clean datasets, run exploratory data analysis (EDA), and prepare charts comparing models.',
    skills: ['Python', 'SQL', 'Pandas', 'Matplotlib', 'Jupyter Notebook'],
    requirements: ['Understanding of statistical methods', 'Good coding skills in Python', 'Familiarity with database queries'],
    responsibilities: ['Clean raw dataset outputs', 'Format graphs for reports', 'Run data sorting pipelines'],
    benefits: ['Onsite transport help', 'Conversion bonuses', 'Free snack pantries'],
    companyName: 'TCS'
  },
  {
    title: 'Technical Writer',
    location: 'Noida',
    workSetting: 'Remote',
    jobType: 'Part-time',
    experienceLevel: 'Mid Level',
    minExperience: 2,
    salaryDisplay: '₹3,50,000 - ₹5,00,000',
    minSalary: 350000,
    maxSalary: 500000,
    description: 'Draft API documentation, release notes, user manuals, and readmes for platform code frameworks.',
    skills: ['Markdown', 'Git', 'API Documentation', 'Technical Writing', 'Editing'],
    requirements: ['2+ years writing engineering summaries', 'Ability to read code parameters', 'Portfolio of technical articles'],
    responsibilities: ['Document API schemas and returns', 'Format help articles', 'Structure readme documentation guides'],
    benefits: ['Flexible part-time schedules', 'Certifications assistance', 'Internet allowance'],
    companyName: 'Accenture India'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully!');

    const companyNames = ['Google India', 'TCS', 'Infosys', 'Wipro', 'Accenture India'];
    const companyMap = {};
    const recruiterMap = {};

    for (const name of companyNames) {
      const email = `recruiter.${name.toLowerCase().replace(/\s+/g, '')}@cnear.com`;
      
      // Find or create recruiter user
      let recruiter = await User.findOne({ email });
      if (!recruiter) {
        console.log(`Creating recruiter user for ${name}: ${email}...`);
        recruiter = await User.create({
          name: `${name} Recruiter`,
          email,
          password: 'recruiter123',
          role: 'recruiter'
        });
      }
      recruiterMap[name] = recruiter._id;

      // Find or create company
      let company = await Company.findOne({ name });
      if (!company) {
        console.log(`Creating company details for: ${name}...`);
        company = await Company.create({
          recruiter: recruiter._id,
          name,
          logo: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com` || 'https://via.placeholder.com/150',
          website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `${name} is a leading global technology and services organization driving innovation.`,
          location: name === 'TCS' ? 'Mumbai' : 'Bangalore',
          industry: 'Information Technology'
        });
      }
      companyMap[name] = company._id;
    }

    // Clear existing jobs
    console.log('Clearing old job listings...');
    await Job.deleteMany({});

    // Seed Jobs
    const jobsWithCompanyRefs = dummyJobs.map((job) => {
      const companyId = companyMap[job.companyName];
      const recruiterId = recruiterMap[job.companyName];
      const jobData = { 
        ...job, 
        company: companyId, 
        recruiter: recruiterId,
        status: 'active',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      delete jobData.companyName; // remove virtual seeding key
      return jobData;
    });

    console.log(`Seeding ${jobsWithCompanyRefs.length} job vacancies...`);
    await Job.insertMany(jobsWithCompanyRefs);

    console.log('Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error);
    process.exit(1);
  }
};

seedDatabase();
