export interface User {
  User_ID: number;
  Full_Name: string;
  Grade_Class: string;
  Avatar_URL: string;
  Total_Points: number;
  Password?: string;
}

export interface Book {
  Book_ID: number;
  Title: string;
  Author: string;
  Cover_Image: string;
  Category: string;
  Target_Grade: string;
  Book_Type: 'Ebook' | 'Audio';
  Content_URL: string;
}

export interface MonthlyTheme {
  Theme_ID: number;
  Month_Year: string;
  Title: string;
  Banner_Image: string;
  Description: string;
  Media_Podcast: string;
  Media_Video: string;
  Media_MiniGame: string;
}

export interface UserBookInteraction {
  Interaction_ID: number;
  User_ID: number;
  Book_ID: number;
  Is_Favorite: boolean;
  Reading_Progress: number; // 0 to 100
  Status: 'Đang đọc' | 'Đã hoàn thành';
}

export interface Challenge {
  Challenge_ID: number;
  Title: string;
  Target: number;
  Current: number;
  Progress_Type: string;
  Completed: boolean;
  Reward: string;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  owned: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  query: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'system' | 'error';
}
