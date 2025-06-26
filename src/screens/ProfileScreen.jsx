import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import profileImage from '../assets/profile.png';
import whatsappIcon from '../assets/whatsapp.png';
import btcIcon from '../assets/btc.png';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';
const MANAGER_WHATSAPP = 'https://wa.me/996507535771';
const ADMIN_PASSWORD = 'admin4590$';

// Обновленная цветовая палитра
const BACKGROUND = '#121212';
const CARD_BG = '#1E1E1E';
const ACCENT = '#FF9800';
const ACCENT_HOVER = '#FFB74D';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#BDBDBD';
const SUCCESS = '#4CAF50';
const ERROR_COLOR = '#F44336';
const WARNING = '#FFC107';
const INPUT_BG = '#121212';
const INPUT_BORDER = '#424242';
const INPUT_FOCUS_BORDER = ACCENT;

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
    return <div style={{...styles.centered, color: TEXT_PRIMARY}}>Пользователь не авторизован</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileRow}>
        <img 
          src={profileImage} 
          alt="Profile" 
          style={{...styles.image, border: `2px solid ${ACCENT}`}} 
        />
        <div style={styles.infoContainer}>
          <div style={styles.label}>
            <span style={styles.labelText}>Pubg ID:</span>
            <span style={styles.labelValue}>{userInfo.pubg_id}</span>
          </div>
          <div style={styles.label}>
            <span style={styles.labelText}>Никнейм:</span>
            <span style={styles.labelValue}>{userInfo.nickname}</span>
          </div>
          <div style={styles.label}>
            <span style={styles.labelText}>Телефон:</span>
            <span style={styles.labelValue}>{userInfo.phone}</span>
          </div>
        </div>
      </div>

      <div style={styles.balanceBox}>
        Баланс: <span style={styles.balanceValue}>{userInfo.balance} $</span>
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
          background: hoverPay 
            ? `linear-gradient(135deg, ${ACCENT_HOVER} 0%, #E65100 100%)` 
            : `linear-gradient(135deg, ${ACCENT} 0%, #F57C00 100%)`,
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
            backgroundColor: hoverManager ? '#FFD54F' : WARNING,
            color: '#000',
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
            backgroundColor: hoverManager ? '#66BB6A' : SUCCESS,
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
                backgroundColor: hoverCancel ? '#424242' : '#333',
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
            style={{...styles.textBtn, color: TEXT_SECONDARY}}
          >
            Промокод
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm('Вы уверены, что хотите выйти?');
              if (confirmed) logout();
            }}
            style={{...styles.textBtn, color: TEXT_SECONDARY}}
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
    color: TEXT_PRIMARY,
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
    background:`linear-gradient(135deg, ${CARD_BG} 0%, #263238 100%)`,
    borderRadius: 16,
    padding: 24,
    gap: 20,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  infoContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
    lineHeight: 1.5,
  },
  labelText: {
    color: TEXT_SECONDARY,
  },
  labelValue: {
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  balanceBox: {
    padding: 20,
    background: CARD_BG,
    borderRadius: 16,
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  balanceValue: {
    color: '#white',
    fontWeight: '700',
    fontSize: '1.2em',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: INPUT_BG,
    color: TEXT_PRIMARY,
    border: `1px solid ${INPUT_BORDER}`,
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    ':focus': {
      borderColor: INPUT_FOCUS_BORDER,
      boxShadow: `0 0 0 2px rgba(255, 152, 0, 0.2)`,
    }
  },
  button: {
    width: '100%',
    padding: 16,
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    cursor: 'pointer',
    gap: 12,
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4)',
    }
  },
  icon: {
    width: 24,
    height: 24,
  },
  managerBtn: {
    width: '100%',
    padding: 16,
    color: '#fff',
    fontWeight: '600',
    borderRadius: 12,
    cursor: 'pointer',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4)',
    }
  },
  adminBtnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  adminBtn: {
    flex: 1,
    padding: 14,
    color: '#000',
    fontWeight: '700',
    borderRadius: 12,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4)',
    }
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    borderRadius: 12,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4)',
    }
  },
  textBtn: {
    background: 'none',
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: 15,
    transition: 'color 0.3s',
    ':hover': {
      color: ACCENT,
    }
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 25,
    padding: '0 10px',
  },
  centered: {
    padding: 50,
    textAlign: 'center',
  },
};