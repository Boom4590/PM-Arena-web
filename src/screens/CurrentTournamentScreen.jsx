import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../UserContext';
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Цветовая схема в стиле киберспорта
const COLORS = {
  primary: '#121212',
  cardBg: '#1E1E1E',
  accent: '#F0A400',
  secondary: '#29B6F6',
  error: '#D7263D',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#4CAF50',
  warning: '#FF9800'
};

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

export default function CurrentTournament() {
  const { userInfo } = useContext(UserContext);
  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);
  const [lobbyCountdown, setLobbyCountdown] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [copied, setCopied] = useState({ room: false, password: false });

  const pollingRef = useRef(null);
  const lobbyTimerRef = useRef(null);
  const navigate = useNavigate();

  // --- Функции-хелперы ---
  function clearLobbyTimer() {
    if (lobbyTimerRef.current) {
      clearInterval(lobbyTimerRef.current);
      lobbyTimerRef.current = null;
    }
  }

  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    }).catch(err => {
      console.error('Не удалось скопировать текст: ', err);
    });
  }

  const openLobbyPubg = () => {
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
    
    fetchCurrentTournament();
    
    pollingRef.current = setInterval(fetchCurrentTournament, 20000);

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
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>Текущий турнир не найден</h3>
          <p style={styles.emptyText}>Участвуйте в турнирах, чтобы видеть здесь активные события</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={styles.tournamentsButton}
            onClick={() => navigate('/tournaments')}
          >
            Посмотреть турниры
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Текущий турнир</h1>
        <p style={styles.subtitle}>#{tournament.id} · {tournament.mode}</p>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>
          Дата начала: {formatStartDate(startTime)}
        </p>
      </motion.div>

      {!lobbyVisible && lobbyCountdown !== null && (
        <motion.div 
          style={styles.lobbyCountdownBox}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div style={styles.lobbyCountdownIcon}>🔒</div>
          <div style={styles.lobbyCountdownText}>
            Доступ к лобби откроется через: 
            <span style={styles.lobbyCountdownTime}> {lobbyCountdown} сек</span>
          </div>
        </motion.div>
      )}

      {lobbyVisible && (
        <motion.div 
          style={styles.lobbyBox}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div style={styles.lobbyHeader}>
            <div style={styles.lobbyIcon}>🎮</div>
            <h3 style={styles.lobbyTitle}>Данные лобби</h3>
          </div>

          <div style={styles.lobbyInfo}>
            <div style={styles.lobbyField}>
              <div style={styles.lobbyLabel}>ID комнаты:</div>
              <div style={styles.lobbyValueContainer}>
                <div style={styles.lobbyValue}>{tournament.room_id}</div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={styles.copyButton}
                  onClick={() => copyToClipboard(tournament.room_id, 'room')}
                >
                  <MdContentCopy size={18} color={copied.room ? COLORS.accent : COLORS.textSecondary} />
                </motion.button>
                {copied.room && <div style={styles.copiedText}>Скопировано!</div>}
              </div>
            </div>

            <div style={styles.lobbyField}>
              <div style={styles.lobbyLabel}>Пароль:</div>
              <div style={styles.lobbyValueContainer}>
                <div style={styles.lobbyValue}>{tournament.room_password}</div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={styles.copyButton}
                  onClick={() => copyToClipboard(tournament.room_password, 'password')}
                >
                  <MdContentCopy size={18} color={copied.password ? COLORS.accent : COLORS.textSecondary} />
                </motion.button>
                {copied.password && <div style={styles.copiedText}>Скопировано!</div>}
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={styles.openPubgButton}
            onClick={openLobbyPubg}
          >
            Открыть PUBG Mobile
          </motion.button>
        </motion.div>
      )}

      <div style={styles.content}>
        <motion.div 
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>⏱️</div>
            <div>
              <div style={styles.cardLabel}>До начала турнира</div>
              <div style={styles.cardValue}>{formatTimeWithDays(timeLeft)}</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          style={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>📍</div>
            <div>
              <div style={styles.cardLabel}>Ваше место</div>
              <div style={styles.cardValue}>#{tournament.seat}</div>
            </div>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          style={styles.viewSlotButton}
          onClick={() => navigate(`/lobby?currentUserSlot=${tournament.seat}`)}
        >
          Посмотреть мой слот в лобби
        </motion.button>
      </div>
    </div>
  );
}

// Форматирование даты старта турнира
function formatStartDate(timestamp) {
  if (!timestamp) return '';
  const options = {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  };
  return new Date(timestamp).toLocaleString('ru-RU', options);
}

// Форматирование таймера с днями
function formatTimeWithDays(sec) {
  if (sec == null || sec < 0) return '00:00:00:00';
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:` + 
         `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: '16px',
    minHeight: '100vh',
    fontFamily: '"Rajdhani", "Arial Narrow", sans-serif',
  },
  header: {
    marginBottom: '24px',
    padding: '0 8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    background: `linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 15px rgba(240, 164, 0, 0.3)',
  },
  subtitle: {
    fontSize: '16px',
    color: COLORS.textSecondary,
    margin: '8px 0 0',
  },
  content: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    background: COLORS.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  cardIcon: {
    fontSize: '32px',
    background: 'rgba(41, 182, 246, 0.1)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.secondary,
  },
  cardLabel: {
    fontSize: '16px',
    color: COLORS.textSecondary,
    marginBottom: '4px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: COLORS.text,
  },
  viewSlotButton: {
    background: `linear-gradient(45deg, ${COLORS.accent}, #FF8C00)`,
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: '16px',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s ease',
  },
  lobbyCountdownBox: {
    background: COLORS.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
  },
  lobbyCountdownIcon: {
    fontSize: '32px',
    background: 'rgba(240, 164, 0, 0.1)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.accent,
  },
  lobbyCountdownText: {
    fontSize: '16px',
    color: COLORS.text,
    fontWeight: 600,
  },
  lobbyCountdownTime: {
    color: COLORS.accent,
    fontWeight: 700,
    marginLeft: '4px',
  },
  lobbyBox: {
    background: COLORS.cardBg,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '8px',
  },
  lobbyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  lobbyIcon: {
    fontSize: '32px',
    background: 'rgba(240, 164, 0, 0.1)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.accent,
  },
  lobbyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
  },
  lobbyInfo: {
    display: 'grid',
    gap: '16px',
  },
  lobbyField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  lobbyLabel: {
    fontSize: '14px',
    color: COLORS.textSecondary,
    fontWeight: 600,
  },
  lobbyValueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  lobbyValue: {
    flex: 1,
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.text,
    userSelect: 'all',
  },
  copyButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
  },
  copiedText: {
    color: COLORS.accent,
    fontSize: '12px',
    fontWeight: 600,
    userSelect: 'none',
  },
  openPubgButton: {
    marginTop: '20px',
    width: '100%',
    background: `linear-gradient(45deg, ${COLORS.accent}, #FF8C00)`,
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: '18px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '80px',
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '12px',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  tournamentsButton: {
    background: `linear-gradient(45deg, ${COLORS.accent}, #FF8C00)`,
    border: 'none',
    borderRadius: '12px',
    color: COLORS.primary,
    padding: '14px 28px',
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
