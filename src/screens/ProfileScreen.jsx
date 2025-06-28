import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import profileImage from '../assets/profile.png';
import whatsappIcon from '../assets/whatsapp.png';
import btcIcon from '../assets/btc.png';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';
const MANAGER_WHATSAPP = 'https://wa.me/996507535771';
const ADMIN_PASSWORD = 'admin4590$';

// Updated color palette aligned with Tournaments
const COLORS = {
  background: '#121212',          // Deep black for background
  cardBg: '#1E1E1E',              // Dark gray for cards
  accent: '#D4A017',              // Soft gold for balance, buttons
  accentHover: '#E8B923',         // Brighter gold for hover
  secondary: '#1E88E5',           // Deep teal for crypto button
  secondaryHover: '#42A5F5',      // Brighter teal for hover
  textPrimary: '#F7F9FA',         // Crisp white for text
  textSecondary: '#B0BEC5',       // Light gray for secondary text
  success: '#4CAF50',             // Green for manager button
  successHover: '#66BB6A',        // Brighter green for hover
  error: '#F44336',               // Red for errors
  warning: '#FFC107',             // Amber for warnings
  inputBg: '#121212',             // Input background
  inputBorder: '#424242',         // Input border
  inputFocusBorder: '#D4A017',    // Gold for input focus
};

export default function Profile() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [amountUsd, setAmountUsd] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [payCurrency, setPayCurrency] = useState('btc');
  const [isError, setIsError] = useState(false);
  
  // Hover and focus states
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
      alert('Неверный Promocode ;)');
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
    return <div style={{...styles.centered, color: COLORS.textPrimary}}>Пользователь не авторизован</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileRow}>
        <img 
          src={profileImage} 
          alt="Profile" 
          style={{...styles.image, border: `2px solid ${COLORS.accent}`}} 
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
        Баланс: <span style={{...styles.balanceValue, color: 'white',marginLeft:'10px'}}>{userInfo.balance} $</span>
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
            ? COLORS.error 
            : (focusAmount ? COLORS.inputFocusBorder : COLORS.inputBorder)
        }}
      />

      <button 
        onClick={handlePay} 
        style={{
          ...styles.button,
          backgroundColor: hoverPay ? COLORS.secondaryHover : COLORS.secondary,
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
            backgroundColor: hoverManager ? COLORS.warning : COLORS.warning,
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
            backgroundColor: hoverManager ? COLORS.successHover : COLORS.success,
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
                backgroundColor: hoverAdmin ? COLORS.accentHover : COLORS.accent,
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
            style={{...styles.textBtn, color: COLORS.textSecondary}}
          >
            Промокод
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm('Вы уверены, что хотите выйти?');
              if (confirmed) logout();
            }}
            style={{...styles.textBtn, color: COLORS.textSecondary}}
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
    backgroundColor: COLORS.background,
    fontFamily: "'Inter', 'Arial', sans-serif",
    minHeight: '100vh',
    color: COLORS.textPrimary,
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 30,
    background: COLORS.cardBg,
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
    color: COLORS.textSecondary,
  },
  labelValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  balanceBox: {
    padding: 20,
    background: COLORS.cardBg,
    borderRadius: 16,
   paddingRight:40,
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 18,
    color:'silver',
    fontWeight: '500',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  balanceValue: {
    fontWeight: '700',
    fontSize: '1.2em',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.inputBorder}`,
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  button: {
    width: '100%',
    padding: 16,
    color: COLORS.textPrimary,
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
  },
  icon: {
    width: 24,
    height: 24,
  },
  managerBtn: {
    width: '100%',
    padding: 16,
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
    fontWeight: '700',
    borderRadius: 12,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    borderRadius: 12,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: 15,
    transition: 'color 0.3s',
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 40,
    
    padding: '0 10px',
  },
  centered: {
    padding: 50,
    textAlign: 'center',
  },
};