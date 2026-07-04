import React, { useState } from 'react';
import { Play, Pause, ChevronRight, RefreshCw, Award, Eye, ShieldAlert } from 'lucide-react';

interface StoryVideoPlayerProps {
  title: string;
  onComplete: () => void;
  playChime: (type: 'success' | 'correct' | 'error' | 'click' | 'victory') => void;
}

const STORY_STEPS = [
  {
    depth: "0m - Vùng Ánh Sáng (Epipelagic Zone)",
    narration: "Bắt đầu hành trình lặn sâu vào rạn san hô xanh tuyệt đẹp. Đây là nơi sinh sống của hơn 90% sinh vật biển nhờ nhận đầy đủ ánh mặt trời.",
    emoji: "☀️🐠🐢",
    fact: "Bạn có biết? San hô thực chất là những quần thể động vật nhỏ li ti chứ không phải là thực vật!"
  },
  {
    depth: "200m - Vùng Chạng Vạng (Mesopelagic Zone)",
    narration: "Ánh sáng mặt trời nhạt dần. Ở đây, chúng ta gặp những đàn cá mập đi tuần tra và các loài mực khổng lồ.",
    emoji: "🦈🦑🌊",
    fact: "Nhiệt độ nước ở đây giảm mạnh xuống khoảng 4 độ C. Các loài cá ở đây thường có mắt rất lớn để bắt chút ánh sáng yếu ớt."
  },
  {
    depth: "1,000m - Vùng Nửa Đêm (Bathypelagic Zone)",
    narration: "Bóng tối hoàn toàn bao phủ. Nhưng kìa! Những chú cá đèn lồng tự phát ra ánh sáng sinh học rực rỡ để thu hút con mồi và kết bạn.",
    emoji: "🏮🐟🐙",
    fact: "Hiện tượng phát quang sinh học (bioluminescence) giúp sinh vật biển tồn tại trong môi trường áp suất cực lớn này!"
  },
  {
    depth: "4,000m - Vùng Đáy Vực (Abyssal Zone)",
    narration: "Chúng ta đã chạm đáy rãnh Mariana sâu thẳm. Ở đây ngập tràn các rác thải nhựa và vi nhựa mà con người vô tình xả xuống biển cả.",
    emoji: "⚠️🥤🛍️",
    fact: "Một chiếc túi nilon mất tới 500 năm để phân hủy dưới đáy biển sâu. Hãy hạn chế sử dụng đồ nhựa một lần để bảo vệ đại dương!"
  }
];

export default function StoryVideoPlayer({ title, onComplete, playChime }: StoryVideoPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    playChime('click');
    if (currentStep < STORY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!isCompleted) {
        setIsCompleted(true);
        playChime('success');
        onComplete();
      }
    }
  };

  const handleRestart = () => {
    playChime('click');
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const stepInfo = STORY_STEPS[currentStep];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-lg mx-auto text-white">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-xs tracking-wide">TRÌNH CHIẾU BÀI GIẢNG TƯƠNG TÁC</span>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full font-mono">
          PHỤ ĐỀ TIẾNG VIỆT
        </span>
      </div>

      {/* Narrative Submarine Display Canvas */}
      <div className="bg-slate-950 relative h-60 overflow-hidden flex flex-col justify-between p-5 border-b border-slate-800">
        {/* Deep sea ambient graphics */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-slate-950 to-indigo-950 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600')] bg-cover bg-center mix-blend-color-burn opacity-30"></div>
        
        {/* Animated Submarine */}
        <div className="absolute right-6 top-1/4 animate-bounce text-4xl select-none z-10" style={{ animationDuration: '4s' }}>
          🚢
        </div>

        {/* Depth badge */}
        <div className="relative z-10 bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1 rounded-xl w-fit text-xs font-mono text-sky-400 flex items-center gap-1.5 shadow-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Độ sâu: {stepInfo.depth}</span>
        </div>

        {/* Big visual emojis representing ocean environment */}
        <div className="relative z-10 flex justify-center text-6xl my-4 drop-shadow-xl animate-pulse">
          {stepInfo.emoji}
        </div>

        {/* Caption panel */}
        <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-center shadow-lg">
          <p className="text-xs text-sky-100 leading-relaxed font-medium">
            "{stepInfo.narration}"
          </p>
        </div>
      </div>

      {/* Controls & Fun Facts */}
      <div className="p-5 space-y-4">
        {/* Scientific Fact Banner */}
        <div className="bg-sky-500/10 border border-sky-500/25 p-3.5 rounded-2xl flex items-start gap-2.5">
          <span className="text-xl">💡</span>
          <div>
            <h5 className="font-extrabold text-[10px] text-sky-400 uppercase tracking-widest">Kiến Thức Khoa Học</h5>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{stepInfo.fact}</p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-1.5">
            {STORY_STEPS.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-sky-400 w-6' : 'bg-slate-800'}`}
              ></span>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={handleRestart} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="Xem lại">
              <RefreshCw className="w-4 h-4" />
            </button>

            <button 
              onClick={handleNext} 
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/10 transition-all"
            >
              <span>{currentStep === STORY_STEPS.length - 1 ? 'Hoàn Thành' : 'Tiếp Theo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isCompleted && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs text-center py-2.5 rounded-2xl flex items-center justify-center gap-2 animate-bounce">
            <Award className="w-4.5 h-4.5 animate-spin" />
            <span>Đã hoàn thành bài giảng! Cộng thêm +40 XP thi đua!</span>
          </div>
        )}
      </div>
    </div>
  );
}
