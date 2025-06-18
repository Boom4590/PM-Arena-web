import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../UserContext'; // Убедитесь, что путь верный
import { MdContentCopy } from "react-icons/md"; // Иконка для копирования
import { useNavigate } from 'react-router-dom';
// Предполагается, что изображение лежит в папке `src/assets`
 import pubgImage from '../assets/pubger.png'; 
// Если изображения нет, можно использовать URL

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

// Внедряем CSS-анимации в документ
const animationStyles = `
  @keyframes glow {
    0% { border-color: #1E90FF; color: #1E90FF; }
    50% { border-color: #00BFFF; color: #00BFFF; }
    100% { border-color: #1E90FF; color: #1E90FF; }
  }
`;

// Helper-компонент для стилей
const StyleInjector = ({ children }) => {
  return (
    <>
      <style>{animationStyles}</style>
      {children}
    </>
  );
};

export default function CurrentTournament() {
  const { userInfo } = useContext(UserContext);
  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);
  const [lobbyCountdown, setLobbyCountdown] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const pollingRef = useRef(null);
  const lobbyTimerRef = useRef(null);

  // --- Функции-хелперы ---
  function clearLobbyTimer() {
    if (lobbyTimerRef.current) {
      clearInterval(lobbyTimerRef.current);
      lobbyTimerRef.current = null;
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Скопировано: ${text}`);
    }).catch(err => {
      console.error('Не удалось скопировать текст: ', err);
      alert('Ошибка при копировании');
    });
  }

  // Заглушка для навигации
    const navigate = useNavigate();
  
  const openLobbyPubg = () => {
    // В вебе мы не можем открыть приложение напрямую, поэтому откроем сайт
    window.open('https://www.pubgmobile.com/', '_blank');
  };

  // --- Основная логика ---
  async function fetchCurrentTournament() {
    try {
      if (!userInfo?.pubg_id) return;

      const res = await fetch(`${BACKEND_URL}/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id: userInfo.pubg_id }),
      });

      if (!res.ok) {
        // Если турнира нет, бэкенд может вернуть ошибку, это нормальное поведение
        setTournament(null);
        return;
      }
      
      const data = await res.json();
      
      if (!data || Object.keys(data).length === 0) {
        setTournament(null);
        return;
      }
      
      setTournament(data);
      
      const startTimeObj = new Date(data.start_time);
      setStartTime(startTimeObj.getTime());
      
      // Логика отображения лобби с задержкой
      clearLobbyTimer();
      const lobbyKey = `lobbyShown_${userInfo.pubg_id}_${data.id}`;
      const lobbyStartKey = `lobbyStart_${userInfo.pubg_id}_${data.id}`;

      // Используем localStorage вместо AsyncStorage
      const storedLobbyShown = localStorage.getItem(lobbyKey);
      const storedLobbyStart = localStorage.getItem(lobbyStartKey);

      if (storedLobbyShown === 'true') {
        setLobbyVisible(true);
        setLobbyCountdown(null);
        return;
      }

      if (data.room_id && data.room_password && data.seat != null) {
        const delaySeconds = data.seat * 5;
        const processLobbyCountdown = (remainingSeconds) => {
          if (remainingSeconds <= 0) {
            setLobbyVisible(true);
            setLobbyCountdown(null);
            localStorage.setItem(lobbyKey, 'true');
            localStorage.removeItem(lobbyStartKey);
          } else {
            setLobbyCountdown(remainingSeconds);
            lobbyTimerRef.current = setInterval(() => {
              setLobbyCountdown(prev => {
                if (prev <= 1) {
                  clearLobbyTimer();
                  setLobbyVisible(true);
                  localStorage.setItem(lobbyKey, 'true');
                  localStorage.removeItem(lobbyStartKey);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          }
        };

        if (storedLobbyStart) {
          const lobbyStartTime = parseInt(storedLobbyStart, 10);
          const elapsed = Math.floor((Date.now() - lobbyStartTime) / 1000);
          processLobbyCountdown(delaySeconds - elapsed);
        } else {
          localStorage.setItem(lobbyStartKey, Date.now().toString());
          processLobbyCountdown(delaySeconds);
        }
      } else {
        setLobbyVisible(false);
        setLobbyCountdown(null);
      }
    } catch (err) {
      console.error(err);
      setTournament(null);
    }
  }

  // Эффекты
  useEffect(() => {
    if (!userInfo || !userInfo.pubg_id) {
      setTournament(null);
      return;
    }
    
    fetchCurrentTournament(); // Первый запуск
    
    pollingRef.current = setInterval(fetchCurrentTournament, 20000); // Опрос каждые 20 сек

    // Обновление данных при возвращении на вкладку (аналог 'focus' в React Navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCurrentTournament();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearLobbyTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userInfo]);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((startTime - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);


  if (!tournament) {
    return (
      <div style={styles.container}>
        <p style={styles.noTournamentText}>У вас нет текущего турнира.</p>
      </div>
    );
  }

  return (
    <StyleInjector>
      <div style={styles.container}>
        <h2 style={styles.title}>
          Турнир #{tournament.id}
          <button style={styles.rulesButton} onClick={() => navigate('/Instruction')}>
             ℹ️
          </button>
        </h2>
        
        {timeLeft !== null && (
          <div style={styles.timerBox}>
            <p style={styles.timerLabel}>Осталось:</p>
            <p style={styles.timer}>{formatTime(timeLeft)}</p>
          </div>
        )}

        <div style={styles.infoBox}>
          <p style={styles.infoText}>Режим: <span style={styles.infoBold}>{tournament.mode}</span></p>
          <p style={styles.infoText}>Начало: <span style={styles.infoBold}>{new Date(tournament.start_time).toLocaleString()}</span></p>
          <p style={styles.infoText}>Ваше место: <span style={styles.infoBold2}>{tournament.seat}</span></p>
          <button style={styles.animatedButton} onClick={() => navigate(`/lobby?currentUserSlot=${tournament.seat}`) }>
            Посмотреть мой слот
          </button>
        </div>

        {!lobbyVisible && lobbyCountdown !== null && (
          <div style={styles.lobbyCountdownBox}>
            <p style={styles.lobbyCountdownText}>
              Лобби появится через: {lobbyCountdown} сек
            </p>
          </div>
        )}

        {lobbyVisible && (
          <div style={styles.lobbyBox}>
            <div style={styles.lobbyHeader}>
              <img src={pubgImage} alt="PUBG Icon" style={styles.lobbyIcon} />
              <p style={styles.lobbyHeaderText}>Данные лобби</p>
            </div>

            <div style={styles.copyRow}>
              <span style={styles.lobbyLabel}>Комната:</span>
              <span style={styles.lobbyValue}>{tournament.room_id}</span>
              <button style={styles.copyButton} onClick={() => copyToClipboard(tournament.room_id)}>
                <MdContentCopy color="#444" size={17} />
              </button>
            </div>

            <div style={styles.copyRow}>
              <span style={styles.lobbyLabel}>Пароль:</span>
              <span style={styles.lobbyValue}>{tournament.room_password}</span>
              <button style={styles.copyButton} onClick={() => copyToClipboard(tournament.room_password)}>
                <MdContentCopy color="#444" size={17} />
              </button>
            </div>
            
            <button style={styles.enterLobbyButton} onClick={openLobbyPubg}>
              <span style={styles.enterLobbyButtonText}>Открыть сайт Pubg Mobile</span>
            </button>
          </div>
        )}
      </div>
    </StyleInjector>
  );
}

function formatTime(sec) {
  if (sec == null || sec < 0) return '00:00:00';
  const days = Math.floor(sec / (3600 * 24));
  const hours = Math.floor((sec % (3600 * 24)) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const dayStr = days > 0 ? `${days}д ` : '';
  return `${dayStr}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = {
  container: {
    
    margin: '0 auto',
    backgroundColor: '#f2f2f7',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  animatedButton: {
    backgroundColor: '#fff',
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1.6px solid',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '12px',
    boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    cursor: 'pointer',
    animation: 'glow 2s infinite ease-in-out', // Применяем CSS анимацию
  },
  enterLobbyButton: {
    backgroundColor: '#666',
    padding: '10px 16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '6px',
    boxShadow: '0 2px 3px rgba(0,0,0,0.3)',
    border: 'none',
    cursor: 'pointer',
  },
  enterLobbyButtonText: {
    color: '#f1c40f', // Золотистый стиль PUBG
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  lobbyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    position: 'relative',
  },
  lobbyIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    objectFit: 'contain',
  },
  lobbyHeaderText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#222',
  },
  title: {
    fontSize: '20px',
    marginTop: '16px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '8px',
    color: '#2c3e50',
  },
  timerBox: {
    backgroundColor: '#fff',
    borderLeft: '3px solid #e74c3c',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  timerLabel: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  timer: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoText: {
    fontSize: '12px',
    color: '#34495e',
    marginBottom: '4px',
  },
  infoBold: {
    fontWeight: '600',
    color: '#333333',
  },
  infoBold2: {
    fontWeight: '800',
    color: '#000',
    marginLeft: '4px'
  },
  lobbyBox: {
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '40px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  },
  copyRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  copyButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px'
  },
  lobbyLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#2c3e50',
    width: '70px',
  },
  lobbyValue: {
    fontSize: '12px',
    color: '#2c3e50',
    flex: 1,
  },
  lobbyCountdownBox: {
    backgroundColor: '#fff',
    borderLeft: '3px solid #2980b9',
    padding: '8px 12px',
    borderRadius: '10px',
    marginBottom: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  lobbyCountdownText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2980b9',
  },
  noTournamentText: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '30px',
  },
  rulesButton: {
    padding: '4px 8px',
    borderRadius: '4px',
    marginLeft: '10px',
    fontSize: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
};