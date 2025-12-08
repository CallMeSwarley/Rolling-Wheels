export interface OpeningSlot {
  open: string;
  close: string;
  date: string;
  platzwart: string;
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
  openingHours: OpeningSlot[];
  files: FileItem[];
  galleryImages: GalleryImage[];
  credentials: Credentials;
}
