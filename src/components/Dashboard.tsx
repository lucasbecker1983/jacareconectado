import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogOut, Camera, Play, Server, HardDrive, Activity, Clock, RefreshCw, Users, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import UserManagement from './UserManagement';
import SidebarProgressBar from './SidebarProgressBar';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [view, setView] = useState<'dashboard' | 'camera' | 'users'>('dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [cameras, setCameras] = useState<string[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [indexingStatus, setIndexingStatus] = useState({ is_indexing: false, progress: 0, total: 0, processed: 0 });
  const [isRecordingsLoading, setIsRecordingsLoading] = useState(false);

  useEffect(() => { loadStats(); loadCameras(); }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const res = await api.get('/index/status');
            setIndexingStatus(res.data);
            if (res.data.is_indexing) {
                if (res.data.processed % 100 === 0) loadCameras();
            }
        } catch(e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCamera && view === 'camera') {
        setIsRecordingsLoading(true);
        loadAvailableDates(selectedCamera).then(dates => {
            if (dates && dates.length > 0) {
                const lastDate = parseISO(dates[0]);
                setDate(lastDate);
            }
            loadRecordings(selectedCamera, dates && dates.length > 0 ? parseISO(dates[0]) : date);
        });
    }
  }, [selectedCamera, view]);

  const onDateChange = (newDate: Date) => {
      setDate(newDate);
      if(selectedCamera) loadRecordings(selectedCamera, newDate);
  }

  const loadStats = async () => { try { const res = await api.get('/dashboard/stats'); setStats(res.data); } catch(e) {} };
  const loadCameras = async () => { try { const res = await api.get('/cameras'); setCameras(res.data); } catch(e) {} };
  
  const loadAvailableDates = async (cam: string) => {
      try {
          const res = await api.get(`/cameras/${cam}/dates`);
          setAvailableDates(res.data);
          return res.data;
      } catch (e) { return []; }
  };

  const loadRecordings = async (cam: string, targetDate: Date) => {
    setIsRecordingsLoading(true);
    try {
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const res = await api.get(`/recordings?camera=${cam}&date=${dateStr}`);
      setRecordings(res.data);
    } catch(e) {
      setRecordings([]);
    } finally {
      setIsRecordingsLoading(false);
    }
  };

  const handleCameraSelect = (cam: string) => { 
      setSelectedCamera(cam); 
      setView('camera'); 
      setRecordings([]);
      setCurrentVideo(null);
      setAvailableDates([]);
      setVideoError('');
  };

  const forceIndex = async () => {
    try {
        await api.post('/index/force');
        setIndexingStatus(prev => ({ ...prev, is_indexing: true, progress: 1 }));
    } catch (e) { alert("Erro ao iniciar indexação"); }
  };

  const selectVideo = (rec: any) => {
      setCurrentVideo(rec);
      setIsVideoLoading(true);
      setVideoError('');
      
      // Reset do vídeo
      if (videoRef.current) {
          videoRef.current.load();
      }
  };

  const tileClassName = ({ date, view }: any) => {
      if (view === 'month' && availableDates.includes(format(date, 'yyyy-MM-dd'))) {
          return 'text-blue-600 font-bold bg-blue-50 rounded-full hover:bg-blue-100';
      }
      return null;
  };

  const handleVideoError = (e: any) => {
      console.error("Erro no vídeo:", e);
      setIsVideoLoading(false);
      
      const target = e.target as HTMLVideoElement;
      const error = target.error;
      
      let errorMessage = "Erro ao carregar vídeo";
      
      if (error) {
          switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                  errorMessage = "Carregamento abortado. Tente novamente.";
                  break;
              case error.MEDIA_ERR_NETWORK:
                  errorMessage = "Erro de rede ao carregar vídeo";
                  break;
              case error.MEDIA_ERR_DECODE:
                  errorMessage = "Erro ao decodificar o vídeo";
                  break;
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMessage = "Formato de vídeo não suportado";
                  break;
          }
      }
      
      setVideoError(errorMessage);
  };

  const handleVideoCanPlay = () => {
      setIsVideoLoading(false);
      setVideoError('');
  };

  const handleVideoLoadStart = () => {
      setIsVideoLoading(true);
      setVideoError('');
  };

  const retryVideo = () => {
      if (videoRef.current && currentVideo) {
          setVideoError('');
          setIsVideoLoading(true);
          videoRef.current.load();
          videoRef.current.play().catch(err => {
              console.error("Erro ao reproduzir:", err);
              setVideoError("Não foi possível reproduzir o vídeo");
              setIsVideoLoading(false);
          });
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden">
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 relative`}>
        <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 ${isSidebarCollapsed ? 'text-xl text-center' : 'text-2xl'}`}>{isSidebarCollapsed ? 'S' : 'SIVI'}</h1>
          {!isSidebarCollapsed && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">BeckerCorp System v3.1</p>}
        </div>
        <SidebarProgressBar status={indexingStatus} isCollapsed={isSidebarCollapsed} />
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            {!isSidebarCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Menu</h3>}
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Activity size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>
            <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'users' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Users size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Usuários</span>}
            </button>
          </div>
          <div>
            {!isSidebarCollapsed && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Câmeras</h3>}
            <div className="space-y-1">
                {cameras.map(cam => (
                <button key={cam} onClick={() => handleCameraSelect(cam)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${selectedCamera === cam && view === 'camera' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <Camera size={20} className="shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium truncate capitalize">{cam}</span>}
                </button>
                ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800"><button onClick={logout} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium w-full px-2"><LogOut size={20} className="shrink-0" /> {!isSidebarCollapsed && <span>Sair</span>}</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
        <header className="h-16 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
            {view === 'dashboard' ? 'Visão Geral' : view === 'users' ? 'Controle de Acesso' : `Monitorando: ${selectedCamera}`}
          </h1>
          <div className="flex items-center gap-4">
             <button 
                onClick={forceIndex} 
                disabled={indexingStatus.is_indexing}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${indexingStatus.is_indexing ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'}`}
             >
                <RefreshCw size={16} className={indexingStatus.is_indexing ? "animate-spin" : ""} />
                {indexingStatus.is_indexing ? "Indexando..." : "Reindexar Sistema"}
             </button>
             
             <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 font-mono">UPTIME: {stats?.uptime || '...'}</div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md">{user?.sub?.[0].toUpperCase()}</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
            {view === 'dashboard' && stats && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4"><div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Camera size={24} /></div><div><p className="text-sm text-gray-500">Câmeras</p><h3 className="text-2xl font-bold dark:text-white">{stats.total_cameras}</h3></div></div>
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4"><div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Activity size={24} /></div><div><p className="text-sm text-gray-500">Gravações</p><h3 className="text-2xl font-bold dark:text-white">{stats.total_recordings}</h3></div></div>
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4"><div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl"><HardDrive size={24} /></div><div><p className="text-sm text-gray-500">Disco</p><h3 className="text-2xl font-bold dark:text-white">{stats.disk_usage_percent}%</h3></div></div>
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4"><div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl"><Server size={24} /></div><div><p className="text-sm text-gray-500">Status</p><h3 className="text-2xl font-bold text-green-500">Online</h3></div></div>
                    </div>
                </div>
            )}

            {view === 'users' && <UserManagement />}

            {view === 'camera' && (
                <div className="flex flex-col xl:flex-row gap-6 h-full">
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden relative flex items-center justify-center group" style={{ maxHeight: '75vh', aspectRatio: '16/9' }}>
                            {currentVideo ? (
                                <>
                                    <video 
                                        ref={videoRef} 
                                        key={`${selectedCamera}-${currentVideo.id}`}
                                        className="w-full h-full object-contain" 
                                        controls 
                                        preload="metadata"
                                        playsInline
                                        onLoadStart={handleVideoLoadStart}
                                        onCanPlay={handleVideoCanPlay}
                                        onError={handleVideoError}
                                        src={`https://cameras.jacarezinho.cloud/api/stream/${currentVideo.id}`}
                                    >
                                        Seu navegador não suporta vídeos.
                                    </video>
                                    
                                    {isVideoLoading && !videoError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
                                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                                        </div>
                                    )}
                                    
                                    {videoError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6 text-center">
                                            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                                            <p className="text-white text-lg font-semibold mb-2">Erro ao carregar vídeo</p>
                                            <p className="text-gray-400 text-sm mb-6 max-w-md">{videoError}</p>
                                            <button 
                                                onClick={retryVideo}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                            >
                                                🔄 Tentar novamente
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-gray-500 space-y-4"><div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto"><Play size={32} className="text-gray-600 ml-1" /></div><p>Selecione uma gravação</p></div>
                            )}
                            {currentVideo && !isVideoLoading && !videoError && <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">{currentVideo.duration_label || currentVideo.filename}</div>}
                        </div>
                        <div className="mt-4 flex items-center justify-between px-2">
                            <div><h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{selectedCamera}</h2><p className="text-sm text-gray-500">{format(date, 'dd ')} de {format(date, 'MMMM, yyyy', { locale: ptBR })}</p></div>
                        </div>
                    </div>
                    <div className="w-full xl:w-96 flex flex-col gap-6 h-full overflow-hidden">
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800"><Calendar onChange={(val) => onDateChange(val as Date)} value={date} locale="pt-BR" className="w-full border-none" tileClassName={tileClassName} /></div>
                        <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Clock size={16} /> Gravações</h3><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{recordings.length}</span></div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {isRecordingsLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                                ) : recordings.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400 text-sm px-4">Nenhuma gravação encontrada.<br/><span className="text-xs opacity-70">Verifique a data.</span></div>
                                ) : (
                                    recordings.map((rec) => (
                                        <button key={rec.id} onClick={() => selectVideo(rec)} className={`w-full text-left p-3 rounded-xl transition-all border flex items-center gap-3 group ${currentVideo?.id === rec.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                            <div className={`p-2 rounded-lg ${currentVideo?.id === rec.id ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}><Play size={14} className={currentVideo?.id === rec.id ? 'text-white' : 'text-gray-500'} /></div>
                                            <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{rec.duration_label || format(new Date(rec.created_at), 'HH:mm:ss')}</p><p className={`text-xs truncate ${currentVideo?.id === rec.id ? 'text-blue-200' : 'text-gray-400'}`}>{rec.filename}</p></div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
