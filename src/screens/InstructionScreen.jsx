import React, { useState } from 'react';

export default function InstructionScreen() {
  const [lang, setLang] = useState('ru');
  const toggleLang = () => setLang(lang === 'ru' ? 'kg' : 'ru');

  const rulesText = {
    ru: {
      title: '📌 Правила участия в турнире',
      extraRulesTitle: '🔰 Как участвовать (обязательно прочтите)',
      extraRules: [
        'Указывайте настоящий PUBG MOBILE ID, с которым будете заходить в лобби. Другой аккаунт — исключение.',
        'Указывайте номер с WhatsApp — менеджер свяжется.',
        'Чтобы участвовать: пополните баланс → выберите турнир → нажмите "Участвовать".',
        'После регистрации данные появятся в "Текущий турнир".',
        'Занимайте только свой слот — иначе исключат.',
        'В лобби заходите с тем PUBG ID, с которым регистрировались.',
        'Нарушения (читы, тиминг) — проверка до 7 дней.',
        'Победителям пишут в WhatsApp для выплаты.',
        'При уважительной причине можно вернуть деньги через менеджера.',
        'Все вопросы — только через WhatsApp менеджера.',
      ],
      rewardsTitle: '🏆 Награды и условия',
      rewards: [
        'Деньги отправляются в течение 6–12 часов после проверки.',
        'Победитель получает сообщение в WhatsApp.',
        'Если номер недоступен — игрок сам пишет менеджеру.',
        'Игроки без оплаты в лобби — без награды и пожизненный бан.',
      ],
      bansTitle: '🚫 Пожизненный бан за:',
      bans: [
        'Игра с эмулятора',
        'Использование читов или стороннего ПО',
        'Использование багов (застревание в текстурах и др.)',
        'Тиминг (командная игра в SOLO-турнире)',
        'Занятие чужого слота',
        'Передача ID и пароля лобби другим',
      ],
      section2Title: '❗ Если заняли не свой слот',
      section2: ['Вы будете исключены, но можете вернуться до начала матча.'],
      section3Title: '⚠ После входа в лобби',
      section3: [
        'Нельзя выходить или менять место.',
        'Если матч начнётся без вас — билет не возвращается.',
      ],
      section4Title: '❓ Если не удалось зайти в лобби',
      section4: [
        'Обратитесь в поддержку WhatsApp и объясните ситуацию.',
        'При подтверждении причины — билет вернётся.',
      ],
      understood: 'Понятно',
    },
    kg: {
      title: '📌 Турнирге катышуу эрежелери',
      extraRulesTitle: '🔰 Катышуу тартиби (милдеттүү окуңуз)',
      extraRules: [
        'PUBG MOBILE IDңизди туура жазыңыз — ошол аккаунт менен лоббиге киришиңиз керек.',
        'WhatsApp номериңизди жазыңыз — менеджер байланышат.',
        'Катышуу үчүн: баланс толтуруңуз → турнир тандаңыз → "Катышуу".',
        '"Азыркы турнир" бөлүмүндө маалымат чыгат.',
        'Ар ким өз ордуна отурушу керек — болбосо чыгарып салышат.',
        'Лоббиге каттоодо колдонгон PUBG ID менен гана кириңиз.',
        'Эрежени бузса — текшерүү 7 күнгө чейин болушу мүмкүн.',
        'Жеңгендерге WhatsApp аркылуу жазышат.',
        'Катыша албаган учурда менеджер аркылуу акча кайтарылышы мүмкүн.',
        'Бардык суроолор WhatsApp аркылуу гана чечилет.',
      ],
      rewardsTitle: '🏆 Сыйлык жана шарттар',
      rewards: [
        'Сыйлык 6–12 саат ичинде берилет (текшерүүдөн кийин).',
        'Жеңүүчүгө WhatsApp аркылуу байланышат.',
        'Номер жеткиликсиз болсо — өзү менеджерге жазышы керек.',
        'Төлөбөстөн лоббиге кирген — сыйлык берилбейт, өмүр бою бан.',
      ],
      bansTitle: '🚫 Өмүр бою бан үчүн:',
      bans: [
        'Эмулятор менен ойноо',
        'Чит же башка программаларды колдонуу',
        'Багдарды пайдалануу (дубалга кирүү ж.б.)',
        'Тиминг (SOLO турнирде командалык оюн)',
        'Башканын ордуна отуруу',
        'Лоббинин ID жана сыр сөзүн бөлүшүү',
      ],
      section2Title: '❗ Эгер башка орунга отурсаңыз',
      section2: ['Сиз чыгарылат, бирок оюн башталганга чейин кайта аласыз.'],
      section3Title: '⚠ Лоббиге киргенден кийин',
      section3: [
        'Ордуңузду өзгөртүүгө жана чыгууга болбойт.',
        'Оюндун башында жок болсоңуз — билет күйөт.',
      ],
      section4Title: '❓ Лоббиге кире албасаңыз',
      section4: [
        'WhatsApp менен байланышып, себебин түшүндүрүңүз.',
        'Себеп тастыкталса — билет кайтарылат.',
      ],
      understood: 'Түшүнүктүү',
    },
  };

  const t = rulesText[lang];

  const renderList = (arr, style) =>
    arr.map((item, idx) => (
      <li key={idx} style={{ ...styles.text, ...style }}>
        <div style={styles.listBullet}>•</div>
        <div style={styles.listItemText}>{item}</div>
      </li>
    ));

  return (
    <div style={styles.container}>
      {/* Языковой переключатель */}
      <div style={styles.fixedTopBar}>
        <button 
          onClick={toggleLang} 
          style={styles.toggleButton}
          aria-label={lang === 'ru' ? 'Переключить на кыргызский' : 'Switch to Russian'}
        >
          <span style={styles.flagText}>{lang === 'ru' ? '🇰🇬' : '🇷🇺'}</span>
          <span style={styles.langText}>{lang === 'ru' ? 'Кыргызча' : 'Русский'}</span>
        </button>
      </div>

      <div style={styles.contentContainer}>
        <h1 style={styles.title}>{t.title}</h1>

        <div style={styles.rulesContainer}>
          <section style={{ ...styles.section, ...styles.sectionImportant }}>
            <h2 style={styles.sectionTitle}>{t.extraRulesTitle}</h2>
            <ul style={styles.list}>{renderList(t.extraRules)}</ul>
          </section>

          <section style={{ ...styles.section, ...styles.sectionImportant }}>
            <h2 style={styles.sectionTitle}>{t.rewardsTitle}</h2>
            <ul style={styles.list}>{renderList(t.rewards)}</ul>
          </section>

          <section style={{ ...styles.section, ...styles.sectionWarning }}>
            <h2 style={styles.sectionTitle}>{t.bansTitle}</h2>
            <ul style={styles.list}>{renderList(t.bans, styles.warningText)}</ul>
          </section>

          <div style={styles.grid}>
            <section style={{ ...styles.section, ...styles.sectionInfo }}>
              <h2 style={styles.sectionTitle}>{t.section2Title}</h2>
              <ul style={styles.list}>{renderList(t.section2)}</ul>
            </section>

            <section style={{ ...styles.section, ...styles.sectionInfo }}>
              <h2 style={styles.sectionTitle}>{t.section3Title}</h2>
              <ul style={styles.list}>{renderList(t.section3)}</ul>
            </section>
          </div>

          <section style={{ ...styles.section, ...styles.sectionInfo }}>
            <h2 style={styles.sectionTitle}>{t.section4Title}</h2>
            <ul style={styles.list}>{renderList(t.section4)}</ul>
          </section>
        </div>

        {/* Кнопка "Понятно" */}
        <button
          style={styles.button}
          onClick={() => alert(lang === 'ru' ? 'Вы ознакомились с правилами!' : 'Эрежелер менен тааныштыңыз!')}
          aria-label={lang === 'ru' ? 'Подтвердить ознакомление' : 'Түшүнүктүү'}
        >
          {t.understood}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    color: '#f0f0f0',
    paddingBottom: 40,
  },
  contentContainer: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '0 20px',
  },
  fixedTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '15px 20px',
   
    position: 'sticky',
    top: 0,
    zIndex: 100,
    
  },
  toggleButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    padding: '8px 15px',
    border: '1px solid #555',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s',
    color: '#FFD700',
    fontWeight: 500,
    fontSize: 15,
    ':hover': {
      backgroundColor: '#222',
    },
  },
  flagText: {
    fontSize: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#FFD700',
    margin: '20px 0 25px',
    textAlign: 'center',
    padding: '0 10px',
  },
  rulesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  section: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1d1d1d',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  sectionImportant: {
    borderLeft: '4px solid #FFD700',
  },
  sectionWarning: {
    borderLeft: '4px solid #e74c3c',
    backgroundColor: '#241a1a',
  },
  sectionInfo: {
    borderLeft: '4px solid #3498db',
    backgroundColor: '#1a1d24',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 600,
    color: '#FFD700',
    marginTop: 0,
    marginBottom: 15,
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    padding: 0,
    margin: 0,
    listStyleType: 'none',
  },
  listItemText: {
    lineHeight: 1.5,
  },
  text: {
    fontSize: 15,
    color: '#e0e0e0',
    marginBottom: 12,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  listBullet: {
    color: '#FFD700',
    fontSize: 20,
    lineHeight: 1,
    flexShrink: 0,
    marginTop: 2,
  },
  warningText: {
    color: '#ff9e9e',
  },
  grid: {
    display: 'flex',
    gap: 20,
    flexDirection: 'column',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
    }
  },
  button: {
    backgroundColor: '#FFD700',
    padding: '15px 0',
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    margin: '30px auto 0',
    fontSize: 17,
    fontWeight: 600,
    color: '#121212',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    display: 'block',
    ':hover': {
      backgroundColor: '#ffea9d',
    },
  },
};