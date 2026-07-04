import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Award, Disc, Radio } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  onComplete: () => void;
  playChime: (type: 'success' | 'correct' | 'error' | 'click' | 'victory') => void;
}

export default function AudioPlayer({ title, onComplete, playChime }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // Initial mock starting percentage
  const [volume, setVolume] = useState(80);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleComplete();
            return 100;
          }
          return prev + 1;
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    playChime('click');
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    playChime('click');
    setProgress(0);
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      playChime('success');
      onComplete();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold bg-sky-400/10 px-2 py-1 rounded-full">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>PODCAST CHỦ ĐIỂM</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">ID: 101_POD</span>
      </div>

      <div className="relative flex justify-center py-6">
        {/* Rotating Record Art */}
        <div className="relative">
          <div className={`w-28 h-28 bg-slate-950 rounded-full border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`}>
            <Disc className="w-16 h-16 text-sky-500 opacity-60" />
            <div className="absolute w-8 h-8 bg-slate-900 rounded-full border-2 border-slate-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-sky-400 rounded-full"></div>
            </div>
          </div>
          {/* Tone Arm */}
          <div className={`absolute top-0 right-1 w-8 h-12 border-r-2 border-t-2 border-sky-400/40 rounded-tr-lg transform origin-top-left transition-transform duration-500 ${isPlaying ? 'rotate-12' : 'rotate-0'}`}></div>
        </div>
      </div>

      <div className="text-center space-y-1 mb-5">
        <h4 className="font-extrabold text-sm line-clamp-1 text-slate-200" title={title}>
          {title}
        </h4>
        <p className="text-[10px] text-sky-400 font-medium">Bí Mật Rãnh Mariana & Sinh Vật Vùng Sâu</p>
      </div>

      {/* Progress & Timeline */}
      <div className="space-y-1.5 mb-5">
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.round((clickX / rect.width) * 100);
          setProgress(percentage);
        }}>
          <div className="bg-sky-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{Math.floor(progress * 0.1)}:{(Math.floor(progress * 6) % 60).toString().padStart(2, '0')}</span>
          <span>10:00</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={handleReset} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition" title="Đặt lại">
          <RotateCcw className="w-4 h-4" />
        </button>

        <button onClick={handlePlayPause} className="p-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-full shadow-lg shadow-sky-500/20 hover:scale-105 transition-all duration-300">
          {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
        </button>

        <div className="flex items-center gap-2 text-slate-400">
          <Volume2 className="w-4 h-4" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))} 
            className="w-16 h-1 bg-slate-800 accent-sky-400 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {progress >= 100 && !isCompleted && (
        <button onClick={handleComplete} className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
          <Award className="w-4 h-4" />
          Nhận điểm hoàn thành (+30 XP)
        </button>
      )}

      {isCompleted && (
        <div className="mt-4 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold py-2 rounded-xl text-xs">
          🎉 Đã nhận +30 XP rèn luyện học tập!
        </div>
      )}
    </div>
  );
}
