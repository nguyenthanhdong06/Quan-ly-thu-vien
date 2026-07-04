import React, { useState } from 'react';
import { Check, X, Award, HelpCircle, ChevronRight, HelpCircle as HelpIcon } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data';

interface InteractiveQuizProps {
  onComplete: (score: number) => void;
  playChime: (type: 'success' | 'correct' | 'error' | 'click' | 'victory') => void;
}

export default function InteractiveQuiz({ onComplete, playChime }: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<'playing' | 'completed'>('playing');

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const question = QUIZ_QUESTIONS[currentIndex];
    const isCorrect = optionIndex === question.correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      playChime('correct');
    } else {
      playChime('error');
    }
  };

  const handleNext = () => {
    playChime('click');
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizState('completed');
      playChime('victory');
      onComplete(score);
    }
  };

  const handleRestart = () => {
    playChime('click');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuizState('playing');
  };

  if (quizState === 'completed') {
    const totalQuestions = QUIZ_QUESTIONS.length;
    const earnedXp = score * 30 + (score === totalQuestions ? 10 : 0); // Flat bonus for perfect score!

    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-w-sm mx-auto text-center space-y-4">
        <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-full text-2xl font-bold animate-pulse">
          🏆
        </div>
        <h4 className="font-extrabold text-base text-slate-900">Hoàn Thành Thử Thách Độc Giả</h4>
        <p className="text-xs text-slate-500">
          Chúc mừng em đã hoàn thành bài thi trắc nghiệm chủ điểm của tuần này!
        </p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between font-medium">
            <span>Số câu chính xác:</span>
            <span className="font-extrabold text-emerald-600">{score} / {totalQuestions}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Độ chính xác:</span>
            <span className="font-extrabold text-sky-600">{Math.round((score / totalQuestions) * 100)}%</span>
          </div>
          <hr className="border-slate-200 my-1" />
          <div className="flex justify-between font-bold text-amber-600">
            <span>Tích lũy XP rèn luyện:</span>
            <span>+{earnedXp} XP</span>
          </div>
        </div>

        <button 
          onClick={handleRestart} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
        >
          Làm Lại Bài Kiểm Tra
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentIndex];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl max-w-sm mx-auto space-y-4 text-slate-800">
      {/* Quiz Progress header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[10px] bg-sky-50 text-sky-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <HelpIcon className="w-3 h-3 text-sky-600" />
          Câu hỏi {currentIndex + 1} / {QUIZ_QUESTIONS.length}
        </span>
        <span className="text-[10px] text-slate-400 font-bold font-mono">
          Điểm hiện tại: {score} câu
        </span>
      </div>

      <h4 className="font-extrabold text-sm text-slate-950 leading-relaxed">
        {question.q}
      </h4>

      {/* Answer options */}
      <div className="space-y-2.5 pt-2">
        {question.a.map((answer, optionIdx) => {
          let btnClass = 'border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-700';
          let trailingIcon = null;

          if (isAnswered) {
            const isCorrectOption = optionIdx === question.correct;
            const isSelectedOption = optionIdx === selectedAnswer;

            if (isCorrectOption) {
              btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
              trailingIcon = <Check className="w-4.5 h-4.5 text-emerald-600" />;
            } else if (isSelectedOption) {
              btnClass = 'border-rose-500 bg-rose-50 text-rose-800';
              trailingIcon = <X className="w-4.5 h-4.5 text-rose-600" />;
            } else {
              btnClass = 'border-slate-100 opacity-50 text-slate-400 cursor-not-allowed';
            }
          }

          return (
            <button
              key={optionIdx}
              onClick={() => handleAnswerSelect(optionIdx)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 border font-semibold text-xs rounded-2xl transition duration-200 flex items-center justify-between ${btnClass}`}
            >
              <span>{answer}</span>
              {trailingIcon}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <button 
          onClick={handleNext} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition"
        >
          <span>{currentIndex + 1 === QUIZ_QUESTIONS.length ? 'Hoàn Thành' : 'Tiếp Tục'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
