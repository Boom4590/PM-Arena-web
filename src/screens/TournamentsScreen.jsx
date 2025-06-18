import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

export default function Tournaments() {
  const { userInfo } = useContext(UserContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
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
          mode: 'Erangel, Solo',
          entry_fee: 50,
          prize_pool: 4500,
          start_time: new Date().toISOString(),
          participants_count: 0,
          isParticipating: false,
          isFake: true,
        },
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

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={styles.loading}>Загрузка...</p>
      ) : tournaments.length === 0 ? (
        <p style={styles.loading}>Турниры не найдены</p>
      ) : (
        <div style={styles.list}>
          {tournaments.map((item) => {
            const isFull = item.participants_count >= 100;
            const isParticipating = item.isParticipating;
            const startDate = new Date(item.start_time);
            const startTimeStr = startDate.toLocaleString();

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
              <div key={item.id} style={styles.card}>
                <h3 style={styles.cardTitle}>#{item.id} · {item.mode}</h3>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>💵 Вход:</span>
                  <span style={styles.detailValue}><strong>{item.entry_fee}$</strong></span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>🏆 Приз:</span>
                  <span style={styles.detailValue}><strong>{item.prize_pool}$</strong></span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>🕒 Старт:</span>
                  <span style={{ ...styles.detailValue, ...styles.muted }}>{startTimeStr}</span>
                </div>

                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>👥 Участников:</span>
                  <span style={styles.detailValue}><strong>{item.participants_count || 0}</strong>/100</span>
                </div>

                <button
                  disabled={item.isFake || disabled}
                  onClick={() => !item.isFake && handleJoinPress(item)}
                  style={{
                    ...styles.button,
                    backgroundColor: item.isFake || disabled ? '#ccc' : '#2563eb',
                  }}
                >
                  {item.isFake ? 'Скоро' : buttonText}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {confirmVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <p style={styles.modalText}>
              Подтвердить участие в турнире #{selectedTournament?.id} за {selectedTournament?.entry_fee} $?
            </p>
            <div style={styles.modalButtons}>
              <button onClick={() => setConfirmVisible(false)} style={styles.cancelBtn}>Отмена</button>
              <button onClick={confirmJoin} style={styles.confirmBtn}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  loading: {
    textAlign: 'center',
    color: '#555',
    marginTop: 40,
  },
  list: {
    display: 'grid',
    gap: 16,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  detailRow: {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0',
  borderBottom: '1px solid #f0f0f0',
  alignItems: 'center',
},
detailLabel: {
  width: 120,           // фиксируем ширину, чтобы все лейблы в одной колонке
  fontWeight: 600,
  fontSize: '14px',
  color: '#4B5563',
  textAlign: 'left',    // текст лейбла строго слева
},
detailValue: {
  flexGrow: 1,
  textAlign: 'right',
  fontSize: '14px',
  color: '#111827',
},

  muted: {
    color: '#888',
  },
  button: {
    marginTop: 16,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 8,
    maxWidth: 400,
    width: '90%',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#e5e7eb',
    color: '#111827',
    fontWeight: 600,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
};
