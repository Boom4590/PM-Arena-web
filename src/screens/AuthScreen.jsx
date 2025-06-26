
import React, { useState, useContext } from 'react';
import { UserContext } from '../UserContext';

const BACKEND_URL = 'https://pm-arena-backend-production.up.railway.app';

export default function AuthScreen() {
  const { setUserInfo } = useContext(UserContext);

  const [isRegister, setIsRegister] = useState(true);
  const [pubg_id, setPubgId] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorPubgId, setErrorPubgId] = useState('');

  const handlePubgIdChange = (text) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= 10) {
      setPubgId(digitsOnly);
      if (errorPubgId) setErrorPubgId('');
    }
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isRegister) {
      register();
    } else {
      login();
    }
  };

  async function register() {
    if (!pubg_id || pubg_id.length !== 10) {
      setErrorPubgId('Введите корректный PUBG MOBILE ID');
      return;
    }
    if (!nickname || !phone || !password) {
      setErrorPubgId('');
      alert('Заполните все поля');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id, nickname, phone, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Ошибка регистрации');
        return;
      }
      alert('Регистрация прошла успешно. Войдите в аккаунт.');
      setIsRegister(false);
      setPubgId('');
      setPassword('');
      setNickname('');
      setPhone('');
    } catch (e) {
      alert('Сервер недоступен');
    }
  }

  async function login() {
    if (!pubg_id || pubg_id.length !== 10) {
      setErrorPubgId('Введите корректный PUBG MOBILE ID');
      return;
    }
    if (!password) {
      setErrorPubgId('');
      alert('Заполните PUBG ID и пароль');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubg_id, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          alert(`${data.error || 'Ошибка авторизации'}\nВы заблокированы и не можете войти в аккаунт.`);
        } else {
          alert(data.error || 'Ошибка авторизации');
        }
        return;
      }
      
      // Используем localStorage вместо AsyncStorage
      localStorage.setItem('loginSuccess', JSON.stringify(data.success));
      localStorage.setItem('user', JSON.stringify(data.user));
      setUserInfo(data.user);
     
    } catch (e) {
      alert('Сервер недоступен');
    }
  }


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>PM ARENA</div>
        <div style={styles.subtitle}>КИБЕРСПОРТИВНАЯ ПЛАТФОРМА</div>
      </div>
      
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>{isRegister ? 'РЕГИСТРАЦИЯ' : 'ВХОД В СИСТЕМУ'}</h1>

        <div style={styles.inputContainer}>
          <label htmlFor="pubg_id" style={styles.label}>PUBG ID</label>
          <input
            id="pubg_id"
            style={{ ...styles.input, ...(errorPubgId ? styles.inputError : {}) }}
            placeholder="Введите ваш PUBG ID"
            value={pubg_id}
            type="text"
            maxLength={10}
            onChange={(e) => handlePubgIdChange(e.target.value)}
          />
          {!!errorPubgId && <p style={styles.errorText}>{errorPubgId}</p>}
        </div>

        {isRegister && (
          <>
            <div style={styles.inputContainer}>
              <label htmlFor="nickname" style={styles.label}>ИГРОВОЙ НИК</label>
              <input
                id="nickname"
                style={styles.input}
                placeholder="Ваш игровой никнейм"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div style={styles.inputContainer}>
              <label htmlFor="phone" style={styles.label}>ТЕЛЕФОН</label>
              <input
                id="phone"
                style={styles.input}
                placeholder="+996 XXX XXX XXX"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </>
        )}

        <div style={styles.inputContainer}>
          <label htmlFor="password" style={styles.label}>ПАРОЛЬ</label>
          <input
            id="password"
            style={styles.input}
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={styles.button}>
          <span style={styles.buttonText}>{isRegister ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ'}</span>
        </button>

       <p style={styles.switch} onClick={() => setIsRegister(!isRegister)}>
  {isRegister ? (
    <>
      Уже зарегистрированы? <span style={styles.switchHighlight}>Войти в систему</span>
    </>
  ) : (
    <>
      Новый игрок? <span style={styles.switchHighlight}>Создать аккаунт</span>
    </>
  )}
</p>
      </form>
      
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2023 PM ARENA | Киберспортивные турниры</p>
      </div>
    </div>
  );
}

// Новая киберспортивная палитра
const PRIMARY_COLOR = '#121212';       // Основной темный фон
const ACCENT_COLOR = '#F0A400';        // Акцентный оранжевый (энергия, действие)
const SECONDARY_COLOR = '#29B6F6';     // Неоново-синий (технологии)
const ERROR_COLOR = '#D7263D';         // Ошибки/предупреждения
const CARD_BG = '#1E1E1E';             // Фон карточек
const TEXT_LIGHT = '#FFFFFF';          // Основной текст
const TEXT_SECONDARY = '#A0A0A0';      // Вторичный текст

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: PRIMARY_COLOR,
    fontFamily: '"Rajdhani", "Arial Narrow", sans-serif',
    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(41, 182, 246, 0.1) 0%, rgba(41, 182, 246, 0) 20%), radial-gradient(circle at 90% 80%, rgba(240, 164, 0, 0.1) 0%, rgba(240, 164, 0, 0) 20%)',
    color: TEXT_LIGHT,
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '42px',
    fontWeight: '900',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    background: `linear-gradient(45deg, ${ACCENT_COLOR}, ${SECONDARY_COLOR})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 15px rgba(240, 164, 0, 0.3)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '3px',
    color: TEXT_SECONDARY,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: '12px',
    padding: '30px',
    width: '100%',
    maxWidth: '450px',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: TEXT_LIGHT,
    marginBottom: '30px',
    textAlign: 'center',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    position: 'relative',
    paddingBottom: '15px',
  },

  inputContainer: {
    marginBottom: '20px',
  },
  label: {
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: '8px',
    fontSize: '13px',
    letterSpacing: '1px',
    display: 'block',
    textTransform: 'uppercase',
  },
  input: {
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '14px 16px',
    fontSize: '16px',
    color: TEXT_LIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  inputError: {
    borderColor: ERROR_COLOR,
    boxShadow: `0 0 0 2px rgba(215, 38, 61, 0.2)`,
  },
  errorText: {
    color: ERROR_COLOR,
    marginTop: '6px',
    fontWeight: '600',
    fontSize: '13px',
  },
  button: {
    marginTop: '15px',
    background: `linear-gradient(45deg, ${ACCENT_COLOR}, #FF8C00)`,
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 15px rgba(240, 164, 0, 0.3)`,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonText: {
    color: PRIMARY_COLOR,
    fontWeight: '800',
    fontSize: '16px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 2,
  },
  switch: {
    marginTop: '25px',
    color: TEXT_SECONDARY,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    lineHeight: '1.6',
  },
  switchHighlight: {
    color: SECONDARY_COLOR,
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: TEXT_SECONDARY,
    letterSpacing: '1px',
  },
};