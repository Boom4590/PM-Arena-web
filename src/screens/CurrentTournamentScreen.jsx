import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../UserContext';
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Enhanced color scheme for dark theme
const COLORS = {
  primary: '#0A0A0A',
  cardBg: '#1C2526',
  accent: '#FFD700',
  secondary: '#00B7EB',
  error: '#FF4D4D',
  text: '#E8ECEF',
  textSecondary: '#B0BEC5',
  success: '#4CAF50',
  warning: '#FFB300',
  glow: 'rgba(255, 215, 0, 0.3)',
};

// Backend URL
const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeInOut' }
};

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

const pulse = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.02, 1], boxShadow: `0 0 10px ${COLORS.glow}, 0 0 20px ${COLORS.glow}` },
  transition: { duration: 0.6, repeat: 1, ease: 'easeInOut' }
};

export default function CurrentTournament() {
  const { userInfo } = useContext(UserContext);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lobbyVisible, setLobbyVisible] = useState(false);
  const [lobbyCountdown, setLobbyCountdown] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [copied, setCopied] = useState({ room: false, password: false });

  const pollingRef = useRef(null);
  const lobbyTimerRef = useRef(null);
  const navigate = useNavigate();

  // Helper functions
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
      console.error('Failed to copy text: ', err);
    });
  }

  const openLobbyPubg = () => {
    window.open('https://www.pubgmobile.com/', '_blank');
  };

  // Fetch tournament data
  async function fetchCurrentTournament() {
    try {
      setLoading(true);
      if (!userInfo?.pubg_id) {
        setTournament(null);
        return;
      }

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
    } finally {
      setLoading(false);
    }
  }

  // Effects
  useEffect(() => {
    if (!userInfo || !userInfo.pubg_id) {
      setTournament(null);
      setLoading(false);
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

  // Loading Notwithstanding: Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={styles.spinner}
          />
        </div>
      </div>
    );
  }

  // No tournament found
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
      <motion.div {...fadeIn} style={styles.header}>
        <h1 style={styles.title}>Текущий турнир</h1>
        <p style={styles.subtitle}>#{tournament.id} · {tournament.mode}</p>
        <p style={{ color: COLORS.textSecondary, marginTop: 4 }}>
          Дата начала: {formatStartDate(startTime)}
        </p>
      </motion.div>

      {!lobbyVisible && lobbyCountdown !== null && (
        <motion.div {...slideUp} style={styles.lobbyCountdownBox}>
          <div style={styles.lobbyCountdownIcon}>🔒</div>
          <div style={styles.lobbyCountdownText}>
            Доступ к лобби откроется через:
            <span style={styles.lobbyCountdownTime}> {lobbyCountdown} сек</span>
          </div>
        </motion.div>
      )}

      {lobbyVisible && (
        <motion.div {...pulse} style={styles.lobbyBox}>
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
        {timeLeft > 0 && (
          <motion.div {...slideUp} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>⏱️</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={styles.cardLabel}>ID и Пароль лобби появится через:</div>
                <div style={styles.cardValue}>{formatTimeWithDays(timeLeft)}</div>
              </div>
            </div>
          </motion.div>
        )}
        <motion.div {...slideUp} style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>📍</div>
            <div>
              <div style={styles.cardLabel}>Ваше место</div>
              <div style={styles.cardValue}>#{tournament.seat}</div>
            </div>
          </div>
        </motion.div>
        <motion.button
          {...slideUp}
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

// Format start date
function formatStartDate(timestamp) {
  if (!timestamp) return '';
  const options = {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  };
  return new Date(timestamp).toLocaleString('ru-RU', options);
}

// Format timer with days
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
    padding: '24px',
    minHeight: '100vh',
    fontFamily: '"Rajdhani", "Arial Narrow", sans-serif',
  },
  header: {
    marginBottom: '32px',
    padding: '0 12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
    background: `linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0 0 15px ${COLORS.glow}`,
  },
  subtitle: {
    fontSize: '18px',
    color: COLORS.textSecondary,
    margin: '8px 0 0',
  },
  content: {
    display: 'grid',
    gap: '20px',
  },
  card: {
    background: COLORS.cardBg,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: `0 6px 24px rgba(0, 0, 0, 0.4), 0 0 10px ${COLORS.glow}`,
    border: `1px solid ${COLORS.glow}`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  cardIcon: {
    fontSize: '36px',
    background: `linear-gradient(45deg, rgba(0, 183, 235, 0.2), rgba(0, 183, 235, 0.1))`,
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.secondary,
  },
  cardLabel: {
    fontSize: '18px',
    color: COLORS.textSecondary,
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: COLORS.text,
  },
  viewSlotButton: {
    background: `linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary})`,
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: '18px',
    padding: '18px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: `0 4px 15px ${COLORS.glow}`,
    transition: 'all 0.3s ease',
  },
  lobbyCountdownBox: {
    background: COLORS.cardBg,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: `0 6px 24px rgba(0, 0, 0, 0.4)`,
    border: `1px solid ${COLORS.glow}`,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginTop: '12px',
  },
  lobbyCountdownIcon: {
    fontSize: '36px',
    background: `linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))`,
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.accent,
  },
  lobbyCountdownText: {
    fontSize: '18px',
    color: COLORS.text,
    fontWeight: 600,
  },
  lobbyCountdownTime: {
    color: COLORS.accent,
    fontWeight: 700,
    marginLeft: '6px',
  },
  lobbyBox: {
    background: `linear-gradient(145deg, ${COLORS.cardBg}, #2A363B)`,
    borderRadius: '16px',
    padding: '28px',
    boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px ${COLORS.glow}`,
    border: `2px solid ${COLORS.accent}`,
    marginTop: '12px',
    marginBottom: '48px',
  },
  lobbyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  lobbyIcon: {
    fontSize: '36px',
    background: `linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))`,
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.accent,
  },
  lobbyTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
    textShadow: `0 0 10px ${COLORS.glow}`,
  },
  lobbyInfo: {
    display: 'grid',
    gap: '20px',
  },
  lobbyField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  lobbyLabel: {
    fontSize: '16px',
    color: COLORS.textSecondary,
    fontWeight: 600,
  },
  lobbyValueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 18px',
    border: `1px solid ${COLORS.glow}`,
  },
  lobbyValue: {
    flex: 1,
    fontSize: '18px',
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
    fontSize: '14px',
    fontWeight: 600,
    userSelect: 'none',
  },
  openPubgButton: {
    marginTop: '24px',
    width: '100%',
    background: `linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary})`,
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: '20px',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: `0 4px 15px ${COLORS.glow}`,
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '100px',
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '16px',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: '18px',
    marginBottom: '24px',
  },
  tournamentsButton: {
    background: `linear-gradient(45deg, ${COLORS.accent}, ${COLORS.secondary})`,
    border: 'none',
    borderRadius: '16px',
    color: COLORS.primary,
    padding: '16px 32px',
    fontWeight: 700,
    fontSize: '18px',
    cursor: 'pointer',
    boxShadow: `0 4px 15px ${COLORS.glow}`,
    transition: 'all 0.3s ease',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: `6px solid ${COLORS.cardBg}`,
    borderTop: `6px solid ${COLORS.accent}`,
    borderRadius: '50%',
  },
};