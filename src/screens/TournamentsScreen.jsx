import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { motion, AnimatePresence } from 'framer-motion';

// Backend URL
const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

// Modern, professional color scheme
const COLORS = {
  primary: '#0F1419',              // Deep black-blue
  cardBg: '#1F2A33',               // Slightly lighter for cards
  accent: '#D4A017',               // Soft gold for emphasis
  secondary: '#1E88E5',            // Deep teal for highlights
  tertiary: '#546E7A',             // Neutral slate for subtle accents
  text: '#F7F9FA',                 // Crisp white for text
  textSecondary: '#B0BEC5',        // Light gray for secondary text
  error: '#C62828',                // Modern red for errors
  success: '#2E7D32',              // Modern green for success
  warning: '#EF6C00',              // Subtle orange for warnings
  border: 'rgba(255, 255, 255, 0.12)', // Subtle border for depth
};

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease: 'easeInOut' }
};

const slideUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

export default function Tournaments() {
  const { userInfo } = useContext(UserContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [userInfo]);

  async function fetchTournaments() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tournaments`);
      const data = await res.json();

      const updated = data.map(t => ({
        ...t,
        isParticipating: t.participants?.some(p => p.pubg_id === userInfo?.pubg_id) || false,
      }));

      setTournaments([
        ...updated,
        {
          id: 24,
          mode: 'Erangel, Squad',
          entry_fee: 10,
          prize_pool: 900,
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        },
        {
          id: 25,
          mode: 'Miramar, Duo',
          entry_fee: 7,
          prize_pool: 600,
          start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        }
      ]);
    } catch {
      console.error('Error fetching tournaments');
    } finally {
      setLoading(false);
    }
  }

  async function confirmJoin() {
    if (!selectedTournament || !userInfo) return;

    const { id, entry_fee } = selectedTournament;

    if (userInfo.balance < entry_fee) {
      setConfirmVisible(false);
      return alert('Недостаточно средств для участия');
    }

    try {
      const res = await fetch(`${BACKEND_URL}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id: userInfo.pubg_id, tournament_id: id }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Не удалось присоединиться');
        setConfirmVisible(false);
        return;
      }

      await fetchTournaments();
      setConfirmVisible(false);
      navigate('/current');
    } catch {
      alert('Ошибка подключения к серверу');
      setConfirmVisible(false);
    }
  }

  const handleJoinPress = (tournament) => {
    setSelectedTournament(tournament);
    setConfirmVisible(true);
  };

  const formatTimeUntil = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;

    if (diffMs <= 0) return 'Начался';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) return `Через ${diffDays} д.`;
    if (diffHours > 0) return `Через ${diffHours} ч.`;
    return `Через ${diffMins} мин.`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (tournament) => {
    if (tournament.isParticipating) return COLORS.success;
    if (tournament.participants_count >= 100) return COLORS.error;
    return COLORS.secondary;
  };

  return (
    <div style={styles.container}>
      <motion.div {...fadeIn} style={styles.header}>
        <h1 style={styles.title}>Доступные турниры</h1>
        <p style={styles.subtitle}>Выберите турнир и участвуйте за призовые</p>
      </motion.div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={styles.spinner}
          />
          <p style={styles.loadingText}>Загрузка турниров...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>Турниры не найдены</h3>
          <p style={styles.emptyText}>Следите за обновлениями, скоро появятся новые турниры</p>
        </div>
      ) : (
        <div style={styles.list}>
          <AnimatePresence>
            {tournaments.map((item) => {
              const isFull = item.participants_count >= 100;
              const isParticipating = item.isParticipating;
              const startTimeStr = formatDate(item.start_time);
              const timeUntil = formatTimeUntil(item.start_time);

              let buttonText = 'Участвовать';
              let disabled = false;

              if (isParticipating) {
                buttonText = 'Вы участвуете';
                disabled = true;
              } else if (isFull) {
                buttonText = 'Заполнен';
                disabled = true;
              }

              return (
                <motion.div
                  key={item.id}
                  {...slideUp}
                  style={{
                    ...styles.card,
                    borderLeft: `3px solid ${getStatusColor(item)}`,
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardId}>#{item.id}</div>
                    <div style={styles.cardTime}>{timeUntil}</div>
                  </div>
                  <h3 style={styles.cardTitle}>{item.mode}</h3>
                  <div style={styles.cardContent}>
                   
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Взнос</span>
                      <span style={{ ...styles.dataValue, color: COLORS.secondary }}>{item.entry_fee}$</span>
                    </div>
                     <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Призовой фонд</span>
                      <span style={{ ...styles.dataValue, color: COLORS.accent }}>{item.prize_pool}$</span>
                    </div>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Дата начала</span>
                      <span style={{ ...styles.dataValue, color: COLORS.textSecondary }}>{startTimeStr}</span>
                    </div>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Участники</span>
                      <span style={styles.dataValue}>
                        <strong>{item.participants_count || 0}</strong> / 100
                      </span>
                    </div>
                    <div style={styles.progressContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${Math.min(item.participants_count || 0, 100)}%`,
                          backgroundColor: isFull ? COLORS.error : COLORS.secondary,
                        }}
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: disabled ? 1 : 1.02, backgroundColor: disabled ? COLORS.textSecondary : '#E8B923' }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    disabled={item.isFake || disabled}
                    onClick={() => !item.isFake && handleJoinPress(item)}
                    style={{
                      ...styles.button,
                      backgroundColor: item.isFake || disabled ? COLORS.textSecondary : COLORS.accent,
                      opacity: item.isFake || disabled ? 0.6 : 1,
                      cursor: item.isFake || disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {item.isFake ? 'Скоро' : buttonText}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {confirmVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setConfirmVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={styles.modalContainer}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Подтверждение участия</h3>
              <div style={styles.tournamentInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Турнир</span>
                  <span style={styles.infoValue}>#{selectedTournament?.id} · {selectedTournament?.mode}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Взнос</span>
                  <span style={{ ...styles.infoValue, color: COLORS.secondary }}>{selectedTournament?.entry_fee} $</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Призовой фонд</span>
                  <span style={{ ...styles.infoValue, color: COLORS.accent }}>{selectedTournament?.prize_pool} $</span>
                </div>
              </div>
              <p style={styles.modalText}>
                После подтверждения сумма будет списана с вашего баланса. Отменить участие нельзя.
              </p>
              <div style={styles.modalButtons}>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: COLORS.cardBg }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmVisible(false)}
                  style={styles.cancelBtn}
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#E8B923' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmJoin}
                  style={styles.confirmBtn}
                >
                  Подтвердить
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    padding: '48px 32px',
    fontFamily: '"Inter", "Arial", sans-serif',
    background: COLORS.primary,
    minHeight: '100vh',
    color: COLORS.text,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    marginBottom: '56px',
    textAlign: 'center',
  },
  title: {
    fontSize: '34px',
    fontWeight: 700,
    margin: 0,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: '18px',
    color: COLORS.textSecondary,
    margin: '12px 0 0',
    fontWeight: 400,
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '40px',
    width: '100%',
    maxWidth: '1280px',
  },
  card: {
    background: COLORS.cardBg,
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardId: {
    background: COLORS.cardBg,
    color: COLORS.textSecondary,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    border: `1px solid ${COLORS.border}`,
  },
  cardTime: {
    background: COLORS.cardBg,
    color: COLORS.accent,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    border: `1px solid ${COLORS.border}`,
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    color: COLORS.text,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dataItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  dataLabel: {
    fontSize: '14px',
    color: COLORS.textSecondary,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dataValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.text,
  },
  progressContainer: {
    height: '8px',
    background: COLORS.border,
    borderRadius: '4px',
    marginTop: '12px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  button: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    color: COLORS.text,
    fontWeight: 600,
    fontSize: '16px',
    transition: 'all 0.3s ease',
    background: COLORS.accent,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
  },
  modalContainer: {
    background: COLORS.cardBg,
    padding: '32px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  modalTitle: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 24px',
    textAlign: 'center',
    color: COLORS.text,
  },
  tournamentInfo: {
    background: COLORS.cardBg,
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '24px',
    border: `1px solid ${COLORS.border}`,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  infoLabel: {
    fontSize: '15px',
    color: COLORS.textSecondary,
    fontWeight: 500,
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: COLORS.text,
  },
  modalText: {
    fontSize: '15px',
    color: COLORS.textSecondary,
    textAlign: 'center',
    margin: '24px 0',
    lineHeight: 1.6,
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: COLORS.cardBg,
    color: COLORS.text,
    fontWeight: 600,
    borderRadius: '10px',
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s ease',
  },
  confirmBtn: {
    flex: 1,
    padding: '14px',
    background: COLORS.accent,
    color: COLORS.text,
    fontWeight: 600,
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s ease',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `5px solid ${COLORS.cardBg}`,
    borderTop: `5px solid ${COLORS.accent}`,
    borderRadius: '50%',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '16px',
    color: COLORS.textSecondary,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '120px',
    color: COLORS.textSecondary,
  },
  emptyTitle: {
    fontSize: '26px',
    fontWeight: 600,
    marginBottom: '16px',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '24px',
  },
};