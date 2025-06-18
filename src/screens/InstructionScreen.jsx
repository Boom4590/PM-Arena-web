import React, { useState } from 'react';

export default function InstructionScreen() {
  const [lang, setLang] = useState('ru');

  const toggleLang = () => setLang(lang === 'ru' ? 'kg' : 'ru');

  const rulesText = {
    ru: {
      title: '📌 Правила участия в турнире',
      extraRulesTitle: '🔰 Как участвовать в турнирах (обязательно прочтите)',
      extraRules: [
        '• Указывайте настоящий PUBG MOBILE ID, с которым будете заходить в лобби. Если зайдете с другим аккаунтом — вас исключат.',
        '• Указывайте номер с WhatsApp — менеджер свяжется по нему.',
        '• Чтобы участвовать: пополните баланс → выберите турнир → нажмите "Участвовать".',
        '• После регистрации данные турнира появятся в "Текущий турнир".',
        '• Займите **только свой слот** — иначе модератор исключит вас.',
        '• В лобби заходите с тем PUBG ID, с которым регистрировались.',
        '• Модератор следит за нарушениями — подозрение в читах/тиминге = проверка до 7 дней.',
        '• Победителям пишут в WhatsApp, они отправляют реквизиты для выплаты.',
        '• При уважительной причине неучастия — можно получить возврат через менеджера.',
        '• Все вопросы — только через WhatsApp менеджера.',
      ],
      rewardsTitle: '🏆 Награды и правила получения:',
      rewards: [
        '• Деньги отправляются победителям в течение 6–12 часов после проверки.',
        '• Победителю пишут в WhatsApp по номеру регистрации.',
        '• При недоступности номера — игрок должен сам написать менеджеру.',
        '• Если игрок попал в лобби без оплаты — награда не выдаётся и бан навсегда.',
      ],
      bansTitle: '1. За следующие нарушения — пожизненный бан:',
      bans: [
        '• Игра с эмулятора',
        '• Использование читов или стороннего ПО',
        '• Использование багов (застревание в текстурах и др.)',
        '• Тиминг (командная игра в SOLO-турнире)',
        '• Занятие чужого слота в лобби',
        '• Передача ID и пароля лобби другим',
      ],
      section2Title: '2. Если вы заняли не свой слот:',
      section2: ['• Вы будете исключены, но можете вернуться на своё место до начала матча'],
      section3Title: '3. После входа в лобби:',
      section3: ['• Нельзя выходить или менять место', '• Если матч начнётся без вас — билет не возвращается'],
      section4Title: '4. Если не удалось зайти в лобби:',
      section4: ['• Обратитесь в поддержку WhatsApp и объясните ситуацию', '• При подтверждении причины — билет вернётся'],
      understood: 'Понятно',
    },
    kg: {
      title: '📌 Турнирге катышуу эрежелери',
      extraRulesTitle: '🔰 Турнирге катышуу тартиби (милдеттүү түрдө окуңуз)',
      extraRules: [
        '• PUBG MOBILE IDңизди туура жазыңыз — ошол аккаунт менен лоббиге киришиңиз керек.',
        '• WhatsApp номериңизди жазыңыз — менеджер сиз менен байланышат.',
        '• Катышуу үчүн: баланс толтуруңуз → турнир тандаңыз → "Катышуу" баскычын басыңыз.',
        '• Каттоодон кийин "Азыркы турнир" бөлүмүндө маалымат чыгат.',
        '• Ар ким өзүнүн ордуна отурушу керек — болбосо модератор чыгарып салат.',
        '• Лоббиге каттоодо колдонгон PUBG ID менен гана кириңиз.',
        '• Эрежени бузуу (чит, тиминг ж.б.) болсо — текшерүү 7 күнгө чейин узартылышы мүмкүн.',
        '• Жеңгендерге WhatsApp аркылуу жазышат жана реквизиттер суралат.',
        '• Эгер себеп менен катыша албай калсаңыз — менеджер аркылуу билеттин акчасы кайтарылышы мүмкүн.',
        '• Бардык суроолор WhatsApp аркылуу гана чечилет.',
      ],
      rewardsTitle: '🏆 Сыйлык жана шарттар:',
      rewards: [
        '• Сыйлык 6–12 саат ичинде берилет (текшерүүдөн кийин).',
        '• Жеңүүчүгө WhatsApp аркылуу байланышат.',
        '• Номер жеткиликсиз болсо — өзү менеджерге жазуусу керек.',
        '• Башка бирөөнүн ID менен кирип жеңсеңиз — сыйлык берилбейт, өмүр бою бан.',
      ],
      bansTitle: '1. Бул эреже бузулса — өмүр бою бан:',
      bans: [
        '• Эмулятор менен ойноо',
        '• Чит же башка программаларды колдонуу',
        '• Багдарды пайдалануу (дубалга кирүү ж.б.)',
        '• Тиминг (SOLO турнирде командалык оюн)',
        '• Башканын ордуна отуруу',
        '• Лоббинин ID жана сыр сөзүн бөлүшүү',
      ],
      section2Title: '2. Башка орунга отуруп алсаңыз:',
      section2: ['• Сиз чыгарылат, бирок оюн башталганга чейин кайта аласыз'],
      section3Title: '3. Лоббиге киргенден кийин:',
      section3: ['• Ордуңузду өзгөртүүгө жана чыгууга болбойт', '• Эгер оюндун башында жок болсоңуз — билет күйөт'],
      section4Title: '4. Лоббиге кире албасаңыз:',
      section4: ['• WhatsApp менен байланышып, себебин түшүндүрүңүз', '• Себеп тастыкталса — билет кайтарылат'],
      understood: 'Түшүнүктүү',
    },
  };

  const t = rulesText[lang];

  const renderList = (arr, style) =>
    arr.map((item, idx) => (
      <p key={idx} style={{ ...styles.text, ...style }}>
        {item}
      </p>
    ));

  return (
    <div style={styles.container}>
      {/* Языковой переключатель */}
      <div style={styles.fixedTopBar}>
        <button onClick={toggleLang} style={styles.toggleButton}>
          <span style={styles.flagText}>{lang === 'ru' ? '🇰🇬' : '🇷🇺'}</span>
          <span style={styles.langText}>{lang === 'ru' ? 'Кыргызча' : 'Русский'}</span>
        </button>
      </div>

      <h1 style={styles.title}>{t.title}</h1>

      <section style={{ ...styles.section, ...styles.sectionGold }}>
        <h2 style={styles.sectionTitle}>{t.extraRulesTitle}</h2>
        {renderList(t.extraRules)}
      </section>

      <section style={{ ...styles.section, ...styles.sectionGold }}>
        <h2 style={styles.sectionTitle}>{t.rewardsTitle}</h2>
        {renderList(t.rewards)}
      </section>

      <section style={{ ...styles.section, ...styles.sectionRed }}>
        <h2 style={styles.sectionTitle}>{t.bansTitle}</h2>
        {renderList(t.bans, styles.red)}
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section2Title}</h2>
        {renderList(t.section2)}
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section3Title}</h2>
        {renderList(t.section3)}
      </section>

      <section style={{ ...styles.section, ...styles.sectionGray }}>
        <h2 style={styles.sectionTitle}>{t.section4Title}</h2>
        {renderList(t.section4)}
      </section>

      {/* Кнопка "Понятно" */}
      <button
        style={styles.button}
        onClick={() => alert(lang === 'ru' ? 'Вы ознакомились!' : 'Жакшы!')}
      >
        {t.understood}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: '0 auto',
    backgroundColor: '#f0f0f0',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  fixedTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: '8px 12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
  },
  flagText: {
    fontSize: 18,
    marginRight: 6,
  },
  langText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    borderLeftWidth: 6,
    borderLeftStyle: 'solid',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  sectionRed: {
    borderLeftColor: '#d32f2f',
    backgroundColor: '#fff5f5',
  },
  sectionGray: {
    borderLeftColor: '#999',
    backgroundColor: '#f9f9f9',
  },
  sectionGold: {
    borderLeftColor: '#DAA520',
    backgroundColor: '#fffaf0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  text: {
    fontSize: 17,
    margin: '4px 0',
  },
  red: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#DAA520',
    padding: '14px 0',
    borderRadius: 12,
    width: '60%',
    margin: '20px auto 0',
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    cursor: 'pointer',
    display: 'block',
    boxShadow: '0 6px 12px rgba(184,134,11,0.8)',
    border: 'none',
  },
};
