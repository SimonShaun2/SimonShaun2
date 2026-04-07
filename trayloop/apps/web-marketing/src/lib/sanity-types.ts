export interface Author {
  name: string;
  image?: any;
  bio?: string;
}

export interface Category {
  title: string;
  slug: string;
  description?: string;
}

export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  body?: any[];
  coverImage?: any;
  coverImageUrl?: string;
  author: Author;
  categories: Category[];
  publishedAt: string;
  readTime: number;
}
