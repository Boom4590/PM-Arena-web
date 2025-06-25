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
      <li key={idx} style={{ ...styles.text, ...style, marginBottom: 6 }}>
        {item}
      </li>
    ));

  return (
    <div style={styles.container}>
      {/* Языковой переключатель */}
      <div style={styles.fixedTopBar}>
        <button onClick={toggleLang} style={styles.toggleButton} aria-label="Switch language">
          <span style={styles.flagText}>{lang === 'ru' ? '🇰🇬' : '🇷🇺'}</span>
          <span style={styles.langText}>{lang === 'ru' ? 'Кыргызча' : 'Русский'}</span>
        </button>
      </div>

      <h1 style={styles.title}>{t.title}</h1>

      <section style={{ ...styles.section, ...styles.sectionGold }}>
        <h2 style={styles.sectionTitle}>{t.extraRulesTitle}</h2>
        <ul style={styles.list}>{renderList(t.extraRules)}</ul>
      </section>

      <section style={{ ...styles.section, ...styles.sectionGold }}>
        <h2 style={styles.sectionTitle}>{t.rewardsTitle}</h2>
        <ul style={styles.list}>{renderList(t.rewards)}</ul>
      </section>

      <section style={{ ...styles.section, ...styles.sectionRed }}>
        <h2 style={styles.sectionTitle}>{t.bansTitle}</h2>
        <ul style={styles.list}>{renderList(t.bans, styles.red)}</ul>
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section2Title}</h2>
        <ul style={styles.list}>{renderList(t.section2)}</ul>
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section3Title}</h2>
        <ul style={styles.list}>{renderList(t.section3)}</ul>
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section4Title}</h2>
        <ul style={styles.list}>{renderList(t.section4)}</ul>
      </section>

      {/* Кнопка "Понятно" */}
      <button
        style={styles.button}
        onClick={() => alert(lang === 'ru' ? 'Вы ознакомились!' : 'Жакшы!')}
        aria-label="Подтвердить ознакомление"
      >
        {t.understood}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
   
    backgroundColor: '#121212',
    padding: 24,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#e0e0e0',
    
    boxShadow: '0 0 15px rgba(0,0,0,0.8)',
  },
  fixedTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 20,
    position: 'sticky',
    top: 0,
    
    zIndex: 10,
    paddingBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: '8px 16px',
    border: '1.5px solid #DAA520',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background-color 0.3s ease',
    color: '#DAA520',
    fontWeight: '600',
    fontSize: 16,
  },
  flagText: {
    fontSize: 22,
  },
  langText: {
    userSelect: 'none',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.8,
  
  },
  section: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 22,
    borderLeftWidth: 8,
    borderLeftStyle: 'solid',
    backgroundColor: '#1e1e1e',
    boxShadow: '0 4px 8px rgba(0,0,0,0.9)',
  },
  sectionRed: {
    borderLeftColor: '#e53935',
    backgroundColor: '#2c1b1b',
  },
  sectionGray: {
    borderLeftColor: '#888',
    backgroundColor: '#262626',
  },
  sectionGold: {
    borderLeftColor: '#FFD700',
    backgroundColor: '#2a2a1f',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 14,
   
  },
  list: {
    paddingLeft: 20,
    margin: 0,
    listStyleType: 'disc',
  },
  text: {
    fontSize: 16,
    lineHeight: 1.5,
    color: '#e0e0e0',
  },
  red: {
    color: '#f44336',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: '14px 0',
    borderRadius: 14,
    width: '60%',
    margin: '0 auto',
    fontSize: 18,
    fontWeight: '800',
    color: '#121212',
    cursor: 'pointer',
    display: 'block',

    border: 'none',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
};
