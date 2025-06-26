import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { motion, AnimatePresence, color } from 'framer-motion';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

// Цветовая схема в стиле киберспорта
const COLORS = {
  primary: '#121212',              // Чёрный основной фон
  cardBg: '#1A1A1A',               // Тёмные карточки с глубиной
  accent: '#FFB300',               // Мягкий янтарно-жёлтый (лучше чем ядро-жёлтый)
  secondary: '#00B8D4',            // Холодный неон для градиента
  tertiary: '#7C4DFF',             // Фиолетовый для редких вкраплений
  text: '#E0E0E0',                 // Светлый текст
  textSecondary: '#9E9E9E',        // Вторичный текст
  error: '#EF5350',                // Красный, не режущий глаз
  success: '#66BB6A',              // Зелёный подтверждения
  warning: '#FFA726',              // Оранжевый для предупреждений
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

      // Добавляем демо-турниры для заполнения
      setTournaments([
        ...updated,
        {
          id: 24,
          mode: 'Erangel, Solo',
          entry_fee: 50,
          prize_pool: 4500,
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        },
        {
          id: 25,
          mode: 'Miramar, Duo',
          entry_fee: 70,
          prize_pool: 6000,
          start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        }
      ]);
    } catch {
      console.error('Ошибка при загрузке турниров');
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

  // Форматирование времени до начала турнира
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

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение цвета статуса турнира
  const getStatusColor = (tournament) => {
    if (tournament.isParticipating) return COLORS.success;
    if (tournament.participants_count >= 100) return COLORS.error;
    return COLORS.secondary;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}><span style={styles.titleText}>Доступные турниры</span></h1>

        <p style={styles.subtitle}>Выберите турнир и участвуйте за призовые</p>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={styles.spinner}
          />
          <p style={styles.loadingText}>Загрузка турниров...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎮</div>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    ...styles.card,
                    borderLeft: `4px solid ${getStatusColor(item)}`
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardId}>#{item.id}</div>
                    <div style={styles.cardTime}>{timeUntil}</div>
                  </div>
                  
                  <h3 style={styles.cardTitle}>{item.mode}</h3>
                  
                  <div style={styles.cardGrid}>
                    <div style={styles.gridItem}>
                      <div style={styles.gridLabel}>💵 Вход билет:</div>
                      <div style={styles.gridValue}>{item.entry_fee}$</div>
                    </div>
                    
                    <div style={styles.gridItem}>
                      <div style={styles.gridLabel}>🏆 Приз. фонд:</div>
                      <div style={styles.gridValue}>{item.prize_pool}$</div>
                    </div>
                    
                    <div style={styles.gridItem}>
                      <div style={styles.gridLabel}>🕒 Дата Начало:</div>
                      <div style={{ ...styles.gridValue, color: COLORS.textSecondary }}>
                        {startTimeStr}
                      </div>
                    </div>
                    
                    <div style={styles.gridItem}>
                      <div style={styles.gridLabel}>👥 Участники:</div>
                      <div style={{...styles.gridValue,color:'#999 '}} >
                        <strong style={{color:'#E0E0E0 ',fontSize:'14px'}}>{item.participants_count || 0}</strong> / 100
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.progressContainer}>
                    <div 
                      style={{
                        ...styles.progressBar,
                        width: `${Math.min(item.participants_count || 0, 100)}%`,
                        backgroundColor: isFull ? COLORS.error : COLORS.secondary
                      }}
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: disabled ? 1 : 1.03 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    disabled={item.isFake || disabled}
                    onClick={() => !item.isFake && handleJoinPress(item)}
                    style={{
                      ...styles.button,
                      backgroundColor: item.isFake || disabled 
                        ? COLORS.textSecondary 
                        : COLORS.accent,
                      opacity: item.isFake ? 0.7 : 1,
                      cursor: item.isFake || disabled ? 'not-allowed' : 'pointer'
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={styles.modalContainer}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Подтверждение участия</h3>
              
              <div style={styles.tournamentInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Турнир:</span>
                  <span style={styles.infoValue}>#{selectedTournament?.id} · {selectedTournament?.mode}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Взнос:</span>
                  <span style={{ ...styles.infoValue, color: COLORS.accent }}>
                    {selectedTournament?.entry_fee} $
                  </span>
                </div>
                
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Призовой фонд:</span>
                  <span style={{ ...styles.infoValue, color: COLORS.secondary }}>
                    {selectedTournament?.prize_pool} $
                  </span>
                </div>
              </div>
              
              <p style={styles.modalText}>
                После подтверждения сумма будет списана с вашего баланса. Отменить участие нельзя.
              </p>
              
              <div style={styles.modalButtons}>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmVisible(false)} 
                  style={styles.cancelBtn}
                >
                  Отмена
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.03 }}
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
    padding: '16px 32px',
    fontFamily: '"Rajdhani", "Arial Narrow", sans-serif',
    background: `linear-gradient(45deg, #000, #333,#000)`,
    minHeight: '100vh',
    color: COLORS.text,
  },
  header: {
    marginBottom: '24px',
    padding: '0 8px',
  },
 title: {
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
  textAlign: 'center', // или 'center', как тебе нужно
},
titleText: {
  background: `linear-gradient(180deg,rgb(214, 154, 2), rgb(214, 154, 2))`,
  WebkitBackgroundClip: 'text',
  textAlign:'center',
  WebkitTextFillColor: 'transparent',
 
  textShadow: '0 0 15px rgba(240, 164, 0, 0.3)',
}
,

  subtitle: {
    fontSize: '16px',
    color: COLORS.textSecondary,
    margin: '8px 0 0',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '36px',
  },
  card: {
    background: '#222',
borderRadius: '12px',
boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
border: '1px solid rgba(255,255,255,0.06)',

  
    padding: '20px 40px',
   display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
    transition: 'transform 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardId: {
    background: 'rgba(41, 182, 246, 0.1)',
    color: COLORS.secondary,
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 700,
  },
  cardTime: {
    background: 'rgba(240, 164, 0, 0.1)',
    color: COLORS.accent,
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 700,
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 16px 0',
    color: COLORS.text,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '12px',
    marginTop: '12px',
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px',
  },
  gridLabel: {
    fontSize: '15px',
    color: COLORS.textSecondary,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: COLORS.text,
    textAlign: 'right',
  },
  progressContainer: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: COLORS.primary,
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  modalContainer: {
    backgroundColor: COLORS.cardBg,
    padding: '30px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '450px',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 20px',
    textAlign: 'center',
    color: COLORS.text,
  },
  tournamentInfo: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontWeight: 600,
  },
  infoValue: {
    fontWeight: 700,
  },
  modalText: {
    fontSize: '14px',
    color: COLORS.textSecondary,
    textAlign: 'center',
    margin: '20px 0',
    lineHeight: 1.5,
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: COLORS.text,
    fontWeight: 700,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
  },
  confirmBtn: {
    flex: 1,
    padding: '14px',
    background: `linear-gradient(45deg, ${COLORS.accent}, #FF8C00)`,
    color: COLORS.primary,
    fontWeight: 700,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
  },
};