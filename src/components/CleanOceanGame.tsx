import React, { useState, useEffect } from 'react';
import { Gamepad2, Award, Heart, RefreshCw, Sparkles, Smile, ShieldAlert } from 'lucide-react';

interface CleanOceanGameProps {
  onComplete: () => void;
  playChime: (type: 'success' | 'correct' | 'error' | 'click' | 'victory') => void;
}

interface Cell {
  id: number;
  type: 'trash' | 'fish';
  revealed: boolean;
}

export default function CleanOceanGame({ onComplete, playChime }: CleanOceanGameProps) {
  const [lives, setLives] = useState(3);
  const [trashLeft, setTrashLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize the 3x3 game board
  const initGame = () => {
    setLives(3);
    setScore(0);
    setGameState('playing');

    // 5 pieces of trash, 4 fish
    const types: ('trash' | 'fish')[] = ['trash', 'trash', 'trash', 'trash', 'trash', 'fish', 'fish', 'fish', 'fish'];
    // Shuffle the array
    types.sort(() => Math.random() - 0.5);

    const newGrid: Cell[] = Array.from({ length: 9 }, (_, idx) => ({
      id: idx,
      type: types[idx],
      revealed: false,
    }));

    setGrid(newGrid);
    setTrashLeft(5);
    playChime('click');
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCellClick = (cellId: number) => {
    if (gameState !== 'playing') return;

    const cellIndex = grid.findIndex(c => c.id === cellId);
    if (cellIndex === -1 || grid[cellIndex].revealed) return;

    // Update cell status
    const newGrid = [...grid];
    newGrid[cellIndex].revealed = true;
    setGrid(newGrid);

    const cell = newGrid[cellIndex];
    if (cell.type === 'trash') {
      const remainingTrash = trashLeft - 1;
      setTrashLeft(remainingTrash);
      setScore(prev => prev + 30);
      playChime('correct');

      if (remainingTrash === 0) {
        setGameState('won');
        playChime('victory');
        onComplete();
      }
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      playChime('error');

      if (remainingLives === 0) {
        setGameState('lost');
        // Reveal all tiles
        setGrid(prev => prev.map(c => ({ ...c, revealed: true })));
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xl text-slate-800 max-w-sm mx-auto space-y-4">
      {/* Top dashboard */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-extrabold">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Sinh mệnh: {Array.from({ length: 3 }).map((_, idx) => (
            <span key={idx} className={`text-sm ${idx < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
          ))}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-50 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Rác cần dọn: <span className="font-extrabold text-sky-600">{trashLeft}</span></span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h4 className="font-extrabold text-sm text-slate-900">Chiến Dịch Giải Cứu Đại Dương 🐬</h4>
        <p className="text-[10px] text-slate-400">Nhấp vào bọt sóng 🌊 để dọn nhựa nguy hại. Hãy tránh dọa sợ các bạn cá 🐠 nhé!</p>
      </div>

      {/* Grid of wave cells */}
      <div className="grid grid-cols-3 gap-2 py-2">
        {grid.map((cell) => {
          let emoji = '🌊';
          let bgColor = 'bg-sky-50 hover:bg-sky-100 border-sky-100';
          
          if (cell.revealed) {
            if (cell.type === 'trash') {
              emoji = '🥤';
              bgColor = 'bg-rose-100 border-rose-200 text-rose-500 scale-95 duration-200';
            } else {
              emoji = '🐠';
              bgColor = 'bg-emerald-100 border-emerald-200 text-emerald-500 scale-95 duration-200';
            }
          }

          return (
            <button
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              disabled={cell.revealed || gameState !== 'playing'}
              className={`h-16 rounded-2xl text-2xl flex items-center justify-center border transition-all duration-300 transform active:scale-95 disabled:cursor-not-allowed shadow-sm font-medium ${bgColor}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {/* Tally message */}
      {gameState === 'playing' && (
        <div className="text-center text-[10px] text-slate-400 font-bold">
          Điểm Tích Lũy Game: <span className="text-sky-500">{score}</span> / 150
        </div>
      )}

      {/* Won Overlay State */}
      {gameState === 'won' && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center space-y-2.5 animate-bounce">
          <div className="inline-flex p-2 bg-emerald-500 rounded-full text-white">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h5 className="font-black text-sm text-emerald-800">Tuyệt Vời! Đại Dương Đã Sạch Đẹp</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Các sinh vật biển cảm ơn bạn rất nhiều! Bạn đã rèn thêm kỹ năng bảo vệ môi trường hữu ích.
          </p>
          <div className="text-xs font-black text-amber-600 bg-amber-50 rounded-xl py-1.5 border border-amber-200">
            🎁 Tặng thưởng rèn luyện: +150 XP
          </div>
          <button onClick={initGame} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Chơi Lại</span>
          </button>
        </div>
      )}

      {/* Lost Overlay State */}
      {gameState === 'lost' && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center space-y-2.5">
          <div className="inline-flex p-2 bg-rose-500 rounded-full text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h5 className="font-black text-sm text-rose-800">Không Thành Công!</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Bạn vô tình làm các sinh vật hoảng sợ mất rồi. Hãy quan sát tỉ mỉ hơn trong lần thử tới!
          </p>
          <button onClick={initGame} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử Thách Lại</span>
          </button>
        </div>
      )}
    </div>
  );
}
