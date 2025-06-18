import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import profileImage from '../assets/profile.png';
import whatsappIcon from '../assets/whatsapp.png';
import btcIcon from '../assets/btc.png';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';
const MANAGER_WHATSAPP = 'https://wa.me/996507535771';
const ADMIN_PASSWORD = 'admin4590$';

const PUBG_DARK_GREEN = '#1B3A2F';
const PUBG_LIGHT_GREEN = '#2E7D32';

export default function Profile() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [amountUsd, setAmountUsd] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [payCurrency, setPayCurrency] = useState('btc');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo?.pubg_id) {
      fetchLatestUserData();
    }
  }, [userInfo?.pubg_id]);

  async function fetchLatestUserData() {
    try {
      const res = await fetch(`${BACKEND_URL}/user?pubg_id=${userInfo.pubg_id}`);
      if (!res.ok) return;
      const updatedUser = await res.json();
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
    } catch (error) {
      console.log('Ошибка сервера:', error);
    }
  }

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    navigate('/'); // Можно перенаправить на страницу логина, если нужно
  };

  const handleManagerContact = () => {
    window.open(MANAGER_WHATSAPP, '_blank');

  };

  const tryAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      navigate('/admin');  // Переход в админ-панель
      setShowAdminInput(false);
      setAdminPassword('');
    } else {
      alert('Неверный пароль администратора');
    }
  };

 const handlePay = async () => {
  if (!amountUsd) {
    alert('Введите сумму');
    return;
  }
  const amount = parseFloat(amountUsd);
  if (isNaN(amount) || amount < 13) {
    setIsError(true);
    alert('Сумма должна быть не меньше 13 USD');
    return;
  }

  setIsError(false);

  try {
    const response = await fetch(`${BACKEND_URL}/api/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUsd: amount, payCurrency, pubg_id: userInfo.pubg_id }),
    });

    const data = await response.json();
  

    // Открываем ссылку в новой вкладке вместо навигации
    window.open(data.invoice_url, '_blank', 'noopener,noreferrer');
  } catch (e) {
    alert('Ошибка: ' + e.message);
  }
};


  if (!userInfo) {
    return <div style={styles.centered}>Пользователь не авторизован</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileRow}>
        <img src={profileImage} alt="Profile" style={styles.image} />
        <div>
          <div style={styles.label}><strong>Pubg ID:</strong> {userInfo.pubg_id}</div>
          <div style={styles.label}><strong>Никнейм:</strong> {userInfo.nickname}</div>
          <div style={styles.label}><strong>Телефон:</strong> {userInfo.phone}</div>
        </div>
      </div>

      <div style={styles.balanceBox}>
        Баланс: <strong>{userInfo.balance} $</strong>
      </div>

      <input
        type="number"
        placeholder="Сумма в USD"
        value={amountUsd}
        onChange={(e) => setAmountUsd(e.target.value)}
        style={{ ...styles.input, ...(isError ? styles.inputError : {}) }}
      />

      <button onClick={handlePay} style={styles.button}>
        <img src={btcIcon} alt="btc" style={styles.icon} /> Пополнить криптой
      </button>

      {amountUsd && parseFloat(amountUsd) < 13 ? (
        <button onClick={handleManagerContact} style={styles.managerBtn}>
          Если у вас меньше 13, можно пополнить через менеджера →
        </button>
      ) : (
        <button onClick={handleManagerContact} style={styles.managerBtn}>
          <img src={whatsappIcon} alt="whatsapp" style={styles.icon} /> Оплатить через менеджера
        </button>
      )}

      {showAdminInput ? (
        <div>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Введите промокод"
            style={styles.input}
          />
          <div style={styles.adminBtnRow}>
            <button onClick={tryAdminLogin} style={styles.adminBtn}>Подтвердить</button>
            <button onClick={() => {
              setAdminPassword('');
              setShowAdminInput(false);
            }} style={styles.cancelBtn}>Отмена</button>
          </div>
        </div>
      ) : (
        <div style={styles.bottomRow}>
          <button onClick={() => setShowAdminInput(true)} style={styles.textBtn}>Промокод</button>
          <button
  onClick={() => {
    const confirmed = window.confirm('Вы уверены, что хотите выйти?');
    if (confirmed) logout();
  }}
  style={styles.textBtn}
>
  Выйти
</button>

        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    maxWidth: 500,
    margin: '0 auto',
    backgroundColor: '#fff',
    fontFamily: 'sans-serif',
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    border: `2px solid ${PUBG_DARK_GREEN}`,
    borderRadius: 8,
    padding: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 16,
    border: `2px solid ${PUBG_DARK_GREEN}`,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  balanceBox: {
    padding: 10,
    border: '1px solid #aaa',
    borderRadius: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 6,
    
    marginBottom: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: PUBG_DARK_GREEN,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    cursor: 'pointer',
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  managerBtn: {
    width: '100%',
    padding: 12,
    backgroundColor: PUBG_LIGHT_GREEN,
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adminBtnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  adminBtn: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    backgroundColor: PUBG_DARK_GREEN,
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eee',
    color: PUBG_DARK_GREEN,
    fontWeight: 'bold',
    borderRadius: 6,
    cursor: 'pointer',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: PUBG_DARK_GREEN,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  centered: {
    padding: 50,
    textAlign: 'center',
    color: '#555',
  },
};
