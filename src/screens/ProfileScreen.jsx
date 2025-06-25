import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import profileImage from '../assets/profile.png';
import whatsappIcon from '../assets/whatsapp.png';
import btcIcon from '../assets/btc.png';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';
const MANAGER_WHATSAPP = 'https://wa.me/996507535771';
const ADMIN_PASSWORD = 'admin4590$';

// Новые цвета дизайна
const BACKGROUND = '#121212';
const CARD_BG = '#2C2C2C';
const ACCENT = '#F0A400';
const ACCENT_HOVER = '#FFB300';
const TEXT_COLOR = '#FFFFFF';
const INPUT_BG = '#1E1E1E';
const INPUT_BORDER = '#444';
const INPUT_FOCUS_BORDER = ACCENT;
const LINK_COLOR = '#29B6F6';
const ERROR_COLOR = '#D7263D';

export default function Profile() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [amountUsd, setAmountUsd] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [payCurrency, setPayCurrency] = useState('btc');
  const [isError, setIsError] = useState(false);
  
  // Состояния для hover-эффектов
  const [hoverPay, setHoverPay] = useState(false);
  const [hoverManager, setHoverManager] = useState(false);
  const [hoverAdmin, setHoverAdmin] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
  const [focusAmount, setFocusAmount] = useState(false);

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
    navigate('/');
  };

  const handleManagerContact = () => {
    window.open(MANAGER_WHATSAPP, '_blank');
  };

  const tryAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      navigate('/admin');
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
      window.open(data.invoice_url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('Ошибка: ' + e.message);
    }
  };

  if (!userInfo) {
    return <div style={{...styles.centered, color: TEXT_COLOR}}>Пользователь не авторизован</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileRow}>
        <img 
          src={profileImage} 
          alt="Profile" 
          style={{...styles.image, border: `2px solid ${ACCENT}`}} 
        />
        <div style={styles.flexx}>
          <div style={styles.label}><strong>Pubg ID:</strong><div>{userInfo.pubg_id}</div> </div>
          <div style={styles.label}><strong>Никнейм:</strong> <div>{userInfo.nickname}</div></div>
          <div style={styles.label}><strong>Телефон:</strong> <div>{userInfo.phone}</div></div>
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
        onFocus={() => setFocusAmount(true)}
        onBlur={() => setFocusAmount(false)}
        style={{ 
          ...styles.input, 
          borderColor: isError 
            ? ERROR_COLOR 
            : (focusAmount ? INPUT_FOCUS_BORDER : INPUT_BORDER)
        }}
      />

      <button 
        onClick={handlePay} 
        style={{
          ...styles.button,
          backgroundColor: hoverPay ? ACCENT_HOVER : ACCENT,
        }}
        onMouseEnter={() => setHoverPay(true)}
        onMouseLeave={() => setHoverPay(false)}
      >
        <img src={btcIcon} alt="btc" style={styles.icon} /> Пополнить криптой
      </button>

      {amountUsd && parseFloat(amountUsd) < 13 ? (
        <button 
          onClick={handleManagerContact} 
          style={{
            ...styles.managerBtn,
            backgroundColor: hoverManager ? '#4fc3f7' : LINK_COLOR,
          }}
          onMouseEnter={() => setHoverManager(true)}
          onMouseLeave={() => setHoverManager(false)}
        >
          Если у вас меньше 13, можно пополнить через менеджера →
        </button>
      ) : (
        <button 
          onClick={handleManagerContact} 
          style={{
            ...styles.managerBtn,
            backgroundColor: hoverManager ? '#4fc3f7' : LINK_COLOR,
          }}
          onMouseEnter={() => setHoverManager(true)}
          onMouseLeave={() => setHoverManager(false)}
        >
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
            <button 
              onClick={tryAdminLogin}
              style={{
                ...styles.adminBtn,
                backgroundColor: hoverAdmin ? ACCENT_HOVER : ACCENT,
              }}
              onMouseEnter={() => setHoverAdmin(true)}
              onMouseLeave={() => setHoverAdmin(false)}
            >
              Подтвердить
            </button>
            <button 
              onClick={() => {
                setAdminPassword('');
                setShowAdminInput(false);
              }}
              style={{
                ...styles.cancelBtn,
                backgroundColor: hoverCancel ? '#666' : '#444',
              }}
              onMouseEnter={() => setHoverCancel(true)}
              onMouseLeave={() => setHoverCancel(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.bottomRow}>
          <button 
            onClick={() => setShowAdminInput(true)} 
            style={{...styles.textBtn, color: LINK_COLOR}}
          >
            Промокод
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm('Вы уверены, что хотите выйти?');
              if (confirmed) logout();
            }}
            style={{...styles.textBtn, color: LINK_COLOR}}
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
    backgroundColor: BACKGROUND,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    color: TEXT_COLOR,
  },
 profileRow: {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 30,
  backgroundColor: CARD_BG,
  borderRadius: 12,
  padding: 20,
  gap: 20,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
},

  image: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    marginRight: 20,
    objectFit: 'cover',
  },
label: {
width:'100%',
  marginBottom: 10,
  display: 'flex',
  justifyContent:'space-between',
  fontSize: 17,
  lineHeight: 1.4,
},

  balanceBox: {
  
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
 flexx: {
  width:'60%',
  display: 'flex',
  flexDirection: 'column', // если хочешь вертикально
  alignItems: 'flex-start', // прижать к левому краю по поперечной оси
  justifyContent: 'space-between', // прижать к верхнему краю по основной оси
  gap: '8px', // отступы между элементами для ровного визуала (по желанию)
}
,
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: INPUT_BG,
    color: TEXT_COLOR,
    border: '1px solid',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: 16,
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    cursor: 'pointer',
    gap: 10,
    border: 'none',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  icon: {
    width: 24,
    height: 24,
  },
  managerBtn: {
    width: '100%',
    padding: 14,
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 20,
    backgroundColor:'rgb(0 122 63)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    border: 'none',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  adminBtnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  adminBtn: {
    flex: 1,
    padding: 14,
    color: '#000',
    fontWeight: 'bold',
    borderRadius: 8,
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    color: TEXT_COLOR,
    fontWeight: 'bold',
    borderRadius: 8,
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.3s, transform 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  textBtn: {
    background: 'none',
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 15,
    transition: 'color 0.3s',
    ':hover': {
      textDecoration: 'underline',
    }
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  centered: {
    padding: 50,
    textAlign: 'center',
  },
};