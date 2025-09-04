import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MEMBER_NAMES } from './constants';
import type { AppMessage, AttendanceStatus, AttendanceRecord } from './types';
import { gasRun } from './services/gasService';

// --- Icon Components --- //
const CheckCircleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const XCircleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
const ArrowLeftOnRectangleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
);
const UserGroupIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 9 10.5V9A4.5 4.5 0 0 1 13.5 4.5v.75m-6 5.25a3.75 3.75 0 0 1-7.5 0v-1.5a3.75 3.75 0 0 1 7.5 0v1.5Zm0 0V9A4.5 4.5 0 0 1 9 4.5v.75M12.75 12.75v.75a3.75 3.75 0 0 0 7.5 0v-1.5a3.75 3.75 0 0 0-7.5 0v1.5Zm0 0v-1.5a4.5 4.5 0 0 0-9 0v1.5" /></svg>
);
const ArrowDownTrayIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);

// --- Shared UI Components --- //

const Spinner = () => (
    <div className="fixed inset-0 bg-white bg-opacity-60 flex justify-center items-center z-50">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
);

const MessageDisplay = ({ message }: { message: AppMessage | null }) => {
  if (!message) return null;
  const isSuccess = message.type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-3 rounded-lg text-white shadow-lg animate-fade-in-up ${bgColor}`}>
      <Icon className="h-6 w-6 mr-2" />
      <span className="font-semibold">{message.text}</span>
    </div>
  );
};

// --- Admin Components --- //

const AdminLoginScreen = ({ onLogin, onBack }: { onLogin: (password: string) => void; onBack: () => void; }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '2025') {
            onLogin(password);
        } else {
            setError('パスワードが違います。');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-3xl font-bold text-center text-slate-800">管理者ログイン</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="パスワード"
                            className="w-full px-4 py-3 text-lg text-slate-800 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Password"
                        />
                         {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>
                    <button type="submit" className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">ログイン</button>
                </form>
                 <button onClick={onBack} className="w-full px-4 py-2 mt-4 font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition duration-200">戻る</button>
            </div>
        </div>
    );
}

const AdminDashboard = ({ onLogout }: { onLogout: () => void; }) => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<AppMessage | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchRecords = useCallback((date: string) => {
        setIsLoading(true);
        gasRun<AttendanceRecord[]>('getAttendanceForDate', date)
            .then(setRecords)
            .catch(err => setMessage({ text: `データ取得失敗: ${(err as Error).message}`, type: 'error' }))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchRecords(selectedDate);
    }, [selectedDate, fetchRecords]);

    useEffect(() => {
        if (message) {
          const timer = setTimeout(() => setMessage(null), 3000);
          return () => clearTimeout(timer);
        }
    }, [message]);

    const handleDownloadCSV = () => {
        if (records.length === 0) {
            setMessage({ text: 'ダウンロードする記録がありません。', type: 'error' });
            return;
        }

        try {
            const headers = ['日付', '名前', '出席時間', '退席時間'];
            const sortedRecords = [...records].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            const csvContent = [
                headers.join(','),
                ...sortedRecords.map(rec => [
                    rec.date,
                    `"${rec.name}"`, // Quote names to handle potential commas
                    rec.checkInTime || '',
                    rec.checkOutTime || ''
                ].join(','))
            ].join('\n');

            // Add BOM for UTF-8 Excel compatibility
            const bom = '\uFEFF';
            const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendance_${selectedDate}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("CSV Download failed:", error);
            setMessage({ text: 'CSVのダウンロードに失敗しました。', type: 'error' });
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
            {isLoading && <Spinner />}
            <MessageDisplay message={message} />
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">管理者ダッシュボード</h1>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <input 
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="px-3 py-2 text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <button
                        onClick={handleDownloadCSV}
                        disabled={records.length === 0}
                        title="Download CSV"
                        className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">CSVダウンロード</span>
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-200">
                        <ArrowLeftOnRectangleIcon />
                        <span>ログアウト</span>
                    </button>
                </div>
            </header>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-slate-200">
                <table className="min-w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">日付</th>
                            <th scope="col" className="px-6 py-3 font-semibold">名前</th>
                            <th scope="col" className="px-6 py-3 font-semibold">出席時間</th>
                            <th scope="col" className="px-6 py-3 font-semibold">退席時間</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.sort((a, b) => a.name.localeCompare(b.name, 'ja')).map((rec, index) => (
                            <tr key={`${rec.name}-${index}`} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4">{rec.date}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{rec.name}</td>
                                <td className="px-6 py-4 font-mono font-semibold text-emerald-600">{rec.checkInTime ?? <span className="text-slate-400 font-normal">N/A</span>}</td>
                                <td className="px-6 py-4 font-mono font-semibold text-blue-600">{rec.checkOutTime ?? <span className="text-slate-400 font-normal">N/A</span>}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    この日付の記録はありません。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- User View Components --- //

const Header = ({ onAdminClick }: { onAdminClick: () => void; }) => (
    <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">将棋班 出欠管理</h1>
        <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <UserGroupIcon />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </header>
);

const MemberGrid = ({ statuses, onSelectMember }: { statuses: Record<string, AttendanceStatus>; onSelectMember: (name: string) => void; }) => {
    const statusClasses: Record<AttendanceStatus, string> = {
      attended: 'bg-emerald-500 text-white hover:bg-emerald-600 ring-emerald-400',
      left: 'bg-blue-500 text-white hover:bg-blue-600 ring-blue-400',
      absent: 'bg-white text-slate-800 hover:bg-slate-100 ring-slate-400 border border-slate-200'
    };
    return(
        <div className="p-4 md:p-6">
            <div className="flex justify-center items-center space-x-6 mb-6 text-sm text-slate-600">
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-emerald-500"></div><span>出席</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span>退室</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-white border border-slate-400"></div><span>未記録</span></div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 max-w-6xl mx-auto">
                {MEMBER_NAMES.map(name => {
                    const status = statuses[name] || 'absent';
                    return (
                        <button key={name} onClick={() => onSelectMember(name)}
                            className={`p-4 text-lg font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${statusClasses[status]}`}>
                            {name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ActionModal = ({ member, onRecord, onClose, isLoading }: { member: string | null; onRecord: (type: '出席' | '退室') => void; onClose: () => void; isLoading: boolean; }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="relative p-8 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex justify-center items-center rounded-xl">
             <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        )}
        <h3 className="text-3xl font-bold text-slate-800 mb-6 text-center">{member}</h3>
        <div className="flex justify-center space-x-4">
            <button onClick={() => onRecord('出席')} disabled={isLoading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">出席</button>
            <button onClick={() => onRecord('退室')} disabled={isLoading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed">退室</button>
        </div>
        <button onClick={onClose} disabled={isLoading} className="mt-8 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-lg transition duration-200">戻る</button>
      </div>
    </div>
  );
};


const UserView = ({ onAdminClick }: { onAdminClick: () => void }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<AppMessage | null>(null);

  const fetchStatus = useCallback(() => {
    setIsLoading(true);
    gasRun<AttendanceRecord[]>('getTodayStatus')
      .then(setRecords)
      .catch(err => setMessage({ text: `状態の取得に失敗: ${(err as Error).message}`, type: 'error' }))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const statusMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    records.forEach(record => {
      if (record.checkInTime && record.checkOutTime) {
        map[record.name] = 'left';
      } else if (record.checkInTime) {
        map[record.name] = 'attended';
      }
    });
    return map;
  }, [records]);

  const handleRecord = useCallback(async (type: '出席' | '退室') => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const resultMessage = await gasRun<string>('recordAttendance', selectedMember, type);
      setMessage({ text: resultMessage, type: 'success' });
      fetchStatus();
    } catch (err) {
      setMessage({ text: `エラー: ${(err as Error).message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      setSelectedMember(null);
    }
  }, [selectedMember, fetchStatus]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAdminClick={onAdminClick}/>
      <main>
        {isLoading && !selectedMember && <Spinner />}
        <MessageDisplay message={message} />
        <ActionModal 
            member={selectedMember} 
            onRecord={handleRecord}
            onClose={() => setSelectedMember(null)}
            isLoading={isSubmitting}
        />
        <MemberGrid statuses={statusMap} onSelectMember={setSelectedMember} />
      </main>
    </div>
  );
};


// --- Main App Component --- //

function App() {
    type View = 'user' | 'adminLogin' | 'adminDashboard';
    const [view, setView] = useState<View>('user');
    const [isAdmin, setIsAdmin] = useState(false);

    const handleLogin = () => {
        setIsAdmin(true);
        setView('adminDashboard');
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setView('user');
    };

    switch (view) {
        case 'adminLogin':
            return <AdminLoginScreen onLogin={handleLogin} onBack={() => setView('user')} />;
        case 'adminDashboard':
            return isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <AdminLoginScreen onLogin={handleLogin} onBack={() => setView('user')} />;
        case 'user':
        default:
            return <UserView onAdminClick={() => setView('adminLogin')} />;
    }
}

export default App;
