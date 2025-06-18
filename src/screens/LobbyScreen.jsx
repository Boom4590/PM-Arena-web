import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

const LobbyScreen = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentUserSlot = params.get('currentUserSlot');

  async function fetchPlayers() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/players`);
      if (!response.ok) throw new Error('Ошибка при загрузке игроков');

      const playersFromServer = await response.json();
      setPlayers(playersFromServer);
    } catch (error) {
      console.error(error);
      setError(error.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

  const LobbyGrid = ({ players, currentUserSlot }) => {
    const totalSlots = 100;
    const data = Array.from({ length: totalSlots }, (_, i) => {
      const slotId = i + 1;
      const player = players.find(p => p.slot === slotId);
      return {
        slot: slotId,
        nickname: player?.nickname || null,
        userId: player?.id || null,
      };
    });

    const gridStyles = {
      
      display: 'grid',
      gridTemplateColumns: 'repeat(8, minmax(70px, 1fr))',
      gap: '8px',
      width: '100%',
      maxWidth: '720px',
      margin: '20px auto',
      userSelect: 'none',
    };

    const slotStyles = (isCurrentUser, isEmpty) => ({
      borderRadius: 8,
      border: isCurrentUser ? '2.5px solid #00FF00' : '1.5px solid #444',
      backgroundColor: isEmpty ? '#1c1c1c' : '#2e2e2e',
      color: isEmpty ? 'rgba(255,255,255,0.3)' : '#d4d4d4',
      fontWeight: isEmpty ? '400' : '700',
      fontSize: 12,
      textAlign: 'center',
      padding: 8,
      minHeight: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: isCurrentUser
        ? '0 0 8px 2px rgba(0, 255, 0, 0.7)'
        : 'none',
      transition: 'box-shadow 0.3s ease',
      cursor: isEmpty ? 'default' : 'pointer',
      position: 'relative',
      overflow: 'hidden',
    });

    // Анимация пульса для текущего пользователя
    const pulseAnimation = `
      @keyframes pulse {
        0% { box-shadow: 0 0 8px 2px rgba(0,255,0,0.7); }
        50% { box-shadow: 0 0 14px 4px rgba(0,255,0,1); }
        100% { box-shadow: 0 0 8px 2px rgba(0,255,0,0.7); }
      }
    `;

    return (
      <>
        <style>{pulseAnimation}</style>
        <div style={{ overflowX: 'auto', width: '100%', paddingBottom: 12 }}>
          <div style={gridStyles}>
            {data.map(({ slot, nickname, userId }) => {
              const isCurrentUser = slot === Number(currentUserSlot);
              const isEmpty = !nickname;
              return (
                <div
                  key={slot}
                  style={{
                    ...slotStyles(isCurrentUser, isEmpty),
                    animation: isCurrentUser ? 'pulse 2s infinite' : 'none',
                  }}
                  title={nickname || 'Пусто'}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: isEmpty ? 'rgba(255,255,255,0.3)' : '#a0ffa0',
                      marginBottom: 2,
                      fontWeight: '600',
                      textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    {slot}
                  </div>
                  <div
                    style={{
                      fontWeight: '700',
                      fontSize: 13,
                      color: isEmpty ? 'rgba(255,255,255,0.3)' : '#e2e2e2',
                      whiteSpace: 'normal',           // Разрешить перенос строк
    wordBreak: 'break-word',   
                      maxWidth: '100%',
                      textShadow: isEmpty
                        ? 'none'
                        : '0 0 3px rgba(0,0,0,0.9)',
                    }}
                  >
                    {nickname || 'Пусто'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        padding: 12,
        backgroundColor: '#222',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        userSelect: 'none',
      }}
    >
      <h1 style={{ marginTop: 5,fontSize:20, marginBottom: 2, color: '#fff' }}>
        PUBG Mobile - Лобби
      </h1>
      {loading && (
        <p
          style={{
            color: '#0f0',
            fontSize: 18,
            marginTop: 50,
            textShadow: '0 0 6px #00FF00',
          }}
        >
          Загрузка...
        </p>
      )}
      {error && (
        <p
          style={{
            color: '#f44',
            fontSize: 16,
            marginTop: 50,
            textShadow: '0 0 6px #f00',
          }}
        >
          {`Ошибка загрузки: ${error}`}
        </p>
      )}
      {!loading && !error && (
        <LobbyGrid
          players={players}
          currentUserSlot={currentUserSlot}
        />
      )}

      <footer
        style={{
          marginTop: 'auto',
          padding: 12,
          fontSize: 12,
          color: '#555',
          opacity: 0.6,
        }}
      >
        © 2025 PUBG Mobile Arena
      </footer>
    </div>
  );
};

export default LobbyScreen;
