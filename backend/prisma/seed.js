import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_USERS = [
  {
    id: 'poster-1',
    name: 'Vikas Sharma (Contractor)',
    email: 'vikas@sharmaconstruction.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    role: 'poster',
    rating: 4.8,
    reviewCount: 24,
    completedJobs: 18,
    skills: [],
    certifications: [],
    balance: 5000.0,
  },
  {
    id: 'poster-2',
    name: 'Aditi Rao',
    email: 'aditi@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'poster',
    rating: 4.6,
    reviewCount: 5,
    completedJobs: 4,
    skills: [],
    certifications: [],
    balance: 5000.0,
  },
  {
    id: 'poster-3',
    name: 'Rohan Gupta',
    email: 'rohan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    role: 'poster',
    rating: 4.9,
    reviewCount: 8,
    completedJobs: 6,
    skills: [],
    certifications: [],
    balance: 5000.0,
  },
  {
    id: 'poster-4',
    name: 'Meera Deshmukh',
    email: 'meera@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'poster',
    rating: 4.7,
    reviewCount: 12,
    completedJobs: 9,
    skills: [],
    certifications: [],
    balance: 5000.0,
  },
  {
    id: 'worker-1',
    name: 'Rajesh Kumar (Electrician)',
    email: 'rajesh.electrician@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
    role: 'worker',
    rating: 4.9,
    reviewCount: 38,
    completedJobs: 42,
    skills: ['Wiring', 'Smart Home Setup', 'Chandelier Installation', 'Appliance Repair', 'Generator Service'],
    certifications: ['Govt Certified Electrician Grade A', 'SmartHome Systems Expert'],
    balance: 850.0,
  },
  {
    id: 'worker-2',
    name: 'Manpreet Singh (Mason)',
    email: 'manpreet.masonry@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'worker',
    rating: 4.7,
    reviewCount: 19,
    completedJobs: 21,
    skills: ['Brickwork', 'Plastering', 'Tile Installation', 'Foundation Laying', 'Concrete Mixing'],
    certifications: ['Guild of Master Masons Certificate'],
    balance: 320.0,
  },
  {
    id: 'worker-3',
    name: 'Amit Verma (AC Technician)',
    email: 'amit.ac.tech@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'worker',
    rating: 4.8,
    reviewCount: 56,
    completedJobs: 65,
    skills: ['Gas Refill', 'Compressor Repair', 'AC Installation', 'HVAC Diagnostics', 'Filter Cleaning'],
    certifications: ['HVAC Certified Technician Level 2', 'Daikin & LG Verified Partner'],
    balance: 1250.0,
  },
  {
    id: 'worker-4',
    name: 'Suresh Patil (Plumber)',
    email: 'suresh.plumbing@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    role: 'worker',
    rating: 4.6,
    reviewCount: 29,
    completedJobs: 33,
    skills: ['Pipe Leak Repair', 'Bathroom Fitting', 'Drain Cleaning', 'Water Pump Repair', 'Geyser Installation'],
    certifications: ['Municipal Plumber License'],
    balance: 410.0,
  }
];

const INITIAL_JOBS = [
  {
    id: 'job-old-1',
    title: 'Office Space Wiring',
    description: 'Complete office wiring upgrade.',
    category: 'Electrical',
    posterId: 'poster-1',
    posterName: 'Vikas Sharma (Contractor)',
    posterRating: 4.8,
    budget: 500.0,
    location: 'Sector 62, Noida',
    date: '2026-05-28',
    status: 'completed',
    requirements: ['Wiring', 'Commercial Experience'],
    duration: '3 Days',
    createdDate: '2026-05-25',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar (Electrician)',
  },
  {
    id: 'job-old-2',
    title: 'Brick Perimeter Garden Wall',
    description: 'Construct garden wall fence.',
    category: 'Masonry',
    posterId: 'poster-1',
    posterName: 'Vikas Sharma (Contractor)',
    posterRating: 4.8,
    budget: 300.0,
    location: 'Sector 50, Noida',
    date: '2026-06-02',
    status: 'completed',
    requirements: ['Brickwork'],
    duration: '2 Days',
    createdDate: '2026-06-01',
    workerId: 'worker-2',
    workerName: 'Manpreet Singh (Mason)',
  },
  {
    id: 'job-old-3',
    title: 'Water Tank Valve Repair',
    description: 'Fix leak in the main overhead water tank valve.',
    category: 'Plumbing',
    posterId: 'poster-1',
    posterName: 'Vikas Sharma (Contractor)',
    posterRating: 4.8,
    budget: 150.0,
    location: 'Sector 15, Noida',
    date: '2026-06-08',
    status: 'completed',
    requirements: ['Plumbing', 'Valve Repair'],
    duration: '1 Day',
    createdDate: '2026-06-07',
    workerId: 'worker-4',
    workerName: 'Suresh Patil (Plumber)',
  },
  {
    id: 'job-1',
    title: 'Kitchen Sink Drain Leak Repair',
    description: 'The drain pipe underneath our kitchen sink is leaking heavily whenever the tap runs. Need a plumber.',
    category: 'Plumbing',
    posterId: 'poster-2',
    posterName: 'Aditi Rao',
    posterRating: 4.6,
    budget: 80.0,
    location: 'Sector 45, Noida',
    date: '2026-06-15',
    status: 'open',
    requirements: ['PVC Pipe Joinery', 'Leak Diagnostics', 'Bring own tools'],
    duration: '2 Hours',
    createdDate: '2026-06-13',
  },
  {
    id: 'job-2',
    title: 'Install Brick Wall for Garden Fence',
    description: 'Looking for an experienced mason to construct a brick perimeter wall for my garden.',
    category: 'Masonry',
    posterId: 'poster-1',
    posterName: 'Vikas Sharma (Contractor)',
    posterRating: 4.8,
    budget: 350.0,
    location: 'Sohna Road, Gurgaon',
    date: '2026-06-17',
    status: 'open',
    requirements: ['Bricklaying', 'Level Alignment', 'Mortar Mixing', 'Safety Gear'],
    duration: '2 Days',
    createdDate: '2026-06-12',
  },
  {
    id: 'job-3',
    title: 'Complete Smart Home Light Switch Installation',
    description: 'Need an electrician to install and configure smart touch switches.',
    category: 'Electrical',
    posterId: 'poster-1',
    posterName: 'Vikas Sharma (Contractor)',
    posterRating: 4.8,
    budget: 120.0,
    location: 'Vasant Kunj, New Delhi',
    date: '2026-06-14',
    status: 'open',
    requirements: ['Smart Switch Connection', 'Living Wire Handling', 'Neutral Wire Setup'],
    duration: '4 Hours',
    createdDate: '2026-06-13',
  },
  {
    id: 'job-4',
    title: 'Gas Refill & Servicing for 2 Split ACs',
    description: 'ACs stopped cooling effectively. Suspecting gas leak.',
    category: 'AC/HVAC',
    posterId: 'poster-3',
    posterName: 'Rohan Gupta',
    posterRating: 4.9,
    budget: 110.0,
    location: 'Indiranagar, Bangalore',
    date: '2026-06-16',
    status: 'open',
    requirements: ['R32 Refrigerant Refill', 'Leak Detection/Welding', 'AC Cleaning'],
    duration: '3 Hours',
    createdDate: '2026-06-13',
  },
  {
    id: 'job-5',
    title: 'Install 5 New Ceiling Fans',
    description: 'Replacing older ceiling fans with BLDC fans.',
    category: 'Electrical',
    posterId: 'poster-4',
    posterName: 'Meera Deshmukh',
    posterRating: 4.7,
    budget: 90.0,
    location: 'Andheri West, Mumbai',
    date: '2026-06-18',
    status: 'in_progress',
    requirements: ['BLDC Fan Hookup', 'Ceiling Mount Stability', 'Remote Pairing'],
    duration: '3 Hours',
    createdDate: '2026-06-11',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar (Electrician)',
  }
];

