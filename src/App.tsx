import React, { useState, useEffect } from 'react';
import { 
  BookOpen, User, Award, ShieldAlert, Sparkles, Trophy, Heart, Search, Filter, 
  Menu, X, Calendar, Activity, CheckCircle, BarChart2, Radio, Play, ChevronRight, Eye, Star,
  TrendingUp, HelpCircle, Lock, GraduationCap, Shield, Camera, Upload, LogOut
} from 'lucide-react';

import { 
  INITIAL_USERS, INITIAL_BOOKS, INITIAL_THEME, INITIAL_THEMES, INITIAL_INTERACTIONS, INITIAL_CHALLENGES, INITIAL_BADGES, QUIZ_QUESTIONS 
} from './data';
import { User as UserType, Book, MonthlyTheme, UserBookInteraction, Challenge, Badge, LogEntry } from './types';
import { executeVirtualSQL } from './sqlEngine';
import { supabase, supabaseUrl } from './supabase';

const SUPABASE_SQL_SCHEMA = `-- =========================================================================
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
CREATE TABLE users (
  "User_ID" INT PRIMARY KEY,
  "Username" TEXT UNIQUE,
  "Full_Name" TEXT NOT NULL,
  "Grade_Class" TEXT NOT NULL,
  "Avatar_URL" TEXT,
  "Total_Points" INT DEFAULT 0,
  "Password" TEXT
);

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

CREATE TABLE user_book_interactions (
  "Interaction_ID" INT PRIMARY KEY,
  "User_ID" INT REFERENCES users("User_ID") ON DELETE CASCADE,
  "Book_ID" INT REFERENCES books("Book_ID") ON DELETE CASCADE,
  "Is_Favorite" BOOLEAN DEFAULT FALSE,
  "Reading_Progress" INT DEFAULT 0,
  "Status" TEXT CHECK ("Status" IN ('Đang đọc', 'Đã hoàn thành'))
);

CREATE TABLE challenges (
  "Challenge_ID" INT PRIMARY KEY,
  "Title" TEXT NOT NULL,
  "Target" INT NOT NULL,
  "Current" INT DEFAULT 0,
  "Progress_Type" TEXT NOT NULL,
  "Completed" BOOLEAN DEFAULT FALSE,
  "Reward" TEXT
);

CREATE TABLE badges (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "desc" TEXT,
  "icon" TEXT,
  "color" TEXT,
  "owned" BOOLEAN DEFAULT FALSE
);

-- 3. DISABLE ROW LEVEL SECURITY FOR QUICK TESTING PLAYGROUND
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_themes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;

-- 4. SEED DATA
INSERT INTO users ("User_ID", "Username", "Full_Name", "Grade_Class", "Avatar_URL", "Total_Points", "Password") VALUES
(1, 'lamanh', 'Nguyễn Lâm Anh', 'Lớp 5A', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 1450, 'user123'),
(2, 'minhquan', 'Trần Minh Quân', 'Lớp 4B', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 1100, 'user456'),
(3, 'myhuyen', 'Lê Mỹ Huyền', 'Lớp 5C', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 1980, 'user789');

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
('b4', 'Chiến Thần Đọc Sách', 'Đạt mốc 1500 XP thi đua', '👑', 'bg-indigo-500/25 border-indigo-500 text-indigo-400', FALSE);`;


// Subcomponents
import AudioPlayer from './components/AudioPlayer';
import StoryVideoPlayer from './components/StoryVideoPlayer';
import CleanOceanGame from './components/CleanOceanGame';
import InteractiveQuiz from './components/InteractiveQuiz';
import { 
  AdminBooksView, AdminThemeView, AdminStudentsView, AdminGamificationView, AdminAnalyticsView 
} from './components/AdminModules';

