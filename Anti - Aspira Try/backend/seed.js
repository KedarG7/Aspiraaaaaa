import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

const employersData = [
  {
    name: 'Ava Chen',
    email: 'ava@northstarlabs.com',
    password: 'password123',
    role: 'employer',
    isVerified: true,
    companyName: 'Northstar Labs',
    companyWebsite: 'https://northstarlabs.com',
    companyDescription: 'Building AI-driven developer platforms for modern teams.',
    companyIndustry: 'Software',
    employeeCount: '50-100',
    location: 'Seattle, WA',
    headline: 'Hiring product-minded engineers',
  },
  {
    name: 'Marcus Reed',
    email: 'marcus@finflux.io',
    password: 'password123',
    role: 'employer',
    isVerified: true,
    companyName: 'FinFlux',
    companyWebsite: 'https://finflux.io',
    companyDescription: 'Secure payment infrastructure for digital-first businesses.',
    companyIndustry: 'Fintech',
    employeeCount: '100-250',
    location: 'New York, NY',
    headline: 'Expanding engineering and design teams',
  },
  {
    name: 'Priya Shah',
    email: 'priya@pixelforge.co',
    password: 'password123',
    role: 'employer',
    isVerified: true,
    companyName: 'PixelForge',
    companyWebsite: 'https://pixelforge.co',
    companyDescription: 'Design-led product studio for fast-moving startups.',
    companyIndustry: 'Design',
    employeeCount: '25-50',
    location: 'Austin, TX',
    headline: 'Looking for UI/UX and frontend talent',
  },
  {
    name: 'Daniel Brooks',
    email: 'daniel@cloudhaven.dev',
    password: 'password123',
    role: 'employer',
    isVerified: true,
    companyName: 'CloudHaven',
    companyWebsite: 'https://cloudhaven.dev',
    companyDescription: 'Cloud-native infrastructure and DevOps automation company.',
    companyIndustry: 'Cloud Infrastructure',
    employeeCount: '200+',
    location: 'Denver, CO',
    headline: 'Hiring platform engineers and SREs',
  },
  {
    name: 'Lina Ortiz',
    email: 'lina@signalai.com',
    password: 'password123',
    role: 'employer',
    isVerified: true,
    companyName: 'Signal AI',
    companyWebsite: 'https://signalai.com',
    companyDescription: 'Enterprise AI tools for analytics and data operations.',
    companyIndustry: 'AI',
    employeeCount: '100-200',
    location: 'Remote',
    headline: 'Hiring across data engineering and ML ops',
  },
];

