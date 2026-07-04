import { User, Book, MonthlyTheme, UserBookInteraction, Challenge, Badge } from './types';

export const INITIAL_USERS: User[] = [
  { 
    User_ID: 1, 
    Username: "lamanh",
    Full_Name: "Nguyễn Lâm Anh", 
    Grade_Class: "Lớp 5A", 
    Avatar_URL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", 
    Total_Points: 1450, 
    Password: "user123" 
  },
  { 
    User_ID: 2, 
    Username: "minhquan",
    Full_Name: "Trần Minh Quân", 
    Grade_Class: "Lớp 4B", 
    Avatar_URL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150", 
    Total_Points: 1100, 
    Password: "user456" 
  },
  { 
    User_ID: 3, 
    Username: "myhuyen",
    Full_Name: "Lê Mỹ Huyền", 
    Grade_Class: "Lớp 5C", 
    Avatar_URL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", 
    Total_Points: 1980, 
    Password: "user789" 
  }
];

export const INITIAL_BOOKS: Book[] = [
  { 
    Book_ID: 1, 
    Title: "Dế Mèn Phiêu Lưu Ký", 
    Author: "Tô Hoài", 
    Cover_Image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", 
    Category: "Văn học Việt Nam", 
    Target_Grade: "Lớp 4-5", 
    Book_Type: "Ebook", 
    Content_URL: "#" 
  },
  { 
    Book_ID: 2, 
    Title: "Sự Tích Trầu Cau", 
    Author: "Dân gian Việt Nam", 
    Cover_Image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", 
    Category: "Cổ tích", 
    Target_Grade: "Lớp 1-3", 
    Book_Type: "Audio", 
    Content_URL: "#" 
  },
  { 
    Book_ID: 3, 
    Title: "Khám Phá Đại Dương", 
    Author: "NXB Kim Đồng", 
    Cover_Image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400", 
    Category: "Khoa học", 
    Target_Grade: "Lớp 4-5", 
    Book_Type: "Ebook", 
    Content_URL: "#" 
  },
  { 
    Book_ID: 4, 
    Title: "Thám Hiểm Vũ Trụ", 
    Author: "Laura Ingalls Wilder", 
    Cover_Image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400", 
    Category: "Khoa học", 
    Target_Grade: "Lớp 5", 
    Book_Type: "Ebook", 
    Content_URL: "#" 
  },
  { 
    Book_ID: 5, 
    Title: "Kể chuyện Bác Hồ", 
    Author: "Nhiều tác giả", 
    Cover_Image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", 
    Category: "Lịch sử", 
    Target_Grade: "Lớp 4-5", 
    Book_Type: "Audio", 
    Content_URL: "#" 
  }
];

export const INITIAL_THEME: MonthlyTheme = {
  Theme_ID: 101,
  Month_Year: "10/2026",
  Title: "Đại Dương Xanh Kỳ Thú",
  Banner_Image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000",
  Description: "Cùng lặn sâu xuống đáy đại dương tìm hiểu các sinh vật độc đáo của biển cả và rèn luyện kỹ năng đọc sách trong tháng này!",
  Media_Podcast: "Podcast: Bí mật Rãnh Mariana - Tập 4",
  Media_Video: "Video: Thám hiểm rạn san hô kỳ ảo",
  Media_MiniGame: "Trò chơi dọn rác cứu sinh vật biển"
};

export const INITIAL_INTERACTIONS: UserBookInteraction[] = [
  { Interaction_ID: 1, User_ID: 1, Book_ID: 1, Is_Favorite: true, Reading_Progress: 75, Status: "Đang đọc" },
  { Interaction_ID: 2, User_ID: 1, Book_ID: 2, Is_Favorite: false, Reading_Progress: 100, Status: "Đã hoàn thành" },
  { Interaction_ID: 3, User_ID: 1, Book_ID: 3, Is_Favorite: true, Reading_Progress: 10, Status: "Đang đọc" },
  { Interaction_ID: 4, User_ID: 2, Book_ID: 4, Is_Favorite: true, Reading_Progress: 90, Status: "Đang đọc" }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  { Challenge_ID: 1, Title: "Kẻ hủy diệt sách cổ", Target: 3, Current: 2, Progress_Type: "Cổ tích", Completed: false, Reward: "Huy hiệu Cổ Tích" },
  { Challenge_ID: 2, Title: "Trái tim xanh bảo vệ biển", Target: 1, Current: 0, Progress_Type: "Quiz Đại Dương", Completed: false, Reward: "Huy hiệu Bảo Vệ Biển" },
  { Challenge_ID: 3, Title: "Mọt Sách Chuyên Cần", Target: 5, Current: 5, Progress_Type: "Any Book", Completed: true, Reward: "Huy hiệu Chuyên Cần" }
];

export const INITIAL_BADGES: Badge[] = [
  { id: "b1", title: "Mọt Sách", desc: "Đọc trọn vẹn hơn 5 cuốn sách", icon: "📚", color: "bg-sky-500/25 border-sky-500 text-sky-400", owned: true },
  { id: "b2", title: "Thông Thái", desc: "Hoàn thành 3 bài Quiz chủ điểm", icon: "🧠", color: "bg-amber-500/25 border-amber-500 text-amber-400", owned: false },
  { id: "b3", title: "Bảo Vệ Biển", desc: "Tham gia trò chơi bảo vệ san hô", icon: "🐬", color: "bg-teal-500/25 border-teal-500 text-teal-400", owned: true },
  { id: "b4", title: "Chiến Thần Đọc Sách", desc: "Đạt mốc 1500 XP thi đua", icon: "👑", color: "bg-indigo-500/25 border-indigo-500 text-indigo-400", owned: false }
];

export const QUIZ_QUESTIONS = [
  {
    q: "Đại dương chiếm khoảng bao nhiêu phần trăm diện tích bề mặt Trái Đất?",
    a: ["Khoảng 50%", "Khoảng 70%", "Khoảng 90%"],
    correct: 1
  },
  {
    q: "Loài sinh vật biển nào được biết tới có kích thước lớn nhất hành tinh?",
    a: ["Cá voi xanh", "Cá mập voi", "Cá nhà táng"],
    correct: 0
  },
  {
    q: "Đâu là nơi sâu nhất thế giới thuộc Thái Bình Dương?",
    a: ["Vực Sunda", "Rãnh Mariana", "Vực Puerto Rico"],
    correct: 1
  }
];
