export interface OpeningSlot {
  open: string;
  close: string;
  date: string;
  platzwart: string;
}

export type AppointmentType = 'session' | 'event' | 'workshop' | 'other';
export type UserRole = 'admin' | 'platzwart' | 'dev';

export interface Appointment {
  date: string;
  start: string;
  end: string;
  responsible?: string;
  type: AppointmentType;
  month: number;
  name?: string;
  url?: string;
  showUsername?: boolean;
  displayName?: string;
}

export interface MonthConfig {
  month: number;
  month_name: string;
  min_gap_mins: number;
  corehours_start: string;
  corehours_end: string;
}

export interface FileItem {
  id: number;
  name: string;
  filename: string;
  description: string;
  uploadDate: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  caption: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  summary: string;
  images?: string[];
  folder?: string;
}

export interface AppData {
  openingHours: OpeningSlot[];
  files: FileItem[];
  galleryImages: GalleryImage[];
  events: Event[];
  credentials: Credentials;
}
