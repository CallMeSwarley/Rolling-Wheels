export interface OpeningHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeekSchedule {
  monday: OpeningHours;
  tuesday: OpeningHours;
  wednesday: OpeningHours;
  thursday: OpeningHours;
  friday: OpeningHours;
  saturday: OpeningHours;
  sunday: OpeningHours;
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

export interface AppData {
  openingHours: WeekSchedule;
  files: FileItem[];
  galleryImages: GalleryImage[];
  credentials: Credentials;
}
