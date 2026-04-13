export interface ConsultantDirectoryItem {
  id: string;
  name: string;
  role: string;
  location: string;
  city: string;
  rating: number;
  projects: number;
  experience: number;
  age: number;
  expertise: string[];
  image: string;
  verified: boolean;
  bio: string;
}

export interface CompanyDirectoryItem {
  id: string;
  name: string;
  location: string;
  city: string;
  image: string;
  updatedAt: string | null;
}

export interface CityCoverageItem {
  city: string;
  total: number;
}

export interface DashboardSnapshot {
  consultantCount: number;
  companyCount: number;
  verifiedConsultantCount: number;
  averageRating: number;
  featuredConsultants: ConsultantDirectoryItem[];
  companies: CompanyDirectoryItem[];
  topCities: CityCoverageItem[];
}

export interface ChallengeSummary {
  id: string;
  title: string;
  description: string;
  status: string;
  mode: string;
  publishedAt: string | null;
  raw: Record<string, unknown>;
}

export interface SeedStatus {
  companiesSeeded: number;
  consultantsSeeded: number;
  ready: boolean;
  canSeed: boolean;
  note: string;
}

export interface ListResponse<T> {
  items: T[];
  count: number;
  source: 'supabase';
}
