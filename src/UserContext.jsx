import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка данных пользователя из localStorage при монтировании
    try {
      const savedUser = localStorage.getItem('userInfo');
      if (savedUser) {
        setUserInfo(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Ошибка загрузки userInfo из localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Сохранение данных пользователя в localStorage при изменении
    try {
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('userInfo');
      }
    } catch (e) {
      console.error('Ошибка сохранения userInfo в localStorage:', e);
    }
  }, [userInfo]);

  if (loading) {
    // Можно вернуть спиннер или null, пока данные загружаются
    return null;
  }

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}
