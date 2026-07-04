import React, { useState, useEffect } from 'react';
import { 
  BookOpen, User, Award, ShieldAlert, Sparkles, Trophy, Heart, Search, Filter, 
  Menu, X, Calendar, Activity, CheckCircle, BarChart2, Radio, Play, ChevronRight, Eye, Star,
  TrendingUp, HelpCircle
} from 'lucide-react';

import { 
  INITIAL_USERS, INITIAL_BOOKS, INITIAL_THEME, INITIAL_INTERACTIONS, INITIAL_CHALLENGES, INITIAL_BADGES, QUIZ_QUESTIONS 
} from './data';
import { User as UserType, Book, MonthlyTheme, UserBookInteraction, Challenge, Badge, LogEntry } from './types';
import { executeVirtualSQL } from './sqlEngine';

// Subcomponents
import AudioPlayer from './components/AudioPlayer';
import StoryVideoPlayer from './components/StoryVideoPlayer';
import CleanOceanGame from './components/CleanOceanGame';
import InteractiveQuiz from './components/InteractiveQuiz';
import SqlMonitor from './components/SqlMonitor';
import { 
  AdminBooksView, AdminThemeView, AdminStudentsView, AdminGamificationView, AdminAnalyticsView 
} from './components/AdminModules';

export default function App() {
  // ==========================================
  // CORE DB STATES (SYNC TO LOCAL STORAGE)
  // ==========================================
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUserId] = useState<number>(1); // Active simulated student: Nguyễn Lâm Anh

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
  // VIEW & FILTER LOCAL STATES
  // ==========================================
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterFormat, setFilterFormat] = useState('');

  // Modals & overlay states
  const [modalType, setModalType] = useState<
    null | 'read_book' | 'podcast' | 'video' | 'quiz' | 'game' | 'admin_auth' | 'add_book' | 'edit_book' | 'add_student' | 'edit_student' | 'award_xp'
  >(null);
  const [activeModalData, setActiveModalData] = useState<any>(null);
  
  // Custom toast messages
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Administrative login fields
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

  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
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
    localStorage.setItem('db_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('db_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem('db_badges', JSON.stringify(badges));
  }, [badges]);

  // Initial DB logs
  useEffect(() => {
    logTransaction(`SELECT * FROM Users WHERE User_ID = ${currentUserId}; -- Khởi chạy hồ sơ học sinh`, 'select');
    logTransaction(`SELECT * FROM Monthly_Themes WHERE Theme_ID = 101; -- Đồng bộ sự kiện tháng`, 'select');
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

  // Switch role with validation
  const handleTrySwitchRole = (newRole: 'student' | 'admin') => {
    playChimeSound('click');
    if (newRole === 'admin' && role !== 'admin') {
      setAuthError(false);
      setAdminPassword('');
      setModalType('admin_auth');
    } else {
      setRole('student');
      setActiveTab('home');
      logTransaction(`ROLE_CHANGE: Switched view session to STUDENT`, 'system');
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      setRole('admin');
      setActiveTab('admin-books');
      setModalType(null);
      playChimeSound('victory');
      triggerToast('Đăng nhập Quản trị thành công!');
      logTransaction(`AUTH_SUCCESS: Admin logged in successfully as "${adminUsername}"`, 'system');
    } else {
      setAuthError(true);
      playChimeSound('error');
      logTransaction(`AUTH_FAILED: Invalid admin authentication attempt`, 'error');
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
  const handleToggleFavorite = (bookId: number) => {
    playChimeSound('click');
    const existing = interactions.find(i => i.User_ID === currentUserId && i.Book_ID === bookId);
    
    if (existing) {
      const updated = interactions.map(i => 
        (i.User_ID === currentUserId && i.Book_ID === bookId) 
          ? { ...i, Is_Favorite: !i.Is_Favorite } 
          : i
      );
      setInteractions(updated);
      logTransaction(`UPDATE User_Book_Interactions SET Is_Favorite = ${!existing.Is_Favorite} WHERE User_ID = ${currentUserId} AND Book_ID = ${bookId};`);
      triggerToast(!existing.Is_Favorite ? "Đã lưu vào tủ sách yêu thích!" : "Đã gỡ khỏi tủ sách yêu thích!");
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
    }
  };

  const handleOpenReadBook = (bookId: number) => {
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
    }
    setActiveModalData(bookId);
    setModalType('read_book');
  };

  const handleUpdateReadingProgress = (bookId: number, targetPercent: number) => {
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

    if (isNowCompleted && oldPercent < 100) {
      // Award student +50 XP
      const updatedUsers = users.map(u => 
        u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 50 } : u
      );
      setUsers(updatedUsers);
      playChimeSound('victory');
      triggerToast("Chúc mừng em đã đọc xong cuốn sách! Cộng thêm +50 XP rèn luyện!");
      logTransaction(`UPDATE Users SET Total_Points = Total_Points + 50 WHERE User_ID = ${currentUserId}; -- Đọc xong sách`, 'update');

      // Update student active first challenge (Kẻ hủy diệt sách cổ)
      const targetBook = books.find(b => b.Book_ID === bookId);
      if (targetBook && targetBook.Category === "Cổ tích") {
        setChallenges(prev => prev.map(c => {
          if (c.Challenge_ID === 1 && c.Current < c.Target) {
            const nextVal = c.Current + 1;
            return { ...c, Current: nextVal, Completed: nextVal >= c.Target };
          }
          return c;
        }));
        logTransaction(`UPDATE Challenges SET Current = Current + 1 WHERE Challenge_ID = 1; -- Cổ tích đọc thêm`, 'update');
      }
    } else {
      playChimeSound('success');
      triggerToast("Đã lưu lại tiến trình đọc sách!");
    }
    setModalType(null);
  };

  // Multimedia Completion callbacks
  const handlePodcastComplete = () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 30 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Học tập xuất sắc! Đã nhận +30 XP nghe Podcast!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 30 WHERE User_ID = ${currentUserId}; -- Hoàn thành Podcast`, 'update');
  };

  const handleVideoComplete = () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 40 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Học tập xuất sắc! Đã nhận +40 XP bài giảng Video!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 40 WHERE User_ID = ${currentUserId}; -- Hoàn thành Video bài học`, 'update');
  };

  const handleGameComplete = () => {
    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + 150 } : u
    );
    setUsers(updatedUsers);
    triggerToast("Giải cứu biển cả thành công! Đã nhận +150 XP thử thách sinh thái!");
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + 150 WHERE User_ID = ${currentUserId}; -- Hoàn thành MiniGame sinh thái`, 'update');

    // Update student badge list
    setBadges(prev => prev.map(b => b.id === 'b3' ? { ...b, owned: true } : b));
  };

  const handleQuizComplete = (score: number) => {
    const totalQuestions = QUIZ_QUESTIONS.length;
    const earnedXp = score * 30 + (score === totalQuestions ? 10 : 0);

    const updatedUsers = users.map(u => 
      u.User_ID === currentUserId ? { ...u, Total_Points: u.Total_Points + earnedXp } : u
    );
    setUsers(updatedUsers);
    triggerToast(`Đã nhận +${earnedXp} XP thi đua làm câu hỏi!`);
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + ${earnedXp} WHERE User_ID = ${currentUserId}; -- Hoàn thành Quiz`, 'update');

    if (score === totalQuestions) {
      // Advance Challenge 2 (Trái tim xanh bảo vệ biển)
      setChallenges(prev => prev.map(c => {
        if (c.Challenge_ID === 2 && c.Current < c.Target) {
          const nextVal = c.Current + 1;
          return { ...c, Current: nextVal, Completed: nextVal >= c.Target };
        }
        return c;
      }));
      logTransaction(`UPDATE Challenges SET Current = Current + 1 WHERE Challenge_ID = 2; -- Đạt điểm Quiz tuyệt đối`, 'update');
    }
  };

  // ==========================================
  // ADMINISTRATIVE WORKFLOW FUNCTIONS
  // ==========================================
  const handleAddNewBook = () => {
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
      Content_URL: '#'
    };

    setBooks([...books, newBook]);
    playChimeSound('success');
    triggerToast('Thêm sách mới thành công!');
    logTransaction(`INSERT INTO Books VALUES (${newId}, '${editBookTitle}', '${editBookAuthor}', '${editBookCategory}', '${editBookType}');`, 'insert');
    setModalType(null);
  };

  const handleEditBookInit = (book: Book) => {
    setActiveModalData(book.Book_ID);
    setEditBookTitle(book.Title);
    setEditBookAuthor(book.Author);
    setEditBookCategory(book.Category);
    setEditBookGrade(book.Target_Grade);
    setEditBookType(book.Book_Type);
    setEditBookCover(book.Cover_Image);
    setModalType('edit_book');
  };

  const handleSaveBookEdits = () => {
    const updatedBooks = books.map(b => 
      b.Book_ID === activeModalData 
        ? { 
            ...b, 
            Title: editBookTitle, 
            Author: editBookAuthor, 
            Category: editBookCategory, 
            Target_Grade: editBookGrade, 
            Book_Type: editBookType, 
            Cover_Image: editBookCover 
          }
        : b
    );
    setBooks(updatedBooks);
    playChimeSound('success');
    triggerToast('Cập nhật đầu sách thành công!');
    logTransaction(`UPDATE Books SET Title = '${editBookTitle}', Author = '${editBookAuthor}' WHERE Book_ID = ${activeModalData};`, 'update');
    setModalType(null);
  };

  const handleDeleteBook = (bookId: number) => {
    const updatedBooks = books.filter(b => b.Book_ID !== bookId);
    setBooks(updatedBooks);
    playChimeSound('error');
    triggerToast('Đã xóa đầu sách khỏi thư viện!');
    logTransaction(`DELETE FROM Books WHERE Book_ID = ${bookId};`, 'delete');
  };

  const handleAddNewStudent = () => {
    if (!editStudentName || !editStudentClass) {
      playChimeSound('error');
      triggerToast('Vui lòng điền Họ tên và Lớp học!', 'error');
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.User_ID)) + 1 : 1;
    const newStudent: UserType = {
      User_ID: newId,
      Full_Name: editStudentName,
      Grade_Class: editStudentClass,
      Avatar_URL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${editStudentName}`,
      Total_Points: 0,
      Password: 'user123'
    };

    setUsers([...users, newStudent]);
    playChimeSound('success');
    triggerToast('Tạo tài khoản học sinh thành công!');
    logTransaction(`INSERT INTO Users VALUES (${newId}, '${editStudentName}', '${editStudentClass}', 0);`, 'insert');
    setModalType(null);
  };

  const handleEditStudentInit = (student: UserType) => {
    setActiveModalData(student.User_ID);
    setEditStudentName(student.Full_Name);
    setEditStudentClass(student.Grade_Class);
    setModalType('edit_student');
  };

  const handleSaveStudentEdits = () => {
    const updatedUsers = users.map(u => 
      u.User_ID === activeModalData 
        ? { ...u, Full_Name: editStudentName, Grade_Class: editStudentClass } 
        : u
    );
    setUsers(updatedUsers);
    playChimeSound('success');
    triggerToast('Cập nhật tài khoản thành công!');
    logTransaction(`UPDATE Users SET Full_Name = '${editStudentName}', Grade_Class = '${editStudentClass}' WHERE User_ID = ${activeModalData};`, 'update');
    setModalType(null);
  };

  const handleDeleteStudent = (studentId: number) => {
    const updatedUsers = users.filter(u => u.User_ID !== studentId);
    setUsers(updatedUsers);
    playChimeSound('error');
    triggerToast('Đã xóa tài khoản học sinh!');
    logTransaction(`DELETE FROM Users WHERE User_ID = ${studentId};`, 'delete');
  };

  const handleSaveAwardXP = () => {
    const updatedUsers = users.map(u => 
      u.User_ID === activeModalData 
        ? { ...u, Total_Points: u.Total_Points + awardXpAmount } 
        : u
    );
    setUsers(updatedUsers);
    playChimeSound('victory');
    triggerToast(`Đã cộng thêm +${awardXpAmount} XP cho học sinh!`);
    logTransaction(`UPDATE Users SET Total_Points = Total_Points + ${awardXpAmount} WHERE User_ID = ${activeModalData}; -- Ban quản trị cộng tay`, 'update');
    setModalType(null);
  };

  const handleSaveThemeSettings = (updatedTheme: MonthlyTheme) => {
    setTheme(updatedTheme);
    playChimeSound('success');
    triggerToast('Đã cập nhật cấu hình chủ điểm sự kiện tháng!');
    logTransaction(`UPDATE Monthly_Themes SET Title = '${updatedTheme.Title}', Month_Year = '${updatedTheme.Month_Year}' WHERE Theme_ID = ${updatedTheme.Theme_ID};`, 'update');
  };

  const handleIncrementChallenge = (challengeId: number) => {
    setChallenges(prev => prev.map(c => {
      if (c.Challenge_ID === challengeId && c.Current < c.Target) {
        const nextVal = c.Current + 1;
        playChimeSound('correct');
        triggerToast('Tăng tiến độ thử thách thành công!');
        logTransaction(`UPDATE Challenges SET Current = ${nextVal} WHERE Challenge_ID = ${challengeId}; -- Admin cộng tiến trình`, 'update');
        return { ...c, Current: nextVal, Completed: nextVal >= c.Target };
      }
      return c;
    }));
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
            {/* Live Role Selector Switch */}
            <div className="bg-slate-950 p-1 rounded-2xl flex border border-slate-800">
              <button 
                onClick={() => handleTrySwitchRole('student')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
                  role === 'student' 
                    ? 'bg-sky-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎓 Học Sinh
              </button>
              <button 
                onClick={() => handleTrySwitchRole('admin')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
                  role === 'admin' 
                    ? 'bg-sky-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙️ Quản Trị
              </button>
            </div>

            {/* Quick Student Badge */}
            {role === 'student' && activeUser && (
              <div className="flex items-center gap-3 bg-slate-950/70 px-3 py-1.5 rounded-2xl border border-slate-800">
                <img 
                  className="w-8 h-8 rounded-full border border-sky-400 object-cover bg-slate-950" 
                  src={activeUser.Avatar_URL} 
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUser.Full_Name}`; }}
                  alt="Avatar" 
                />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-extrabold text-sky-400">{activeUser.Full_Name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                    <span>{activeUser.Grade_Class}</span> • <span className="text-amber-400 font-extrabold">{activeUser.Total_Points.toLocaleString()} XP</span>
                  </div>
                </div>
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

        {/* Dynamic View Component */}
        <div className="min-h-[50vh] transition-all duration-300">
          {role === 'student' ? (
            <>
              {/* STUDENT VIEWS */}
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* High Fidelity Theme Banner */}
                  <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r from-sky-800 to-indigo-900 border border-sky-700/30">
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 bg-[url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600')] bg-cover bg-center"></div>
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
                        {books.filter(b => b.Category === 'Khoa học').map(book => (
                          <div key={book.Book_ID} className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60 text-center flex flex-col justify-between">
                            <img src={book.Cover_Image} className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-200" alt="book" />
                            <div className="mt-3 space-y-1.5">
                              <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{book.Title}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{book.Author}</p>
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
                                <p className="text-[10px] text-slate-400 font-medium mb-3">{book.Author}</p>
                                
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
                    <div className="relative w-24 h-24 mx-auto">
                      <img 
                        className="w-full h-full rounded-full border-4 border-sky-400 object-cover shadow-md bg-slate-950" 
                        src={activeUser.Avatar_URL} 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUser.Full_Name}`; }}
                        alt="User" 
                      />
                      <span className="absolute bottom-0 right-0 bg-amber-500 text-white border-2 border-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow">👑</span>
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
                    setModalType('add_book');
                  }}
                  onEditBook={handleEditBookInit}
                  onDeleteBook={handleDeleteBook}
                />
              )}

              {activeTab === 'admin-theme' && (
                <AdminThemeView 
                  theme={theme}
                  onSaveTheme={handleSaveThemeSettings}
                />
              )}

              {activeTab === 'admin-students' && (
                <AdminStudentsView 
                  students={users}
                  onAddStudent={() => {
                    setEditStudentName('');
                    setEditStudentClass('');
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

      {/* 3. FLOATING DATABASE SYNC MONITOR WIDGET */}
      <SqlMonitor 
        logs={logs} 
        onClearLogs={() => setLogs([])}
        onExecuteSQL={handleExecuteSqlConsole}
      />

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
          
          {/* Admin Switch Authenticator Form */}
          {modalType === 'admin_auth' && (
            <form onSubmit={handleAdminAuthSubmit} className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">🔐</span>
                <h4 class="font-extrabold text-sm text-white mt-2">ĐĂNG NHẬP QUẢN TRỊ</h4>
                <p className="text-xs text-slate-400 mt-1">Cung cấp mật khẩu quản trị hệ thống</p>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Tài khoản quản trị</label>
                  <input 
                    type="text" 
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Mật khẩu bảo mật</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-sky-400 space-y-1 font-mono">
                  <span className="font-bold text-slate-300">💡 Thông tin mẫu để trải nghiệm:</span>
                  <div>• Tài khoản: <span className="text-white font-bold">admin</span></div>
                  <div>• Mật khẩu: <span className="text-white font-bold">admin123</span></div>
                </div>

                {authError && (
                  <p className="text-rose-500 font-extrabold text-[11px] text-center">
                    ❌ Sai tài khoản hoặc mật khẩu!
                  </p>
                )}
              </div>

              <div className="flex gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-sky-500/10"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
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
                    <label className="block text-slate-400 font-bold mb-1">Khối lớp</label>
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
                  <label className="block text-slate-400 font-bold mb-1">Lớp học</label>
                  <input 
                    type="text" 
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    placeholder="VD: Lớp 5D"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
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
                  <label className="block text-slate-400 font-bold mb-1">Lớp học</label>
                  <input 
                    type="text" 
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white" 
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
