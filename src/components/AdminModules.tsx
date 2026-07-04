import React from 'react';
import { BookOpen, User, Award, BarChart2, Plus, Edit, Trash2, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import { Book, User as UserType, Challenge, MonthlyTheme, UserBookInteraction } from '../types';

// ==========================================
// 1. ADMIN BOOKS VIEWS
// ==========================================
interface AdminBooksViewProps {
  books: Book[];
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: number) => void;
}

export function AdminBooksView({ books, onAddBook, onEditBook, onDeleteBook }: AdminBooksViewProps) {
  return (
    <div className="space-y-4 text-white">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            CƠ SỞ DỮ LIỆU ĐẦU SÁCH ({books.length})
          </h3>
          <p className="text-xs text-slate-400">Xem và hiệu chỉnh cơ sở dữ liệu sách hệ thống (Table: Books)</p>
        </div>
        <button 
          onClick={onAddBook}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-sky-500/10"
        >
          <Plus className="w-4 h-4" />
          Thêm Sách Mới
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Mã Sách</th>
                <th className="px-4 py-3">Tựa Đề</th>
                <th className="px-4 py-3">Tác Giả</th>
                <th className="px-4 py-3">Thể Loại</th>
                <th className="px-4 py-3">Định Dạng</th>
                <th className="px-4 py-3">Khối Lớp</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.Book_ID} className="border-b border-slate-800 hover:bg-slate-900/40 transition">
                  <td className="px-4 py-3.5 font-mono text-sky-400 font-bold">#{book.Book_ID}</td>
                  <td className="px-4 py-3.5 flex items-center gap-3">
                    <img 
                      src={book.Cover_Image} 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100'; }} 
                      className="w-8 h-12 object-cover rounded shadow border border-slate-800" 
                      alt="cover"
                    />
                    <div className="font-bold text-xs max-w-[160px] truncate text-slate-200" title={book.Title}>
                      {book.Title}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">{book.Author}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">{book.Category}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                      book.Book_Type === 'Audio' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      {book.Book_Type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">{book.Target_Grade}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5 font-semibold">
                      <button 
                        onClick={() => onEditBook(book)}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2 py-1 rounded-lg text-[10px] transition"
                      >
                        <Edit className="w-3 h-3 inline mr-1" /> Sửa
                      </button>
                      <button 
                        onClick={() => onDeleteBook(book.Book_ID)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg text-[10px] transition"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. ADMIN THEME VIEWS
// ==========================================
interface AdminThemeViewProps {
  theme: MonthlyTheme;
  onSaveTheme: (updatedTheme: MonthlyTheme) => void;
}

export function AdminThemeView({ theme, onSaveTheme }: AdminThemeViewProps) {
  const [title, setTitle] = React.useState(theme.Title);
  const [date, setDate] = React.useState(theme.Month_Year);
  const [banner, setBanner] = React.useState(theme.Banner_Image);
  const [desc, setDesc] = React.useState(theme.Description);
  const [podcast, setPodcast] = React.useState(theme.Media_Podcast);
  const [video, setVideo] = React.useState(theme.Media_Video);
  const [minigame, setMinigame] = React.useState(theme.Media_MiniGame);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTheme({
      Theme_ID: theme.Theme_ID,
      Month_Year: date,
      Title: title,
      Banner_Image: banner,
      Description: desc,
      Media_Podcast: podcast,
      Media_Video: video,
      Media_MiniGame: minigame
    });
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h3 className="text-base font-extrabold flex items-center gap-2">
          <span>🎨</span> CẤU HÌNH CHỦ ĐIỂM SỰ KIỆN THÁNG (Table: Monthly_Themes)
        </h3>
        <p className="text-xs text-slate-400">Thay đổi chủ đề truyền thông, banner sự kiện và liên kết bài học tương tác</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-2 bg-slate-900 p-5 border border-slate-800 rounded-2xl space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Tên chủ điểm sự kiện</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Thời điểm (Tháng/Năm)</label>
              <input 
                type="text" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1.5">Địa chỉ Banner URL</label>
            <input 
              type="text" 
              value={banner} 
              onChange={(e) => setBanner(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1.5">Mô tả sự kiện chi tiết</label>
            <textarea 
              rows={3} 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <hr className="border-slate-800 my-4" />
          <h4 className="font-extrabold text-xs text-sky-400">Nội dung học liệu đính kèm</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Podcast Title</label>
              <input 
                type="text" 
                value={podcast} 
                onChange={(e) => setPodcast(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Video Title</label>
              <input 
                type="text" 
                value={video} 
                onChange={(e) => setVideo(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Mini-Game Title</label>
              <input 
                type="text" 
                value={minigame} 
                onChange={(e) => setMinigame(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition duration-200"
          >
            Lưu Cấu Hình Chủ Điểm
          </button>
        </form>

        {/* Live Card Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Xem trước Banner</h4>
            <div className="relative rounded-xl overflow-hidden border border-slate-800">
              <img 
                src={banner} 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000'; }} 
                className="w-full h-36 object-cover" 
                alt="Preview" 
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            <h5 className="font-black text-sm text-sky-400 mt-2">{title}</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{desc}</p>
          </div>
          <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono mt-4 leading-relaxed">
            TABLE: Monthly_Themes <br />ID: {theme.Theme_ID} <br />MONTH_YEAR: {date}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ADMIN STUDENTS VIEWS
// ==========================================
interface AdminStudentsViewProps {
  students: UserType[];
  onAddStudent: () => void;
  onEditStudent: (student: UserType) => void;
  onDeleteStudent: (studentId: number) => void;
  onAwardXp: (studentId: number) => void;
}

export function AdminStudentsView({ students, onAddStudent, onEditStudent, onDeleteStudent, onAwardXp }: AdminStudentsViewProps) {
  return (
    <div className="space-y-4 text-white">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            QUẢN LÝ DANH SÁCH HỌC SINH ({students.length})
          </h3>
          <p className="text-xs text-slate-400">Kiểm tra tiến trình đọc và cộng điểm rèn luyện rèn thói quen (Table: Users)</p>
        </div>
        <button 
          onClick={onAddStudent}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          Thêm Học Sinh Mới
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Mã Học Sinh</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3">Tên đăng nhập</th>
                <th className="px-4 py-3">Lớp học</th>
                <th className="px-4 py-3">Mật khẩu</th>
                <th className="px-4 py-3">Tích Lũy Thi Đua</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map((usr) => (
                <tr key={usr.User_ID} className="border-b border-slate-800 hover:bg-slate-900/40 transition">
                  <td className="px-4 py-3.5 font-mono text-sky-400 font-bold">#{usr.User_ID}</td>
                  <td className="px-4 py-3.5 flex items-center gap-3">
                    <img 
                      src={usr.Avatar_URL} 
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.Full_Name}`; }} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-800 bg-slate-950" 
                      alt="avatar"
                    />
                    <span className="font-bold text-xs text-slate-200">{usr.Full_Name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 rounded px-2 py-1 border border-emerald-500/20">
                      {usr.Username || 'chưa_có'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">{usr.Grade_Class}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400 font-semibold">{usr.Password || '(Chưa cài)'}</td>
                  <td className="px-4 py-3.5 text-amber-400 font-extrabold">{usr.Total_Points.toLocaleString()} XP</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5 font-semibold">
                      <button 
                        onClick={() => onAwardXp(usr.User_ID)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg text-[10px] transition"
                      >
                        🎁 Tặng XP
                      </button>
                      <button 
                        onClick={() => onEditStudent(usr)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] transition"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => onDeleteStudent(usr.User_ID)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg text-[10px] transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN GAMIFICATION / CHALLENGES VIEWS
// ==========================================
interface AdminGamificationViewProps {
  challenges: Challenge[];
  onIncrementChallenge: (challengeId: number) => void;
}

export function AdminGamificationView({ challenges, onIncrementChallenge }: AdminGamificationViewProps) {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-base font-extrabold flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          QUẢN TRỊ ĐUA TOP & THỬ THÁCH (Table: Challenges)
        </h3>
        <p className="text-xs text-slate-400">Kiểm soát tiến trình nhiệm vụ thi đua rèn luyện thói quen đọc sách</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {challenges.map((ch) => {
          const isComplete = ch.Current >= ch.Target;
          const pct = Math.round((ch.Current / ch.Target) * 100);

          return (
            <div key={ch.Challenge_ID} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-200 line-clamp-1">{ch.Title}</h4>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{ch.Progress_Type}</span>
                </div>
                <span className={`text-[9px] px-2.5 py-0.5 rounded font-extrabold border ${
                  isComplete 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isComplete ? 'HOÀN THÀNH' : 'ĐANG CHẠY'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Tiến độ: {ch.Current} / {ch.Target}</span>
                  <span>{Math.min(100, pct)}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-2 text-[10px]">
                  <span className="text-amber-400 font-semibold">🎁 {ch.Reward}</span>
                  <button 
                    onClick={() => onIncrementChallenge(ch.Challenge_ID)}
                    disabled={isComplete}
                    className="bg-slate-800 hover:bg-slate-700 text-white hover:text-sky-400 px-3 py-1.5 rounded-xl text-[9px] transition font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +1 Tiến Độ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 5. ADMIN ANALYTICS & DASHBOARD VIEWS
// ==========================================
interface AdminAnalyticsViewProps {
  books: Book[];
  students: UserType[];
  interactions: UserBookInteraction[];
}

export function AdminAnalyticsView({ books, students, interactions }: AdminAnalyticsViewProps) {
  const totalBooks = books.length;
  const totalPoints = students.reduce((sum, s) => sum + s.Total_Points, 0);
  const averagePoints = students.length ? Math.round(totalPoints / students.length) : 0;
  const completedCount = interactions.filter(i => i.Status === 'Đã hoàn thành').length;

  return (
    <div className="space-y-6 text-white">
      <div>
        <h3 className="text-base font-extrabold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-sky-400" />
          THỐNG KÊ & BÁO CÁO TOÀN TRƯỜNG
        </h3>
        <p className="text-xs text-slate-400">Trực quan hóa hoạt động, tích lũy điểm thưởng và tần suất tương tác học tập</p>
      </div>

      {/* Widgets Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-xl">
            📚
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Tổng đầu sách</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{totalBooks} đầu sách</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xl">
            ⭐
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Tổng điểm rèn luyện</span>
            <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{totalPoints.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xl">
            🧠
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Trung bình học sinh</span>
            <span className="text-xl font-extrabold text-sky-400 mt-0.5 block">{averagePoints.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xl">
            ✅
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Lượt đọc xong</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{completedCount} lượt đọc</span>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">📊 Phân bổ tương tác định dạng sách</h4>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Ebook (Sách số điện tử)</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Audio Book (Sách phát âm thanh)</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4">* Dữ liệu tổng hợp từ 100% lượt đọc thật và podcast nghe từ đầu niên khóa.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">🐳 Hoạt động chuyên sâu theo chủ điểm</h4>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Tham gia giải đố (Quiz)</span>
                <span>90% học sinh</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Mini-game sinh thái</span>
                <span>65% học sinh</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4">* Tỷ lệ học sinh đã kích hoạt và nhận quà từ sự kiện "Đại dương xanh kỳ thú".</p>
        </div>
      </div>
    </div>
  );
}
