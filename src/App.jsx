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
import Profile from './screens/ProfileScreen';
import AdminPanel from './screens/AdminPanelScreen';
import LobbyScreen from './screens/LobbyScreen';

import './App.css';

import {
  IoGameControllerOutline,
  IoList,
  IoTimerOutline,
  IoPersonOutline,
} from 'react-icons/io5';

// === Header Component ===

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const showBack = !['/tournaments', '/current', '/profile'].includes(path);
  const showRules = ['/tournaments', '/current', '/profile'].includes(path);

  return (
    <header className="appHeader">
      <div className="headerContent">
        {showBack ? (
          <button className="backButton" onClick={() => navigate(-1)}>
            ← Назад
          </button>
        ) : (
          <div style={{ width: 70 }} />
        )}

        <div className="logoBox" onClick={() => navigate('/tournaments')}>
          <span className="headerText">PM Arena</span>
          <IoGameControllerOutline size={22} color="#1E3D23" style={{ marginLeft: 6 }} />
        </div>

        {showRules ? (
          <button className="" style={{ marginRight: 0,padding:0,fontSize:14 }} onClick={() => navigate('/instruction')}>
            Инструк.ℹ️
          </button>
        ) : (
          <div style={{ width: 70 }} />
        )}
      </div>
    </header>
  );
}

// === Bottom Tabs ===
function BottomTabBar() {
  const location = useLocation();
  const activeTab = location.pathname;

  return (
    <nav className="bottomTabBar">
      <Link to="/tournaments" className={`tabItem ${activeTab === '/tournaments' ? 'active' : ''}`}>
        <IoList size={24} />
        <span>Турниры</span>
      </Link>
      <Link to="/current" className={`tabItem ${activeTab === '/current' ? 'active' : ''}`}>
        <IoTimerOutline size={24} />
        <span>Текущий</span>
      </Link>
      <Link to="/profile" className={`tabItem ${activeTab === '/profile' ? 'active' : ''}`}>
        <IoPersonOutline size={24} />
        <span>Профиль</span>
      </Link>
    </nav>
  );
}

// === Layout Wrapper ===


function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="appContainer">
      <Header />
      <main className="content">
        <AnimatePresence mode="wait">
   <motion.div
  key={location.pathname}
  initial={{ y: '4%', opacity: 1 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: '4%', opacity: 1}}
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
        <Route path="/profile" element={<Profile user={userInfo} setUser={setUserInfo} />} />
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
  if (!initialScreen) return <div>Загрузка...</div>;

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
              <LobbyScreen />
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
    const [isMobile, setIsMobile] = useState(null); // null — пока не определено

  useEffect(() => {
    function checkIsMobile() {
      const mobile = window.innerWidth <= 835;
      setIsMobile(mobile);
    }

    checkIsMobile(); // Проверяем сразу при монтировании

    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  if (isMobile === null) {
    // Пока не определили устройство, показываем заглушку (чтобы не было пустоты)
    return <div>Загрузка...</div>;
  }

  if (!isMobile) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh', fontSize: '1.5rem' }}>
        Этот сайт доступен только с мобильных устройств.
      </div>
    );
  }

  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
