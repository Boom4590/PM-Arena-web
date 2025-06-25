import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

const LobbyScreen = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeUntilStart, setTimeUntilStart] = useState(300);
  const gridContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentUserSlot = parseInt(params.get('currentUserSlot'), 10);

  // Сохраняем позицию скролла при прокрутке
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      scrollPositionRef.current = container.scrollLeft;
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // Восстанавливаем позицию скролла после обновления DOM
  useLayoutEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollLeft = scrollPositionRef.current;
    }
  }, [players]); // Восстанавливаем позицию каждый раз после обновления players

  async function fetchPlayers() {
    try {
      setLoading(true);
      setError(null);

      // Перед запросом сохраняем позицию скролла
      if (gridContainerRef.current) {
        scrollPositionRef.current = gridContainerRef.current.scrollLeft;
      }

      const response = await fetch(`${BACKEND_URL}/players`);
      if (!response.ok) throw new Error('Ошибка при загрузке игроков');

      const playersFromServer = await response.json();
      setPlayers(playersFromServer);
    } catch (err) {
      setError(err.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilStart(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSlots = 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>PUBG Mobile - Лобби</h1>
        <div style={styles.timerBox}>
          <span style={styles.timerLabel}>До начала:</span>
          <span style={styles.timerValue}>{formatTime(timeUntilStart)}</span>
        </div>
      </div>

      <div style={styles.statusInfo}>
        <div style={styles.statusItem}>
          <div style={styles.statusIndicatorConnected} />
          <span>Подключено: {players.length}/{totalSlots}</span>
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusIndicatorEmpty} />
          <span>Свободно: {totalSlots - players.length}</span>
        </div>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Загрузка данных лобби...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>Ошибка загрузки: {error}</p>
          <button style={styles.retryButton} onClick={fetchPlayers}>Повторить попытку</button>
        </div>
      )}

      {!loading && !error && (
        <div
          ref={gridContainerRef}
          style={styles.gridContainer}
        >
          <div style={styles.grid}>
            {Array.from({ length: totalSlots }, (_, i) => {
              const slotId = i + 1;
              const player = players.find(p => p.slot === slotId);
              const isCurrentUser = slotId === currentUserSlot;
              const isEmpty = !player;

              return (
                <div
                  key={slotId}
                  style={{
                    ...styles.slot,
                    ...(isCurrentUser && styles.currentUserSlot),
                    ...(isEmpty && styles.emptySlot),
                  }}
                >
                  <div style={styles.slotNumber}>{slotId}</div>
                  <div style={styles.playerName}>{player?.nickname || ''}</div>
                  {isCurrentUser && <div style={styles.currentUserIndicator}>Вы</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <button style={styles.actionButton}>Открыть PUBG Mobile</button>
        <div style={styles.footerText}>© 2023 PUBG Mobile Arena</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 16,
    backgroundColor: '#121212',
    minHeight: '100vh',
    fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif",
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(45deg, #F0A400, #29B6F6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 15px rgba(240, 164, 0, 0.3)',
  },
  timerBox: {
    background: 'rgba(41, 182, 246, 0.1)',
    borderRadius: 20,
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginRight: 8,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#29B6F6',
  },
  statusInfo: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
  },
  statusIndicatorConnected: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginRight: 8,
    background: '#4CAF50',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)',
  },
  statusIndicatorEmpty: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginRight: 8,
    background: '#A0A0A0',
  },
  gridContainer: {
    overflowX: 'auto',
    overflowY: 'auto',
    width: '100%',
     // например, фиксируем высоту контейнера для прокрутки
    border: '1px solid #333',
    padding: 10,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 100px)',
    gap: 10,
  },
  slot: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    border: '1px solid #444',
    padding: 10,
    textAlign: 'center',
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  emptySlot: {
    borderColor: '#444',
  },
  currentUserSlot: {
    border: '2px solid #00FF00',
    boxShadow: '0 0 15px rgba(0, 255, 0, 0.4)',
    zIndex: 2,
  },
  slotNumber: {
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: 600,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  currentUserIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 255, 0, 0.2)',
    color: '#00FF00',
    fontSize: 10,
    padding: 2,
    fontWeight: 700,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  spinner: {
    width: 50,
    height: 50,
    border: '4px solid rgba(41, 182, 246, 0.2)',
    borderTop: '4px solid #29B6F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: 20,
  },
  loadingText: {
    color: '#A0A0A0',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 20,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
    color: '#F0A400',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    background: 'rgba(240, 164, 0, 0.1)',
    color: '#F0A400',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 20,
  },
  actionButton: {
    background: 'linear-gradient(45deg, #F0A400, #FF8C00)',
    color: '#121212',
    border: 'none',
    borderRadius: 12,
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
    transition: 'transform 0.2s ease',
  },
  footerText: {
    color: '#A0A0A0',
    fontSize: 12,
    opacity: 0.7,
  },
};

export default LobbyScreen;
