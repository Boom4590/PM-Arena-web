import React, { useState, useContext } from 'react';
import { UserContext } from '../UserContext'; // Убедитесь, что путь верный

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
    event.preventDefault(); // Предотвращаем перезагрузку страницы
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
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>{isRegister ? 'Регистрация' : 'Вход'}</h1>

        <label htmlFor="pubg_id" style={styles.label}>PUBG MOBILE ID</label>
        <input
          id="pubg_id"
          style={{ ...styles.input, ...(errorPubgId ? styles.inputError : {}) }}
          placeholder="Введите PUBG ID"
          value={pubg_id}
          type="text" // Используем text для контроля через JS
          maxLength={10}
          onChange={(e) => handlePubgIdChange(e.target.value)}
        />
        {!!errorPubgId && <p style={styles.errorText}>{errorPubgId}</p>}

        {isRegister && (
          <>
            <label htmlFor="nickname" style={styles.label}>Никнейм</label>
            <input
              id="nickname"
              style={styles.input}
              placeholder="Введите никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <label htmlFor="phone" style={styles.label}>Номер телефона</label>
            <input
              id="phone"
              style={styles.input}
              placeholder="Введите номер телефона"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}

        <label htmlFor="password" style={styles.label}>Пароль</label>
        <input
          id="password"
          style={styles.input}
          placeholder="Введите пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" style={styles.button}>
          <span style={styles.buttonText}>{isRegister ? 'Зарегистрироваться' : 'Войти'}</span>
        </button>

        <p style={styles.switch} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </p>
      </form>
    </div>
  );
}

// Константы и стили для веб-версии
const ACCENT_COLOR = '#2f4f4f'; // темно-зеленый/оливковый
const BACKGROUND = '#fff';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: BACKGROUND,
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: BACKGROUND,
    borderRadius: '12px',
    padding: '25px',
    boxShadow: `0 4px 12px rgba(30, 47, 47, 0.3)`, // аналог shadow* и elevation
    border: `2px solid ${ACCENT_COLOR}`,
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '900',
    color: ACCENT_COLOR,
    marginBottom: '25px',
    textAlign: 'center',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  label: {
    fontWeight: '700',
    color: ACCENT_COLOR,
    marginTop: '12px',
    marginBottom: '6px',
    fontSize: '14px',
    letterSpacing: '1px',
    display: 'block', // чтобы margin работал корректно
  },
  input: {
    border: '2px solid #aaa',
    borderRadius: '6px',
    padding: '10px 15px',
    fontSize: '16px',
    color: '#222',
    backgroundColor: '#f9f9f9',
    width: '100%',
    boxSizing: 'border-box', // чтобы padding не увеличивал ширину
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: '3px',
    marginBottom: '6px',
    fontWeight: '700',
    fontSize: '12px',
    marginLeft: '4px',
  },
  button: {
    marginTop: '24px',
    backgroundColor: ACCENT_COLOR,
    padding: '14px',
    borderRadius: '6px',
    textAlign: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    boxShadow: `0 4px 6px rgba(30, 47, 47, 0.5)`,
  },
  buttonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: '17px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  },
  switch: {
    marginTop: '18px',
    color: ACCENT_COLOR,
    fontWeight: '600',
    textAlign: 'center',
    textDecoration: 'underline',
    fontSize: '14px',
    cursor: 'pointer',
  },
};