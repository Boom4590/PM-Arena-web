import React, { useContext, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom';

import { UserProvider, UserContext } from './UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import InstructionScreen from './screens/InstructionScreen';
import CryptoPaymentScreen from './screens/CryptoPaymentScreen';
import AuthScreen from './screens/AuthScreen';
import Tournaments from './screens/TournamentsScreen';
import CurrentTournament from './screens/CurrentTournamentScreen';
import StyledProfile from './screens/ProfileScreen';
import AdminPanel from './screens/AdminPanelScreen';
import StyledLobbyScreen from './screens/LobbyScreen';

import './App.css';

import {
  IoGameController,
  IoList,
  IoTimer,
  IoPerson,
  IoArrowBack,
  IoInformationCircle
} from 'react-icons/io5';

// Цветовая палитра
const PRIMARY_COLOR = '#121212';       // Основной темный фон
const ACCENT_COLOR = '#F0A400';        // Акцентный оранжевый
const SECONDARY_COLOR = '#29B6F6';     // Неоново-синий
const CARD_BG = '#1E1E1E';             // Фон карточек
const TEXT_LIGHT = '#FFFFFF';          // Основной текст
const TEXT_SECONDARY = '#A0A0A0';      // Вторичный текст

// === Header Component ===
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showBack = !['/tournaments', '/current', '/StyledProfile'].includes(path);
  const showRules = ['/tournaments', '/current', '/StyledProfile'].includes(path);
  
  // Определяем тип экрана
  const isVeryNarrow = windowWidth < 350;
  const isNarrow = windowWidth < 420;

  return (
    <header className="appHeader" style={{
      backgroundColor: PRIMARY_COLOR,
      borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
      padding: '12px 16px',
    }}>
      <div className="headerContent" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '100%',
        gap: '8px',
      }}>
        {/* Левая часть: кнопка "Назад" или пустое место */}
        {showBack ? (
          <button 
            className="backButton" 
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: ACCENT_COLOR,
              fontWeight: 700,
              fontSize: isVeryNarrow ? '14px' : '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              minWidth: isVeryNarrow ? '40px' : 'auto',
            }}
          >
            {!isVeryNarrow && <IoArrowBack size={20} style={{ marginRight: 5 }} />}
            {isVeryNarrow ? '←' : 'Назад'}
          </button>
        ) : (
          <div style={{ width: isVeryNarrow ? '40px' : '70px' }} />
        )}

        {/* Центральная часть: логотип */}
        <div 
          className="logoBox" 
          onClick={() => navigate('/tournaments')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexShrink: 1,
            minWidth: 0, // Важно для правильного сжатия текста
          }}
        >
          <span className="headerText" style={{
            fontWeight: 900,
            fontSize: isNarrow ? '18px' : '22px',
            letterSpacing: '1px',
            background: `linear-gradient(45deg, ${ACCENT_COLOR}, ${SECONDARY_COLOR})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 15px rgba(240, 164, 0, 0.3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: isVeryNarrow ? '120px' : '100%',
          }}>
            {isVeryNarrow ? 'PM Arena' : 'PM Arena'}
          </span>
          {!isNarrow && (
            <IoGameController size={22} style={{ 
              marginLeft: '6px',
              color: SECONDARY_COLOR,
              flexShrink: 0,
            }} />
          )}
        </div>

        {/* Правая часть: кнопка инструкции */}
        {showRules ? (
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: SECONDARY_COLOR,
              fontWeight: 700,
              fontSize: isVeryNarrow ? '12px' : '14px',
              cursor: 'pointer',
              padding: '6px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              minWidth: isVeryNarrow ? '40px' : 'auto',
            }} 
            onClick={() => navigate('/instruction')}
          >
            {isVeryNarrow ? (
              <IoInformationCircle size={18} />
            ) : (
              <>
                <IoInformationCircle size={18} style={{ marginRight: '4px' }} />
                Инструкция
              </>
            )}
          </button>
        ) : (
          <div style={{ width: isVeryNarrow ? '40px' : '70px' }} />
        )}
      </div>
    </header>
  );
}

// === Bottom Tabs ===
function BottomTabBar() {
  const location = useLocation();
  const activeTab = location.pathname;
  
  const tabs = [
    { path: '/tournaments', icon: <IoList size={24} />, label: 'Турниры' },
    { path: '/current', icon: <IoTimer size={24} />, label: 'Текущий' },
    { path: '/StyledProfile', icon: <IoPerson size={24} />, label: 'Профиль' }
  ];

  return (
    <nav className="bottomTabBar" style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: PRIMARY_COLOR,
      borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
      padding: '8px 0',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <Link 
          key={tab.path}
          to={tab.path} 
          className={`tabItem ${activeTab === tab.path ? 'active' : ''}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            padding: '8px 12px',
            color: activeTab === tab.path ? ACCENT_COLOR : TEXT_SECONDARY,
            fontWeight: activeTab === tab.path ? 700 : 500,
            fontSize: '12px',
            transition: 'color 0.3s',
          }}
        >
          {tab.icon}
          <span style={{ marginTop: '4px' }}>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}

