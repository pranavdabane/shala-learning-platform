
import { Course } from './types';

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Mastering Data Science with Python & Big Data',
    description: 'Learn the foundations of data analysis, visualization, and machine learning from industry experts.',
    price: 99.99,
    category: 'Technology',
    rating: 4.9,
    reviews: '2.1k',
    duration: '42 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfq4tEvWyC3J50gJD6d6QWP0g1Yf7x-KoUe_dLLhVkJaUStTDnjxZFD2WL69OXsQaldQugGmBkkm4P1ZP0HHTCTjkRW2-aG-V1IAv-ihW-5kvF4OKZzZsxp-5ofS4J0rgNeoZSf08kMdnBVfL9N6pcxPel2sn6zr5sESLLZ0p7uz1Bsp5mmiyFSqlJQFJ4TJsIW_MEXJwXGzhOgp7gY3u-FgF1W7bG-llQy7cyssfuQhV2NveWz4smTI0zxDn0UwMYT3EaHjlmpQFc',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    lessons: [
      { id: 1, title: "Data Science Foundations", duration: "12:40", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 2, title: "Python for Data Analysis", duration: "18:20", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 3, title: "Machine Learning Basics", duration: "24:15", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 4, title: "Big Data Ecosystems", duration: "15:50", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 5, title: "Capstone Project", duration: "32:10", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }
    ]
  },
  {
    id: '2',
    title: 'Advanced UI/UX: Design Systems & Components',
    description: 'Scale your design process with modular component libraries and high-fidelity prototyping.',
    price: 49.99,
    category: 'Design',
    rating: 4.8,
    reviews: '1.5k',
    duration: '28 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmyO5K2YoHGubw4b2yU_v66-BALd7m_vpZuOe08ah5xsv-XAEaMd-IFomI396i3S4Bd8DVEMg1le4AUXKmjDcuhmqVVit4oQ6v4a7WCT3r2nVdti3DihG6nm5a_aoBRtopk5o4SBT6ZDlkWXbBJhkS3RsEllHcht13GcpDx5LOK0QMjdVgi3GZ4Vzf2FZcXoG3VwLXNpGNjD1W4T6utPcGawUES72UYILELBFzW_Fzcnq2bOr2-h6dd2JkYtzPpGxYB7pWl-ywOYu8',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    lessons: [
      { id: 1, title: "Design System Fundamentals", duration: "10:15", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 2, title: "Atomic Design Principles", duration: "15:30", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 3, title: "Component Architecture", duration: "20:45", videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 4, title: "High-Fidelity Prototyping", duration: "18:20", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 5, title: "Handoff & Documentation", duration: "25:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' }
    ]
  },
  {
    id: '3',
    title: 'Scaleup Strategy: From Seed to IPO',
    description: 'The ultimate guide for founders and leaders looking to scale their operations globally.',
    price: 59.99,
    category: 'Business',
    rating: 5.0,
    reviews: '890',
    duration: '15 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnrYGdVCC2S63_dPb5hn7QV22zndSVKn-gWXYaJfCzWguYVBHo0rbI1JwuqHntx8T4fLkVGWUIpzuk5th-ilrlPyjE-Hj2z06_I-ohJ7-h_fMGZ6UrKv6C6FVnjT5c4CPd2E0Z2LFpEHZnIAm_FCRefo9_vAwoFVkcWHWe9DN9OdySCPI0Xk0ER1Sc_t2g4T3cFGfA8smztpT2Nf8xBKBAz0T_KD6xs2DE1IpZz3kgSlFPiKyMzIWBmQpN64WxiO3bnBnewu4UB0q-',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    lessons: [
      { id: 1, title: "Seed Stage Strategy", duration: "12:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 2, title: "Series A & Beyond", duration: "15:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 3, title: "Operational Scaling", duration: "18:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
      { id: 4, title: "Global Expansion", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 5, title: "Preparing for IPO", duration: "25:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' }
    ]
  },
  {
    id: '4',
    title: 'Holistic Mindfulness for Busy Professionals',
    description: 'Integrate mental wellness and productivity habits into your daily high-performance routine.',
    price: 29.99,
    category: 'Wellness',
    rating: 4.7,
    reviews: '3.2k',
    duration: '10 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDurDkdCP-ydfR_qMF_jjbHzeee7FY2hB4ru8UjTqjSPH37TNrcTDbe_dVqZ09Sn9Eyc0t0axFd-mxQvO8W5qn8wn1uDQbhFTd-jfXlwYuPaUsDWd16UkeHiyoVffXGX96eqyeE-kHusBfZWFTZklc8U5AgFQsI1gAwXLvu1vQBlcl6_xpPCzXQJDAJpbvag6dERDFcRr4NzRw7WijJll18L6w58RLchkYG82FbNrsijtkenktGLdHnNc_x0644pcWPUSr9buuxrwI5',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    lessons: [
      { id: 1, title: "Mindfulness Basics", duration: "08:00", videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4' },
      { id: 2, title: "Stress Management", duration: "10:00", videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4' },
      { id: 3, title: "Focus & Productivity", duration: "12:00", videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 4, title: "Habit Formation", duration: "15:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 5, title: "Sustainable Performance", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  },
  {
    id: '5',
    title: 'Growth Hacking: Modern Digital Marketing',
    description: 'Master SEO, SEM, and social media algorithms to drive exponential traffic to your brand.',
    price: 69.99,
    category: 'Marketing',
    rating: 4.9,
    reviews: '5k+',
    duration: '35 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5fhbrql6JtGgfCczV_EIWwzGhsncGG_mj0wF9y6bp55ObBc4p0-m2F1DeV0CG8hoZi2liOPv48z9y0yu1ALg_76pbHRs1Hvr3lj-PilTrmyW3CbzRxfuzyFPSkvWLSmsRsXZI2aJ5bi8IZ2fBpuXpe4kJZWGdMHnk3so9TzGtU3UDyK0aXK9ZeFhDpY9UlHMLCOVoNZ-hH5vyfRC2t0c9tf8fCpb61oiQlVBtv7rfysQD7sFaokIUtDg10ho648awxnCQzoPId-WE',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    lessons: [
      { id: 1, title: "Viral Marketing Loops", duration: "10:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
      { id: 2, title: "SEO & SEM Mastery", duration: "15:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 3, title: "Social Media Algorithms", duration: "12:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
      { id: 4, title: "Conversion Optimization", duration: "18:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 5, title: "Analytics & Attribution", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ]
  },
  {
    id: '6',
    title: 'Full-stack React & Node.js Masterclass',
    description: 'Build and deploy production-ready web applications using the most popular JavaScript stack.',
    price: 89.99,
    category: 'Technology',
    rating: 4.8,
    reviews: '2.8k',
    duration: '56 hours',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8zdxCR_xyUr1tEL5VAcvbCpTN_HBtf2zWeE0Mgr-Z00xTBB8OQvJTazUoiLGOw1PKmpmwD3hAmPWoJo1V8xie0ICd8qebS-3qfREcT8UGhfTEuXncE5CJimMr9k9AVSt930X9D0scaRWxMQDMJe2lU3PHNOjqpvJ1utKLMDJ1EBpX74sRw1u-vm9ZExh3KNYJk0XUE7Ua_OUwUjj6_rlayoYyOMCKMkvYieGCy-5iJ6T7aGxJ8dW2Gu7VEZBmjl-EBqnQ7hRC8WIc',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    lessons: [
      { id: 1, title: "React Hooks Deep Dive", duration: "15:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 2, title: "Node.js Architecture", duration: "18:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
      { id: 3, title: "Database Design (SQL vs NoSQL)", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 4, title: "Authentication & Security", duration: "22:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 5, title: "Deployment & CI/CD", duration: "25:00", videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4' }
    ]
  },
  {
    id: '7',
    title: 'Neural Networks & Deep Learning Essentials',
    description: 'Deep dive into architecture designs and practical implementations of neural networks.',
    price: 119.99,
    category: 'Data Science',
    rating: 4.9,
    reviews: '1.2k',
    duration: '60 hours',
    imageUrl: 'https://picsum.photos/seed/ds1/800/450',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    lessons: [
      { id: 1, title: "Neural Network Architecture", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
      { id: 2, title: "Backpropagation & Optimization", duration: "25:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 3, title: "CNNs for Computer Vision", duration: "30:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 4, title: "RNNs & LSTMs", duration: "28:00", videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 5, title: "Transformers & LLMs", duration: "35:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  },
  {
    id: '8',
    title: 'The Art of Product Management',
    description: 'Master the lifecycle of software products from discovery to launch and iteration.',
    price: 74.99,
    category: 'Business',
    rating: 4.7,
    reviews: '950',
    duration: '22 hours',
    imageUrl: 'https://picsum.photos/seed/pm1/800/450',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    lessons: [
      { id: 1, title: "Product Discovery", duration: "12:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 2, title: "Agile Methodologies", duration: "15:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 3, title: "Stakeholder Management", duration: "18:00", videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
      { id: 4, title: "Product Analytics", duration: "20:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 5, title: "Growth & Iteration", duration: "25:00", videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' }
    ]
  }
];

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  courseIds: string[];
  role: string;
  icon: string;
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'cp1',
    title: 'Full-Stack Data Architect',
    description: 'Design and deploy data-intensive applications from the ground up.',
    courseIds: ['1', '6', '7'],
    role: 'Solutions Architect',
    icon: 'database'
  },
  {
    id: 'cp2',
    title: 'Lead Product Designer',
    description: 'Master the intersection of user psychology, business goals, and design systems.',
    courseIds: ['2', '8', '4'],
    role: 'Senior UI/UX Designer',
    icon: 'architecture'
  },
  {
    id: 'cp3',
    title: 'Digital Growth Executive',
    description: 'Scale businesses through high-impact marketing and data-driven strategy.',
    courseIds: ['5', '3', '8'],
    role: 'Head of Growth',
    icon: 'trending_up'
  }
];
