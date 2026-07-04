-- =========================================================================
-- SQL SETUP FOR SUPABASE PLAYGROUND - BOOK READING APP
-- Copy and paste this script directly into the Supabase SQL Editor
-- to initialize your database structure and seed the initial data.
-- =========================================================================

-- 1. DROP EXISTING TABLES IF ANY (CAUTION: CLEARS DATA)
DROP TABLE IF EXISTS user_book_interactions CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS monthly_themes CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

-- 2. CREATE TABLES

-- Users table
CREATE TABLE users (
  "User_ID" INT PRIMARY KEY,
  "Full_Name" TEXT NOT NULL,
  "Grade_Class" TEXT NOT NULL,
  "Avatar_URL" TEXT,
  "Total_Points" INT DEFAULT 0,
  "Password" TEXT
);

-- Books table
CREATE TABLE books (
  "Book_ID" INT PRIMARY KEY,
  "Title" TEXT NOT NULL,
  "Author" TEXT NOT NULL,
  "Cover_Image" TEXT,
  "Category" TEXT NOT NULL,
  "Target_Grade" TEXT NOT NULL,
  "Book_Type" TEXT CHECK ("Book_Type" IN ('Ebook', 'Audio')),
  "Content_URL" TEXT DEFAULT '#'
);

-- Monthly Themes table
CREATE TABLE monthly_themes (
  "Theme_ID" INT PRIMARY KEY,
  "Month_Year" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Banner_Image" TEXT,
  "Description" TEXT,
  "Media_Podcast" TEXT,
  "Media_Video" TEXT,
  "Media_MiniGame" TEXT
);

-- User-Book Interactions table
CREATE TABLE user_book_interactions (
  "Interaction_ID" INT PRIMARY KEY,
  "User_ID" INT REFERENCES users("User_ID") ON DELETE CASCADE,
  "Book_ID" INT REFERENCES books("Book_ID") ON DELETE CASCADE,
  "Is_Favorite" BOOLEAN DEFAULT FALSE,
  "Reading_Progress" INT DEFAULT 0,
  "Status" TEXT CHECK ("Status" IN ('Đang đọc', 'Đã hoàn thành'))
);

-- Challenges table
CREATE TABLE challenges (
  "Challenge_ID" INT PRIMARY KEY,
  "Title" TEXT NOT NULL,
  "Target" INT NOT NULL,
  "Current" INT DEFAULT 0,
  "Progress_Type" TEXT NOT NULL,
  "Completed" BOOLEAN DEFAULT FALSE,
  "Reward" TEXT
);

-- Badges table
CREATE TABLE badges (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "desc" TEXT,
  "icon" TEXT,
  "color" TEXT,
  "owned" BOOLEAN DEFAULT FALSE
);

-- 3. ENABLE ALL PUBLIC ACCESS (DISABLE ROW LEVEL SECURITY OR SET UP POLICIES)
-- For easy testing in the playground, we can disable RLS.
-- This allows anyone with the anon key to read, insert, update, or delete.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_themes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;

-- 4. SEED DATA

INSERT INTO users ("User_ID", "Full_Name", "Grade_Class", "Avatar_URL", "Total_Points", "Password") VALUES
(1, 'Nguyễn Lâm Anh', 'Lớp 5A', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 1450, 'user123'),
(2, 'Trần Minh Quân', 'Lớp 4B', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 1100, 'user456'),
(3, 'Lê Mỹ Huyền', 'Lớp 5C', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1980, 'user789');

INSERT INTO books ("Book_ID", "Title", "Author", "Cover_Image", "Category", "Target_Grade", "Book_Type", "Content_URL") VALUES
(1, 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'Văn học Việt Nam', 'Lớp 4-5', 'Ebook', '#'),
(2, 'Sự Tích Trầu Cau', 'Dân gian Việt Nam', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Cổ tích', 'Lớp 1-3', 'Audio', '#'),
(3, 'Khám Phá Đại Dương', 'NXB Kim Đồng', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'Khoa học', 'Lớp 4-5', 'Ebook', '#'),
(4, 'Thám Hiểm Vũ Trụ', 'Laura Ingalls Wilder', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400', 'Khoa học', 'Lớp 5', 'Ebook', '#'),
(5, 'Kể chuyện Bác Hồ', 'Nhiều tác giả', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Lịch sử', 'Lớp 4-5', 'Audio', '#');

INSERT INTO monthly_themes ("Theme_ID", "Month_Year", "Title", "Banner_Image", "Description", "Media_Podcast", "Media_Video", "Media_MiniGame") VALUES
(101, '10/2026', 'Đại Dương Xanh Kỳ Thú', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000', 'Cùng lặn sâu xuống đáy đại dương tìm hiểu các sinh vật độc đáo của biển cả và rèn luyện kỹ năng đọc sách trong tháng này!', 'Podcast: Bí mật Rãnh Mariana - Tập 4', 'Video: Thám hiểm rạn san hô kỳ ảo', 'Trò chơi dọn rác cứu sinh vật biển');

INSERT INTO user_book_interactions ("Interaction_ID", "User_ID", "Book_ID", "Is_Favorite", "Reading_Progress", "Status") VALUES
(1, 1, 1, TRUE, 75, 'Đang đọc'),
(2, 1, 2, FALSE, 100, 'Đã hoàn thành'),
(3, 1, 3, TRUE, 10, 'Đang đọc'),
(4, 2, 4, TRUE, 90, 'Đang đọc');

INSERT INTO challenges ("Challenge_ID", "Title", "Target", "Current", "Progress_Type", "Completed", "Reward") VALUES
(1, 'Kẻ hủy diệt sách cổ', 3, 2, 'Cổ tích', FALSE, 'Huy hiệu Cổ Tích'),
(2, 'Trái tim xanh bảo vệ biển', 1, 0, 'Quiz Đại Dương', FALSE, 'Huy hiệu Bảo Vệ Biển'),
(3, 'Mọt Sách Chuyên Cần', 5, 5, 'Any Book', TRUE, 'Huy hiệu Chuyên Cần');

INSERT INTO badges ("id", "title", "desc", "icon", "color", "owned") VALUES
('b1', 'Mọt Sách', 'Đọc trọn vẹn hơn 5 cuốn sách', '📚', 'bg-sky-500/25 border-sky-500 text-sky-400', TRUE),
('b2', 'Thông Thái', 'Hoàn thành 3 bài Quiz chủ điểm', '🧠', 'bg-amber-500/25 border-amber-500 text-amber-400', FALSE),
('b3', 'Bảo Vệ Biển', 'Tham gia trò chơi bảo vệ san hô', '🐬', 'bg-teal-500/25 border-teal-500 text-teal-400', TRUE),
('b4', 'Chiến Thần Đọc Sách', 'Đạt mốc 1500 XP thi đua', '👑', 'bg-indigo-500/25 border-indigo-500 text-indigo-400', FALSE);
