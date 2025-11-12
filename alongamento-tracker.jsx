import React, { useState, useEffect } from 'react';
import { Clock, CheckSquare, Activity, BarChart3, QrCode } from 'lucide-react';

export default function AlongamentoTracker() {
  const [activeTab, setActiveTab] = useState('timer');
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [painLevel, setPainLevel] = useState(5);
  const [dailyChecklist, setDailyChecklist] = useState([
    { id: 1, text: 'Alongamento cervical', completed: false },
    { id: 2, text: 'Alongamento de ombros', completed: false },
    { id: 3, text: 'Alongamento lombar', completed: false },
    { id: 4, text: 'Alongamento de quadríceps', completed: false },
    { id: 5, text: 'Alongamento de isquiotibiais', completed: false }
  ]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('⏰ Timer finalizado! Parabéns pelo alongamento!');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMinutes * 60);
  };

  const setTimer = (minutes) => {
    setTimerMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const toggleChecklistItem = (id) => {
    setDailyChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const saveProgress = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const completedTasks = dailyChecklist.filter(item => item.completed).length;
    const newEntry = {
      date: today,
      completedTasks,
      totalTasks: dailyChecklist.length,
      painLevel
    };
    setProgressHistory(prev => [...prev, newEntry]);
    alert('✅ Progresso salvo com sucesso!');
  };

  const getPainColor = (level) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPainEmoji = (level) => {
    if (level === 0) return '😊';
    if (level <= 2) return '🙂';
    if (level <= 4) return '😐';
    if (level <= 6) return '😟';
    if (level <= 8) return '😣';
    return '😫';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Fisio Tracker</h1>
              <p className="text-gray-600">Acompanhamento de Alongamento e Dor</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <QrCode size={24} />
            </button>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="bg-indigo-50 p-6 rounded-xl text-center mb-4">
              <div className="bg-white p-4 inline-block rounded-lg mb-3">
                <svg width="200" height="200" viewBox="0 0 29 29">
                  <rect width="29" height="29" fill="white"/>
                  <g fill="black">
                    {/* QR Code pattern simplificado */}
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="22" y="0" width="7" height="7"/>
                    <rect x="0" y="22" width="7" height="7"/>
                    <rect x="2" y="2" width="3" height="3" fill="white"/>
                    <rect x="24" y="2" width="3" height="3" fill="white"/>
                    <rect x="2" y="24" width="3" height="3" fill="white"/>
                    
                    {/* Pattern data */}
                    <rect x="9" y="1" width="1" height="1"/>
                    <rect x="11" y="1" width="1" height="1"/>
                    <rect x="13" y="1" width="1" height="1"/>
                    <rect x="15" y="1" width="1" height="1"/>
                    <rect x="17" y="1" width="1" height="1"/>
                    <rect x="19" y="1" width="1" height="1"/>
                    
                    <rect x="9" y="3" width="1" height="1"/>
                    <rect x="13" y="3" width="1" height="1"/>
                    <rect x="17" y="3" width="1" height="1"/>
                    <rect x="19" y="3" width="1" height="1"/>
                    
                    <rect x="9" y="5" width="1" height="1"/>
                    <rect x="11" y="5" width="1" height="1"/>
                    <rect x="15" y="5" width="1" height="1"/>
                    <rect x="19" y="5" width="1" height="1"/>
                    
                    <rect x="1" y="9" width="1" height="1"/>
                    <rect x="3" y="9" width="1" height="1"/>
                    <rect x="5" y="9" width="1" height="1"/>
                    <rect x="9" y="9" width="1" height="1"/>
                    <rect x="13" y="9" width="1" height="1"/>
                    <rect x="17" y="9" width="1" height="1"/>
                    <rect x="23" y="9" width="1" height="1"/>
                    <rect x="27" y="9" width="1" height="1"/>
                    
                    <rect x="1" y="11" width="1" height="1"/>
                    <rect x="5" y="11" width="1" height="1"/>
                    <rect x="9" y="11" width="1" height="1"/>
                    <rect x="11" y="11" width="1" height="1"/>
                    <rect x="15" y="11" width="1" height="1"/>
                    <rect x="19" y="11" width="1" height="1"/>
                    <rect x="23" y="11" width="1" height="1"/>
                    
                    <rect x="9" y="13" width="1" height="1"/>
                    <rect x="13" y="13" width="1" height="1"/>
                    <rect x="15" y="13" width="1" height="1"/>
                    <rect x="17" y="13" width="1" height="1"/>
                    <rect x="19" y="13" width="1" height="1"/>
                    
                    <rect x="1" y="15" width="1" height="1"/>
                    <rect x="3" y="15" width="1" height="1"/>
                    <rect x="9" y="15" width="1" height="1"/>
                    <rect x="13" y="15" width="1" height="1"/>
                    <rect x="17" y="15" width="1" height="1"/>
                    <rect x="23" y="15" width="1" height="1"/>
                    <rect x="25" y="15" width="1" height="1"/>
                    
                    <rect x="1" y="17" width="1" height="1"/>
                    <rect x="5" y="17" width="1" height="1"/>
                    <rect x="11" y="17" width="1" height="1"/>
                    <rect x="15" y="17" width="1" height="1"/>
                    <rect x="19" y="17" width="1" height="1"/>
                    <rect x="25" y="17" width="1" height="1"/>
                    
                    <rect x="1" y="19" width="1" height="1"/>
                    <rect x="3" y="19" width="1" height="1"/>
                    <rect x="5" y="19" width="1" height="1"/>
                    <rect x="9" y="19" width="1" height="1"/>
                    <rect x="13" y="19" width="1" height="1"/>
                    <rect x="17" y="19" width="1" height="1"/>
                    <rect x="19" y="19" width="1" height="1"/>
                    <rect x="23" y="19" width="1" height="1"/>
                    <rect x="27" y="19" width="1" height="1"/>
                    
                    <rect x="9" y="23" width="1" height="1"/>
                    <rect x="11" y="23" width="1" height="1"/>
                    <rect x="15" y="23" width="1" height="1"/>
                    <rect x="19" y="23" width="1" height="1"/>
                    
                    <rect x="9" y="25" width="1" height="1"/>
                    <rect x="13" y="25" width="1" height="1"/>
                    <rect x="15" y="25" width="1" height="1"/>
                    <rect x="17" y="25" width="1" height="1"/>
                    
                    <rect x="9" y="27" width="1" height="1"/>
                    <rect x="11" y="27" width="1" height="1"/>
                    <rect x="13" y="27" width="1" height="1"/>
                    <rect x="17" y="27" width="1" height="1"/>
                    <rect x="19" y="27" width="1" height="1"/>
                  </g>
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                Escaneie para acessar em outro dispositivo
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Compartilhe com seus pacientes
              </p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'timer', label: 'Timer', icon: Clock },
              { id: 'checklist', label: 'Checklist', icon: CheckSquare },
              { id: 'dor', label: 'Escala de Dor', icon: Activity },
              { id: 'progresso', label: 'Progresso', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Timer de Alongamento
            </h2>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-indigo-600 mb-6">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex justify-center gap-3 mb-6">
                <button
                  onClick={startTimer}
                  disabled={isRunning}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Iniciar
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!isRunning}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Pausar
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Resetar
                </button>
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                {[1, 3, 5, 10, 15].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setTimer(mins)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      timerMinutes === mins
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Checklist Diário de Alongamentos
            </h2>
            
            <div className="space-y-3 mb-6">
              {dailyChecklist.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className={`text-lg ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-center text-gray-700">
                Concluído: <span className="font-bold text-indigo-600">
                  {dailyChecklist.filter(i => i.completed).length} / {dailyChecklist.length}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Pain Scale Tab */}
        {activeTab === 'dor' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Escala de Dor
            </h2>
            
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">{getPainEmoji(painLevel)}</div>
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {painLevel}
              </div>
              <div className="text-gray-600">
                {painLevel === 0 && 'Sem dor'}
                {painLevel > 0 && painLevel <= 3 && 'Dor leve'}
                {painLevel > 3 && painLevel <= 6 && 'Dor moderada'}
                {painLevel > 6 && painLevel <= 8 && 'Dor intensa'}
                {painLevel > 8 && 'Dor muito intensa'}
              </div>
            </div>

            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #fbbf24 50%, #ef4444 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0 - Sem dor</span>
                <span>10 - Pior dor</span>
              </div>
            </div>

            <div className="grid grid-cols-11 gap-1 mb-6">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPainLevel(i)}
                  className={`py-2 rounded font-medium text-sm transition ${
                    painLevel === i
                      ? `${getPainColor(i)} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progresso' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Histórico de Progresso
            </h2>

            <button
              onClick={saveProgress}
              className="w-full mb-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Salvar Progresso de Hoje
            </button>

            {progressHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhum registro ainda</p>
                <p className="text-sm">Salve seu primeiro progresso!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progressHistory.map((entry, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{entry.date}</p>
                        <p className="text-sm text-gray-600">
                          Tarefas: {entry.completedTasks}/{entry.totalTasks}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Nível de dor</p>
                        <p className="text-2xl font-bold">{entry.painLevel} {getPainEmoji(entry.painLevel)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(entry.completedTasks / entry.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>💙 Ferramenta de acompanhamento fisioterapêutico</p>
          <p className="text-xs mt-1">Consulte sempre seu médico ortopedista</p>
        </div>
      </div>
    </div>
  );
}