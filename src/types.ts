export interface Article {
  id: string | number;
  title: string;
  extract: string;
  imageUrl?: string;
  url: string;
  lang: string;
}

export interface UserProfile {
  likes: Article[];
  favorites: Article[];
  history: Article[];
  dislikes: string[];
  interests: string[];
}
