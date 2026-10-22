import type { EntryImage, LocalizedText } from '../events/event-types';
export type GalleryPhoto = {
  id: string;
  image: EntryImage;
  caption: LocalizedText;
  album: string;
  credit?: string;
};
export type GalleryContent = {
  title: LocalizedText;
  description: LocalizedText;
  musicUrl: string;
  photos: GalleryPhoto[];
};
export type PhotoSubmission = {
  id: string;
  photos: GalleryPhoto[];
  status: 'uploading' | 'pending' | 'approved' | 'rejected' | 'failed';
  created_at: string;
};
