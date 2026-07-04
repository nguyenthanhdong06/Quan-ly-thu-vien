import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, Send, Play } from 'lucide-react';
import { LogEntry } from '../types';

interface SqlMonitorProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onExecuteSQL: (query: string) => { success: boolean; message: string; rows?: any[] };
}

export default function SqlMonitor({ logs, onClearLogs, onExecuteSQL }: SqlMonitorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [consoleResult, setConsoleResult] = useState<{ message: string; rows?: any[] } | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when logs change
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, consoleResult]);

  const handleSubmitSql = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sqlQuery.trim()) return;

    const result = onExecuteSQL(sqlQuery);
    setConsoleResult({
      message: result.message,
      rows: result.rows,
    });
    setSqlQuery('');
  };

  if (isCollapsed) {
    return (
      <button 
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 bg-slate-950 text-emerald-400 hover:bg-slate-900 border border-emerald-500/30 px-4 py-2.5 rounded-full shadow-2xl transition duration-300 flex items-center gap-2 text-xs font-mono"
      >
        <Terminal className="w-4.5 h-4.5 animate-pulse" />
        <span>⚙️ Hiện SQL Logs ({logs.length})</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-full transition-all duration-300 transform translate-y-0">
      <div className="bg-slate-950 text-emerald-400 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-xs flex flex-col h-80">
        
        {/* Panel Header */}
        <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              DATABASE SYNC MONITOR
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onClearLogs}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition duration-200"
            >
              Xóa Log
            </button>
            <button 
              onClick={() => setIsCollapsed(true)}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded-lg transition"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel Terminal Console Logs */}
        <div className="p-3.5 font-mono flex-grow overflow-y-auto space-y-2 bg-slate-950/95 scrollbar-thin">
          <div className="text-slate-500">// Kết nối SQL Database thành công! Đang lắng nghe hoạt động live...</div>
          
          {logs.map((log) => {
            let logColor = 'border-emerald-500/40 text-emerald-400';
            if (log.type === 'error') logColor = 'border-rose-500/40 text-rose-400';
            if (log.type === 'system') logColor = 'border-blue-500/40 text-blue-400';

            return (
              <div key={log.id} className={`border-l-2 pl-2 py-0.5 leading-relaxed text-[11px] font-mono ${logColor}`}>
                <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                <span>{log.query}</span>
              </div>
            );
          })}

          {/* Interactive SQL Output Display */}
          {consoleResult && (
            <div className="border-t border-slate-800 mt-2 pt-2 text-slate-300 space-y-1">
              <div className="text-sky-400 font-bold font-mono">💻 SQL Terminal Output:</div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-[10px] overflow-x-auto whitespace-pre font-mono">
                {consoleResult.message}
                {consoleResult.rows && consoleResult.rows.length > 0 && (
                  <div className="mt-1.5 border-t border-slate-800 pt-1.5">
                    {JSON.stringify(consoleResult.rows.slice(0, 3), null, 2)}
                    {consoleResult.rows.length > 3 ? `\n... và ${consoleResult.rows.length - 3} hàng khác.` : ''}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div ref={consoleEndRef}></div>
        </div>

        {/* Panel Live SQL Input Terminal Form */}
        <form onSubmit={handleSubmitSql} className="border-t border-slate-800 bg-slate-900 p-2 flex gap-1.5 shrink-0">
          <div className="flex-grow relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-sky-500 font-bold font-mono">SQL&gt;</span>
            <input 
              type="text" 
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="SELECT * FROM Books; hoặc UPDATE..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-2 py-1.5 font-mono text-[11px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-slate-600"
            />
          </div>
          <button 
            type="submit" 
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-2.5 rounded-xl flex items-center justify-center transition duration-200"
            title="Thực thi SQL"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
          </button>
        </form>

      </div>
    </div>
  );
}
