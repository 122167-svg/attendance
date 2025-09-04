import React, { useState, useEffect, useCallback } from 'react';

// --- Merged from constants.ts ---
const MEMBER_NAMES: string[] = [
  "熱田 望", "池田 大翔", "岩間 悠希", "白石 怜大", "高椋 煌生",
  "布施 皓己", "吉井 千智", "秋山 七星", "大庭 悠誠", "熊谷 流星",
  "佐藤 勘太", "下田 聖", "遅 志丞", "皆川 哲弥", "宮崎 惺也",
  "山崎 泰蔵", "片山 幸典", "葛石 知佑", "金 悠鉉", "小林 慈人",
  "坂内 元気", "下村 篤生", "染谷 尚太朗", "高木 翔玄", "棚瀬 侑真",
  "中野 琥太郎", "西内 幸輝", "野田 慧", "秀村 紘嗣", "船津 太一",
  "槇 啓秀", "松井 俐真", "森本 直樹", "山田 悠聖", "若林 空",
  "小畑 高慈", "龍口 直史"
];

// --- Merged from types.ts ---
type AttendanceStatus = 'attended' | 'left' | 'absent';
type StatusMap = Record<string, AttendanceStatus>;
interface AppMessage {
  text: string;
  type: 'success' | 'error';
}

// --- Merged from gasService.ts ---
// This allows TypeScript to recognize the google.script.run API
// provided by the Google Apps Script environment.
declare global {
  // We are defining this in the global scope
  // eslint-disable-next-line no-unused-vars
  namespace google.script {
    interface Runner {
      withSuccessHandler(callback: (result: any) => void): Runner;
      withFailureHandler(callback: (error: Error) => void): Runner;
      [functionName: string]: (...args: any[]) => void;
    }
  }

  // eslint-disable-next-line no-unused-vars
  const google: {
    script: {
      run: google.script.Runner;
    }
  };
}

/**
 * Executes a Google Apps Script function and returns a Promise.
 * This simplifies server-side calls from the client-side React code.
 * @param functionName The name of the function to call in your Apps Script project.
 * @param args The arguments to pass to the function.
 * @returns A Promise that resolves with the return value of the Apps Script function.
 */
const gasRun = <T,>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result: T) => resolve(result))
      .withFailureHandler((error: Error) => reject(error))
      [functionName](...args);
  });
};


// --- Icon Components --- //

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FullscreenEnterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9.75 9.75M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L14.25 9.75M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9.75 14.25m10.5 6L14.25 14.25" />
  </svg>
);

const FullscreenExitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
  </svg>
);


// --- UI Components --- //

const Header: React.FC = () => (
  <header className="w-full bg-white shadow-md p-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">将棋班 出欠管理アプリ</h1>
      <div className="mt-4 text-sm text-slate-600 bg-slate-100 p-3 rounded-lg max-w-md mx-auto">
        <div className="flex justify-center items-center space-x-6 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-emerald-400"></div>
            <span>出席済み</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-rose-400"></div>
            <span>退室済み</span>
          </div>
        </div>
        <p className="text-xs text-left">
          名前をクリックして「出席」か「退室」を選択してください。操作後にメッセージが表示されます。
        </p>
      </div>
    </div>
  </header>
);

const MessageDisplay: React.FC<{ message: AppMessage | null }> = ({ message }) => {
  if (!message) return null;

  const isSuccess = message.type === 'success';
  const bgColor = isSuccess ? 'bg-emerald-500' : 'bg-rose-500';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-3 rounded-lg text-white shadow-lg animate-fade-in-down ${bgColor}`}>
      <Icon className="h-6 w-6 mr-2" />
      <span className="font-semibold">{message.text}</span>
    </div>
  );
};

const Spinner: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

interface MemberGridProps {
  statuses: StatusMap;
  onSelectMember: (name: string) => void;
}

const MemberGrid: React.FC<MemberGridProps> = ({ statuses, onSelectMember }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 p-4 md:p-6 max-w-4xl mx-auto">
    {MEMBER_NAMES.map(name => {
      const status = statuses[name] || 'absent';
      const statusClasses: Record<AttendanceStatus, string> = {
        attended: 'bg-emerald-400 text-white hover:bg-emerald-500',
        left: 'bg-rose-400 text-white hover:bg-rose-500',
        absent: 'bg-white text-slate-700 hover:bg-slate-200'
      };
      return (
        <button
          key={name}
          onClick={() => onSelectMember(name)}
          className={`p-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${statusClasses[status]}`}
        >
          {name}
        </button>
      );
    })}
  </div>
);


interface ActionPanelProps {
    selectedMember: string;
    onRecord: (type: '出席' | '退室') => void;
    onBack: () => void;
}
const ActionPanel: React.FC<ActionPanelProps> = ({ selectedMember, onRecord, onBack }) => (
    <div className="p-6 max-w-md mx-auto my-8 text-center bg-white rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">{selectedMember} さん</h3>
        <div className="flex justify-center space-x-4">
            <button
                onClick={() => onRecord('出席')}
                className="w-32 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-lg shadow-md hover:shadow-lg"
            >
                出席
            </button>
            <button
                onClick={() => onRecord('退室')}
                className="w-32 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-lg shadow-md hover:shadow-lg"
            >
                退室
            </button>
        </div>
        <button
            onClick={onBack}
            className="mt-8 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
        >
            戻る
        </button>
    </div>
);

const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
      aria-label={isFullscreen ? "全画面解除" : "全画面表示"}
    >
      {isFullscreen ? <FullscreenExitIcon className="h-6 w-6" /> : <FullscreenEnterIcon className="h-6 w-6" />}
    </button>
  );
};


// --- Main App Component --- //

function App() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<AppMessage | null>(null);

  const fetchStatus = useCallback(() => {
    setIsLoading(true);
    gasRun<StatusMap>('getTodayStatus')
      .then(result => {
        setStatuses(result);
      })
      .catch(err => {
        const error = err as Error;
        setMessage({ text: `状態の取得に失敗: ${error.message}`, type: 'error' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSelectMember = useCallback((name: string) => {
    setSelectedMember(name);
  }, []);

  const handleRecord = useCallback(async (type: '出席' | '退室') => {
    if (!selectedMember) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const resultMessage = await gasRun<string>('recordAttendance', selectedMember, type);
      
      setStatuses(prev => ({
        ...prev,
        [selectedMember]: type === '出席' ? 'attended' : 'left',
      }));
      
      setMessage({ text: resultMessage, type: 'success' });
      setSelectedMember(null); // Go back to the grid view
    } catch (err) {
      const error = err as Error;
      setMessage({ text: `エラー: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMember]);

  const handleGoBack = useCallback(() => {
    setSelectedMember(null);
    fetchStatus(); // Refresh data when going back to the main list
  }, [fetchStatus]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {isLoading && <Spinner />}
        <MessageDisplay message={message} />
        <FullscreenButton />
        {selectedMember ? (
          <ActionPanel 
            selectedMember={selectedMember} 
            onRecord={handleRecord} 
            onBack={handleGoBack}
          />
        ) : (
          <MemberGrid 
            statuses={statuses} 
            onSelectMember={handleSelectMember} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
