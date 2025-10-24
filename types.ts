export interface Page {
  filename: string;
  html: string;
  css: string;
  js: string;
  title: string;
  metaDescription: string;
}

export type MessageStatus = 'thinking' | 'generating' | 'done' | 'error';

export interface ChristosProgress {
  status: MessageStatus;
  files: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'christos';
  text: string;
  progress?: ChristosProgress;
  thought?: string;
}
