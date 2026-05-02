
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  module?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: string;
  duration: string;
  imageUrl: string;
  instructor?: string;
  videoUrl?: string;
  lessons?: Lesson[];
  isFeatured?: boolean;
  created_at?: string;
}

export interface EnrolledCourse extends Course {
  enrollmentId: string;
  progress: number;
  purchaseDate?: string;
  paymentMethod?: string;
  orderId?: string;
}

export interface CartItem extends Course {
  addedAt: number;
}

export enum Category {
  ALL = 'All Topics',
  TECHNOLOGY = 'Technology',
  BUSINESS = 'Business',
  DESIGN = 'UI/UX Design',
  MARKETING = 'Marketing',
  WELLNESS = 'Wellness',
  DATA_SCIENCE = 'Data Science'
}