const INITIAL_APPLICATIONS = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Kitchen Sink Drain Leak Repair',
    workerId: 'worker-4',
    workerName: 'Suresh Patil (Plumber)',
    workerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    workerRating: 4.6,
    workerCompletionRate: 95.0,
    bidAmount: 75.0,
    message: 'Hello, I am a certified plumber with 8 years of experience.',
    status: 'pending',
    date: '2026-06-13',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Install Brick Wall for Garden Fence',
    workerId: 'worker-2',
    workerName: 'Manpreet Singh (Mason)',
    workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    workerRating: 4.7,
    workerCompletionRate: 98.0,
    bidAmount: 350.0,
    message: 'Hi Sir, I read your description and I am ready to start on June 17.',
    status: 'pending',
    date: '2026-06-13',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    jobTitle: 'Complete Smart Home Light Switch Installation',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar (Electrician)',
    workerAvatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
    workerRating: 4.9,
    workerCompletionRate: 100.0,
    bidAmount: 110.0,
    message: 'Hello Vikas, I have installed Wipro smart switches before.',
    status: 'pending',
    date: '2026-06-13',
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    jobId: 'job-old-1',
    rating: 5.0,
    comment: 'Rajesh did a fantastic job.',
    reviewerName: 'Kabir Mehta',
    reviewerRole: 'poster',
    date: '2026-05-28',
  },
  {
    id: 'rev-2',
    jobId: 'job-old-2',
    rating: 4.0,
    comment: 'Good mason, wall looks solid.',
    reviewerName: 'Sanjay Dutt',
    reviewerRole: 'poster',
    date: '2026-06-02',
  },
  {
    id: 'rev-3',
    jobId: 'job-old-3',
    rating: 5.0,
    comment: 'Excellent plumbing service.',
    reviewerName: 'Priya Nair',
    reviewerRole: 'poster',
    date: '2026-06-08',
  }
];

async function main() {
  console.log('Start seeding...');

  // Delete all existing data to prevent duplicates
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  for (const u of INITIAL_USERS) {
    await prisma.user.create({ data: u });
  }
  console.log(`Seeded ${INITIAL_USERS.length} users.`);

  // 2. Seed Jobs
  for (const j of INITIAL_JOBS) {
    await prisma.job.create({ data: j });
  }
  console.log(`Seeded ${INITIAL_JOBS.length} jobs.`);

  // 3. Seed Applications
  for (const a of INITIAL_APPLICATIONS) {
    await prisma.application.create({ data: a });
  }
  console.log(`Seeded ${INITIAL_APPLICATIONS.length} applications.`);

  // 4. Seed Reviews
  for (const r of INITIAL_REVIEWS) {
    await prisma.review.create({ data: r });
  }
  console.log(`Seeded ${INITIAL_REVIEWS.length} reviews.`);

  // 5. Seed Notifications
  await prisma.notification.create({
    data: {
      id: '1',
      userId: 'all',
      text: 'Welcome to LaborLink! Log in or register an account to view and participate in the gig marketplace.',
      read: false,
      date: 'Just Now',
    },
  });
  console.log('Seeded initial notifications.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
