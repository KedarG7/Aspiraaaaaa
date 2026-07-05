import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    console.log('Cleared existing data.');

    // Create a mock employer
    const employer = new User({
      name: 'Google Recruiters',
      email: 'recruiter@google.com',
      password: 'password123', // pre-save hook will hash this
      role: 'employer',
    });

    await employer.save();
    console.log('Created mock employer user.');

    // Seed mock jobs
    const jobs = [
      {
        title: 'Senior Frontend Engineer (React)',
        company: 'Google',
        location: 'Mountain View, CA / Remote',
        salary: '$150,000 - $180,000',
        type: 'Remote',
        description: 'We are looking for a Senior Frontend Engineer to build beautiful and performant web interfaces for our cloud applications. You will collaborate with designers and backend teams to implement high-quality, responsive user experiences.',
        requirements: [
          '5+ years of experience with React, Redux, and modern JavaScript (ES6+)',
          'Strong understanding of semantic HTML5, CSS Grid, and Flexbox',
          'Familiarity with performance optimization techniques',
          'Excellent problem-solving and collaborative skills',
        ],
        employer: employer._id,
      },
      {
        title: 'Full Stack Developer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        salary: '$130,000 - $160,000',
        type: 'Full-time',
        description: 'Join our billing platform team to build secure, robust financial tools. You will work across the stack, developing responsive React applications and designing scalable Express/NodeJS microservices.',
        requirements: [
          '3+ years of experience in Node.js, Express, and React',
          'Solid understanding of MongoDB database modeling and optimization',
          'Experience building RESTful APIs and integrating payment gateways',
          'Knowledge of authentication flows (JWT, OAuth)',
        ],
        employer: employer._id,
      },
      {
        title: 'Product Designer (UI/UX)',
        company: 'Airbnb',
        location: 'Remote',
        salary: '$110,000 - $130,000',
        type: 'Remote',
        description: 'We are seeking a creative UI/UX Product Designer to shape the future of our booking experiences. You will conduct user research, design interactive high-fidelity wireframes, and verify styling with frontend developers.',
        requirements: [
          '3+ years of experience designing complex web and mobile products',
          'Expertise in Figma, clean design systems, and prototyping tools',
          'Strong portfolio demonstrating interaction design and user journeys',
          'Understanding of HTML/CSS code principles is a plus',
        ],
        employer: employer._id,
      },
      {
        title: 'Software Engineer Intern',
        company: 'Netflix',
        location: 'Los Gatos, CA',
        salary: '$40 - $50 / hour',
        type: 'Internship',
        description: 'Kickstart your career as an intern in our media streaming infrastructure team. You will write clean, well-tested code, deploy microservices, and learn from experienced engineers.',
        requirements: [
          'Currently pursuing a BS/MS in Computer Science or related field',
          'Basic experience in JavaScript, React, and Git source control',
          'Eagerness to learn and solve challenging algorithmic puzzles',
        ],
        employer: employer._id,
      },
    ];

    await Job.insertMany(jobs);
    console.log('Seeded job listings successfully.');

    // Create a mock candidate
    const candidate = new User({
      name: 'Jane Applicant',
      email: 'jane@applicant.com',
      password: 'candidatepass',
      role: 'candidate',
    });
    await candidate.save();
    console.log('Created mock candidate user.');

    // Create an example application from the candidate to the first job
    const firstJob = await Job.findOne({ title: 'Senior Frontend Engineer (React)' });
    if (firstJob) {
      const application = new Application({
        job: firstJob._id,
        candidate: candidate._id,
        coverLetter: 'I am excited to apply and bring 6+ years of frontend expertise building React apps.',
        resume: {
          experience: '6 years building scalable React applications',
          skills: 'React, Redux, TypeScript, CSS, Testing',
          resumeText: 'Experienced frontend engineer...',
          file: null,
        },
        status: 'applied',
      });
      await application.save();
      console.log('Created example application for candidate.');
    }

    mongoose.connection.close();
    console.log('Seeding complete. Connection closed.');
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