export default function App() {
  // ==========================================
  // CORE DB STATES (SYNC TO LOCAL STORAGE)
  // ==========================================
  const [role, setRole] = useState<'student' | 'admin'>(() => {
    const saved = localStorage.getItem('db_role');
    return (saved as 'student' | 'admin') || 'student';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('db_active_tab');
    return saved || 'home';
  });
  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const saved = localStorage.getItem('db_current_user_id');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('db_is_logged_in');
    return saved === 'true'; // Default to false so they see the gorgeous login page first
  });

  const [users, setUsers] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('db_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('db_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [theme, setTheme] = useState<MonthlyTheme>(() => {
    const saved = localStorage.getItem('db_theme');
    return saved ? JSON.parse(saved) : INITIAL_THEME;
  });

  const [themes, setThemes] = useState<MonthlyTheme[]>(() => {
    const saved = localStorage.getItem('db_themes');
    return saved ? JSON.parse(saved) : INITIAL_THEMES;
  });

  const [interactions, setInteractions] = useState<UserBookInteraction[]>(() => {
    const saved = localStorage.getItem('db_interactions');
    return saved ? JSON.parse(saved) : INITIAL_INTERACTIONS;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('db_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('db_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  // Database simulator live transaction logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // ==========================================
  // SUPABASE SYNC STATES
  // ==========================================
  const [supabaseStatus, setSupabaseStatus] = useState<'connecting' | 'connected' | 'error' | 'tables_missing'>('connecting');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string>('');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);


  // ==========================================
  // VIEW & FILTER LOCAL STATES
  // ==========================================
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterFormat, setFilterFormat] = useState('');

  // Modals & overlay states
  const [modalType, setModalType] = useState<
    null | 'read_book' | 'podcast' | 'video' | 'quiz' | 'game' | 'admin_auth' | 'auth_login' | 'add_book' | 'edit_book' | 'add_student' | 'edit_student' | 'award_xp'
  >('auth_login');
  const [activeModalData, setActiveModalData] = useState<any>(null);
  
  // Custom toast messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auth fields
  const [loginModalTab, setLoginModalTab] = useState<'student' | 'admin'>('student');
  const [studentUsernameInput, setStudentUsernameInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Administrative dynamic field edits
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookCategory, setEditBookCategory] = useState('Khoa học');
  const [editBookGrade, setEditBookGrade] = useState('Lớp 4-5');
  const [editBookType, setEditBookType] = useState<'Ebook' | 'Audio'>('Ebook');
  const [editBookCover, setEditBookCover] = useState('');
  const [editBookTheme, setEditBookTheme] = useState('Đại Dương');

  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [editStudentUsername, setEditStudentUsername] = useState('');
  const [awardXpAmount, setAwardXpAmount] = useState(100);

  // ==========================================
  // SYNC TO LOCALSTORAGE EFFECTS
  // ==========================================
  useEffect(() => {
    localStorage.setItem('db_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('db_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('db_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('db_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('db_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('db_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('db_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('db_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('db_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('db_current_user_id', currentUserId.toString());
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('db_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  // ==========================================
  // SUPABASE CLOUD FUNCTIONS
  // ==========================================
  const loadDataFromSupabase = async (showModalOnError: boolean = false) => {
    setSupabaseStatus('connecting');
    try {
      // 1. Check users table
      const { data: dbUsers, error: usersErr } = await supabase.from('users').select('*');
      
      // 2. Check other tables
      const { data: dbBooks, error: booksErr } = await supabase.from('books').select('*');
      const { data: dbThemes, error: themesErr } = await supabase.from('monthly_themes').select('*');
      const { data: dbInteractions, error: intersErr } = await supabase.from('user_book_interactions').select('*');
      const { data: dbChallenges, error: challengesErr } = await supabase.from('challenges').select('*');
      const { data: dbBadges, error: badgesErr } = await supabase.from('badges').select('*');

      const anyTableError = usersErr || booksErr || themesErr || intersErr || challengesErr || badgesErr;

      if (anyTableError) {
        const isTableMissing = 
          anyTableError.code === '42P01' || 
          anyTableError.message?.toLowerCase().includes('relation') || 
          anyTableError.message?.toLowerCase().includes('does not exist') ||
          anyTableError.message?.toLowerCase().includes('not found');

        if (isTableMissing) {
          setSupabaseStatus('tables_missing');
          setSupabaseErrorMsg('Các bảng chưa được tạo hoặc bị thiếu trên Supabase. Vui lòng bấm vào nút cấu hình để xem hướng dẫn thiết lập SQL!');
          if (showModalOnError) {
            setIsSupabaseModalOpen(true);
          }
          return false;
        }
        throw anyTableError;
      }

      // If data is present in Supabase, update our React states!
      if (dbUsers && dbUsers.length > 0) setUsers(dbUsers);
      if (dbBooks && dbBooks.length > 0) setBooks(dbBooks);
      if (dbThemes && dbThemes.length > 0) {
        setTheme(dbThemes[0]);
        setThemes(dbThemes);
      }
      if (dbInteractions) setInteractions(dbInteractions);
      if (dbChallenges && dbChallenges.length > 0) setChallenges(dbChallenges);
      if (dbBadges && dbBadges.length > 0) setBadges(dbBadges);

      setSupabaseStatus('connected');
      logTransaction('SUPABASE_SYNC: Đồng bộ dữ liệu từ Supabase đám mây thành công!', 'system');
      return true;
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      const rawMsg = err.message || '';
      let isFetchError = false;
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('fetch') || !navigator.onLine) {
        isFetchError = true;
      }
      
      const errStr = rawMsg.toLowerCase();
      if (err.code === '42P01' || errStr.includes('relation') || errStr.includes('does not exist') || errStr.includes('not found')) {
        setSupabaseStatus('tables_missing');
        setSupabaseErrorMsg('Các bảng chưa được tạo hoặc bị thiếu trên Supabase. Vui lòng xem hướng dẫn SQL!');
        if (showModalOnError) {
          setIsSupabaseModalOpen(true);
        }
      } else {
        setSupabaseStatus('error');
        if (isFetchError) {
          setSupabaseErrorMsg('Không thể kết nối tới Supabase (Failed to fetch). Nguyên nhân phổ biến: Dự án Supabase của bạn đã bị TẠM NGƯNG (Paused) do lâu ngày không hoạt động, bị chặn bởi AdBlocker, hoặc sai cấu hình URL / Key.');
        } else {
          setSupabaseErrorMsg(err.message || 'Lỗi kết nối đến Supabase');
        }
        if (showModalOnError) {
          setIsSupabaseModalOpen(true);
        }
      }
      logTransaction(`SUPABASE_ERROR: Lỗi đồng bộ: ${err.message}`, 'error');
      return false;
    }
  };

  const pushDataToSupabase = async () => {
    try {
      setSupabaseStatus('connecting');
      // Delete old contents and insert current React states via upsert
      const { error: usersErr } = await supabase.from('users').upsert(users);
      const { error: booksErr } = await supabase.from('books').upsert(books);
      const { error: themeErr } = await supabase.from('monthly_themes').upsert([theme]);
      const { error: intersErr } = await supabase.from('user_book_interactions').upsert(interactions);
      const { error: challengesErr } = await supabase.from('challenges').upsert(challenges);
      const { error: badgesErr } = await supabase.from('badges').upsert(badges);

      const firstErr = usersErr || booksErr || themeErr || intersErr || challengesErr || badgesErr;
      if (firstErr) throw firstErr;

      setSupabaseStatus('connected');
      triggerToast('Đã đẩy toàn bộ dữ liệu hiện tại lên Supabase đám mây!');
      logTransaction('SUPABASE_SYNC: Đã đẩy dữ liệu local lên đám mây (Upsert thành công).', 'system');
    } catch (err: any) {
      console.error('Supabase push error:', err);
      triggerToast('Lỗi đẩy dữ liệu lên Supabase: ' + err.message, 'error');
      const errStr = (err.message || '').toLowerCase();
      if (err.code === '42P01' || errStr.includes('relation') || errStr.includes('does not exist') || errStr.includes('not found')) {
        setSupabaseStatus('tables_missing');
        setSupabaseErrorMsg('Các bảng chưa được tạo trên Supabase. Bạn hãy tạo bảng trước bằng SQL Editor.');
      } else {
        setSupabaseStatus('error');
        setSupabaseErrorMsg(err.message);
      }
    }
  };

  const dbUpsert = async (table: string, data: any) => {
    try {
      const { error } = await supabase.from(table).upsert(Array.isArray(data) ? data : [data]);
      if (error) {
        console.error(`Supabase Upsert error for table "${table}":`, error);
        logTransaction(`SUPABASE_WRITE_ERR (${table}): ${error.message}`, 'error');
      } else {
        logTransaction(`SUPABASE_WRITE_OK: Đã lưu trực tiếp dữ liệu bảng "${table}" lên đám mây thành công.`, 'system');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const dbDelete = async (table: string, matchConditions: any) => {
    try {
      const { error } = await supabase.from(table).delete().match(matchConditions);
      if (error) {
        console.error(`Supabase Delete error for table "${table}":`, error);
        logTransaction(`SUPABASE_DELETE_ERR (${table}): ${error.message}`, 'error');
      } else {
        logTransaction(`SUPABASE_DELETE_OK: Đã xóa dữ liệu bảng "${table}" trên đám mây thành công.`, 'system');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Initial DB logs and Supabase synchronization
  useEffect(() => {
    logTransaction(`SELECT * FROM Users WHERE User_ID = ${currentUserId}; -- Khởi chạy hồ sơ học sinh`, 'select');
    logTransaction(`SELECT * FROM Monthly_Themes WHERE Theme_ID = 101; -- Đồng bộ sự kiện tháng`, 'select');
    
    // Auto-sync from Supabase on start
    loadDataFromSupabase(false);
  }, []);


  // ==========================================
  // SYSTEM HELPER FUNCTIONS
  // ==========================================
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const playChimeSound = (type: 'success' | 'correct' | 'error' | 'click' | 'victory') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success' || type === 'correct') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'victory') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.08, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.4);
        });
      }
    } catch (e) {
      // Ignored if sound is blocked or not available
    }
  };

  const logTransaction = (
    query: string, 
    type: 'select' | 'insert' | 'update' | 'delete' | 'system' | 'error' = 'update'
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp,
      query,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Run virtual SQL console query
  const handleExecuteSqlConsole = (query: string) => {
    const result = executeVirtualSQL(
      query,
      { users, books, interactions, challenges, theme, badges },
      (newState) => {
        if (newState.users) setUsers(newState.users);
        if (newState.books) setBooks(newState.books);
        if (newState.interactions) setInteractions(newState.interactions);
        if (newState.challenges) setChallenges(newState.challenges);
        if (newState.theme) setTheme(newState.theme);
        if (newState.badges) setBadges(newState.badges);
      }
    );

    if (result.success) {
      playChimeSound('success');
      logTransaction(`CONSOLE_SQL: ${query} (SUCCESS)`, 'system');
      triggerToast('Thực thi lệnh SQL thành công!');
    } else {
      playChimeSound('error');
      logTransaction(`CONSOLE_SQL: ${query} (FAILED)`, 'error');
      triggerToast('Lỗi cú pháp SQL hoặc không tìm thấy bảng!', 'error');
    }

    return result;
  };

  // Switch role with validation / unified login dialog trigger
  const handleTrySwitchRole = (newRole: 'student' | 'admin') => {
    playChimeSound('click');
    setAuthError(false);
    setLoginModalTab(newRole);
    setAdminPassword('');
    setStudentPasswordInput('');
    setModalType('auth_login');
  };

  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = studentUsernameInput.trim().toLowerCase();
    const cleanPassword = studentPasswordInput.trim();
    
    // Find matching student
    const matchedUser = users.find(u => 
      u.Username && u.Username.toLowerCase() === cleanUsername && u.Password === cleanPassword
    );

    if (matchedUser) {
      setCurrentUserId(matchedUser.User_ID);
      setIsLoggedIn(true);
      setRole('student');
      setActiveTab('home');
      setModalType(null);
      setAuthError(false);
      setStudentUsernameInput('');
      setStudentPasswordInput('');
      playChimeSound('victory');
      triggerToast(`Chào mừng ${matchedUser.Full_Name} quay trở lại!`);
      logTransaction(`AUTH_SUCCESS: Student "${matchedUser.Full_Name}" (ID: ${matchedUser.User_ID}) logged in`, 'system');
    } else {
      setAuthError(true);
      playChimeSound('error');
      logTransaction(`AUTH_FAILED: Student login failed for username "${studentUsernameInput}"`, 'error');
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setRole('admin');
      setIsLoggedIn(true);
      setActiveTab('admin-books');
      setModalType(null);
      setAuthError(false);
      setAdminPassword('');
      playChimeSound('victory');
      triggerToast('Đăng nhập Quản trị thành công!');
      logTransaction(`AUTH_SUCCESS: Admin logged in successfully as "${adminUsername}"`, 'system');
    } else {
      setAuthError(true);
      playChimeSound('error');
      logTransaction(`AUTH_FAILED: Invalid admin authentication attempt`, 'error');
    }
  };

  const handleLogout = () => {
    playChimeSound('click');
    if (role === 'admin') {
      setRole('student');
      setCurrentUserId(1); // Set back to first default user
      setIsLoggedIn(true); // Since they are back to a valid student (default user 1)
      setActiveTab('home');
      setModalType('auth_login');
      triggerToast('Đã đăng xuất tài khoản quản trị!');
      logTransaction(`AUTH_LOGOUT: Admin logged out`, 'system');
    } else {
      const activeUserRec = getActiveUser();
      const name = activeUserRec ? activeUserRec.Full_Name : 'Học sinh';
      setIsLoggedIn(false);
      setCurrentUserId(-1); // No active user
      setActiveTab('home');
      setModalType('auth_login');
      triggerToast('Đăng xuất thành công!');
      logTransaction(`AUTH_LOGOUT: Student "${name}" logged out`, 'system');
    }
  };

  const handleTabSwitch = (tabId: string) => {
    playChimeSound('click');
    setActiveTab(tabId);
    logTransaction(`TAB_CHANGE: Routed workspace to "/${tabId}"`, 'select');
  };

  const getActiveUser = (): UserType | undefined => {
    return users.find(u => u.User_ID === currentUserId);
  };

  // ==========================================
  // CLIENT CORE READER INTERACTIONS
  // ==========================================
  const handleToggleFavorite = async (bookId: number) => {
    playChimeSound('click');
    const existing = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === bookId);
    
    if (existing) {
      const nextFav = !existing.Is_Favorite;
      const updated = interactions.map(i => 
        (i.User_ID === currentUserId && i.Book_ID === bookId) 
          ? { ...i, Is_Favorite: nextFav } 
          : i
      );
      setInteractions(updated);
      logTransaction(`UPDATE User_Book_Interactions SET Is_Favorite = ${nextFav} WHERE User_ID = ${currentUserId} AND Book_ID = ${bookId};`);
      triggerToast(nextFav ? "Đã lưu vào tủ sách yêu thích!" : "Đã gỡ khỏi tủ sách yêu thích!");
      
      await dbUpsert('user_book_interactions', {
        Interaction_ID: existing.Interaction_ID,
        User_ID: currentUserId,
        Book_ID: bookId,
        Is_Favorite: nextFav,
        Reading_Progress: existing.Reading_Progress,
        Status: existing.Status
      });
    } else {
      const newId = interactions.length > 0 ? Math.max(...interactions.map(i => i.Interaction_ID)) + 1 : 1;
      const newInteraction: UserBookInteraction = {
        Interaction_ID: newId,
        User_ID: currentUserId,
        Book_ID: bookId,
        Is_Favorite: true,
        Reading_Progress: 0,
        Status: 'Đang đọc'
      };
      setInteractions([...interactions, newInteraction]);
      logTransaction(`INSERT INTO User_Book_Interactions VALUES (${newId}, ${currentUserId}, ${bookId}, TRUE, 0, 'Đang đọc');`);
      triggerToast("Đã lưu vào tủ sách yêu thích!");
      
      await dbUpsert('user_book_interactions', newInteraction);
    }
  };

  const handleOpenReadBook = async (bookId: number) => {
    playChimeSound('click');
    const existing = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === bookId);
    if (!existing) {
      const newId = interactions.length > 0 ? Math.max(...interactions.map(i => i.Interaction_ID)) + 1 : 1;
      const newInteraction: UserBookInteraction = {
        Interaction_ID: newId,
        User_ID: currentUserId,
        Book_ID: bookId,
        Is_Favorite: false,
        Reading_Progress: 0,
        Status: 'Đang đọc'
      };
      setInteractions([...interactions, newInteraction]);
      logTransaction(`INSERT INTO User_Book_Interactions (Interaction_ID, User_ID, Book_ID) VALUES (${newId}, ${currentUserId}, ${bookId});`);
      
      await dbUpsert('user_book_interactions', newInteraction);
    }
    setActiveModalData(bookId);
    setModalType('read_book');
  };

  const handleUpdateReadingProgress = async (bookId: number, targetPercent: number) => {
    const existing = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === bookId);
    if (!existing) return;

    const oldPercent = existing.Reading_Progress;
    const isNowCompleted = targetPercent === 100;
    const nextStatus = isNowCompleted ? 'Đã hoàn thành' : 'Đang đọc';

    const updatedInteractions = interactions.map(i => 
      (i.User_ID === currentUserId && i.Book_ID === bookId)
        ? { ...i, Reading_Progress: targetPercent, Status: nextStatus as any }
        : i
    );
    setInteractions(updatedInteractions);

    logTransaction(`UPDATE User_Book_Interactions SET Reading_Progress = ${targetPercent}, Status = '${nextStatus}' WHERE Book_ID = ${bookId} AND User_ID = ${currentUserId};`);

    const updatedIntRec = {
      ...existing,
      Reading_Progress: targetPercent,
      Status: nextStatus as any
    };
    await dbUpsert('user_book_interactions', updatedIntRec);

    if (isNowCompleted && oldPercent < 100) {
      // Award student +50 XP
      const updatedUsers = users.map(u => 
        u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 50 } : u
      );
      setUsers(updatedUsers);
      playChimeSound('victory');
      triggerToast("Chúc mừng em đã đọc xong cuốn sách! Cộng thêm +50 XP rèn luyện!");
      logTransaction(`UPDATE Users SET Total_Points = Total_Points + 50 WHERE User_ID = ${currentUserId}; -- Đọc xong sách`, 'update');

      const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
      if (activeUserRec) {
        await dbUpsert('users', activeUserRec);
      }

      // Update student active first challenge (Kẻ hủy diệt sách cổ)
      const targetBook = books.find(b => b.Book_ID === bookId);
      if (targetBook && targetBook.Category === "Cổ tích") {
        let challengeToUpdate: any = null;
        const updatedChallenges = challenges.map(c => {
          if (c.Challenge_ID === 1 && c.Current < c.Target) {
            const nextVal = c.Current + 1;
            challengeToUpdate = { ...c, Current: nextVal, Completed: nextVal >= c.Target };
            return challengeToUpdate;
          }
          return c;
        });
        setChallenges(updatedChallenges);
        logTransaction(`UPDATE Challenges SET Current = Current + 1 WHERE Challenge_ID = 1; -- Cổ tích đọc thêm`, 'update');
        
        if (challengeToUpdate) {
          await dbUpsert('challenges', challengeToUpdate);
        }
      }
    } else {
      playChimeSound('success');
      triggerToast("Đã lưu lại tiến trình đọc sách!");
    }
    setModalType(null);
  };

  // Multimedia Completion callbacks
  const handlePodcastComplete = async () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 30 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Học tập xuất sắc! Đã nhận +30 XP nghe Podcast!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 30 WHERE User_ID = ${currentUserId}; -- Hoàn thành Podcast`, 'update');

    const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
    if (activeUserRec) {
      await dbUpsert('users', activeUserRec);
    }
  };

  const handleVideoComplete = async () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 40 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Học tập xuất sắc! Đã nhận +40 XP bài giảng Video!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 40 WHERE User_ID = ${currentUserId}; -- Hoàn thành Video bài học`, 'update');

    const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
    if (activeUserRec) {
      await dbUpsert('users', activeUserRec);
    }
  };

  const handleGameComplete = async () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 150 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Giải cứu biển cả thành công! Đã nhận +150 XP thử thách sinh thái!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 150 WHERE User_ID = ${currentUserId}; -- Hoàn thành MiniGame sinh thái`, 'update');

    const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
    if (activeUserRec) {
      await dbUpsert('users', activeUserRec);
    }

    // Update student badge list
    const updatedBadges = badges.map(b => b.id === 'b3' ? { ...b, owned: true } : b);
    setBadges(updatedBadges);
    const targetBadge = updatedBadges.find(b => b.id === 'b3');
    if (targetBadge) {
      await dbUpsert('badges', targetBadge);
    }
  };

  const handleQuizComplete = async (score: number) => {
    const totalQuestions = QUIZ_QUESTIONS.length;
    const earnedXp = score * 30 + (score === totalQuestions ? 10 : 0);

    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + earnedXp } : u
    );
    setUsers(updatedUsers);
    triggerToast(`Đã nhận +${earnedXp} XP thi đua làm câu hỏi!`);
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + ${earnedXp} WHERE User_ID = ${currentUserId}; -- Hoàn thành Quiz`, 'update');

    const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
    if (activeUserRec) {
      await dbUpsert('users', activeUserRec);
    }

    if (score === totalQuestions) {
      // Advance Challenge 2 (Trái tim xanh bảo vệ biển)
      let challengeToUpdate: any = null;
      const updatedChallenges = challenges.map(c => {
        if (c.Challenge_ID === 2 && c.Current < c.Target) {
          const nextVal = c.Current + 1;
          challengeToUpdate = { ...c, Current: nextVal, Completed: nextVal >= c.Target };
          return challengeToUpdate;
        }
        return c;
      });
      setChallenges(updatedChallenges);
      logTransaction(`UPDATE Challenges SET Current = Current + 1 WHERE Challenge_ID = 2; -- Đạt điểm Quiz tuyệt đối`, 'update');
      
      if (challengeToUpdate) {
        await dbUpsert('challenges', challengeToUpdate);
      }
    }
  };

  // ==========================================
  // ADMINISTRATIVE WORKFLOW FUNCTIONS
  // ==========================================
  const handleAddNewBook = async () => {
    if (!editBookTitle || !editBookAuthor) {
      playChimeSound('error');
      triggerToast('Vui lòng điền đủ Tựa sách và Tác giả!', 'error');
      return;
    }

    const newId = books.length > 0 ? Math.max(...books.map(b => b.Book_ID)) + 1 : 1;
    const newBook: Book = {
      Book_ID: newId,
      Title: editBookTitle,
      Author: editBookAuthor,
      Category: editBookCategory,
      Target_Grade: editBookGrade,
      Book_Type: editBookType,
      Cover_Image: editBookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      Content_URL: '#',
      Theme: editBookTheme
    };

    setBooks([...books, newBook]);
    playChimeSound('success');
    triggerToast('Thêm sách mới thành công!');
    logTransaction(`INSERT INTO Books VALUES (${newId}, '${editBookTitle}', '${editBookAuthor}', '${editBookCategory}', '${editBookType}', '${editBookTheme}');`, 'insert');
    setModalType(null);

    await dbUpsert('books', newBook);
  };

  const handleEditBookInit = (book: Book) => {
    setActiveModalData(book.Book_ID);
    setEditBookTitle(book.Title);
    setEditBookAuthor(book.Author);
    setEditBookCategory(book.Category);
    setEditBookGrade(book.Target_Grade);
    setEditBookType(book.Book_Type);
    setEditBookCover(book.Cover_Image);
    setEditBookTheme(book.Theme || 'Đại Dương Xanh Kỳ Thú');
    setModalType('edit_book');
  };

  const handleSaveBookEdits = async () => {
    let bookToUpdate: any = null;
    const updatedBooks = books.map(b => {
      if (b.Book_ID === activeModalData) {
        bookToUpdate = { 
          ...b, 
          Title: editBookTitle, 
          Author: editBookAuthor, 
          Category: editBookCategory, 
          Target_Grade: editBookGrade, 
          Book_Type: editBookType, 
          Cover_Image: editBookCover,
          Theme: editBookTheme
        };
        return bookToUpdate;
      }
      return b;
    });
    setBooks(updatedBooks);
    playChimeSound('success');
    triggerToast('Cập nhật đầu sách thành công!');
    logTransaction(`UPDATE Books SET Title = '${editBookTitle}', Author = '${editBookAuthor}', Theme = '${editBookTheme}' WHERE Book_ID = ${activeModalData};`, 'update');
    setModalType(null);

    if (bookToUpdate) {
      await dbUpsert('books', bookToUpdate);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    const updatedBooks = books.filter(b => b.Book_ID !== bookId);
    setBooks(updatedBooks);
    playChimeSound('error');
    triggerToast('Đã xóa đầu sách khỏi thư viện!');
    logTransaction(`DELETE FROM Books WHERE Book_ID = ${bookId};`, 'delete');

    await dbDelete('books', { Book_ID: bookId });
  };

  const handleAddNewStudent = async () => {
    if (!editStudentName || !editStudentClass) {
      playChimeSound('error');
      triggerToast('Vui lòng điền Họ tên và Lớp học!', 'error');
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.User_ID)) + 1 : 1;
    const generatedUsername = editStudentUsername || editStudentName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/\s+/g, "");
    const newStudent: UserType = {
      User_ID: newId,
      Username: generatedUsername,
      Full_Name: editStudentName,
      Grade_Class: editStudentClass,
      Avatar_URL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${editStudentName}`,
      Total_Points: 0,
      Password: editStudentPassword || 'user123'
    };

    setUsers([...users, newStudent]);
    playChimeSound('success');
    triggerToast('Tạo tài khoản học sinh thành công!');
    logTransaction(`INSERT INTO Users ("User_ID", "Username", "Full_Name", "Grade_Class", "Total_Points", "Password") VALUES (${newId}, '${generatedUsername}', '${editStudentName}', '${editStudentClass}', 0, '${editStudentPassword || 'user123'}');`, 'insert');
    setModalType(null);

    await dbUpsert('users', newStudent);
  };

  const handleEditStudentInit = (student: UserType) => {
    setActiveModalData(student.User_ID);
    setEditStudentName(student.Full_Name);
    setEditStudentClass(student.Grade_Class);
    setEditStudentPassword(student.Password || 'user123');
    setEditStudentUsername(student.Username || '');
    setModalType('edit_student');
  };

  const handleSaveStudentEdits = async () => {
    let studentToUpdate: any = null;
    const updatedUsers = users.map(u => {
      if (u.User_ID === activeModalData) {
        studentToUpdate = { ...u, Username: editStudentUsername, Full_Name: editStudentName, Grade_Class: editStudentClass, Password: editStudentPassword };
        return studentToUpdate;
      }
      return u;
    });
    setUsers(updatedUsers);
    playChimeSound('success');
    triggerToast('Cập nhật tài khoản thành công!');
    logTransaction(`UPDATE Users SET Username = '${editStudentUsername}', Full_Name = '${editStudentName}', Grade_Class = '${editStudentClass}', Password = '${editStudentPassword}' WHERE User_ID = ${activeModalData};`, 'update');
    setModalType(null);

    if (studentToUpdate) {
      await dbUpsert('users', studentToUpdate);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    const updatedUsers = users.filter(u => u.User_ID !== studentId);
    setUsers(updatedUsers);
    playChimeSound('error');
    triggerToast('Đã xóa tài khoản học sinh!');
    logTransaction(`DELETE FROM Users WHERE User_ID = ${studentId};`, 'delete');

    await dbDelete('users', { User_ID: studentId });
  };

  const handleSaveAwardXP = async () => {
    let studentToUpdate: any = null;
    const updatedUsers = users.map(u => {
      if (u.User_ID === activeModalData) {
        studentToUpdate = { ...u, Total_Points: u.Total_Points + awardXpAmount };
        return studentToUpdate;
      }
      return u;
    });
    setUsers(updatedUsers);
    playChimeSound('victory');
    triggerToast(`Đã cộng thêm +${awardXpAmount} XP cho học sinh!`);
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + ${awardXpAmount} WHERE User_ID = ${activeModalData}; -- Ban quản trị cộng tay`, 'update');
    setModalType(null);

    if (studentToUpdate) {
      await dbUpsert('users', studentToUpdate);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 3MB)
    if (file.size > 3 * 1024 * 1024) {
      triggerToast("Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 3MB.", "error");
      playChimeSound('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      if (!base64String) return;

      const updatedUsers = users.map(u => 
        u.User_ID === currentUserId ? { ...u, Avatar_URL: base64String } : u
      );
      setUsers(updatedUsers);
      triggerToast("Tải ảnh đại diện mới thành công!");
      playChimeSound('success');
      
      const activeUserRec = updatedUsers.find(u => u.User_ID === currentUserId);
      if (activeUserRec) {
        await dbUpsert('users', activeUserRec);
      }
      logTransaction(`UPDATE Users SET Avatar_URL = '[Base64 Image]' WHERE User_ID = ${currentUserId}; -- Học sinh đổi ảnh đại diện`, 'update');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveThemeSettings = async (updatedTheme: MonthlyTheme) => {
    setTheme(updatedTheme);
    setThemes(prev => prev.map(t => t.Theme_ID === updatedTheme.Theme_ID ? updatedTheme : t));
    playChimeSound('success');
    triggerToast('Đã cập nhật cấu hình chủ điểm!');
    logTransaction(`UPDATE Monthly_Themes SET Title = '${updatedTheme.Title}', Month_Year = '${updatedTheme.Month_Year}' WHERE Theme_ID = ${updatedTheme.Theme_ID};`, 'update');

    await dbUpsert('monthly_themes', updatedTheme);
  };

  const handleSetActiveTheme = async (activeTheme: MonthlyTheme) => {
    setTheme(activeTheme);
    playChimeSound('success');
    triggerToast(`Đã đổi chủ điểm hoạt động tháng sang: ${activeTheme.Title}`);
    logTransaction(`-- Thiết lập chủ điểm hoạt động hiện tại: ${activeTheme.Title} (ID: ${activeTheme.Theme_ID})`, 'update');
  };

  const handleAddNewTheme = async (newTheme: MonthlyTheme) => {
    setThemes(prev => [...prev, newTheme]);
    playChimeSound('success');
    triggerToast(`Đã thêm thành công chủ điểm mới: ${newTheme.Title}`);
    logTransaction(`INSERT INTO Monthly_Themes ("Theme_ID", "Month_Year", "Title", "Banner_Image", "Description") VALUES (${newTheme.Theme_ID}, '${newTheme.Month_Year}', '${newTheme.Title}', '${newTheme.Banner_Image}', '${newTheme.Description}');`, 'insert');

    await dbUpsert('monthly_themes', newTheme);
  };

  const handleIncrementChallenge = async (challengeId: number) => {
    let challengeToUpdate: any = null;
    const updatedChallenges = challenges.map(c => {
      if (c.Challenge_ID === challengeId && c.Current < c.Target) {
        const nextVal = c.Current + 1;
        challengeToUpdate = { ...c, Current: nextVal, Completed: nextVal >= c.Target };
        return challengeToUpdate;
      }
      return c;
    });
    setChallenges(updatedChallenges);
    if (challengeToUpdate) {
      playChimeSound('correct');
      triggerToast('Tăng tiến độ thử thách thành công!');
      logTransaction(`UPDATE Challenges SET Current = ${challengeToUpdate.Current} WHERE Challenge_ID = ${challengeId}; -- Admin cộng tiến trình`, 'update');
      await dbUpsert('challenges', challengeToUpdate);
    }
  };

  // ==========================================
  // CLIENT RENDER HELPERS
  // ==========================================
  const activeUser = getActiveUser();

  // Search filter core calculation
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.Title.toLowerCase().includes(searchKeyword.toLowerCase()) || book.Author.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = filterCategory === '' || book.Category === filterCategory;
    const matchesGrade = filterGrade === '' || book.Target_Grade.includes(filterGrade);
    const matchesFormat = filterFormat === '' || book.Book_Type === filterFormat;
    return matchesSearch && matchesCategory && matchesGrade && matchesFormat;
  });

  const categories = Array.from(new Set(books.map(b => b.Category)));
  const sortedLeaderboardUsers = [...users].sort((a, b) => b.Total_Points - a.Total_Points);

  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col justify-between relative bg-cover bg-center select-none overflow-y-auto"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&auto=format&fit=crop')`,
        }}
      >
        {/* Dark tinted cozy glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-[6px] z-0" />

        {/* Header decoration */}
        <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500 rounded-2xl text-slate-950 font-black text-2xl tracking-wider shadow-lg shadow-sky-500/25">
              📚
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                BIBLIO-HUB 
                <span className="text-[10px] font-extrabold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-lg border border-sky-500/30">v1.5</span>
              </h1>
              <p className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest">Hệ Thống Thư Viện Chuyên Nghiệp</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tự động lưu tiến trình</span>
            <span className="text-slate-700">•</span>
            <span>Niên khóa 2026-2027</span>
          </div>
        </header>

        {/* Main login portal container */}
        <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-slate-950/85 hover:bg-slate-950/90 border border-slate-800/80 text-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative transition duration-300 shadow-sky-500/5 backdrop-blur-xl">
            
            {/* Top design crown decorative */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-sky-500/10 border border-sky-500/20 text-sky-400 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-3xl shadow-inner animate-pulse">
                📖
              </div>
            </div>

            {/* Header info */}
            <div className="text-center space-y-2 pt-8">
              <h2 className="font-extrabold text-2xl text-white tracking-tight uppercase flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                <span>Cổng đăng nhập Biblio-Hub</span>
              </h2>
              <p className="text-xs text-slate-400">Hãy đăng nhập để bước vào thế giới sách tri thức và tích lũy điểm thi đua!</p>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playChimeSound('click');
                  setLoginModalTab('student');
                  setAuthError(false);
                }}
                className={`py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  loginModalTab === 'student'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                HỌC SINH
              </button>
              <button
                type="button"
                onClick={() => {
                  playChimeSound('click');
                  setLoginModalTab('admin');
                  setAuthError(false);
                }}
                className={`py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  loginModalTab === 'admin'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                BAN GIÁM HIỆU
              </button>
            </div>

            {/* Login Forms */}
            {loginModalTab === 'student' ? (
              <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
                <div className="space-y-4 text-xs text-left">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      Tên đăng nhập học sinh
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nhập tên đăng nhập (VD: lamanh, minhquan...)"
                      value={studentUsernameInput}
                      onChange={(e) => setStudentUsernameInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      Mật khẩu học sinh
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="Nhập mật khẩu của em (VD: user123...)"
                      value={studentPasswordInput}
                      onChange={(e) => setStudentPasswordInput(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all text-sm"
                    />
                  </div>

                  {authError && (
                    <p className="text-rose-400 font-extrabold text-[11px] text-center bg-rose-500/10 py-2 rounded-xl border border-rose-500/20 shadow-sm animate-pulse">
                      ❌ Sai tên đăng nhập hoặc mật khẩu! Hãy kiểm tra lại em nhé.
                    </p>
                  )}

                  {/* Quick select credential shelf */}
                  <div className="bg-slate-900/95 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Danh sách Học sinh (Chọn nhanh):</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                      {users.map((usr) => (
                        <button
                          key={usr.User_ID}
                          type="button"
                          onClick={() => {
                            setStudentUsernameInput(usr.Username || '');
                            setStudentPasswordInput(usr.Password || 'user123');
                            setAuthError(false);
                            playChimeSound('click');
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-500/40 text-left transition duration-250 group cursor-pointer"
                        >
                          <img
                            src={usr.Avatar_URL}
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.Full_Name}`; }}
                            className="w-8 h-8 rounded-full border border-slate-700 bg-slate-950 shrink-0 group-hover:scale-105 transition"
                            alt="avatar"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10.5px] font-extrabold text-white truncate group-hover:text-sky-300 transition">{usr.Full_Name}</p>
                            <p className="text-[8px] text-slate-400 font-bold font-mono tracking-tight uppercase">{usr.Grade_Class} ({usr.Username})</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition duration-300 shadow-lg shadow-sky-500/15 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-slate-950" />
                  ĐĂNG NHẬP VÀO THƯ VIỆN
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
                <div className="space-y-4 text-xs text-left">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      Tài khoản ban giám hiệu
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="VD: admin..."
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5 text-[11px] tracking-wide uppercase">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      Mật khẩu bảo mật
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="Nhập mật khẩu quản trị..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all text-sm"
                    />
                  </div>

                  {authError && (
                    <p className="text-rose-400 font-extrabold text-[11px] text-center bg-rose-500/10 py-2 rounded-xl border border-rose-500/20 shadow-sm animate-pulse">
                      ❌ Sai tài khoản hoặc mật khẩu Quản trị viên!
                    </p>
                  )}

                  <div className="bg-slate-900/95 p-3.5 rounded-xl border border-slate-800 text-[10px] text-sky-400 space-y-1.5 font-mono">
                    <span className="font-bold text-slate-300 text-[11px]">💡 Tài khoản trải nghiệm:</span>
                    <div className="flex gap-4">
                      <div>Tài khoản: <span className="text-white font-bold">admin</span></div>
                      <div>Mật khẩu: <span className="text-white font-bold">admin123</span></div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition duration-300 shadow-lg shadow-sky-500/15 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  ĐĂNG NHẬP BAN GIÁM HIỆU
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Footer decoration */}
        <footer className="relative z-10 w-full text-center py-6 text-[10.5px] text-slate-400 font-bold tracking-wider uppercase border-t border-slate-800/30 bg-slate-950/30 backdrop-blur-[2px]">
          <span>© 2026 Biblio-Hub - Thư viện số thông minh phát triển bền vững</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden text-slate-800 bg-sky-50/40 min-h-screen flex flex-col justify-between">
      
      {/* 1. MAIN GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 rounded-2xl text-slate-950 font-black text-xl tracking-wider shadow-inner">
              📚
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                BIBLIO-HUB 
                <span className="text-[10px] font-extrabold bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded-lg border border-sky-500/30">v1.5</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hệ Thống Thư Viện Chuyên Nghiệp</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Supabase Status Badge */}
            <button
              onClick={() => {
                playChimeSound('click');
                setIsSupabaseModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-dashed ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : supabaseStatus === 'connecting'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
                  : supabaseStatus === 'tables_missing'
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/25'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
              }`}
            >
              <span className="text-sm">☁️</span>
              <span>
                {supabaseStatus === 'connected' ? 'Supabase Connected' :
                 supabaseStatus === 'connecting' ? 'Connecting...' :
                 supabaseStatus === 'tables_missing' ? 'Supabase SQL Setup' : 'Supabase Error'}
              </span>
            </button>

            {/* Quick Student Badge */}
            {role === 'student' && activeUser && (
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => {
                    playChimeSound('click');
                    setActiveTab('profile');
                  }}
                  title="Xem hồ sơ cá nhân"
                  className="flex items-center gap-3 bg-slate-950/50 hover:bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all duration-300 text-left cursor-pointer group shadow-inner"
                >
                  <div className="relative">
                    <img 
                      className="w-8.5 h-8.5 rounded-full border border-sky-400 object-cover bg-slate-950 group-hover:scale-105 transition duration-300" 
                      src={activeUser.Avatar_URL} 
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUser.Full_Name}`; }}
                      alt="Avatar" 
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-[8px] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-slate-900 font-bold shadow-sm pointer-events-none">👑</span>
                  </div>
                  <div className="hidden sm:block text-left text-xs space-y-0.5">
                    <div className="font-extrabold text-sky-400 flex items-center gap-1.5 group-hover:text-sky-300 transition duration-300">
                      <span>{activeUser.Full_Name}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-1 font-bold">
                      <span className="bg-sky-500/10 text-sky-300 px-1 py-0.5 rounded text-[8px] tracking-wide font-extrabold uppercase">{activeUser.Grade_Class}</span>
                      <span className="text-amber-400 font-extrabold">{activeUser.Total_Points.toLocaleString()} XP</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3.5 py-2.5 rounded-2xl border border-rose-500/20 hover:border-rose-600 transition duration-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/5 hover:scale-[1.02] cursor-pointer"
                  title="Đăng xuất khỏi tài khoản học sinh"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            )}

            {role === 'admin' && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-2xl border border-rose-500/20 text-xs text-rose-400 font-extrabold">
                  <span>🛡️ Ban Giám Hiệu</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3.5 py-2.5 rounded-2xl border border-rose-500/20 hover:border-rose-600 transition duration-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/5 hover:scale-[1.02] cursor-pointer"
                  title="Đăng xuất quyền quản trị"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC WORKSPACE BODY CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
        
        {/* Dynamic Navigation Tabs */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-thin">
          {role === 'student' ? (
            <>
              {[
                { id: 'home', title: '🏠 Trang chủ' },
                { id: 'theme', title: '🌊 Sự kiện tháng' },
                { id: 'catalog', title: '📖 Danh mục thư viện' },
                { id: 'gamification', title: '🏆 Góc thi đua' },
                { id: 'profile', title: '👤 Hồ sơ cá nhân' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 font-extrabold text-xs transition duration-200 rounded-xl border ${
                    activeTab === tab.id 
                      ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-100 hover:text-slate-950'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'admin-books', title: '📚 Quản lý sách' },
                { id: 'admin-theme', title: '🎨 Quản lý chủ điểm' },
                { id: 'admin-students', title: '🎓 Quản lý học sinh' },
                { id: 'admin-gamification', title: '🏅 Quản lý thi đua' },
                { id: 'admin-analytics', title: '📈 Dashboard thống kê' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 font-extrabold text-xs transition duration-200 rounded-xl border ${
                    activeTab === tab.id 
                      ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-sm' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Supabase Notice Banner */}
        {(supabaseStatus === 'tables_missing' || supabaseStatus === 'error') && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">☁️</span>
              <div>
                <h5 className="font-extrabold text-sm text-orange-600 uppercase">
                  {supabaseStatus === 'tables_missing' ? 'Yêu cầu khởi tạo SQL trên Supabase' : 'Lỗi kết nối đến Supabase'}
                </h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {supabaseStatus === 'tables_missing' 
                    ? 'Bạn cần sao chép và thực thi câu lệnh SQL khởi tạo trên Supabase Dashboard để kích hoạt đồng bộ dữ liệu.'
                    : `Hệ thống gặp sự cố khi đồng bộ: ${supabaseErrorMsg}. Vui lòng kiểm tra lại cấu hình.`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playChimeSound('click');
                setIsSupabaseModalOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-sm w-full sm:w-auto shrink-0"
            >
              📋 Lấy mã SQL &amp; Hướng dẫn setup
            </button>
          </div>
        )}

        {/* Dynamic View Component */}
        <div className="min-h-[50vh] transition-all duration-300">
          {role === 'student' ? (
            <>
              {/* STUDENT VIEWS */}
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* High Fidelity Theme Banner */}
                  <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-sky-800 to-indigo-900 border border-sky-700/30">
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 bg-cover bg-center transition-all duration-500" 
                      style={{ backgroundImage: `url(${theme.Banner_Image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600'})` }}
                    ></div>
                    <div className="relative z-10 max-w-xl space-y-3">
                      <span className="bg-sky-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Sự Kiện Chủ Điểm Tháng</span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{theme.Title}</h2>
                      <p className="text-sky-100 text-xs leading-relaxed line-clamp-2">{theme.Description}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => handleTabSwitch('theme')} className="bg-white hover:bg-slate-100 text-sky-950 font-extrabold px-4.5 py-2 rounded-xl text-xs shadow-md transition-all">
                          🐳 Khám phá hoạt động
                        </button>
                        <button onClick={() => handleTabSwitch('catalog')} className="bg-sky-500/30 text-white hover:bg-sky-500/50 border border-sky-400/30 font-bold px-4.5 py-2 rounded-xl text-xs transition">
                          Thư viện sách
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Currently Reading Books */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="text-sky-500 text-base">📖</span> Sách bạn đang đọc
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {interactions.filter(i => i.User_ID === currentUserId && i.Status === 'Đang đọc').length === 0 ? (
                          <div className="col-span-full bg-white rounded-2xl p-6 text-center border border-slate-100 shadow-sm space-y-2">
                            <span className="text-3xl block">📖</span>
                            <p className="font-bold text-slate-700 text-sm">Chưa có cuốn sách nào đang đọc dở.</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">Em hãy vào tab "Danh mục thư viện" để chọn cho mình những tác phẩm bổ ích nhé!</p>
                          </div>
                        ) : (
                          interactions.filter(i => i.User_ID === currentUserId && i.Status === 'Đang đọc').map(item => {
                            const b = books.find(book => book.Book_ID === item.Book_ID);
                            if (!b) return null;
                            return (
                              <div key={item.Interaction_ID} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 border border-slate-100 flex gap-4">
                                <img src={b.Cover_Image} className="w-16 h-24 object-cover rounded-xl shadow border border-slate-100" alt="cover" />
                                <div className="flex-grow flex flex-col justify-between">
                                  <div>
                                    <span className="text-[9px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">{b.Book_Type}</span>
                                    <h4 className="font-extrabold text-xs text-slate-800 mt-1.5 line-clamp-1">{b.Title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{b.Author}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold text-slate-600">
                                      <span>Tiến độ</span>
                                      <span>{item.Reading_Progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${item.Reading_Progress}%` }}></div>
                                    </div>
                                    <button 
                                      onClick={() => handleOpenReadBook(b.Book_ID)}
                                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-1.5 rounded-lg text-[10px] transition"
                                    >
                                      Đọc tiếp
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Quick Recommendations */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="text-amber-500 text-base">⭐</span> Gợi ý dành cho em
                      </h3>
                      <div className="grid grid-cols-3 gap-2.5">
                        {books.slice(0, 3).map(book => (
                          <div key={book.Book_ID} className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm text-center flex flex-col justify-between hover:scale-102 transition duration-300">
                            <img src={book.Cover_Image} className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-100" alt="book" />
                            <div className="mt-2 space-y-1">
                              <h4 className="font-extrabold text-[10px] text-slate-800 line-clamp-1" title={book.Title}>{book.Title}</h4>
                              <button 
                                onClick={() => handleOpenReadBook(book.Book_ID)}
                                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1 rounded-lg text-[10px] transition"
                              >
                                Đọc sách
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-6">
                  {/* Monthly banner */}
                  <div className="relative h-60 rounded-3xl overflow-hidden shadow-lg flex items-center justify-center text-center p-4">
                    <img className="absolute inset-0 w-full h-full object-cover brightness-40" src={theme.Banner_Image} alt="Theme Banner" />
                    <div className="relative z-10 max-w-xl text-white space-y-2">
                      <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Chiến dịch tương tác rèn luyện</span>
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tight">{theme.Title}</h2>
                      <p className="text-xs text-slate-200 leading-relaxed">{theme.Description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Books match current theme (Khoa học) */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-2">
                        📖 Tủ Sách Chủ Điểm
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {books.filter(b => {
                          if (!b.Theme) {
                            return theme.Title === 'Đại Dương Xanh Kỳ Thú' && b.Category === 'Khoa học';
                          }
                          const tTitle = (theme.Title || '').toLowerCase();
                          const bTheme = b.Theme.toLowerCase();
                          return tTitle.includes(bTheme) || bTheme.includes(tTitle);
                        }).map(book => (
                          <div key={book.Book_ID} className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60 text-center flex flex-col justify-between">
                            <img src={book.Cover_Image} className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-200" alt="book" />
                            <div className="mt-3 space-y-1.5">
                              <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{book.Title}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{book.Author}</p>
                              {book.Theme && (
                                <div className="text-[9px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                                  🌊 {book.Theme}
                                </div>
                              )}
                              <button 
                                onClick={() => handleOpenReadBook(book.Book_ID)}
                                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1.5 rounded-xl text-xs transition"
                              >
                                Đọc ngay
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive tasks panel */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-2">
                        ⚡️ Hoạt Động Tương Tác
                      </h3>

                      {/* Interactive audio player card trigger */}
                      <div className="bg-sky-50/70 border border-sky-100/80 p-3.5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 text-xl font-bold flex items-center justify-center shadow-sm shrink-0">
                          🎙️
                        </div>
                        <div className="flex-grow text-xs min-w-0">
                          <h4 className="font-extrabold text-slate-950">Podcast Khoa Học</h4>
                          <p className="text-[10px] text-sky-800 truncate mt-0.5">{theme.Media_Podcast}</p>
                          <button 
                            onClick={() => { playChimeSound('click'); setModalType('podcast'); }}
                            className="text-[10px] text-sky-600 font-extrabold mt-1 hover:underline"
                          >
                            Phát âm thanh (+30 XP)
                          </button>
                        </div>
                      </div>

                      {/* Interactive storyteller video lecture */}
                      <div className="bg-amber-50/70 border border-amber-100/85 p-3.5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 text-xl font-bold flex items-center justify-center shadow-sm shrink-0">
                          🎥
                        </div>
                        <div className="flex-grow text-xs min-w-0">
                          <h4 className="font-extrabold text-slate-950">Bài Giảng Tương Tác</h4>
                          <p className="text-[10px] text-amber-800 truncate mt-0.5">{theme.Media_Video}</p>
                          <button 
                            onClick={() => { playChimeSound('click'); setModalType('video'); }}
                            className="text-[10px] text-amber-600 font-extrabold mt-1 hover:underline"
                          >
                            Tham gia xem học bài (+40 XP)
                          </button>
                        </div>
                      </div>

                      {/* Playable Grid game trigger */}
                      <div className="bg-rose-50/70 border border-rose-100/80 p-3.5 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 text-white text-xl font-bold flex items-center justify-center shadow-sm shrink-0">
                          🎮
                        </div>
                        <div className="flex-grow text-xs min-w-0">
                          <h4 className="font-extrabold text-slate-950">Giải Cứu Đại Dương</h4>
                          <p className="text-[10px] text-rose-800 truncate mt-0.5">{theme.Media_MiniGame}</p>
                          <button 
                            onClick={() => { playChimeSound('click'); setModalType('game'); }}
                            className="text-[10px] text-rose-600 font-extrabold mt-1 hover:underline animate-pulse"
                          >
                            Dọn rác nhựa (+150 XP)
                          </button>
                        </div>
                      </div>

                      {/* Playable Quiz trigger */}
                      <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0">
                            🧩
                          </div>
                          <div className="text-xs">
                            <h4 className="font-extrabold text-emerald-950">Thử Thách Giải Đố</h4>
                            <p className="text-[10px] text-emerald-800">Trả lời 3 câu hỏi trắc nghiệm</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { playChimeSound('click'); setModalType('quiz'); }}
                          className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-xs transition duration-200"
                        >
                          Làm Quiz Nhận (+90 XP)
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left filter widget column */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-sky-500" />
                      Bộ Lọc Thư Viện
                    </h3>
                    
                    {/* Search string */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Tìm kiếm</label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={searchKeyword} 
                          onChange={(e) => {
                            setSearchKeyword(e.target.value);
                            logTransaction(`SELECT * FROM Books WHERE Title LIKE '%${e.target.value}%'; -- Tìm sách`, 'select');
                          }}
                          placeholder="Tên tác phẩm, tác giả..." 
                          className="w-full p-2.5 pl-9 rounded-xl border border-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none bg-slate-50 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Thể loại</label>
                      <select 
                        value={filterCategory} 
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          logTransaction(`SELECT * FROM Books WHERE Category = '${e.target.value}';`, 'select');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none bg-slate-50 text-slate-800 font-semibold"
                      >
                        <option value="">Tất cả thể loại</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Grade Class filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Khối lớp học</label>
                      <select 
                        value={filterGrade} 
                        onChange={(e) => {
                          setFilterGrade(e.target.value);
                          logTransaction(`SELECT * FROM Books WHERE Target_Grade IN ('${e.target.value}');`, 'select');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none bg-slate-50 text-slate-800 font-semibold"
                      >
                        <option value="">Mọi khối lớp</option>
                        <option value="Lớp 1-3">Lớp 1, 2, 3</option>
                        <option value="Lớp 4-5">Lớp 4, 5</option>
                      </select>
                    </div>

                    {/* Format filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Định dạng đọc</label>
                      <select 
                        value={filterFormat} 
                        onChange={(e) => {
                          setFilterFormat(e.target.value);
                          logTransaction(`SELECT * FROM Books WHERE Book_Type = '${e.target.value}';`, 'select');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-100 text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none bg-slate-50 text-slate-800 font-semibold"
                      >
                        <option value="">Tất cả định dạng</option>
                        <option value="Ebook">Sách điện tử (Ebook)</option>
                        <option value="Audio">Sách nói (Audio Book)</option>
                      </select>
                    </div>
                  </div>

                  {/* Books grid column */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center justify-between uppercase tracking-wide">
                      <span>DANH MỤC SÁCH THƯ VIỆN ({filteredBooks.length})</span>
                    </h3>

                    {filteredBooks.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm space-y-2">
                        <span className="text-4xl block">🔍</span>
                        <p className="font-bold text-slate-700">Không tìm thấy sách phù hợp.</p>
                        <p className="text-xs text-slate-400">Em hãy thay đổi từ khóa hoặc bộ lọc để hiển thị sách khác nhé.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredBooks.map(book => {
                          const userInt = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === book.Book_ID);
                          const isFav = userInt ? userInt.Is_Favorite : false;

                          return (
                            <div key={book.Book_ID} className="bg-white rounded-3xl shadow-sm hover:shadow-md border border-slate-100/60 p-4 transition duration-300 flex flex-col justify-between">
                              <div className="relative overflow-hidden rounded-2xl bg-slate-100 mb-3 group">
                                <img src={book.Cover_Image} className="w-full h-44 object-cover transform group-hover:scale-105 duration-300" alt={book.Title} />
                                <button 
                                  onClick={() => handleToggleFavorite(book.Book_ID)}
                                  className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition text-xs flex items-center justify-center border border-slate-100"
                                >
                                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[8px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">{book.Book_Type}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">{book.Target_Grade}</span>
                                </div>
                                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1" title={book.Title}>{book.Title}</h4>
                                <p className="text-[10px] text-slate-400 font-medium mb-1">{book.Author}</p>
                                
                                {book.Theme && (
                                  <div className="text-[9px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md inline-block max-w-full truncate mb-2">
                                    🌊 {book.Theme}
                                  </div>
                                )}
                                
                                <button 
                                  onClick={() => handleOpenReadBook(book.Book_ID)}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 rounded-xl text-xs transition"
                                >
                                  Bắt đầu đọc
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Live ranking leaderboard sidebar */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        BẢNG THI ĐUA
                      </h3>
                      <span className="text-[8px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full">LIVE</span>
                    </div>

                    <div className="space-y-2.5">
                      {sortedLeaderboardUsers.map((usr, idx) => {
                        let trophyEmoji = '🏅';
                        if (idx === 0) trophyEmoji = '🥇';
                        if (idx === 1) trophyEmoji = '🥈';
                        if (idx === 2) trophyEmoji = '🥉';

                        return (
                          <div key={usr.User_ID} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-sky-50/20 transition">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-slate-500 w-5 text-center">{trophyEmoji}</span>
                              <img 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                                src={usr.Avatar_URL} 
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.Full_Name}`; }}
                                alt="avatar" 
                              />
                              <div className="text-left text-xs">
                                <h5 className="font-extrabold text-slate-800 line-clamp-1">{usr.Full_Name}</h5>
                                <p className="text-[9px] text-slate-400 font-bold">{usr.Grade_Class}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-sky-600">{usr.Total_Points.toLocaleString()} XP</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gamification' && (
                <div className="space-y-6">
                  {/* Live active challenges */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 pb-2">
                      <Trophy className="w-5 h-5 text-sky-500 animate-bounce" />
                      THỬ THÁCH ĐỌC THI ĐUA TUẦN NÀY
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {challenges.map(ch => {
                        const isComplete = ch.Current >= ch.Target;
                        const pct = Math.round((ch.Current / ch.Target) * 100);

                        return (
                          <div key={ch.Challenge_ID} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{ch.Title}</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ch.Progress_Type}</span>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-lg font-extrabold ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                                {isComplete ? 'XONG' : 'TIẾP TỤC'}
                              </span>
                            </div>

                            <div className="mt-4 space-y-1.5">
                              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                <span>Tiến độ ({ch.Current}/{ch.Target})</span>
                                <span>{Math.min(100, pct)}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }}></div>
                              </div>
                              <p className="text-[9.5px] text-amber-600 font-bold mt-2">🎁 Phần thưởng: {ch.Reward}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badge Catalog Collection */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                        <Award className="w-5 h-5 text-amber-500" />
                        BỘ SƯU TẬP HUY HIỆU DANH GIÁ
                      </h3>
                      <span className="text-xs font-bold text-slate-400">Đã mở khóa: {badges.filter(b=>b.owned).length} / {badges.length}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {badges.map(bg => (
                        <div key={bg.id} className={`p-4 rounded-2xl border flex items-center gap-3 transition duration-300 relative overflow-hidden ${
                          bg.owned ? 'opacity-100 bg-white border-slate-200/80 shadow-sm' : 'opacity-35 bg-slate-50 border-dashed border-slate-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${bg.color}`}>
                            {bg.icon}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800">{bg.title}</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{bg.desc}</p>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full mt-1.5 inline-block ${
                              bg.owned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {bg.owned ? 'ĐÃ SỞ HỮU' : 'CHƯA MỞ'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && activeUser && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left profile info stats */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 h-fit">
                    <div className="space-y-4">
                      <div className="relative w-24 h-24 mx-auto group">
                        <img 
                          className="w-full h-full rounded-full border-4 border-sky-400 object-cover shadow-md bg-slate-950 transition duration-300 group-hover:brightness-75" 
                          src={activeUser.Avatar_URL} 
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUser.Full_Name}`; }}
                          alt="User" 
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition duration-300">
                          <Camera className="w-6 h-6 text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarUpload}
                          />
                        </label>
                        <span className="absolute bottom-0 right-0 bg-amber-500 text-white border-2 border-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow pointer-events-none">👑</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1.5">
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-sky-600 hover:text-sky-700 cursor-pointer bg-sky-50 hover:bg-sky-100/80 px-3 py-1.5 rounded-xl border border-sky-100 shadow-sm transition duration-200">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Đổi ảnh từ máy tính</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarUpload}
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 font-medium italic">Hỗ trợ JPG, PNG dưới 3MB</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{activeUser.Full_Name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{activeUser.Grade_Class} • Niên khóa 2026-2027</p>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>Cấp độ Độc Giả (Cấp 4)</span>
                        <span>{activeUser.Total_Points} / 2,000 XP</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${(activeUser.Total_Points / 2000) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Mini Aggregators */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/60">
                      <div>
                        <span className="font-black text-base text-sky-600 block">{interactions.filter(i=>i.User_ID === currentUserId).length}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Đã Xem</span>
                      </div>
                      <div>
                        <span className="font-black text-base text-emerald-600 block">{interactions.filter(i=>i.User_ID === currentUserId && i.Status === 'Đã hoàn thành').length}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Đọc Xong</span>
                      </div>
                      <div>
                        <span className="font-black text-base text-rose-600 block">{interactions.filter(i=>i.User_ID === currentUserId && i.Is_Favorite).length}</span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Yêu Thích</span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition duration-200 shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>

                  {/* Middle personal favorites list and logs */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Favorites Shelf */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                        ❤️ TỦ SÁCH CÁ NHÂN (SÁCH YÊU THÍCH THƯỜNG ĐỌC)
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {interactions.filter(i => i.User_ID === currentUserId && i.Is_Favorite).length === 0 ? (
                          <p className="text-xs text-slate-400 col-span-full py-4 text-center">Em chưa lưu sách yêu thích nào cả.</p>
                        ) : (
                          interactions.filter(i => i.User_ID === currentUserId && i.Is_Favorite).map(item => {
                            const b = books.find(book => book.Book_ID === item.Book_ID);
                            if (!b) return null;
                            return (
                              <div key={item.Interaction_ID} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center flex flex-col justify-between">
                                <img src={b.Cover_Image} className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200" alt="cover" />
                                <h4 className="font-extrabold text-[10px] text-slate-800 line-clamp-1 mt-2">{b.Title}</h4>
                                <button 
                                  onClick={() => handleOpenReadBook(b.Book_ID)}
                                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1 rounded-lg text-[9px] mt-2 transition"
                                >
                                  Đọc tiếp
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Reading Log History */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                        📜 LỊCH SỬ HOẠT ĐỘNG ĐỌC SÁCH
                      </h3>
                      <div className="space-y-3">
                        {interactions.filter(i => i.User_ID === currentUserId).map(item => {
                          const b = books.find(book => book.Book_ID === item.Book_ID);
                          if (!b) return null;
                          return (
                            <div key={item.Interaction_ID} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <span className="text-xl shrink-0">{b.Book_Type === 'Audio' ? '🔊' : '📖'}</span>
                                <div className="text-left">
                                  <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{b.Title}</h4>
                                  <p className="text-[10px] text-slate-400 font-medium">Tác giả: {b.Author}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  item.Status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                                }`}>
                                  {item.Status}
                                </span>
                                <p className="text-[10px] font-extrabold text-slate-500 mt-1 font-mono">Tiến độ: {item.Reading_Progress}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ADMIN VIEW MODULES INTERFACES */}
              {activeTab === 'admin-books' && (
                <AdminBooksView 
                  books={books} 
                  onAddBook={() => {
                    setEditBookTitle('');
                    setEditBookAuthor('');
                    setEditBookCategory('Khoa học');
                    setEditBookGrade('Lớp 4-5');
                    setEditBookType('Ebook');
                    setEditBookCover('');
                    setEditBookTheme('Đại Dương');
                    setModalType('add_book');
                  }}
                  onEditBook={handleEditBookInit}
                  onDeleteBook={handleDeleteBook}
                />
              )}

              {activeTab === 'admin-theme' && (
                <AdminThemeView 
                  theme={theme}
                  themes={themes}
                  onSaveTheme={handleSaveThemeSettings}
                  onSetActiveTheme={handleSetActiveTheme}
                  onAddTheme={handleAddNewTheme}
                />
              )}

              {activeTab === 'admin-students' && (
                <AdminStudentsView 
                  students={users}
                  onAddStudent={() => {
                    setEditStudentName('');
                    setEditStudentClass('');
                    setEditStudentPassword('user123');
                    setEditStudentUsername('');
                    setModalType('add_student');
                  }}
                  onEditStudent={handleEditStudentInit}
                  onDeleteStudent={handleDeleteStudent}
                  onAwardXp={(id) => {
                    setActiveModalData(id);
                    setAwardXpAmount(100);
                    setModalType('award_xp');
                  }}
                />
              )}

              {activeTab === 'admin-gamification' && (
                <AdminGamificationView 
                  challenges={challenges}
                  onIncrementChallenge={handleIncrementChallenge}
                />
              )}

              {activeTab === 'admin-analytics' && (
                <AdminAnalyticsView 
                  books={books}
                  students={users}
                  interactions={interactions}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* 4. FOOTER CREDITS INFO */}
      <footer className="bg-slate-950 text-slate-400 py-6 text-center border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold">
            <span className="font-extrabold text-sky-400">BIBLIO-HUB</span> © 2026. Phát triển ứng dụng Thư viện tương tác.
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <a href="#" className="hover:text-white transition">SƠ ĐỒ HỆ THỐNG</a>
            <span>•</span>
            <span className="text-emerald-500 flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              TRẠNG THÁI DB: ONLINE (LOCALSTORAGE)
            </span>
          </div>
        </div>
      </footer>

      {/* ==========================================
          5. DYNAMIC DIALOG & MODAL INJECTORS
          ========================================== */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          
          {/* Unified beautiful Student & Admin login modal */}
          {modalType === 'auth_login' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative animate-fadeIn space-y-5">
              
              {/* Top Close Button */}
              {isLoggedIn && (
                <button 
                  onClick={() => setModalType(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Header Info */}
              <div className="text-center space-y-1 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-2 text-sky-400 shadow-lg shadow-sky-500/5">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-base text-white tracking-tight uppercase">Cổng đăng nhập Biblio-Hub</h4>
                <p className="text-xs text-slate-400">Vui lòng đăng nhập để tiếp tục học tập và quản lý</p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    playChimeSound('click');
                    setLoginModalTab('student');
                    setAuthError(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    loginModalTab === 'student'
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Học Sinh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChimeSound('click');
                    setLoginModalTab('admin');
                    setAuthError(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    loginModalTab === 'admin'
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Quản Trị Viên
                </button>
              </div>

              {/* Login forms */}
              {loginModalTab === 'student' ? (
                <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
                  <div className="space-y-3 text-xs text-left">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        Tên đăng nhập (Username)
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="VD: lamanh, minhquan..."
                        value={studentUsernameInput}
                        onChange={(e) => setStudentUsernameInput(e.target.value)}
                        className="w-full p-2.5 pl-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-sky-400" />
                        Mật khẩu cá nhân
                      </label>
                      <input 
                        type="password" 
                        required
                        placeholder="Nhập mật khẩu của em..."
                        value={studentPasswordInput}
                        onChange={(e) => setStudentPasswordInput(e.target.value)}
                        className="w-full p-2.5 pl-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                      />
                    </div>

                    {authError && (
                      <p className="text-rose-500 font-extrabold text-[11px] text-center bg-rose-500/10 py-1.5 rounded-xl border border-rose-500/20">
                        ❌ Sai tên đăng nhập hoặc mật khẩu học sinh!
                      </p>
                    )}

                    {/* Quick select credential shelf */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-sky-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Danh sách Học sinh (Chọn nhanh để tự điền):</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        {users.map((usr) => (
                          <button
                            key={usr.User_ID}
                            type="button"
                            onClick={() => {
                              setStudentUsernameInput(usr.Username || '');
                              setStudentPasswordInput(usr.Password || 'user123');
                              setAuthError(false);
                              playChimeSound('click');
                            }}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-left transition duration-200 group"
                          >
                            <img
                              src={usr.Avatar_URL}
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.Full_Name}`; }}
                              className="w-7 h-7 rounded-full border border-slate-700 bg-slate-950 shrink-0"
                              alt="avatar"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[9.5px] font-extrabold text-white truncate group-hover:text-sky-400 transition">{usr.Full_Name}</p>
                              <p className="text-[8px] text-slate-400 font-medium font-mono">{usr.Username} ({usr.Password || 'user123'})</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2 text-xs pt-1">
                    {isLoggedIn && (
                      <button 
                        type="button" 
                        onClick={() => setModalType(null)}
                        className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition"
                      >
                        Hủy bỏ
                      </button>
                    )}
                    <button 
                      type="submit"
                      className={`${isLoggedIn ? 'w-2/3' : 'w-full'} bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-sky-500/15 flex items-center justify-center gap-1.5 hover:scale-[1.02] duration-200`}
                    >
                      <GraduationCap className="w-4 h-4 text-slate-950" />
                      Đăng Nhập Học Sinh
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
                  <div className="space-y-3 text-xs text-left">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        Tài khoản Quản trị
                      </label>
                      <input 
                        type="text" 
                        required
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full p-2.5 pl-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-sky-400" />
                        Mật khẩu bảo mật
                      </label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full p-2.5 pl-3 rounded-xl border border-slate-700 bg-slate-950 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                      />
                    </div>

                    {authError && (
                      <p className="text-rose-500 font-extrabold text-[11px] text-center bg-rose-500/10 py-1.5 rounded-xl border border-rose-500/20">
                        ❌ Sai tài khoản hoặc mật khẩu Quản trị!
                      </p>
                    )}

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-sky-400 space-y-1 font-mono">
                      <span className="font-bold text-slate-300">💡 Thông tin mẫu để trải nghiệm:</span>
                      <div>• Tài khoản: <span className="text-white font-bold">admin</span></div>
                      <div>• Mật khẩu: <span className="text-white font-bold">admin123</span></div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2 text-xs pt-2">
                    {isLoggedIn && (
                      <button 
                        type="button" 
                        onClick={() => setModalType(null)}
                        className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition"
                      >
                        Hủy bỏ
                      </button>
                    )}
                    <button 
                      type="submit"
                      className={`${isLoggedIn ? 'w-2/3' : 'w-full'} bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-sky-500/15 flex items-center justify-center gap-1.5 hover:scale-[1.02] duration-200`}
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-950" />
                      Đăng Nhập Quản Trị
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Ebook Reader Simulator panel */}
          {modalType === 'read_book' && activeModalData && (
            (() => {
              const book = books.find(b => b.Book_ID === activeModalData);
              const interaction = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === activeModalData);
              if (!book || !interaction) return null;

              return (
                <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col justify-between h-[80vh] text-slate-800">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <div className="text-left">
                      <h4 className="font-extrabold text-sm line-clamp-1">{book.Title}</h4>
                      <p className="text-[10px] text-sky-400 font-medium">Tác giả: {book.Author} • Độc giả: Nguyễn Lâm Anh</p>
                    </div>
                    <button 
                      onClick={() => setModalType(null)}
                      className="text-white hover:text-rose-500 font-black text-base"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Simulated story pages */}
                  <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div className="max-w-md mx-auto text-center py-4">
                      <img src={book.Cover_Image} className="w-28 h-40 mx-auto rounded-xl shadow-lg object-cover mb-3" alt="cover" />
                      <span className="text-[9px] font-extrabold bg-sky-100 text-sky-800 px-3 py-1 rounded-full uppercase">{book.Book_Type}</span>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm space-y-3">
                      <h3 className="font-bold text-center text-slate-950 text-base">Chương 1: Những Chân Trời Mới</h3>
                      <p>Ánh ban mai xuyên qua tàn lá sồi cổ thụ đỏ lựng, thả từng đốm vàng lấp lánh xuống nền cỏ sương ẩm ướt. Cuộc phiêu lưu bất ngờ cuốn chú vật nhỏ của chúng ta vào sâu thẳm trong vùng đất của những bí mật lớn chưa từng được lý giải.</p>
                      <p>Từng trang sách mở ra trước mắt em cả một không gian rực rỡ sắc màu, dạy em cách yêu thương thế giới xung quanh, và rèn cho em một trái tim quả cảm, sẵn sàng đối đầu với những chặng đường thử thách phía trước...</p>
                    </div>
                  </div>

                  {/* Read actions and progress bar */}
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                    <div className="w-full sm:w-1/2 flex flex-col items-start">
                      <div className="flex justify-between w-full text-[10px] font-bold mb-1 text-slate-600">
                        <span>Tiến độ đọc:</span>
                        <span>{interaction.Reading_Progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${interaction.Reading_Progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto text-xs font-bold">
                      <button 
                        onClick={() => handleUpdateReadingProgress(book.Book_ID, 100)}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition"
                      >
                        Đọc xong (+50 XP)
                      </button>
                      <button 
                        onClick={() => handleUpdateReadingProgress(book.Book_ID, Math.min(95, interaction.Reading_Progress + 25))}
                        className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl transition"
                      >
                        Đọc thêm ít nữa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Interactive active Quiz Modal */}
          {modalType === 'quiz' && (
            <div className="relative animate-fadeIn">
              <InteractiveQuiz 
                onComplete={handleQuizComplete}
                playChime={playChimeSound}
              />
              <button 
                onClick={() => setModalType(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow hover:scale-110 transition z-10"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Custom audio player modal */}
          {modalType === 'podcast' && (
            <div className="relative animate-fadeIn">
              <AudioPlayer 
                title={theme.Media_Podcast}
                onComplete={handlePodcastComplete}
                playChime={playChimeSound}
              />
              <button 
                onClick={() => setModalType(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow hover:scale-110 transition z-10"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Interactive custom Story video lecture */}
          {modalType === 'video' && (
            <div className="relative animate-fadeIn">
              <StoryVideoPlayer 
                title={theme.Media_Video}
                onComplete={handleVideoComplete}
                playChime={playChimeSound}
              />
              <button 
                onClick={() => setModalType(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow hover:scale-110 transition z-10"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Fully Playable Cleanup Ocean Game */}
          {modalType === 'game' && (
            <div className="relative animate-fadeIn">
              <CleanOceanGame 
                onComplete={handleGameComplete}
                playChime={playChimeSound}
              />
              <button 
                onClick={() => setModalType(null)}
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow hover:scale-110 transition z-10"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Admin Add book Modal */}
          {modalType === 'add_book' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-extrabold text-sm">➕ THÊM ĐẦU SÁCH MỚI</h4>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tựa đề sách</label>
                    <input 
                      type="text" 
                      value={editBookTitle}
                      onChange={(e) => setEditBookTitle(e.target.value)}
                      placeholder="VD: Dế mèn..."
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tác giả</label>
                    <input 
                      type="text" 
                      value={editBookAuthor}
                      onChange={(e) => setEditBookAuthor(e.target.value)}
                      placeholder="VD: Tô Hoài"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Thể loại</label>
                    <select 
                      value={editBookCategory}
                      onChange={(e) => setEditBookCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Khoa học">Khoa học</option>
                      <option value="Cổ tích">Cổ tích</option>
                      <option value="Văn học Việt Nam">Văn học Việt Nam</option>
                      <option value="Lịch sử">Lịch sử</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Định dạng đọc</label>
                    <select 
                      value={editBookType}
                      onChange={(e) => setEditBookType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Ebook">Sách điện tử (Ebook)</option>
                      <option value="Audio">Sách nói (Audio)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Khối lớp nhắm tới</label>
                    <select 
                      value={editBookGrade}
                      onChange={(e) => setEditBookGrade(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Lớp 1-3">Lớp 1-3</option>
                      <option value="Lớp 4-5">Lớp 4-5</option>
                      <option value="Lớp 5">Lớp 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Ảnh bìa URL</label>
                    <input 
                      type="text" 
                      value={editBookCover}
                      onChange={(e) => setEditBookCover(e.target.value)}
                      placeholder="Địa chỉ liên kết ảnh..."
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chủ điểm sự kiện / chủ đề sách</label>
                  <select 
                    value={editBookTheme}
                    onChange={(e) => setEditBookTheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                  >
                    {theme?.Title && (
                      <option value={theme.Title}>🌊 Sự kiện tháng: {theme.Title}</option>
                    )}
                    {themes.map(t => (
                      <option key={t.Theme_ID} value={t.Title}>📌 {t.Title}</option>
                    ))}
                    <option value="Đại Dương">🌊 Đại Dương</option>
                    <option value="Vũ Trụ">🚀 Vũ Trụ</option>
                    <option value="Môi Trường">🌱 Môi Trường</option>
                    <option value="Kính Trọng Thầy Cô">👩‍🏫 Kính Trọng Thầy Cô</option>
                    <option value="Biển Đảo Quê Hương">🇻🇳 Biển Đảo Quê Hương</option>
                    <option value="Tình Bạn Tuổi Học Trò">🤝 Tình Bạn Tuổi Học Trò</option>
                    <option value="Sách thường">Sách thường (Không thuộc chủ điểm đặc biệt)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button onClick={() => setModalType(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl">Hủy</button>
                <button onClick={handleAddNewBook} className="w-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-2.5 rounded-xl">Thêm Mới</button>
              </div>
            </div>
          )}

          {/* Admin Edit book Modal */}
          {modalType === 'edit_book' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-extrabold text-sm">✏️ SỬA ĐẦU SÁCH</h4>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tựa đề sách</label>
                    <input 
                      type="text" 
                      value={editBookTitle}
                      onChange={(e) => setEditBookTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Tác giả</label>
                    <input 
                      type="text" 
                      value={editBookAuthor}
                      onChange={(e) => setEditBookAuthor(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Thể loại</label>
                    <select 
                      value={editBookCategory}
                      onChange={(e) => setEditBookCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Khoa học">Khoa học</option>
                      <option value="Cổ tích">Cổ tích</option>
                      <option value="Văn học Việt Nam">Văn học Việt Nam</option>
                      <option value="Lịch sử">Lịch sử</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Định dạng đọc</label>
                    <select 
                      value={editBookType}
                      onChange={(e) => setEditBookType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Ebook">Sách điện tử (Ebook)</option>
                      <option value="Audio">Sách nói (Audio)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Khối lớp nhắm tới</label>
                    <select 
                      value={editBookGrade}
                      onChange={(e) => setEditBookGrade(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                    >
                      <option value="Lớp 1-3">Lớp 1-3</option>
                      <option value="Lớp 4-5">Lớp 4-5</option>
                      <option value="Lớp 5">Lớp 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Ảnh bìa URL</label>
                    <input 
                      type="text" 
                      value={editBookCover}
                      onChange={(e) => setEditBookCover(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chủ điểm sự kiện / chủ đề sách</label>
                  <select 
                    value={editBookTheme}
                    onChange={(e) => setEditBookTheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none"
                  >
                    {theme?.Title && (
                      <option value={theme.Title}>🌊 Sự kiện tháng: {theme.Title}</option>
                    )}
                    {themes.map(t => (
                      <option key={t.Theme_ID} value={t.Title}>📌 {t.Title}</option>
                    ))}
                    <option value="Đại Dương">🌊 Đại Dương</option>
                    <option value="Vũ Trụ">🚀 Vũ Trụ</option>
                    <option value="Môi Trường">🌱 Môi Trường</option>
                    <option value="Kính Trọng Thầy Cô">👩‍🏫 Kính Trọng Thầy Cô</option>
                    <option value="Biển Đảo Quê Hương">🇻🇳 Biển Đảo Quê Hương</option>
                    <option value="Tình Bạn Tuổi Học Trò">🤝 Tình Bạn Tuổi Học Trò</option>
                    <option value="Sách thường">Sách thường (Không thuộc chủ điểm đặc biệt)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button onClick={() => setModalType(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl">Hủy</button>
                <button onClick={handleSaveBookEdits} className="w-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-2.5 rounded-xl">Lưu Thay Đổi</button>
              </div>
            </div>
          )}

          {/* Admin Add student Modal */}
          {modalType === 'add_student' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm">➕ THÊM HỌC SINH MỚI</h4>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tên đăng nhập (Username)</label>
                  <input 
                    type="text" 
                    value={editStudentUsername}
                    onChange={(e) => setEditStudentUsername(e.target.value)}
                    placeholder="Để trống tự sinh (VD: nguyenb)"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lớp học</label>
                  <input 
                    type="text" 
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    placeholder="VD: Lớp 5D"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Mật khẩu cấp mới</label>
                  <input 
                    type="text" 
                    value={editStudentPassword}
                    onChange={(e) => setEditStudentPassword(e.target.value)}
                    placeholder="VD: user123"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button onClick={() => setModalType(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl">Hủy</button>
                <button onClick={handleAddNewStudent} className="w-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-2.5 rounded-xl">Tạo Tài Khoản</button>
              </div>
            </div>
          )}

          {/* Admin Edit student Modal */}
          {modalType === 'edit_student' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-bold text-sm">✏️ SỬA TÀI KHOẢN HỌC SINH</h4>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tên đăng nhập (Username)</label>
                  <input 
                    type="text" 
                    value={editStudentUsername}
                    onChange={(e) => setEditStudentUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Lớp học</label>
                  <input 
                    type="text" 
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Mật khẩu</label>
                  <input 
                    type="text" 
                    value={editStudentPassword}
                    onChange={(e) => setEditStudentPassword(e.target.value)}
                    placeholder="Mật khẩu học sinh..."
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button onClick={() => setModalType(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl">Hủy</button>
                <button onClick={handleSaveStudentEdits} className="w-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-2.5 rounded-xl">Lưu Lại</button>
              </div>
            </div>
          )}

          {/* Admin Gift manual XP Modal */}
          {modalType === 'award_xp' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4 text-center">
              <span className="text-4xl block">🎁</span>
              <h4 className="font-bold text-sm text-white">TẶNG ĐIỂM THI ĐUA HỌC SINH</h4>
              <p className="text-xs text-slate-400">Em hãy nhập số điểm XP rèn luyện muốn tặng cho học sinh.</p>

              <div>
                <input 
                  type="number" 
                  value={awardXpAmount}
                  onChange={(e) => setAwardXpAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-center p-3.5 rounded-2xl border border-slate-700 bg-slate-950 text-white text-xl font-black focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono" 
                />
              </div>

              <div className="flex gap-2 text-xs font-bold pt-2">
                <button onClick={() => setModalType(null)} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl">Hủy</button>
                <button onClick={handleSaveAwardXP} className="w-1/2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 rounded-xl">Cộng XP Thưởng</button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Supabase Connection Setup & Synchronization Center Modal */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-2xl p-6 overflow-hidden shadow-2xl space-y-4 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">☁️</span>
                <div>
                  <h4 className="font-extrabold text-sm text-white">SUPABASE CLOUD SYNC CENTER</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đồng bộ hóa dữ liệu đám mây thời gian thực</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSupabaseModalOpen(false)} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full p-1.5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-left overflow-y-auto pr-1 scrollbar-thin">
              {/* Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-slate-400 font-bold mb-1">Trạng thái kết nối Supabase:</div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      supabaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                      supabaseStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                      supabaseStatus === 'tables_missing' ? 'bg-orange-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {supabaseStatus === 'connected' && 'ĐÃ ĐỒNG BỘ ĐÁM MÂY (CONNECTED)'}
                      {supabaseStatus === 'connecting' && 'ĐANG THỰC HIỆN ĐỒNG BỘ...'}
                      {supabaseStatus === 'tables_missing' && 'CHƯA KHỞI TẠO BẢNG (TABLES MISSING)'}
                      {supabaseStatus === 'error' && 'LỖI KẾT NỐI (CONNECTION ERROR)'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1 font-mono break-all max-w-sm sm:max-w-md">
                    Project URL: {supabaseUrl}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => loadDataFromSupabase(true)}
                    disabled={supabaseStatus === 'connecting'}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-[10px] transition"
                  >
                    🔄 Tải từ Cloud
                  </button>
                  <button
                    onClick={pushDataToSupabase}
                    disabled={supabaseStatus === 'connecting'}
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-[10px] transition"
                    title="Ghi đè/Đẩy dữ liệu hiện tại lên Supabase"
                  >
                    ☁️ Đẩy lên Cloud
                  </button>
                </div>
              </div>

              {supabaseStatus === 'tables_missing' && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl text-[11px] leading-relaxed">
                  ⚠️ <strong>Chú ý:</strong> Kết nối đến dự án Supabase thành công, nhưng hệ thống không tìm thấy bảng <code>users</code>. Bạn hãy làm theo các bước bên dưới để tạo cấu trúc dữ liệu!
                </div>
              )}

              {supabaseStatus === 'error' && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-[11px] font-mono whitespace-pre-wrap">
                  ❌ Lỗi: {supabaseErrorMsg}
                </div>
              )}

              {/* Instruction Steps */}
              <div className="space-y-2">
                <h5 className="font-black text-[11px] text-sky-400 flex items-center gap-1.5 uppercase">
                  <span>🛠️</span> Các bước thiết lập Supabase SQL
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60 leading-relaxed text-[11px]">
                  <li>Truy cập vào <strong>Supabase Dashboard</strong> của bạn.</li>
                  <li>Chọn menu <strong>SQL Editor</strong> ở thanh công cụ bên trái.</li>
                  <li>Bấm <strong>New Query</strong> để tạo một trang soạn thảo mới.</li>
                  <li>Copy toàn bộ mã lệnh SQL bên dưới, dán vào khung soạn thảo và bấm <strong>Run</strong>.</li>
                  <li>Quay lại đây bấm nút <strong>☁️ Đẩy lên Cloud</strong> hoặc <strong>🔄 Tải từ Cloud</strong> để bắt đầu sử dụng!</li>
                </ol>
              </div>

              {/* SQL Code Box */}
              <div className="space-y-2 flex-grow flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest">📄 MÃ LỆNH KHỞI TẠO BẢNG &amp; SEED DATA</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      triggerToast('Đã sao chép mã lệnh SQL!');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[10px] transition"
                  >
                    📋 Copy Mã SQL
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-y-auto max-h-[180px] whitespace-pre select-all scrollbar-thin">
                  {SUPABASE_SQL_SCHEMA}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition shadow-md"
              >
                Đóng Bảng Điều Khiển
              </button>
            </div>

          </div>
        </div>
      )}


      {/* 6. TOAST MESSAGE FEEDBACK */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none transition-all duration-300">
          <div className={`p-3 rounded-xl shadow-xl border flex items-center gap-2 text-xs font-bold transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
          }`}>
            <span>{toast.type === 'success' ? '🔔' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
