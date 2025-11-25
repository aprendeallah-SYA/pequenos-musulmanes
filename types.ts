export enum Section {
  HOME = 'HOME',
  LEARN = 'LEARN',
  STORIES = 'STORIES',
  GALLERY = 'GALLERY',
  GAMES = 'GAMES',
  CONTACT = 'CONTACT'
}

export enum GameType {
  NONE = 'NONE',
  HALAL_HARAM = 'HALAL_HARAM',
  OBSTACLE = 'OBSTACLE',
  MAZE = 'MAZE',
  JIHAD = 'JIHAD',
  PUZZLE = 'PUZZLE'
}

export interface Story {
  title: string;
  content: string;
  imagePrompt?: string;
}

export interface WorkbookType {
  id: string;
  title: string;
  description: string;
  type: 'alphabet' | 'prayer' | 'manners' | 'faith';
}

export interface ArabicLetter {
  letter: string;
  name: string;
  start: string;
  middle: string;
  end: string;
  pronunciation: string;
  word: string; // Arabic word example
  translation: string; // Spanish meaning
  icon: string; // Emoji representation
}