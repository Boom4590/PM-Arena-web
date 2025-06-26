import React, { useState } from 'react';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState(null);
  const [topUpPubgId, setTopUpPubgId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [deleteTournamentId, setDeleteTournamentId] = useState('');
  const [pubgId, setBlockPubgId] = useState('');
  const [createMode, setCreateMode] = useState('');
  const [createEntryFee, setCreateEntryFee] = useState('');
  const [createPrizePool, setCreatePrizePool] = useState('');
  const [createStartTime, setCreateStartTime] = useState('');
  const [lobbyTournamentId, setLobbyTournamentId] = useState('');
  const [lobbyRoomId, setLobbyRoomId] = useState('');
  const [lobbyPassword, setLobbyPassword] = useState('');
  const [searchPubgId, setSearchPubgId] = useState('');
  const [foundSeat, setFoundSeat] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  async function blockUser() {
    const pubg_id = pubgId;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id }),
      });
      const json = await res.json();
      if (!res.ok) {
        window.alert(`Ошибка: ${json.error || 'Ошибка блокировки'}`);
        return;
      }
      window.alert('Успешно: Пользователь заблокирован');
      setBlockPubgId('');
    } catch {
      window.alert('Ошибка: Ошибка сервера');
    }
  }

  async function archiveParticipants() {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/archiveParticipants`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        window.alert(`Успех: ${json.message}`);
      } else {
        window.alert(`Ошибка: ${json.error || 'Не удалось архивировать'}`);
      }
    } catch (e) {
      window.alert('Ошибка: Ошибка подключения к серверу');
    }
  }

  async function createTournament() {
    if (
      !createMode.trim() ||
      !createEntryFee.trim() ||
      !createPrizePool.trim() ||
      !createStartTime.trim()
    ) {
      window.alert('Ошибка: Заполните все поля для создания турнира');
      return;
    }
    try {
      const formattedStartTime = createStartTime.replace('T', ' ') + ':00';
      
      const res = await fetch(`${BACKEND_URL}/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: createMode,
          entry_fee: Number(createEntryFee),
          prize_pool: Number(createPrizePool),
          start_time: formattedStartTime,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        window.alert(`Ошибка: ${json.error || 'Ошибка создания турнира'}`);
        return;
      }
      window.alert('Успешно: Турнир создан');
      setCreateMode('');
      setCreateEntryFee('');
      setCreatePrizePool('');
      setCreateStartTime('');
    } catch {
      window.alert('Ошибка: Ошибка сервера');
    }
  }

  async function deleteTournament() {
    if (!deleteTournamentId.trim()) {
      window.alert('Ошибка: Введите ID турнира для удаления');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/delete/${deleteTournamentId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        window.alert('Успешно: Турнир удалён');
        setDeleteTournamentId('');
      } else {
        window.alert(`Ошибка: ${json.error || 'Не удалось удалить турнир'}`);
      }
    } catch (e) {
      window.alert('Ошибка: Ошибка подключения к серверу');
    }
  }

  async function sendLobby() {
    if (!lobbyTournamentId || !lobbyRoomId || !lobbyPassword) {
      window.alert('Ошибка: Заполните все поля для отправки лобби');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/send_lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: Number(lobbyTournamentId),
          room_id: lobbyRoomId,
          room_password: lobbyPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        window.alert(`Ошибка: ${json.error || 'Ошибка отправки лобби'}`);
        return;
      }
      window.alert('Успешно: Данные лобби отправлены');
      setLobbyTournamentId('');
      setLobbyRoomId('');
      setLobbyPassword('');
    } catch {
      window.alert('Ошибка: Ошибка сервера');
    }
  }
  
  async function topUpBalance() {
    if (!topUpPubgId.trim() || !topUpAmount.trim()) {
      window.alert('Ошибка: Введите PUBG ID и сумму');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pubg_id: topUpPubgId,
          amount: Number(topUpAmount),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        window.alert(`Успешно: ${json.message || 'Баланс пополнен'}`);
        setTopUpPubgId('');
        setTopUpAmount('');
      } else {
        window.alert(`Ошибка: ${json.error || 'Не удалось пополнить баланс'}`);
      }
    } catch {
      window.alert('Ошибка: Ошибка сервера');
    }
  }

  async function findSeatByPubgId() {
    if (!searchPubgId.trim()) {
      window.alert('Ошибка: Введите PUBG ID для поиска');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/admin/find_seat/${searchPubgId}`);
      const json = await res.json();
      if (res.ok) {
        setFoundSeat(json.seat);
      } else {
        window.alert(`Ошибка: ${json.error || 'Пользователь не найден'}`);
        setFoundSeat(null);
      }
    } catch {
      window.alert('Ошибка: Ошибка сервера');
      setFoundSeat(null);
    }
  }

  async function fetchAllUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/find_seats`);
      const json = await res.json();
      if (res.ok) {
        setUsersList(json.users || []);
      } else {
        window.alert(`Ошибка: ${json.error || 'Не удалось загрузить список пользователей'}`);
        setUsersList([]);
      }
    } catch {
      window.alert('Ошибка: Ошибка сервера при загрузке списка пользователей');
      setUsersList([]);
    }
    setLoadingUsers(false);
  }

  function toggleSection(sectionName) {
    setActiveSection(prev => {
        const newSection = prev === sectionName ? null : sectionName;
        if (newSection === 'allUsers') {
            fetchAllUsers();
        }
        return newSection;
    });
  }

  // Стили для полного экрана с военной тематикой
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '"Rajdhani", sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: '#0d1721',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(40, 60, 80, 0.1) 0%, rgba(40, 60, 80, 0) 20%),
        radial-gradient(circle at 90% 80%, rgba(30, 50, 70, 0.1) 0%, rgba(30, 50, 70, 0) 20%),
        linear-gradient(to bottom, #0a121b, #0d1721)
      `,
      color: '#e0e0e0',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    },
    header: {
      textAlign: 'center',
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '30px',
      color: '#ffb800',
      textShadow: '0 0 15px rgba(255, 184, 0, 0.3)',
      paddingBottom: '15px',
      borderBottom: '2px solid #1e3a5f',
      position: 'relative',
      zIndex: 1,
    },
    sectionHeader: {
      backgroundColor: 'rgba(26, 42, 64, 0.7)',
      padding: '16px 25px',
      marginTop: '20px',
      borderRadius: '8px',
      cursor: 'pointer',
      userSelect: 'none',
      border: '1px solid #2a4a70',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      zIndex: 1,
      '&:hover': {
        backgroundColor: 'rgba(33, 53, 80, 0.8)',
        borderColor: '#ffb800',
      }
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
    },
    sectionIcon: {
      display: 'inline-block',
      width: '14px',
      height: '14px',
      backgroundColor: '#ffb800',
      borderRadius: '50%',
      marginRight: '15px',
      boxShadow: '0 0 8px rgba(255, 184, 0, 0.5)',
    },
    sectionContent: {
      padding: '25px',
      border: '1px solid #2a4a70',
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      backgroundColor: 'rgba(16, 29, 44, 0.9)',
      marginBottom: '20px',
      backdropFilter: 'blur(5px)',
      boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      zIndex: 1,
    },
    input: {
      width: '100%',
      border: '1px solid #345175',
      borderRadius: '6px',
      margin: '12px 0',
      padding: '14px 18px',
      fontSize: '16px',
      backgroundColor: 'rgba(11, 22, 35, 0.7)',
      color: '#fff',
      transition: 'all 0.3s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#ffb800',
        boxShadow: '0 0 0 3px rgba(255, 184, 0, 0.2)',
        backgroundColor: 'rgba(11, 22, 35, 0.9)',
      },
      '&::placeholder': {
        color: '#8fa3bf',
      }
    },
    button: {
      backgroundColor: '#ffb800',
      backgroundImage: 'linear-gradient(to bottom, #ffc83d, #e69e00)',
      color: '#0d1721',
      padding: '14px 25px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '15px',
      fontWeight: '700',
      transition: 'all 0.2s ease',
      width: '100%',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
      '&:hover': {
        backgroundImage: 'linear-gradient(to bottom, #ffd15e, #ffb800)',
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.5)',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
      }
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      marginTop: '20px',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #2a4a70',
      backdropFilter: 'blur(5px)',
    },
    tableHeader: {
      backgroundColor: '#ffb800',
      backgroundImage: 'linear-gradient(to right, #ffb800, #e69e00)',
    },
    tableRow: {
      backgroundColor: 'rgba(26, 42, 64, 0.5)',
      '&:nth-child(even)': {
        backgroundColor: 'rgba(22, 36, 56, 0.5)',
      }
    },
    tableCell: {
      padding: '14px 18px',
      textAlign: 'left',
      borderBottom: '1px solid #2a4a70',
      color: '#e0e0e0',
      fontSize: '15px',
    },
    headerText: {
      fontWeight: '700',
      color: '#0d1721',
      textShadow: 'none',
    },
    formGroup: {
      marginBottom: '20px',
      position: 'relative',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      color: '#ffb800',
      fontWeight: '600',
      fontSize: '15px',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    },
    pubgBadge: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      backgroundImage: 'linear-gradient(135deg, #ffb800, #e69e00)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      color: '#0d1721',
      fontSize: '22px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
      zIndex: 1,
      border: '2px solid rgba(255, 255, 255, 0.3)',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
      }
    },
    tacticalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M20 20h60v60H20z' stroke='%232a4a70' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%232a4a70' stroke-width='0.3'/%3E%3C/svg%3E")`,
      opacity: 0.1,
      pointerEvents: 'none',
      zIndex: 0,
    },
    statusIndicator: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#4ade80',
      boxShadow: '0 0 8px #4ade80',
    },
    subtitle: {
      fontSize: '16px',
      color: '#94a9c5',
      marginTop: '5px',
      fontWeight: '400',
    },
    sectionCounter: {
      display: 'inline-block',
      minWidth: '25px',
      height: '25px',
      lineHeight: '25px',
      textAlign: 'center',
      backgroundColor: '#ffb800',
      color: '#0d1721',
      borderRadius: '50%',
      marginLeft: '15px',
      fontSize: '14px',
      fontWeight: '700',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.tacticalOverlay}></div>
     
      
      <h1 style={styles.header}>
        ПАНЕЛЬ УПРАВЛЕНИЯ 
        <div style={styles.subtitle}>Административная система PUBG Mobile Arena</div>
      </h1>
      
      <div style={styles.gridContainer}>
        {/* Левый столбец */}
        <div>
          {/* Секция блокировки пользователя */}
         

          {/* Секция создания турнира */}
          <div 
            onClick={() => toggleSection('create')} 
            style={styles.sectionHeader}
          >
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Создание турнира</h3>
          </div>
          {activeSection === 'create' && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Режим турнира</label>
                <input 
                  type="text" 
                  placeholder="Например: TDM, SQUAD" 
                  value={createMode} 
                  onChange={(e) => setCreateMode(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Вступительный взнос ($)</label>
                <input 
                  type="number" 
                  placeholder="Сумма в UC" 
                  value={createEntryFee} 
                  onChange={(e) => setCreateEntryFee(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Призовой фонд ($)</label>
                <input 
                  type="number" 
                  placeholder="Общий призовой фонд" 
                  value={createPrizePool} 
                  onChange={(e) => setCreatePrizePool(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Дата и время начала</label>
                <input 
                  type="datetime-local" 
                  value={createStartTime} 
                  onChange={(e) => setCreateStartTime(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <button onClick={createTournament} style={styles.button}>Создать турнир</button>
            </div>
          )}

          {/* Секция удаления турнира */}
          <div 
            onClick={() => toggleSection('delete')} 
            style={styles.sectionHeader}
          >
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Удаление турнира</h3>
            {deleteTournamentId && <span style={styles.sectionCounter}>1</span>}
          </div>
          {activeSection === 'delete' && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID турнира для удаления</label>
                <input 
                  type="number" 
                  placeholder="Введите ID турнира" 
                  value={deleteTournamentId} 
                  onChange={(e) => setDeleteTournamentId(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              <button onClick={deleteTournament} style={styles.button}>Удалить турнир</button>
            </div>
          )}
        </div>

        {/* Правый столбец */}
        <div>
          {/* Секция отправки данных лобби */}
          <div 
            onClick={() => toggleSection('lobby')} 
            style={styles.sectionHeader}
          >
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Отправка данных лобби</h3>
          </div>
          {activeSection === 'lobby' && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID турнира</label>
                <input 
                  type="number" 
                  placeholder="Введите ID турнира" 
                  value={lobbyTournamentId} 
                  onChange={(e) => setLobbyTournamentId(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>ID комнаты</label>
                <input 
                  type="text" 
                  placeholder="ID игровой комнаты" 
                  value={lobbyRoomId} 
                  onChange={(e) => setLobbyRoomId(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Пароль комнаты</label>
                <input 
                  type="text" 
                  placeholder="Пароль от комнаты" 
                  value={lobbyPassword} 
                  onChange={(e) => setLobbyPassword(e.target.value)} 
                  style={styles.input} 
                />
              </div>
              
              <button onClick={sendLobby} style={styles.button}>Отправить данные</button>
            </div>
          )}

          {/* Секция архивации участников */}
          <div onClick={() => toggleSection('archive')} style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Архивировать участников</h3>
          </div>
          {activeSection === 'archive' && (
            <div style={styles.sectionContent}>
              <p style={{ marginBottom: '20px', color: '#cbd5e1', lineHeight: '1.6' }}>
                Эта операция переместит всех текущих участников в архив.
                Рекомендуется выполнять после завершения турнира.
              </p>
              <button onClick={archiveParticipants} style={styles.button}>Архивировать</button>
            </div>
          )}
 <div 
            onClick={() => toggleSection('block')} 
            style={styles.sectionHeader}
          >
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Блокировка пользователя</h3>
            {pubgId && <span style={styles.sectionCounter}>1</span>}
          </div>
          {activeSection === 'block' && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>PUBG ID пользователя</label>
                <input
                  type="text"
                  placeholder="Введите PUBG ID"
                  value={pubgId}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                    if (digitsOnly.length <= 10) {
                      setBlockPubgId(digitsOnly);
                    }
                  }}
                  maxLength={10}
                  style={styles.input}
                />
              </div>
              <button onClick={blockUser} style={styles.button}>Заблокировать</button>
            </div>
          )}
          {/* Секция пополнения баланса */}
          <div onClick={() => toggleSection('topup')} style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Пополнить баланс</h3>
            {(topUpPubgId || topUpAmount) && <span style={styles.sectionCounter}>2</span>}
          </div>
          {activeSection === 'topup' && (
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>PUBG ID пользователя</label>
                <input 
                  type="text" 
                  placeholder="Введите PUBG ID" 
                  value={topUpPubgId} 
                  onChange={(e) => setTopUpPubgId(e.target.value.replace(/[^0-9]/g, ''))} 
                  maxLength={10} 
                  style={styles.input} 
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Сумма пополнения ($)</label>
                <input 
                  type="number" 
                  placeholder="Сумма" 
                  value={topUpAmount} 
                  onChange={(e) => setTopUpAmount(e.target.value)} 
                  maxLength={6} 
                  style={styles.input} 
                />
              </div>
              
              <button onClick={topUpBalance} style={styles.button}>Пополнить</button>
            </div>
          )}

          {/* Секция списка пользователей */}
          <div onClick={() => toggleSection('allUsers')} style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h3 style={styles.sectionTitle}>Список пользователей</h3>
            {usersList.length > 0 && <span style={styles.sectionCounter}>{usersList.length}</span>}
          </div>
          {activeSection === 'allUsers' && (
            <div style={styles.sectionContent}>
              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#ffb800' }}>
                  <p style={{ fontSize: '18px' }}>Загрузка данных пользователей...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a9c5' }}>
                  <p style={{ fontSize: '18px' }}>Пользователи не найдены</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={{...styles.tableCell, ...styles.headerText}}>Место</th>
                        <th style={{...styles.tableCell, ...styles.headerText}}>Никнейм</th>
                        <th style={{...styles.tableCell, ...styles.headerText}}>PUBG ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((item, index) => (
                        <tr key={item.pubg_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{item.seat}</td>
                          <td style={styles.tableCell}>{item.nickname}</td>
                          <td style={styles.tableCell}>{item.pubg_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}