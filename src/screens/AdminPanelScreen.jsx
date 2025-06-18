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
      // Преобразуем формат datetime-local (YYYY-MM-DDTHH:mm) в нужный (YYYY-MM-DD HH:mm:ss)
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

  return (
    <div style={styles.container}>
      <h1 style={{textAlign: 'center'}}>Панель администратора</h1>
      
      {/* --- Секции --- */}

      <div onClick={() => toggleSection('block')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Блокировка пользователя по ID</h3>
      </div>
      {activeSection === 'block' && (
        <div style={styles.sectionContent}>
          <input
            type="text"
            placeholder="PUBG MOBILE ID"
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
          <button onClick={blockUser} style={styles.button}>Заблокировать пользователя</button>
        </div>
      )}

      <div onClick={() => toggleSection('create')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Создание турнира</h3>
      </div>
      {activeSection === 'create' && (
        <div style={styles.sectionContent}>
          <input type="text" placeholder="Режим" value={createMode} onChange={(e) => setCreateMode(e.target.value)} style={styles.input} />
          <input type="number" placeholder="Вступительный взнос" value={createEntryFee} onChange={(e) => setCreateEntryFee(e.target.value)} style={styles.input} />
          <input type="number" placeholder="Призовой фонд" value={createPrizePool} onChange={(e) => setCreatePrizePool(e.target.value)} style={styles.input} />
          <input type="datetime-local" value={createStartTime} onChange={(e) => setCreateStartTime(e.target.value)} style={styles.input} />
          <button onClick={createTournament} style={styles.button}>Создать турнир</button>
        </div>
      )}

      <div onClick={() => toggleSection('lobby')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Отправка данных лобби</h3>
      </div>
      {activeSection === 'lobby' && (
        <div style={styles.sectionContent}>
          <input type="number" placeholder="ID турнира" value={lobbyTournamentId} onChange={(e) => setLobbyTournamentId(e.target.value)} style={styles.input} />
          <input type="text" placeholder="ID комнаты" value={lobbyRoomId} onChange={(e) => setLobbyRoomId(e.target.value)} style={styles.input} />
          <input type="text" placeholder="Пароль комнаты" value={lobbyPassword} onChange={(e) => setLobbyPassword(e.target.value)} style={styles.input} />
          <button onClick={sendLobby} style={styles.button}>Отправить лобби</button>
        </div>
      )}

      <div onClick={() => toggleSection('delete')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Удаление турнира</h3>
      </div>
      {activeSection === 'delete' && (
        <div style={styles.sectionContent}>
          <input type="number" placeholder="ID турнира" value={deleteTournamentId} onChange={(e) => setDeleteTournamentId(e.target.value)} style={styles.input} />
          <button onClick={deleteTournament} style={styles.button}>Удалить турнир</button>
        </div>
      )}
      
      <div onClick={() => toggleSection('archive')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Архивировать участников</h3>
      </div>
      {activeSection === 'archive' && (
        <div style={styles.sectionContent}>
            <p>Эта операция переместит всех текущих участников в архив.</p>
            <button onClick={archiveParticipants} style={styles.button}>Архивировать Participants</button>
        </div>
      )}

      <div onClick={() => toggleSection('findSeat')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Найти Seat по PUBG ID</h3>
      </div>
      {activeSection === 'findSeat' && (
        <div style={styles.sectionContent}>
          <input type="text" placeholder="PUBG ID" value={searchPubgId} onChange={(e) => setSearchPubgId(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={styles.input} />
          <button onClick={findSeatByPubgId} style={styles.button}>Найти</button>
          {foundSeat !== null && (
            <p style={{ marginTop: '10px', fontSize: '16px' }}>
              Место (seat): <span style={{ fontWeight: 'bold' }}>{foundSeat}</span>
            </p>
          )}
        </div>
      )}
      
      <div onClick={() => toggleSection('topup')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Пополнить баланс пользователя</h3>
      </div>
      {activeSection === 'topup' && (
        <div style={styles.sectionContent}>
          <input type="text" placeholder="PUBG ID" value={topUpPubgId} onChange={(e) => setTopUpPubgId(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} style={styles.input} />
          <input type="number" placeholder="Сумма пополнения" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} maxLength={6} style={styles.input} />
          <button onClick={topUpBalance} style={styles.button}>Пополнить баланс</button>
        </div>
      )}

      <div onClick={() => toggleSection('allUsers')} style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Список всех пользователей</h3>
      </div>
      {activeSection === 'allUsers' && (
        <div style={styles.sectionContent}>
          {loadingUsers ? (
            <p>Загрузка...</p>
          ) : usersList.length === 0 ? (
            <p>Пользователи не найдены</p>
          ) : (
            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeader}>
                        <th style={{...styles.tableCell, ...styles.headerText, flex: 1}}>Seat</th>
                        <th style={{...styles.tableCell, ...styles.headerText, flex: 3}}>Nickname</th>
                        <th style={{...styles.tableCell, ...styles.headerText, flex: 2}}>PUBG ID</th>
                    </tr>
                </thead>
                <tbody>
                    {usersList.map((item, index) => (
                        <tr key={item.pubg_id} style={{ ...styles.tableRow, backgroundColor: index % 2 === 0 ? '#f2f2f2' : '#ffffff' }}>
                           <td style={{...styles.tableCell, flex: 1}}>{item.seat}</td>
                           <td style={{...styles.tableCell, flex: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.nickname}</td>
                           <td style={{...styles.tableCell, flex: 2}}>{item.pubg_id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// Стили для веб-версии
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
  },
  sectionHeader: {
    backgroundColor: '#e0e0e0',
    padding: '10px 15px',
    marginTop: '15px',
    borderRadius: '5px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  sectionContent: {
      padding: '15px',
      border: '1px solid #e0e0e0',
      borderTop: 'none',
      borderRadius: '0 0 5px 5px',
  },
  input: {
    width: 'calc(100% - 22px)', // Учитываем padding и border
    border: '1px solid #ccc',
    borderRadius: '5px',
    margin: '8px 0',
    padding: '10px',
    fontSize: '16px',
  },
  button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '5px',
  },
  // Стили для таблицы пользователей
  table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ffb800',
    padding: '8px 10px',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    padding: '10px',
    borderBottom: '1px solid #ddd',
    alignItems: 'center',
  },
  tableCell: {
    color: '#333',
    fontSize: '16px',
    padding: '0 6px',
    textAlign: 'left',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
};