// === Layout Wrapper ===
function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="appContainer" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: PRIMARY_COLOR,
      paddingBottom: '60px', /* Чтобы контент не скрывался под нижней панелью */
    }}>
      <Header />
      <main className="content" style={{
        flex: 1,
     
        maxWidth: '100%',
        margin: '0',
        width: '100%',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ y: '0%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomTabBar />
    </div>
  );
}

// === Tab Routes ===
function TabScreens() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  return (
    <AppLayout>
      <Routes>
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/current" element={<CurrentTournament />} />
        <Route path="/StyledProfile" element={<StyledProfile user={userInfo} setUser={setUserInfo} />} />
        <Route path="*" element={<Navigate to="/tournaments" replace />} />
      </Routes>
    </AppLayout>
  );
}

// === Main App Routing ===
function MainApp() {
  const { userInfo } = useContext(UserContext);
  const [initialScreen, setInitialScreen] = useState(null);

  useEffect(() => {
    if (!userInfo) return;
    const shown = localStorage.getItem('instructionShown');
    if (shown !== 'true') {
      localStorage.setItem('instructionShown', 'true');
      setInitialScreen('instruction');
    } else {
      setInitialScreen('main');
    }
  }, [userInfo]);

  if (!userInfo) return <AuthScreen />;
  if (!initialScreen) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: PRIMARY_COLOR,
      color: TEXT_LIGHT,
      fontSize: '18px',
      fontWeight: 600,
    }}>
      Загрузка...
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/instruction"
          element={
            <AppLayout>
              <InstructionScreen />
            </AppLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AppLayout>
              <AdminPanel user={userInfo} />
            </AppLayout>
          }
        />
        <Route
          path="/crypto-payment"
          element={
            <AppLayout>
              <CryptoPaymentScreen />
            </AppLayout>
          }
        />
        <Route
          path="/lobby"
          element={
            <AppLayout>
              <StyledLobbyScreen />
            </AppLayout>
          }
        />
        <Route path="/*" element={<TabScreens />} />
        {initialScreen === 'instruction' && (
          <Route path="*" element={<Navigate to="/instruction" replace />} />
        )}
      </Routes>
    </Router>
  );
}

// === Root App ===
export default function App() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    function checkIsMobile() {
      const mobile = window.innerWidth <= 835;
      setIsMobile(mobile);
    }

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  if (isMobile === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: PRIMARY_COLOR,
        color: TEXT_LIGHT,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Загрузка...
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #000)`,
        color: TEXT_LIGHT,
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: `linear-gradient(45deg, ${ACCENT_COLOR}, ${SECONDARY_COLOR})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '32px',
          fontWeight: 900,
          marginBottom: '20px',
        }}>
          PM ARENA
        </div>
        <p style={{ fontSize: '24px', marginBottom: '30px' }}>
          Этот сайт доступен только с мобильных устройств
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '500px',
        }}>
          <p style={{ marginBottom: '20px' }}>
            Пожалуйста, откройте приложение на смартфоне или уменьшите размер окна браузера
          </p>
          <div style={{
            width: '200px',
            height: '300px',
            border: `4px solid ${SECONDARY_COLOR}`,
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '20px',
              right: '20px',
              height: '40px',
              background: ACCENT_COLOR,
              borderRadius: '8px',
            }} />
            <div style={{
              position: 'absolute',
              top: '100px',
              left: '20px',
              right: '20px',
              height: '150px',
              background: CARD_BG,
              borderRadius: '12px',
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              height: '50px',
              background: PRIMARY_COLOR,
              borderRadius: '8px',
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
              display: 'flex',
              justifyContent: 'space-around',
            }}>
              {[ACCENT_COLOR, SECONDARY_COLOR, ACCENT_COLOR].map((color, i) => (
                <div key={i} style={{
                  width: '40px',
                  height: '40px',
                  background: color,
                  borderRadius: '50%',
                  marginTop: '5px',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}