const candidatesData = [
  { name: 'Jane Applicant', email: 'jane@applicant.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Chicago, IL', headline: 'Frontend engineer specializing in React', skills: ['React', 'TypeScript', 'Redux', 'UI/UX'], experience: '6 years' },
  { name: 'Noah Patel', email: 'noah@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Phoenix, AZ', headline: 'Fullstack developer with Node.js background', skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'], experience: '4 years' },
  { name: 'Maya Singh', email: 'maya@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Toronto, CA', headline: 'Product designer focused on web experiences', skills: ['Figma', 'Wireframing', 'Design Systems', 'User Research'], experience: '5 years' },
  { name: 'Lucas Chen', email: 'lucas@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Remote', headline: 'Cloud engineer and DevOps specialist', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], experience: '7 years' },
  { name: 'Ariana Gomez', email: 'ariana@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Miami, FL', headline: 'Data scientist with analytics experience', skills: ['Python', 'SQL', 'Machine Learning', 'Pandas'], experience: '3 years' },
  { name: 'Owen Brooks', email: 'owen@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Austin, TX', headline: 'Mobile engineer building Android applications', skills: ['Android', 'Kotlin', 'Jetpack Compose', 'Firebase'], experience: '4 years' },
  { name: 'Sofia Martinez', email: 'sofia@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Seattle, WA', headline: 'Cybersecurity engineer', skills: ['Security', 'Cloud Security', 'SOC', 'Python'], experience: '6 years' },
  { name: 'Ethan Cole', email: 'ethan@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Denver, CO', headline: 'Backend engineer passionate about microservices', skills: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'], experience: '5 years' },
  { name: 'Nina Walker', email: 'nina@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Remote', headline: 'QA automation engineer', skills: ['Playwright', 'Cypress', 'Testing', 'CI/CD'], experience: '4 years' },
  { name: 'Kai Morgan', email: 'kai@sample.com', password: 'candidatepass', role: 'candidate', isVerified: true, location: 'Los Angeles, CA', headline: 'Product manager with technical background', skills: ['Product Strategy', 'Analytics', 'Roadmaps', 'Agile'], experience: '8 years' },
];

const jobsData = [
  { title: 'Senior Frontend Engineer', company: 'Northstar Labs', location: 'Seattle, WA / Remote', salary: '$150k - $180k', type: 'Remote', category: 'Web Development', skills: ['React', 'TypeScript', 'Next.js', 'Redux'], description: 'Build polished, performant user experiences for a B2B analytics platform.', requirements: ['5+ years in React', 'Experience with TypeScript', 'Strong UI architecture skills'], employerIndex: 0 },
  { title: 'Full Stack Developer', company: 'FinFlux', location: 'New York, NY', salary: '$140k - $165k', type: 'Full-time', category: 'Web Development', skills: ['Node.js', 'Express', 'React', 'MongoDB'], description: 'Develop secure financial workflows and customer dashboards.', requirements: ['3+ years in full-stack development', 'Experience building REST APIs', 'Knowledge of authentication flows'], employerIndex: 1 },
  { title: 'UI/UX Designer', company: 'PixelForge', location: 'Austin, TX', salary: '$110k - $130k', type: 'Hybrid', category: 'UI/UX', skills: ['Figma', 'Wireframing', 'Design Systems'], description: 'Shape the product experience for a multi-product design studio.', requirements: ['3+ years in product design', 'Strong portfolio', 'Excellent collaboration skills'], employerIndex: 2 },
  { title: 'DevOps Engineer', company: 'CloudHaven', location: 'Denver, CO', salary: '$130k - $160k', type: 'Full-time', category: 'DevOps', skills: ['AWS', 'Docker', 'Terraform', 'Kubernetes'], description: 'Own infrastructure automation and deployment reliability.', requirements: ['Experience with CI/CD', 'Strong cloud practices', 'Scripting skills'], employerIndex: 3 },
  { title: 'Data Scientist', company: 'Signal AI', location: 'Remote', salary: '$125k - $150k', type: 'Remote', category: 'Data Science', skills: ['Python', 'Machine Learning', 'SQL'], description: 'Work on predictive analytics and intelligent alerting features.', requirements: ['Strong Python skills', 'Experience with ML pipelines', 'SQL expertise'], employerIndex: 4 },
  { title: 'Android Engineer', company: 'Northstar Labs', location: 'Remote', salary: '$120k - $145k', type: 'Remote', category: 'Mobile Development', skills: ['Android', 'Kotlin', 'Jetpack Compose'], description: 'Build Android experiences for internal and external users.', requirements: ['3+ years in Android development', 'Kotlin experience', 'Strong mobile architecture skills'], employerIndex: 0 },
  { title: 'Product Manager', company: 'FinFlux', location: 'New York, NY / Remote', salary: '$135k - $155k', type: 'Full-time', category: 'Product Management', skills: ['Product Strategy', 'Analytics', 'Roadmaps'], description: 'Drive roadmap execution for a modern fintech platform.', requirements: ['Prior PM experience', 'Metrics-driven thinking', 'Execution focus'], employerIndex: 1 },
  { title: 'Cybersecurity Analyst', company: 'CloudHaven', location: 'Denver, CO / Remote', salary: '$115k - $140k', type: 'Full-time', category: 'Cybersecurity', skills: ['Security', 'Cloud Security', 'SIEM'], description: 'Protect cloud workloads and improve security posture.', requirements: ['Security experience', 'Threat detection background', 'Scripting knowledge'], employerIndex: 3 },
  { title: 'Machine Learning Engineer', company: 'Signal AI', location: 'Remote', salary: '$145k - $170k', type: 'Remote', category: 'Data Science', skills: ['Python', 'PyTorch', 'MLOps'], description: 'Develop and operationalize models used in real-time intelligence products.', requirements: ['ML engineering experience', 'Python proficiency', 'Model deployment experience'], employerIndex: 4 },
  { title: 'Frontend Developer', company: 'PixelForge', location: 'Austin, TX / Remote', salary: '$100k - $125k', type: 'Part-time', category: 'Web Development', skills: ['React', 'CSS', 'Accessibility'], description: 'Collaborate closely with design teams on web applications.', requirements: ['React experience', 'Accessibility experience', 'Strong attention to detail'], employerIndex: 2 },
  { title: 'Backend Engineer', company: 'Northstar Labs', location: 'Seattle, WA', salary: '$140k - $160k', type: 'Full-time', category: 'Web Development', skills: ['Java', 'Spring Boot', 'PostgreSQL'], description: 'Build scalable backend services powering customer workflows.', requirements: ['Java backend experience', 'Microservices familiarity', 'Database design skills'], employerIndex: 0 },
  { title: 'QA Automation Engineer', company: 'CloudHaven', location: 'Denver, CO', salary: '$95k - $120k', type: 'Full-time', category: 'Testing', skills: ['Playwright', 'Cypress', 'CI/CD'], description: 'Create end-to-end test automation for complex cloud applications.', requirements: ['Automation QA experience', 'Testing frameworks knowledge', 'CI/CD fluency'], employerIndex: 3 },
  { title: 'Cloud Engineer', company: 'Signal AI', location: 'Remote', salary: '$130k - $155k', type: 'Remote', category: 'Cloud Computing', skills: ['AWS', 'Azure', 'Terraform'], description: 'Design and support scalable cloud-based analytics infrastructure.', requirements: ['Cloud architecture experience', 'Terraform knowledge', 'Troubleshooting skills'], employerIndex: 4 },
  { title: 'Product Designer', company: 'FinFlux', location: 'New York, NY', salary: '$115k - $135k', type: 'Hybrid', category: 'UI/UX', skills: ['Figma', 'Prototyping', 'User Research'], description: 'Guide the end-to-end design of customer-facing fintech products.', requirements: ['Design portfolio', 'User research experience', 'Strong communication'], employerIndex: 1 },
  { title: 'Mobile Developer', company: 'PixelForge', location: 'Austin, TX / Remote', salary: '$105k - $128k', type: 'Remote', category: 'Mobile Development', skills: ['React Native', 'TypeScript', 'Mobile UI'], description: 'Build cross-platform mobile solutions with a strong design focus.', requirements: ['React Native experience', 'TypeScript knowledge', 'UI polish'], employerIndex: 2 },
  { title: 'SRE Engineer', company: 'CloudHaven', location: 'Remote', salary: '$140k - $165k', type: 'Remote', category: 'DevOps', skills: ['Kubernetes', 'Monitoring', 'Linux'], description: 'Support reliability engineering for a high-scale SaaS platform.', requirements: ['SRE experience', 'Linux proficiency', 'Observability skills'], employerIndex: 3 },
  { title: 'Data Engineer', company: 'Signal AI', location: 'Remote', salary: '$135k - $155k', type: 'Full-time', category: 'Data Science', skills: ['Python', 'SQL', 'ETL'], description: 'Build scalable data pipelines for analytics and machine learning.', requirements: ['ETL experience', 'Python and SQL', 'Data modeling knowledge'], employerIndex: 4 },
  { title: 'Junior Frontend Developer', company: 'Northstar Labs', location: 'Seattle, WA', salary: '$85k - $105k', type: 'Internship', category: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript'], description: 'Ideal role for early-career developers eager to learn modern frontend stacks.', requirements: ['Basic web development skills', 'Willingness to learn', 'Team collaboration'], employerIndex: 0 },
  { title: 'Research Engineer', company: 'FinFlux', location: 'Remote', salary: '$125k - $145k', type: 'Remote', category: 'Data Science', skills: ['Python', 'Research', 'Analytics'], description: 'Investigate new product opportunities and support decision-making.', requirements: ['Research background', 'Analytical mindset', 'Python experience'], employerIndex: 1 },
  { title: 'UI Engineer', company: 'PixelForge', location: 'Austin, TX', salary: '$108k - $132k', type: 'Full-time', category: 'UI/UX', skills: ['React', 'CSS', 'Accessibility'], description: 'Build interface components and polished user flows for startup products.', requirements: ['Strong React experience', 'Design systems knowledge', 'Accessibility focus'], employerIndex: 2 },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    console.log('Cleared existing data.');

    const prepareUsers = async (users) => {
      const hashedUsers = await Promise.all(users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })));
      return hashedUsers;
    };

    const createdEmployers = await User.insertMany(await prepareUsers(employersData));
    console.log(`Created ${createdEmployers.length} employers.`);

    const createdCandidates = await User.insertMany(await prepareUsers(candidatesData));
    console.log(`Created ${createdCandidates.length} candidates.`);

    const jobsToCreate = jobsData.map((job) => ({
      ...job,
      employer: createdEmployers[job.employerIndex]._id,
    }));

    const createdJobs = await Job.insertMany(jobsToCreate);
    console.log(`Created ${createdJobs.length} jobs.`);

    const applicationsData = [
      {
        job: createdJobs[0]._id,
        candidate: createdCandidates[0]._id,
        coverLetter: 'I am excited to help grow your frontend platform and bring a strong React background.',
        resume: {
          experience: '6 years building scalable React applications',
          skills: 'React, TypeScript, Redux, UI/UX',
          portfolioUrl: 'https://portfolio.example.com/jane',
          resumeText: 'Experienced frontend engineer with strong product instincts.',
          file: null,
        },
        status: 'applied',
      },
      {
        job: createdJobs[1]._id,
        candidate: createdCandidates[1]._id,
        coverLetter: 'I would love to contribute to your fintech platform with strong full-stack experience.',
        resume: {
          experience: '4 years working on Node.js and React products',
          skills: 'Node.js, Express, MongoDB, REST APIs',
          portfolioUrl: 'https://portfolio.example.com/noah',
          resumeText: 'Full-stack developer with API and database experience.',
          file: null,
        },
        status: 'reviewing',
      },
      {
        job: createdJobs[3]._id,
        candidate: createdCandidates[3]._id,
        coverLetter: 'I bring hands-on cloud automation experience and strong DevOps delivery.',
        resume: {
          experience: '7 years in DevOps and platform operations',
          skills: 'AWS, Docker, Kubernetes, Terraform',
          portfolioUrl: 'https://portfolio.example.com/lucas',
          resumeText: 'Cloud engineer focused on reliability and scaling.',
          file: null,
        },
        status: 'interviewing',
        interviewDetails: {
          date: new Date('2026-07-16T00:00:00.000Z'),
          time: '10:30 AM',
          link: 'https://meet.jit.si/aspira-demo-1',
          message: 'We would love to discuss your background in more detail.',
        },
      },
      {
        job: createdJobs[4]._id,
        candidate: createdCandidates[4]._id,
        coverLetter: 'I am excited to apply my machine learning background to your analytics platform.',
        resume: {
          experience: '3 years in data science and analytics',
          skills: 'Python, SQL, Machine Learning, Pandas',
          portfolioUrl: 'https://portfolio.example.com/ariana',
          resumeText: 'Data scientist with experience in predictive modeling.',
          file: null,
        },
        status: 'accepted',
      },
      {
        job: createdJobs[7]._id,
        candidate: createdCandidates[5]._id,
        coverLetter: 'My cybersecurity background would add value to your cloud security programs.',
        resume: {
          experience: '4 years in security operations',
          skills: 'Security, Cloud Security, SIEM',
          portfolioUrl: 'https://portfolio.example.com/owen',
          resumeText: 'Security engineer with practical cloud experience.',
          file: null,
        },
        status: 'rejected',
      },
      {
        job: createdJobs[9]._id,
        candidate: createdCandidates[7]._id,
        coverLetter: 'I am eager to build reliable, user-focused web UI.',
        resume: {
          experience: '5 years working on distributed systems',
          skills: 'Java, Spring Boot, Kafka, PostgreSQL',
          portfolioUrl: 'https://portfolio.example.com/ethan',
          resumeText: 'Backend engineer with a strong service architecture background.',
          file: null,
        },
        status: 'applied',
      },
      {
        job: createdJobs[10]._id,
        candidate: createdCandidates[8]._id,
        coverLetter: 'I can bring solid automation and quality engineering practices to your team.',
        resume: {
          experience: '4 years in software testing',
          skills: 'Playwright, Cypress, Testing, CI/CD',
          portfolioUrl: 'https://portfolio.example.com/nina',
          resumeText: 'QA automation engineer with experience in high-volume products.',
          file: null,
        },
        status: 'reviewing',
      },
      {
        job: createdJobs[12]._id,
        candidate: createdCandidates[2]._id,
        coverLetter: 'I enjoy designing thoughtful product experiences and would love to join your team.',
        resume: {
          experience: '5 years in product and UX design',
          skills: 'Figma, Wireframing, Design Systems, User Research',
          portfolioUrl: 'https://portfolio.example.com/maya',
          resumeText: 'Designer proficient in creating clear, usable interfaces.',
          file: null,
        },
        status: 'applied',
      },
      {
        job: createdJobs[15]._id,
        candidate: createdCandidates[6]._id,
        coverLetter: 'I have hands-on infrastructure and monitoring experience and would thrive here.',
        resume: {
          experience: '6 years in cybersecurity engineering',
          skills: 'Security, Cloud Security, SOC, Python',
          portfolioUrl: 'https://portfolio.example.com/sofia',
          resumeText: 'Cybersecurity engineer focused on incident response.',
          file: null,
        },
        status: 'reviewing',
      },
      {
        job: createdJobs[17]._id,
        candidate: createdCandidates[9]._id,
        coverLetter: 'I can strengthen your product roadmap and execution with a technical PM background.',
        resume: {
          experience: '8 years in product management',
          skills: 'Product Strategy, Analytics, Roadmaps, Agile',
          portfolioUrl: 'https://portfolio.example.com/kai',
          resumeText: 'Product manager comfortable bridging business and engineering.',
          file: null,
        },
        status: 'applied',
      },
    ];

    await Application.insertMany(applicationsData);
    console.log(`Created ${applicationsData.length} applications.`);

    mongoose.connection.close();
    console.log('Seeding complete. Connection closed.');
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
