import { useState, useEffect } from 'react'

const colors = {
  primary: '#2D6A4F',
  primaryLight: '#E8F5E9',
  text: '#1a1a2e',
  textMuted: '#555',
  textLight: '#999',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E8E8E8',
  crisis: '#B71C1C',
  crisisBg: '#FFEBEE',
}

const PHQ4_FRAGEN = [
  { id: 'phq4_1', text: 'Wenig Interesse oder Freude an Ihren Tätigkeiten' },
  { id: 'phq4_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq4_3', text: 'Gefühle der Nervosität, Ängstlichkeit oder Anspannung' },
  { id: 'phq4_4', text: 'Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren' },
]

// PHQ9 hat jetzt nur noch 8 Fragen – die Suizid-Frage (Item 9) ist ein eigener Screen
const PHQ9_FRAGEN = [
  { id: 'phq9_1', text: 'Wenig Interesse oder Freude an Ihren Tätigkeiten' },
  { id: 'phq9_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq9_3', text: 'Schwierigkeiten, ein- oder durchzuschlafen, oder vermehrter Schlaf' },
  { id: 'phq9_4', text: 'Müdigkeit oder Gefühl, keine Energie zu haben' },
  { id: 'phq9_5', text: 'Verminderter Appetit oder übermäßiges Bedürfnis zu essen' },
  { id: 'phq9_6', text: 'Schlechte Meinung von sich selbst; Gefühl, ein Versager zu sein oder die Familie enttäuscht zu haben' },
  { id: 'phq9_7', text: 'Schwierigkeiten, sich auf etwas zu konzentrieren, z. B. beim Zeitungslesen oder Fernsehen' },
  { id: 'phq9_8', text: 'Waren Ihre Bewegungen oder Ihre Sprache so verlangsamt, dass es auch anderen auffallen würde? Oder waren Sie im Gegenteil \u201ezappelig\u201c oder ruhelos und hatten dadurch einen stärkeren Bewegungsdrang als sonst?' },
]

const GAD7_FRAGEN = [
  { id: 'gad7_1', text: 'Gefühle der Nervosität, Ängstlichkeit oder Anspannung' },
  { id: 'gad7_2', text: 'Unfähigkeit, Sorgen zu stoppen oder zu kontrollieren' },
  { id: 'gad7_3', text: 'Übermäßige Sorgen bezüglich verschiedener Angelegenheiten' },
  { id: 'gad7_4', text: 'Schwierigkeiten, sich zu entspannen' },
  { id: 'gad7_5', text: 'So rastlos sein, dass das Stillsitzen schwer fällt' },
  { id: 'gad7_6', text: 'Schnelle Verärgerung oder Gereiztheit' },
  { id: 'gad7_7', text: 'Angstgefühle, so als könnte etwas Schreckliches passieren' },
]

const ASRS_FRAGEN = [
  { id: 'asrs_1', text: 'Wie oft haben Sie Probleme, die letzten Feinheiten einer Arbeit zum Abschluss zu bringen, nachdem Sie die wesentlichen Punkte erledigt haben?' },
  { id: 'asrs_2', text: 'Wie oft fällt es Ihnen schwer, Dinge in die Reihe zu bekommen, wenn Sie an einer Aufgabe arbeiten, bei der Organisation gefragt ist?' },
  { id: 'asrs_3', text: 'Wie oft haben Sie Probleme, sich an Termine oder Verabredungen zu erinnern?' },
  { id: 'asrs_4', text: 'Wie oft vermeiden Sie oder verzögern Sie, die Aufgabe zu beginnen, wenn Sie vor einer Aufgabe stehen, bei der sehr viel Denkvermögen gefragt ist?' },
  { id: 'asrs_5', text: 'Wie oft sind Ihre Hände bzw. Füße bei langem Sitzen in Bewegung?' },
  { id: 'asrs_6', text: 'Wie oft fühlen Sie sich übermäßig aktiv und verspüren den Drang Dinge zu tun, als ob Sie von einem Motor angetrieben würden?' },
]

const ANTWORTEN_STANDARD = [
  { wert: 0, label: 'Überhaupt nicht' },
  { wert: 1, label: 'An einzelnen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]

const ANTWORTEN_GAD7 = [
  { wert: 0, label: 'Nie' },
  { wert: 1, label: 'An manchen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]

const ANTWORTEN_ASRS = [
  { wert: 0, label: 'Niemals' },
  { wert: 1, label: 'Selten' },
  { wert: 2, label: 'Manchmal' },
  { wert: 3, label: 'Oft' },
  { wert: 4, label: 'Sehr oft' },
]

const INSTRUMENTE = ['PHQ9', 'GAD7', 'ASRS']

const INSTRUMENT_CONFIG = {
  PHQ9: { fragen: PHQ9_FRAGEN, antworten: ANTWORTEN_STANDARD, zeitrahmen: 'In den letzten 2 Wochen:' },
  GAD7: { fragen: GAD7_FRAGEN, antworten: ANTWORTEN_GAD7, zeitrahmen: 'In den letzten 2 Wochen:' },
  ASRS: { fragen: ASRS_FRAGEN, antworten: ANTWORTEN_ASRS, zeitrahmen: 'In den letzten 6 Monaten:' },
}

// 4 (PHQ4) + 8 (PHQ9 ohne Suizid) + 7 (GAD7) + 6 (ASRS) + 1 (Suizid-Screen) = 26
const GESAMT_FRAGEN = 26

function berechneErgebnisse(antworten) {
  const ergebnisse = []

  const phq9Score = PHQ9_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0) + (antworten['phq9_9'] ?? 0)
  const phq9Chips = []
  if ((antworten['phq9_3'] ?? 0) >= 2) phq9Chips.push('Schlafprobleme')
  if ((antworten['phq9_6'] ?? 0) >= 2) phq9Chips.push('Grübeln')
  if ((antworten['phq9_4'] ?? 0) >= 2) phq9Chips.push('Antriebslosigkeit')
  if ((antworten['phq9_7'] ?? 0) >= 2) phq9Chips.push('Konzentration')
  if ((antworten['phq9_2'] ?? 0) >= 2) phq9Chips.push('Freudlosigkeit')
  ergebnisse.push({ instrument: 'PHQ-9', label: 'Depression', score: phq9Score, cutOff: 10, stufe: phq9Score >= 10 ? 1 : phq9Score >= 5 ? 2 : 3, chips: phq9Chips })

  const gad7Score = GAD7_FRAGEN.reduce((s, f) => s + (antworten[f.id] ?? 0), 0)
  const gad7Chips = []
  if ((antworten['gad7_1'] ?? 0) >= 2) gad7Chips.push('Innere Unruhe')
  if ((antworten['gad7_3'] ?? 0) >= 2) gad7Chips.push('Grübeln / Sorgen')
  if ((antworten['gad7_6'] ?? 0) >= 2) gad7Chips.push('Reizbarkeit')
  ergebnisse.push({ instrument: 'GAD-7', label: 'Angststörung', score: gad7Score, cutOff: 10, stufe: gad7Score >= 10 ? 1 : gad7Score >= 5 ? 2 : 3, chips: gad7Chips })

  const graueFelder = ASRS_FRAGEN.reduce((s, f, i) => {
    const grenze = i < 3 ? 2 : 3
    return s + ((antworten[f.id] ?? 0) >= grenze ? 1 : 0)
  }, 0)
  ergebnisse.push({ instrument: 'ASRS v1.1', label: 'ADHS', score: graueFelder, cutOff: 4, stufe: graueFelder >= 4 ? 1 : graueFelder >= 2 ? 2 : 3, chips: graueFelder >= 2 ? ['Konzentration', 'Innere Unruhe'] : [] })

  const who5Intern = Math.round((
    (3 - Math.min(antworten['phq9_1'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_4'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_3'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_2'] ?? 0, 3)) +
    (3 - Math.min(antworten['phq9_7'] ?? 0, 3))
  ) * (100 / 15))
  if (who5Intern <= 52) {
    ergebnisse.push({ instrument: 'WHO-5 (aus PHQ-9)', label: 'Chronischer Stress', score: who5Intern, cutOff: 52, stufe: who5Intern <= 28 ? 1 : 2, chips: ['Chronischer Stress'] })
  }

  return ergebnisse
}

function HalloScreen({ onWeiter }) {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: colors.primaryLight, borderRadius: '16px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🧠</div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>MeinPsyCheck</h1>
          <p style={{ fontSize: '14px', color: colors.textLight, margin: 0 }}>Deine erste Orientierung für psychische Gesundheit</p>
        </div>
        <p style={{ fontSize: '16px', lineHeight: '1.7', color: colors.textMuted, margin: '0 0 16px' }}>Du fragst dich, wie es dir wirklich geht – und ob du professionelle Unterstützung brauchst. Genau dafür ist diese App da.</p>
        <p style={{ fontSize: '16px', lineHeight: '1.7', color: colors.textMuted, margin: '0 0 32px' }}>MeinPsyCheck hilft dir mit wissenschaftlich validierten Fragen, deine Symptome einzuordnen. <strong style={{ color: colors.text }}>Kostenlos, anonym und ohne Wartezeit.</strong></p>
        <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '16px', marginBottom: '16px', borderLeft: `3px solid ${colors.primary}` }}>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, lineHeight: '1.6' }}><strong style={{ color: colors.text }}>Wichtiger Hinweis:</strong> Diese App stellt keine Diagnose und ersetzt keine professionelle Beratung. Sie dient ausschließlich der persönlichen Orientierung.</p>
        </div>
        <div style={{ backgroundColor: colors.crisisBg, borderRadius: '12px', padding: '16px', marginBottom: '40px' }}>
          <p style={{ fontSize: '13px', color: colors.crisis, margin: 0, lineHeight: '1.6' }}><strong>Akute Belastung oder Krise:</strong> Telefonseelsorge (kostenlos, anonym, 24/7): <strong>0800 111 0 111</strong></p>
        </div>
      </div>
      <div style={{ paddingBottom: '40px' }}>
        <button onClick={onWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Starten</button>
      </div>
    </div>
  )
}

function AlterScreen({ onWeiter, onZurueck }) {
  const [alter, setAlter] = useState('')
  const [geschlecht, setGeschlecht] = useState('')
  const [fehler, setFehler] = useState('')

  const handleWeiter = () => {
    if (!alter || parseInt(alter) < 18 || parseInt(alter) > 99) { setFehler('Bitte gib ein gültiges Alter ein (18–99 Jahre).'); return }
    if (!geschlecht) { setFehler('Bitte wähle eine Option aus.'); return }
    localStorage.setItem('user_alter', alter)
    localStorage.setItem('user_geschlecht', geschlecht)
    localStorage.setItem('onboarding_done', 'true')
    onWeiter()
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui, -apple-system, sans-serif', padding: '60px 24px 40px' }}>
      <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 32px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 8px' }}>Kurz zu dir</h2>
      <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 36px', lineHeight: '1.6' }}>Diese Angaben helfen dabei, deine Ergebnisse besser einzuordnen. Sie werden nur auf deinem Gerät gespeichert.</p>
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>Dein Alter</label>
        <input type="number" min="18" max="99" placeholder="z. B. 28" value={alter} onChange={(e) => { setAlter(e.target.value); setFehler('') }} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: `1px solid ${colors.border}`, borderRadius: '10px', outline: 'none', boxSizing: 'border-box', color: colors.text }} />
      </div>
      <div style={{ marginBottom: '36px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '12px' }}>Geschlecht</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Weiblich', 'Männlich', 'Divers', 'Keine Angabe'].map((option) => (
            <button key={option} onClick={() => { setGeschlecht(option); setFehler('') }} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${geschlecht === option ? colors.primary : colors.border}`, borderRadius: '10px', backgroundColor: geschlecht === option ? colors.primaryLight : colors.background, color: geschlecht === option ? colors.primary : colors.text, cursor: 'pointer', fontWeight: geschlecht === option ? '600' : '400' }}>{option}</button>
          ))}
        </div>
      </div>
      {fehler && <p style={{ color: colors.crisis, fontSize: '14px', margin: '0 0 16px' }}>{fehler}</p>}
      <button onClick={handleWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Weiter</button>
    </div>
  )
}

function ScreeningEinstieg({ symptomAuswahl, setSymptomAuswahl, onWeiter, onZurueck }) {
  const [warnungBestaetigt, setWarnungBestaetigt] = useState(false)

  const optionen = [
    { id: 'leer', label: 'Ich fühle mich leer oder antriebslos' },
    { id: 'sorgen', label: 'Ich mache mir viele Sorgen oder bin innerlich unruhig' },
    { id: 'konzentration', label: 'Ich kann mich schlecht konzentrieren' },
    { id: 'erschoepfung', label: 'Ich bin erschöpft, egal wie viel ich schlafe' },
    { id: 'weissnicht', label: 'Ich weiß es nicht genau' },
  ]

  const toggleOption = (id) => {
    if (id === 'weissnicht') { setSymptomAuswahl(['weissnicht']); return }
    const ohneWeissNicht = symptomAuswahl.filter(s => s !== 'weissnicht')
    if (ohneWeissNicht.includes(id)) {
      setSymptomAuswahl(ohneWeissNicht.filter(s => s !== id))
    } else {
      setSymptomAuswahl([...ohneWeissNicht, id])
    }
  }

  const letztes = localStorage.getItem('screening_datum')
  const tageVergangen = letztes ? Math.floor((Date.now() - new Date(letztes)) / (1000 * 60 * 60 * 24)) : 999
  const zuFrüh = tageVergangen < 14
  const kannWeiter = symptomAuswahl.length > 0 && (!zuFrüh || warnungBestaetigt)

  return (
    <div style={{ padding: '16px' }}>
      <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 8px' }}>Screening starten</h2>
      <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>Wähle aus, welche Aussage(n) aktuell am ehesten zutreffen. Mehrfachauswahl ist möglich.</p>

      {zuFrüh && !warnungBestaetigt && (
        <div style={{ backgroundColor: '#FFF8E1', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #FFE082' }}>
          <p style={{ fontSize: '14px', color: '#F57F17', margin: '0 0 8px', fontWeight: '600' }}>Hinweis</p>
          <p style={{ fontSize: '13px', color: '#795548', margin: '0 0 12px', lineHeight: '1.6' }}>Vor {tageVergangen} Tag(en) wurde bereits ein Screening durchgeführt. Ein erneutes Screening ist in der Regel nach 14 Tagen sinnvoller.</p>
          <button onClick={() => setWarnungBestaetigt(true)} style={{ background: 'none', border: '1px solid #F57F17', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#F57F17', cursor: 'pointer' }}>Fortfahren</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {optionen.map((opt) => {
          const aktiv = symptomAuswahl.includes(opt.id)
          return (
            <button key={opt.id} onClick={() => toggleOption(opt.id)} style={{ padding: '16px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? colors.primary : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? colors.primaryLight : colors.background, color: aktiv ? colors.primary : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', lineHeight: '1.4' }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      <button onClick={onWeiter} disabled={!kannWeiter} style={{ width: '100%', padding: '16px', backgroundColor: kannWeiter ? colors.primary : colors.border, color: kannWeiter ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: kannWeiter ? 'pointer' : 'default' }}>Weiter</button>
      <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '12px' }}>26 Fragen · ca. 5–10 Minuten · Alle Angaben bleiben auf deinem Gerät</p>
    </div>
  )
}

function ScreeningFragen({ fragen, antworten: antwortOptionen, zeitrahmen, onFertig, onZurueck, bisherFragen }) {
  const [antworten, setAntworten] = useState({})
  const [aktuelleIndex, setAktuelleIndex] = useState(0)
  const [ausgewaehlt, setAusgewaehlt] = useState(-1)

  const aktuelleFrage = fragen[aktuelleIndex]
  if (!aktuelleFrage) return null
  const istLetzte = aktuelleIndex === fragen.length - 1
  const aktuelleGesamt = bisherFragen + aktuelleIndex + 1
  const prozent = Math.round((aktuelleGesamt / GESAMT_FRAGEN) * 100)

  const handleWeiter = () => {
    if (ausgewaehlt === -1) return
    const neueAntworten = { ...antworten, [aktuelleFrage.id]: ausgewaehlt }
    setAntworten(neueAntworten)
    setAusgewaehlt(-1)

    if (istLetzte) {
      onFertig(neueAntworten)
    } else {
      setAktuelleIndex(aktuelleIndex + 1)
    }
  }

  const handleZurueck = () => {
    if (aktuelleIndex > 0) {
      setAktuelleIndex(aktuelleIndex - 1)
      setAusgewaehlt(antworten[fragen[aktuelleIndex - 1].id] ?? -1)
    } else {
      onZurueck()
    }
  }

  return (
    <div style={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <button onClick={handleZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>

      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px' }}>
        <div style={{ height: '4px', backgroundColor: colors.primary, borderRadius: '2px', width: `${prozent}%`, transition: 'width 0.4s ease' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 32px' }}>Frage {aktuelleGesamt} von {GESAMT_FRAGEN}</p>

      <div style={{ flex: 1 }}>
        {zeitrahmen && (
          <p style={{ fontSize: '20px', fontWeight: '400', color: colors.textMuted, lineHeight: '1.5', margin: '0 0 8px' }}>{zeitrahmen}</p>
        )}
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 32px' }}>{aktuelleFrage.text}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {antwortOptionen.map((opt) => {
            const aktiv = ausgewaehlt === opt.wert
            return (
              <button key={opt.wert} onClick={() => setAusgewaehlt(opt.wert)} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? colors.primary : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? colors.primaryLight : colors.background, color: aktiv ? colors.primary : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={handleWeiter} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? colors.primary : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '16px' }}>
        {istLetzte ? 'Abschließen' : 'Weiter'}
      </button>
    </div>
  )
}

function SuizidScreen({ onAntwort }) {
  const [ausgewaehlt, setAusgewaehlt] = useState(-1)

  return (
    <div style={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px' }}>
        <div style={{ height: '4px', backgroundColor: colors.primary, borderRadius: '2px', width: '100%' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 32px' }}>Frage 26 von 26</p>

      <div style={{ backgroundColor: colors.crisisBg, borderRadius: '10px', padding: '12px 14px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: colors.crisis, margin: 0, lineHeight: '1.5' }}>
          Bitte beantworten Sie die Frage bezogen auf die letzten 2 Wochen.
        </p>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 32px' }}>
          Gedanken, dass Sie lieber tot wären oder sich Leid zufügen möchten
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {ANTWORTEN_STANDARD.map((opt) => {
            const aktiv = ausgewaehlt === opt.wert
            return (
              <button key={opt.wert} onClick={() => setAusgewaehlt(opt.wert)} style={{ padding: '16px 18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${aktiv ? colors.primary : colors.border}`, borderRadius: '12px', backgroundColor: aktiv ? colors.primaryLight : colors.background, color: aktiv ? colors.primary : colors.text, cursor: 'pointer', fontWeight: aktiv ? '600' : '400', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={() => onAntwort(ausgewaehlt)} disabled={ausgewaehlt === -1} style={{ width: '100%', padding: '16px', backgroundColor: ausgewaehlt !== -1 ? colors.primary : colors.border, color: ausgewaehlt !== -1 ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: ausgewaehlt !== -1 ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '16px' }}>
        Weiter
      </button>
    </div>
  )
}

function SuizidHinweisScreen({ wert, onWeiter }) {
  const config = {
    1: { bg: '#FFF8E1', border: '#FFE082', color: '#F57F17', titel: 'Hinweis', text: 'Du hast angegeben, dass dich solche Gedanken an einzelnen Tagen beschäftigt haben. Das ist ernst zu nehmen. Bitte sprich mit jemandem darüber.' },
    2: { bg: '#FFF3E0', border: '#FFCC80', color: '#E65100', titel: 'Wichtiger Hinweis', text: 'Du hast angegeben, dass dich solche Gedanken an mehr als der Hälfte der Tage beschäftigt haben. Bitte such dir Unterstützung – du musst das nicht alleine tragen.' },
    3: { bg: colors.crisisBg, border: '#FFCDD2', color: colors.crisis, titel: 'Bitte such dir jetzt Hilfe', text: 'Du hast angegeben, dass dich solche Gedanken beinahe jeden Tag beschäftigen. Das ist ein ernstes Warnsignal. Bitte nimm sofort Kontakt auf.' },
  }[wert]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: config.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: config.color, margin: '0 0 12px' }}>{config.titel}</h2>
      <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.7', margin: '0 0 28px' }}>{config.text}</p>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: `1px solid ${config.border}` }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: config.color, margin: '0 0 4px' }}>Telefonseelsorge</p>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 12px' }}>Kostenlos · anonym · 24/7 erreichbar</p>
        <a href="tel:08001110111" style={{ display: 'block', padding: '13px', backgroundColor: colors.crisis, color: '#fff', borderRadius: '10px', fontSize: '17px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>0800 111 0 111</a>
      </div>

      {wert === 3 && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '18px', marginBottom: '24px', border: `1px solid ${config.border}` }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: config.color, margin: '0 0 10px' }}>Notfall</p>
          <a href="tel:112" style={{ display: 'block', padding: '13px', backgroundColor: '#fff', color: colors.crisis, border: `2px solid ${colors.crisis}`, borderRadius: '10px', fontSize: '17px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>112 anrufen</a>
        </div>
      )}

      <button onClick={onWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: wert < 3 ? '8px' : '0' }}>
        Weiter zu den Ergebnissen
      </button>
    </div>
  )
}

// ─── SCREENING FLOW ───────────────────────────────────────────────────────────
// Ablauf: einstieg → phq4 → vertiefung (PHQ9, GAD7, ASRS) → suizid → ergebnis ODER krise
function ScreeningFlow({ onZurueck }) {
  const [phase, setPhase] = useState('einstieg')
  const [symptomAuswahl, setSymptomAuswahl] = useState([])
  const [alleAntworten, setAlleAntworten] = useState({})
  const [aktuellesInstrument, setAktuellesInstrument] = useState(0)
  const [ergebnisse, setErgebnisse] = useState([])
  const [suizidWert, setSuizidWert] = useState(0)

  // Wie viele Fragen waren schon vor diesem Instrument?
  // PHQ4=4 Fragen, dann PHQ9 startet bei Frage 5 (bisherFragen=4)
  // GAD7 startet bei Frage 13 (4 + 8 PHQ9-Fragen = 12, bisherFragen=12)
  // ASRS startet bei Frage 20 (4 + 8 + 7 = 19, bisherFragen=19)
  const bisherFragenProInstrument = [4, 12, 19]

  const handlePHQ4Fertig = (neueAntworten) => {
    setAlleAntworten(prev => ({ ...prev, ...neueAntworten }))
    setAktuellesInstrument(0)
    setPhase('vertiefung')
  }

  const handleVertiefungFertig = (neueAntworten) => {
    const merged = { ...alleAntworten, ...neueAntworten }
    setAlleAntworten(merged)

    const naechstesInstrument = aktuellesInstrument + 1

    if (naechstesInstrument < INSTRUMENTE.length) {
      // Noch mehr Instrumente → direkt mit dem neuen Index setzen
      setAktuellesInstrument(naechstesInstrument)
    } else {
      // Alle 25 normalen Fragen durch → jetzt kommt der Suizid-Screen
      setPhase('suizid')
    }
  }

  const handleSuizidAntwort = (wert) => {
    setSuizidWert(wert)
    const merged = { ...alleAntworten, phq9_9: wert }
    setAlleAntworten(merged)
    if (wert === 0) {
      setPhase('disclaimer')
    } else {
      setPhase('suizid_hinweis')
    }
  }

  const handleSuizidHinweisWeiter = () => {
    setPhase('disclaimer')
  }

  const handleDisclaimerWeiter = () => {
    setErgebnisse(berechneErgebnisse(alleAntworten))
    setPhase('ergebnis')
  }

  if (phase === 'einstieg') {
    return <ScreeningEinstieg symptomAuswahl={symptomAuswahl} setSymptomAuswahl={setSymptomAuswahl} onWeiter={() => setPhase('phq4')} onZurueck={onZurueck} />
  }

  if (phase === 'phq4') {
    return <ScreeningFragen fragen={PHQ4_FRAGEN} antworten={ANTWORTEN_STANDARD} zeitrahmen="In den letzten 2 Wochen:" onFertig={handlePHQ4Fertig} onZurueck={() => setPhase('einstieg')} bisherFragen={0} />
  }

  if (phase === 'vertiefung') {
    const c = INSTRUMENT_CONFIG[INSTRUMENTE[aktuellesInstrument]]
    return <ScreeningFragen
      key={INSTRUMENTE[aktuellesInstrument]}
      fragen={c.fragen}
      antworten={c.antworten}
      zeitrahmen={c.zeitrahmen}
      onFertig={handleVertiefungFertig}
      onZurueck={() => {
        if (aktuellesInstrument > 0) setAktuellesInstrument(aktuellesInstrument - 1)
        else setPhase('phq4')
      }}
      bisherFragen={bisherFragenProInstrument[aktuellesInstrument]}
    />
  }

  if (phase === 'suizid') {
    return <SuizidScreen onAntwort={handleSuizidAntwort} />
  }

  if (phase === 'suizid_hinweis') {
    return <SuizidHinweisScreen wert={suizidWert} onWeiter={handleSuizidHinweisWeiter} />
  }

  if (phase === 'disclaimer') {
    return <DisclaimerScreen onWeiter={handleDisclaimerWeiter} />
  }

  if (phase === 'ergebnis') {
    return <ScreeningErgebnis ergebnisse={ergebnisse} suizidItem={suizidWert} onNeustart={() => { setPhase('einstieg'); setAlleAntworten({}); setSymptomAuswahl([]); setSuizidWert(0) }} onZurueck={onZurueck} />
  }

  return null
}

function DisclaimerScreen({ onWeiter }) {
  return (
    <div style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: colors.background }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px', lineHeight: '1.4' }}>
        Bevor du deine Ergebnisse siehst – ein kurzer Hinweis.
      </h2>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 16px' }}>
        Diese Auswertung ersetzt keine professionelle Diagnose – sie gibt dir jedoch eine erste Orientierung auf Basis wissenschaftlich validierter Screening-Instrumente.
      </p>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 16px' }}>
        Es ist möglich, dass in mehreren Bereichen erhöhte Werte erscheinen. Das ist häufig – psychische Beschwerden treten oft gemeinsam auf, weil sie sich gegenseitig beeinflussen.
      </p>
      <p style={{ fontSize: '16px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 40px' }}>
        Das Tagebuch in dieser App hilft dir, Veränderungen über Zeit zu beobachten.
      </p>
      <button onClick={onWeiter} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
        Zu meinen Ergebnissen
      </button>
    </div>
  )
}

function KrisenScreen() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.crisisBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: '#FFCDD2', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: colors.crisis }}>!</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: colors.crisis, margin: '0 0 12px' }}>Hinweis zur Sicherheit</h2>
        <p style={{ fontSize: '15px', color: '#5D2D2D', lineHeight: '1.7', margin: 0 }}>Du hast angegeben, dass du in den letzten 2 Wochen Gedanken hattest, dir selbst Schaden zuzufügen. Das Screening endet an dieser Stelle. Bitte nutze jetzt eine der folgenden Kontaktmöglichkeiten.</p>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #FFCDD2' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: colors.crisis, margin: '0 0 6px' }}>Telefonseelsorge</p>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 14px' }}>Kostenlos · anonym · 24/7 erreichbar</p>
        <a href="tel:08001110111" style={{ display: 'block', padding: '14px', backgroundColor: colors.crisis, color: '#fff', borderRadius: '10px', fontSize: '18px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>0800 111 0 111</a>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #FFCDD2' }}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: colors.crisis, margin: '0 0 10px' }}>Notfall</p>
        <a href="tel:112" style={{ display: 'block', padding: '14px', backgroundColor: '#fff', color: colors.crisis, border: `2px solid ${colors.crisis}`, borderRadius: '10px', fontSize: '18px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>112 anrufen</a>
      </div>
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '24px', lineHeight: '1.6' }}>Wenn du dich aktuell in unmittelbarer Gefahr fühlst, rufe bitte den Notruf an.</p>
    </div>
  )
}

const STOERUNGSBILDER = {
  'PHQ-9': {
    kurz: 'Deine Angaben im Bereich Stimmung & Antrieb überschreiten den klinischen Grenzwert. Das deutet auf depressive Symptome hin.',
    lang: 'Der PHQ-9 ist einer der weltweit am häufigsten eingesetzten Fragebögen zur Erkennung depressiver Störungen. Die Fragen erfassen, wie oft du in den letzten zwei Wochen typische Symptome einer Depression erlebt hast – wie Antriebslosigkeit, Freudlosigkeit, Schlafprobleme oder das Gefühl, wertlos zu sein. Ein Wert über 10 bedeutet nicht, dass du „krank" bist. Er bedeutet, dass deine Beschwerden ein Ausmaß erreicht haben, bei dem professionelle Unterstützung sinnvoll und wirksam ist. Depressionen gehören zu den am besten behandelbaren psychischen Erkrankungen – mit Therapie sprechen über 60% der Betroffenen gut auf Behandlung an.',
  },
  'GAD-7': {
    kurz: 'Deine Angaben im Bereich Angst & innere Anspannung überschreiten den klinischen Grenzwert. Das deutet auf eine generalisierte Angststörung hin.',
    lang: 'Der GAD-7 wurde entwickelt um zu erfassen, wie stark Sorgen und Anspannung deinen Alltag belasten. Die Fragen fragen nicht nach einzelnen Angst-Momenten, sondern nach einem anhaltenden Muster über zwei Wochen. Generalisierte Angst bedeutet nicht, dass du Angst vor einer bestimmten Sache hast – es bedeutet, dass das Nervensystem dauerhaft in einem erhöhten Alarmzustand ist. Das kostet enorm viel Energie und beeinflusst Schlaf, Konzentration und soziale Kontakte. Auch hier gilt: Das ist behandelbar. Kognitive Verhaltenstherapie zeigt bei Angststörungen sehr gute Ergebnisse.',
  },
  'ASRS v1.1': {
    kurz: 'Deine Angaben im Bereich Konzentration & Impulsivität überschreiten den klinischen Grenzwert. Das deutet auf ADHS-Symptome im Erwachsenenalter hin.',
    lang: 'Der ASRS v1.1 wurde von der Weltgesundheitsorganisation entwickelt und erfasst typische ADHS-Symptome bei Erwachsenen – Schwierigkeiten beim Abschließen von Aufgaben, Probleme mit Organisation und Planung sowie motorische Unruhe. ADHS im Erwachsenenalter wird oft spät erkannt, weil die Symptome sich anders zeigen als bei Kindern. Viele Betroffene haben jahrelang das Gefühl, sich einfach „mehr anstrengen" zu müssen – ohne zu wissen, dass ein neurobiologischer Unterschied dahintersteckt. Eine Abklärung beim Psychiater oder einem spezialisierten Psychologen kann Klarheit bringen.',
  },
  'WHO-5 (aus PHQ-9)': {
    kurz: 'Deine Angaben deuten auf ein reduziertes allgemeines Wohlbefinden hin, das auf chronischen Stress oder emotionale Erschöpfung hinweisen kann.',
    lang: 'Der WHO-5 Wohlbefindens-Index misst, wie oft du dich in den letzten zwei Wochen aktiv, entspannt und positiv gestimmt gefühlt hast. Ein niedriger Wert ist kein Zeichen einer psychischen Störung – aber er ist ein ernstes Signal, das nicht ignoriert werden sollte. Chronischer Stress ist einer der am besten belegten Auslöser für eine Vielzahl von Erkrankungen – sowohl körperlich als auch psychisch. Dauerhafter Stress erhöht das Risiko für Herz-Kreislauf-Erkrankungen, Schlafstörungen, Immunschwäche und ist gleichzeitig einer der häufigsten Wegbereiter für Depressionen und Angststörungen. Du brauchst keine Diagnose, um dir Unterstützung zu suchen. Wer früh gegensteuert, schützt nicht nur seine psychische Gesundheit, sondern seinen gesamten Körper. Ein Gespräch mit dem Hausarzt oder einem Psychologen kann ein sinnvoller erster Schritt sein. Das Tagebuch in dieser App hilft dir, Muster zu erkennen – wann es dir besser geht, wann schlechter, und was den Unterschied macht.',
  },
}

const RESSOURCEN_KATALOG = {
  'Schlafprobleme': {
    erklaerung: 'Du hast angegeben, dass du an mehr als der Hälfte der Tage Schwierigkeiten beim Ein- oder Durchschlafen hast. Schlafprobleme sind eines der häufigsten und am besten behandelbaren Symptome.',
    interventionen: [
      { titel: 'Schlafhygiene', text: 'Feste Schlafzeiten, kein Bildschirm 45 Min. vor Schlaf, kühles Zimmer', video: 'https://youtu.be/l72IHVMcapk' },
      { titel: 'Progressive Muskelentspannung', text: 'Muskelgruppen anspannen und loslassen – Körperscan vor dem Schlafen', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: 'Stimulus-Kontrolle', text: 'Bett nur zum Schlafen nutzen, bei Wachheit aufstehen' },
      { titel: 'Schlaf-Apps', text: 'Sleep Cycle (kostenlos); 7Schläfer / TK-SchlafCoach (Kassenleistung)' },
    ],
  },
  'Grübeln': {
    erklaerung: 'Gedanken kreisen immer wieder um dieselben Themen. Grübeln fühlt sich produktiv an – ist es aber meist nicht. Es gibt konkrete Techniken, um den Kreis zu unterbrechen.',
    interventionen: [
      { titel: 'MBCT/MBSR-Einführung', text: 'Gedanken beobachten ohne zu bewerten', video: 'https://youtu.be/TSGOQaxu43o' },
      { titel: 'Worry-Time', text: '15 Min. täglich für Sorgen reservieren, Rest des Tages aktiv unterbrechen' },
      { titel: 'Verhaltensaktivierung', text: 'Kleine konkrete Aktivität planen – unterbricht den Grübelkreis' },
    ],
  },
  'Antriebslosigkeit': {
    erklaerung: 'Antriebslosigkeit ist nicht Faulheit. Es ist ein neurobiologisches Signal. Der Schlüssel ist nicht mehr Willenskraft, sondern kluge kleine Schritte.',
    interventionen: [
      { titel: 'Ausdauersport', text: 'Walking, Jogging, Radfahren – Dopamin-Anstieg, Cortisolabbau' },
      { titel: 'Krafttraining', text: 'Hantel oder Eigengewicht – wirkt nachweislich antidepressiv' },
      { titel: 'Verhaltensaktivierung', text: 'Eine Kleinstaufgabe heute, die sich machbar anfühlt' },
      { titel: 'Tagesstruktur aufbauen', text: 'Feste Aufstehzeit als erster Anker' },
    ],
  },
  'Konzentration': {
    erklaerung: 'Konzentrationsprobleme entstehen oft durch mentale Überlastung oder Schlafmangel – sie sind ein Symptom, kein Charakterfehler.',
    interventionen: [
      { titel: 'Pomodoro-Technik', text: '25 Min. fokussiert arbeiten, dann 5 Min. Pause', video: 'https://youtu.be/O8Y3WvWM42g' },
      { titel: '5-Minuten-Regel', text: 'Nur 5 Min. an einer Aufgabe starten – der Anfang ist die größte Hürde' },
      { titel: '5-4-3-2-1 Erdung', text: '5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken', video: 'https://youtu.be/TsIGZklzSyc' },
      { titel: 'Box Breathing', text: '4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten', video: 'https://youtu.be/wazCdqIBi2c' },
      { titel: '3-Minuten-Atemraum', text: 'Kurzmeditation aus der MBCT', video: 'https://youtu.be/JEmNFgt21qo' },
      { titel: 'STOPP-Technik', text: 'Stopp – Tief atmen – Beobachten – Perspektive – Weiter', video: 'https://youtu.be/Jj61HkABO7c' },
      { titel: 'Insight Timer', text: 'Kostenlose App für geführte Meditationen' },
    ],
  },
  'Innere Unruhe': {
    erklaerung: 'Innere Unruhe ist oft ein Zeichen, dass das Nervensystem im Alarmzustand ist – auch ohne sichtbaren Auslöser. Beruhigungstechniken wirken direkt auf die Körperebene.',
    interventionen: [
      { titel: 'Box Breathing', text: '4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten', video: 'https://youtu.be/wazCdqIBi2c' },
      { titel: '4-7-8 Atemtechnik', text: '4 Sek. einatmen, 7 halten, 8 ausatmen – aktiviert den Parasympathikus' },
      { titel: 'Progressive Muskelentspannung', text: 'Muskeln anspannen und loslassen – senkt Cortisol direkt', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: '5-4-3-2-1 Erdung', text: 'Sofort anwendbar bei akuter Unruhe', video: 'https://youtu.be/TsIGZklzSyc' },
    ],
  },
  'Reizbarkeit': {
    erklaerung: 'Reizbarkeit ist oft kein Charakterzug – sie ist ein Zeichen von Überlastung, Schlafmangel oder unterdrücktem Stress. Das Nervensystem reagiert schneller als der Verstand denken kann.',
    interventionen: [
      { titel: 'STOPP-Technik', text: 'Innehalten bevor man reagiert: Stopp – Atmen – Beobachten – Perspektive – Weiter', video: 'https://youtu.be/Jj61HkABO7c' },
      { titel: 'Stresstagebuch', text: 'Auslöser 1 Woche täglich notieren – Muster erkennen' },
      { titel: 'Schlafhygiene', text: 'Schlafmangel ist einer der stärksten Treiber von Reizbarkeit', video: 'https://youtu.be/l72IHVMcapk' },
      { titel: 'Grenzen setzen', text: 'Konkrete Übung: eine Anfrage diese Woche ablehnen' },
    ],
  },
  'Chronischer Stress': {
    erklaerung: 'Chronischer Stress ist nicht Schwäche – er ist ein Signal des Körpers, dass das System überlastet ist. Es gibt gut belegte Techniken, um gezielt gegenzusteuern.',
    interventionen: [
      { titel: 'Progressive Muskelentspannung', text: 'Muskeln anspannen und loslassen – senkt Cortisol direkt', video: 'https://youtu.be/vsJ01LxdAi4' },
      { titel: '4-7-8 Atemtechnik', text: '4 Sek. einatmen, 7 halten, 8 ausatmen' },
      { titel: 'MBSR-Kurzübung', text: '10 Min. Achtsamkeit täglich – über 500 Studien belegt', video: 'https://youtu.be/TSGOQaxu43o' },
      { titel: 'Stresstagebuch', text: 'Auslöser 1 Woche täglich notieren' },
      { titel: 'Grenzen setzen', text: 'Konkrete Übung: eine Anfrage diese Woche ablehnen' },
    ],
  },
  'Sozialer Rückzug': {
    erklaerung: 'Sozialer Rückzug kann sich selbst verstärken. Nicht mehr Kontakte helfen – sondern die Gedanken darüber verändern.',
    interventionen: [
      { titel: 'Gedanken prüfen', text: 'Fehlbewertungen über soziale Situationen erkennen und hinterfragen' },
      { titel: 'Kleine soziale Handlung', text: 'Nicht \'Freunde finden\' – den Kassierer ansprechen genügt' },
      { titel: 'Strukturierte Gruppenaktivität', text: 'Kurs, Verein, Ehrenamt – ohne Beziehungsdruck' },
      { titel: 'Selbstmitgefühl', text: 'Innere Kritik bei sozialer Angst reduzieren' },
    ],
  },
}

function ScreeningErgebnis({ ergebnisse, suizidItem = 0, onNeustart, onZurueck }) {
  const höchsteStufe = Math.min(...ergebnisse.map(e => e.stufe))
  const stufe1 = ergebnisse.filter(e => e.stufe === 1)
  const stufe2 = ergebnisse.filter(e => e.stufe === 2)
  const hatStufe1 = stufe1.length > 0
  const [aufgeklappt, setAufgeklappt] = useState(null)
  const [openChipId, setOpenChipId] = useState(null)

  const renderChips = (chips) => {
    if (chips.length === 0) return null
    const klickbareChips = chips.filter(c => RESSOURCEN_KATALOG[c])
    const nichtKlickbar = chips.filter(c => !RESSOURCEN_KATALOG[c])
    return (
      <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {klickbareChips.map((chip) => (
            <div key={chip} onClick={(e) => { e.stopPropagation(); setOpenChipId(openChipId === chip ? null : chip) }} style={{ padding: '8px 14px', backgroundColor: openChipId === chip ? colors.primary : colors.primaryLight, borderRadius: '20px', fontSize: '13px', color: openChipId === chip ? '#fff' : colors.primary, fontWeight: '500', border: `1px solid ${colors.primary}30`, cursor: 'pointer', transition: 'all 0.2s' }}>{chip}</div>
          ))}
          {nichtKlickbar.map((chip) => (
            <div key={chip} style={{ padding: '8px 14px', backgroundColor: colors.primaryLight, borderRadius: '20px', fontSize: '13px', color: colors.primary, fontWeight: '500', border: `1px solid ${colors.primary}30` }}>{chip}</div>
          ))}
        </div>
        {openChipId && chips.includes(openChipId) && RESSOURCEN_KATALOG[openChipId] && (
          <div style={{ marginTop: '12px', padding: '16px', backgroundColor: colors.background, borderRadius: '14px', border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.7', margin: '0 0 16px' }}>
              {RESSOURCEN_KATALOG[openChipId].erklaerung}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {RESSOURCEN_KATALOG[openChipId].interventionen.map((inv) => (
                <div key={inv.titel} style={{ backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: colors.text, margin: '0 0 4px' }}>{inv.titel}</p>
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, lineHeight: '1.5' }}>{inv.text}</p>
                  {inv.video && (
                    <a href={inv.video} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: colors.primary, textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>Video ansehen</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }

  useEffect(() => {
    localStorage.setItem('screening_datum', new Date().toISOString())
    localStorage.setItem('screening_ergebnis', JSON.stringify(ergebnisse))
  }, [])

  return (
    <div style={{ padding: '16px', paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 20px' }}>Dein Ergebnis</h2>

      {suizidItem > 0 && (
        <div style={{ backgroundColor: colors.crisisBg, borderRadius: '14px', padding: '16px', border: '1px solid #FFCDD2', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: colors.crisis, margin: '0 0 6px' }}>Wichtiger Hinweis</p>
          <p style={{ fontSize: '13px', color: '#5D2D2D', margin: '0 0 12px', lineHeight: '1.6' }}>Du hast angegeben, dass dich Gedanken, dir selbst Schaden zuzufügen, in den letzten 2 Wochen beschäftigt haben. Bitte such dir Unterstützung.</p>
          <a href="tel:08001110111" style={{ display: 'block', padding: '12px', backgroundColor: colors.crisis, color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textAlign: 'center', textDecoration: 'none' }}>Telefonseelsorge: 0800 111 0 111</a>
        </div>
      )}

      {hatStufe1 && (
        <p style={{ fontSize: '17px', fontWeight: '600', color: colors.text, lineHeight: '1.6', margin: '0 0 20px' }}>
          Deine Angaben zeigen in mindestens einem Bereich Werte, die auf klinisch relevante Beschwerden hinweisen. Das ist ein Hinweis, den es wert ist, ernst zu nehmen.
        </p>
      )}

      {stufe1.map((res) => {
        const info = STOERUNGSBILDER[res.instrument]
        const istOffen = aufgeklappt === res.instrument
        return (
          <div key={res.instrument} onClick={() => setAufgeklappt(istOffen ? null : res.instrument)} style={{ backgroundColor: '#FFEBEE', borderRadius: '14px', padding: '16px', border: `1px solid #FFCDD2`, marginBottom: '10px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: info ? '10px' : '0' }}>
              <p style={{ fontSize: '14px', color: colors.text, lineHeight: '1.6', margin: 0, flex: 1, paddingRight: '12px' }}>
                {info?.kurz ?? 'Deine Angaben liegen oberhalb des Schwellenwerts.'}
              </p>
              <span style={{ fontSize: '18px', color: colors.crisis, flexShrink: 0, marginTop: '2px' }}>{istOffen ? '↑' : '↓'}</span>
            </div>
            {istOffen && info?.lang && (
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.7', margin: '12px 0 0', borderTop: '1px solid #FFCDD2', paddingTop: '12px' }}>
                {info.lang}
              </p>
            )}
          </div>
        )
      })}

      {stufe2.length > 0 && !hatStufe1 && (() => {
        const alleChips = [...new Set(stufe2.flatMap(res => res.chips ?? []))]
        return (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: colors.text, lineHeight: '1.6', margin: '0 0 6px' }}>
              Deine Angaben erreichen keinen klinischen Grenzwert. Laut den validierten Fragebögen liegen aktuell keine Hinweise auf eine behandlungsbedürftige psychische Störung vor.
            </p>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 16px', lineHeight: '1.5' }}>
              Das ist eine Momentaufnahme – kein Gesundheitszeugnis.
            </p>
            {alleChips.length > 0 && (
              <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: '0 0 12px' }}>
                  In diesen Bereichen hattest du erhöhte Werte:
                </p>
                {renderChips(alleChips)}
              </div>
            )}
          </div>
        )
      })()}

      {hatStufe1 && (() => {
        const alleStufe1Chips = [...new Set(stufe1.flatMap(res => res.chips ?? []))]
        return alleStufe1Chips.length > 0 && (
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: '0 0 12px' }}>
              In diesen Bereichen hattest du erhöhte Werte:
            </p>
            {renderChips(alleStufe1Chips)}
          </div>
        )
      })()}

      {hatStufe1 && (
        <div style={{ backgroundColor: colors.surface, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 6px' }}>Therapeuten finden</p>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 12px', lineHeight: '1.5' }}>Wir helfen dir bald, einen passenden Therapeuten zu finden.</p>
          <button onClick={() => alert('Die Therapeutensuche ist in Version 2 verfügbar.')} style={{ width: '100%', padding: '13px', backgroundColor: colors.surface, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Therapeutensuche – Kommt bald
          </button>
        </div>
      )}

      <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '14px', marginBottom: '20px', borderLeft: `3px solid ${colors.border}` }}>
        <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0, lineHeight: '1.6' }}>
          {höchsteStufe === 1 ? 'Diese Einschätzung basiert auf Selbstangaben und validierten Screening-Fragen. Sie ist keine Diagnose und ersetzt keine fachliche Abklärung.'
            : höchsteStufe === 2 ? 'Diese Einschätzung basiert auf Selbstangaben und ist eine Momentaufnahme. Bei anhaltenden oder zunehmenden Beschwerden ist eine fachliche Abklärung sinnvoll.'
            : 'Diese Einschätzung basiert auf Selbstangaben und ist eine Momentaufnahme. Bei Bedarf kannst du das Screening nach 14 Tagen erneut durchführen.'}
        </p>
      </div>

      <button onClick={onZurueck} style={{ width: '100%', padding: '16px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>Zur Startseite</button>
      <button onClick={onNeustart} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer' }}>Neues Screening starten</button>
    </div>
  )
}

const IS_DEV = import.meta.env.DEV

function HauptApp() {
  const [aktiveTab, setAktiveTab] = useState('home')
  const [tagebuchOffen, setTagebuchOffen] = useState(false)
  const [screeningOffen, setScreeningOffen] = useState(false)
  const [testErgebnis, setTestErgebnis] = useState(null)

  const handleTestErgebnis = (ergebnisse) => {
    setTestErgebnis(ergebnisse)
    setScreeningOffen(true)
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: colors.surface, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {aktiveTab === 'home' && !tagebuchOffen && !screeningOffen && <Hauptseite onTagebuchOeffnen={() => setTagebuchOffen(true)} onScreeningOeffnen={() => setScreeningOffen(true)} onTestErgebnis={IS_DEV ? handleTestErgebnis : undefined} />}
        {aktiveTab === 'home' && tagebuchOffen && <Tagebuch onZurueck={() => setTagebuchOffen(false)} />}
        {aktiveTab === 'home' && screeningOffen && (testErgebnis
          ? <ScreeningErgebnis ergebnisse={testErgebnis} suizidItem={0} onNeustart={() => { setScreeningOffen(false); setTestErgebnis(null) }} onZurueck={() => { setScreeningOffen(false); setTestErgebnis(null) }} />
          : <ScreeningFlow onZurueck={() => setScreeningOffen(false)} />
        )}
        {aktiveTab === 'therapeuten' && <TherapeutenPlatzhalter />}
        {aktiveTab === 'einstellungen' && <Einstellungen />}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', backgroundColor: colors.background, borderTop: `1px solid ${colors.border}`, display: 'flex', zIndex: 100 }}>
        {[{ id: 'home', label: 'Hauptseite' }, { id: 'therapeuten', label: 'Therapeuten' }, { id: 'einstellungen', label: 'Einstellungen' }].map((tab) => (
          <button key={tab.id} onClick={() => { setAktiveTab(tab.id); setTagebuchOffen(false); setScreeningOffen(false) }} style={{ flex: 1, padding: '12px 0 10px', background: 'none', border: 'none', borderTop: `2px solid ${aktiveTab === tab.id ? colors.primary : 'transparent'}`, cursor: 'pointer', fontSize: '11px', fontWeight: aktiveTab === tab.id ? '600' : '400', color: aktiveTab === tab.id ? colors.primary : colors.textLight }}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Hauptseite({ onTagebuchOeffnen, onScreeningOeffnen, onTestErgebnis }) {
  const hour = new Date().getHours()
  const greeting = hour >= 5 && hour < 11 ? 'Guten Morgen'
    : hour >= 11 && hour < 17 ? 'Guten Tag'
      : hour >= 17 && hour < 22 ? 'Guten Abend'
        : 'Hallo'
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 4px' }}>{greeting}</h1>
        <p style={{ fontSize: '13px', color: colors.textLight, margin: 0 }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 4px' }}>Screening</p>
        <div onClick={onScreeningOeffnen} style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', marginBottom: '10px', cursor: 'pointer', border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: colors.primary, margin: '0 0 4px' }}>Neues Screening starten</p>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>26 Fragen · ca. 5–10 Min · wissenschaftlich validiert</p>
        </div>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: colors.text, margin: '0 0 4px' }}>Letzte Ergebnisse</p>
          <p style={{ fontSize: '13px', color: colors.textLight, margin: 0 }}>Noch kein Screening durchgeführt</p>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: colors.border, margin: '20px 4px' }} />
      <div>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px 4px' }}>Tagebuch</p>
        <div onClick={onTagebuchOeffnen} style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', cursor: 'pointer', border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: colors.text, margin: '0 0 4px' }}>Heute eintragen</p>
          <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 10px' }}>Befinden · Energie · Schlaf · Notiz</p>
          <p style={{ fontSize: '13px', color: colors.primary, margin: 0, fontWeight: '500' }}>Eintrag öffnen →</p>
        </div>
      </div>

      {onTestErgebnis && (
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#F3E5F5', borderRadius: '14px', border: '1px dashed #9C27B0' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#7B1FA2', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>Dev · Test-Shortcuts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Test: Stufe 1', ergebnisse: berechneErgebnisse({ phq9_1:3,phq9_2:3,phq9_3:2,phq9_4:2,phq9_5:1,phq9_6:2,phq9_7:1,phq9_8:1,phq9_9:0, gad7_1:2,gad7_2:2,gad7_3:2,gad7_4:2,gad7_5:2,gad7_6:1,gad7_7:1, asrs_1:1,asrs_2:1,asrs_3:1,asrs_4:1,asrs_5:1,asrs_6:1 }) },
              { label: 'Test: Stufe 2', ergebnisse: berechneErgebnisse({ phq9_1:1,phq9_2:2,phq9_3:1,phq9_4:2,phq9_5:1,phq9_6:0,phq9_7:1,phq9_8:0,phq9_9:0, gad7_1:1,gad7_2:1,gad7_3:1,gad7_4:1,gad7_5:0,gad7_6:1,gad7_7:0, asrs_1:1,asrs_2:1,asrs_3:0,asrs_4:1,asrs_5:0,asrs_6:0 }) },
              { label: 'Test: Stufe 3', ergebnisse: berechneErgebnisse({ phq9_1:0,phq9_2:0,phq9_3:0,phq9_4:0,phq9_5:0,phq9_6:0,phq9_7:0,phq9_8:0,phq9_9:0, gad7_1:0,gad7_2:0,gad7_3:0,gad7_4:0,gad7_5:0,gad7_6:0,gad7_7:0, asrs_1:0,asrs_2:0,asrs_3:0,asrs_4:0,asrs_5:0,asrs_6:0 }) },
            ].map(({ label, ergebnisse }) => (
              <button key={label} onClick={() => onTestErgebnis(ergebnisse)} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#7B1FA2', backgroundColor: '#fff', border: '1px solid #CE93D8', borderRadius: '10px', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Tagebuch({ onZurueck }) {
  const [ansicht, setAnsicht] = useState('eintrag')
  const [gewaehlterTag, setGewaehlterTag] = useState(null)
  const [kalenderMonat, setKalenderMonat] = useState(new Date().getMonth())
  const [kalenderJahr, setKalenderJahr] = useState(new Date().getFullYear())
  const [werte, setWerte] = useState({ befinden: 0, energie: 0, schlaf: 0 })
  const [notiz, setNotiz] = useState('')
  const [formularOffen, setFormularOffen] = useState(false)

  const heute = new Date().toISOString().split('T')[0]
  const hatHeuteEintrag = !!localStorage.getItem(`tagebuch_${heute}`)

  const kategorien = [
    { key: 'befinden', label: 'Befinden', links: 'Schlecht', rechts: 'Sehr gut' },
    { key: 'energie', label: 'Energie', links: 'Wenig', rechts: 'Viel' },
    { key: 'schlaf', label: 'Schlaf', links: 'Schlecht', rechts: 'Gut' },
  ]

  const leseEintrag = (datum) => {
    const raw = localStorage.getItem(`tagebuch_${datum}`)
    if (!raw) return null
    const e = JSON.parse(raw)
    return {
      befinden: e.befinden ?? e.werte?.befinden ?? 0,
      energie: e.energie ?? e.werte?.energie ?? 0,
      schlaf: e.schlaf ?? e.werte?.schlaf ?? 0,
      notiz: e.notiz || '',
      datum: e.datum || datum,
    }
  }

  const ladeHeutigenEintrag = () => {
    const e = leseEintrag(heute)
    if (e) {
      setWerte({ befinden: e.befinden, energie: e.energie, schlaf: e.schlaf })
      setNotiz(e.notiz)
    }
    setFormularOffen(true)
  }

  const handleSpeichern = () => {
    localStorage.setItem(`tagebuch_${heute}`, JSON.stringify({
      befinden: werte.befinden,
      energie: werte.energie,
      schlaf: werte.schlaf,
      notiz,
      datum: heute,
    }))
    setFormularOffen(false)
  }

  const alleAusgewaehlt = werte.befinden > 0 && werte.energie > 0 && werte.schlaf > 0

  const padZwei = (n) => String(n).padStart(2, '0')

  const renderPunkte = (wert) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: n <= wert ? colors.primary : colors.border }} />
      ))}
    </div>
  )

  // ─── ANSICHT 1: Tageseintrag ────────────────────────────────────────────────
  if (ansicht === 'eintrag') {
    // Fall B: Heute bereits Eintrag vorhanden, Formular nicht geöffnet
    if (hatHeuteEintrag && !formularOffen) {
      return (
        <div style={{ padding: '16px' }}>
          <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>Tagebuch</h2>
          <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 32px' }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <div style={{ backgroundColor: colors.primaryLight, borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '15px', color: colors.primary, margin: 0, fontWeight: '500', lineHeight: '1.6' }}>Du hast dein Tagebuch für heute bereits ausgefüllt.</p>
          </div>
          <button onClick={ladeHeutigenEintrag} style={{ width: '100%', padding: '16px', backgroundColor: colors.background, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
            Eintrag ergänzen
          </button>
          <button onClick={() => setAnsicht('kalender')} style={{ width: '100%', padding: '16px', backgroundColor: colors.background, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Mein Tagebuch
          </button>
        </div>
      )
    }

    // Fall A: Kein Eintrag heute ODER Formular-Modus (Eintrag ergänzen)
    return (
      <div style={{ padding: '16px' }}>
        <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>Tagebuch</h2>
        <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 24px' }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 20px' }}>Wie geht es dir heute?</p>
          {kategorien.map((kat) => (
            <div key={kat.key} style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{kat.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: colors.textLight, width: '48px' }}>{kat.links}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} onClick={() => setWerte({ ...werte, [kat.key]: n })} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: werte[kat.key] >= n ? colors.primary : colors.border, cursor: 'pointer', transition: 'background 0.15s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: colors.textLight, width: '48px', textAlign: 'right' }}>{kat.rechts}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 10px' }}>Notiz</p>
          <textarea value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Was beschäftigt dich heute? Was war gut, was war schwer?" rows={4} style={{ width: '100%', fontSize: '14px', color: colors.text, border: 'none', outline: 'none', resize: 'none', backgroundColor: 'transparent', lineHeight: '1.6', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }} />
        </div>
        <button onClick={handleSpeichern} disabled={!alleAusgewaehlt} style={{ width: '100%', padding: '16px', backgroundColor: alleAusgewaehlt ? colors.primary : colors.border, color: alleAusgewaehlt ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: alleAusgewaehlt ? 'pointer' : 'default', transition: 'background 0.2s', marginBottom: '10px' }}>
          Speichern
        </button>
        <button onClick={() => setAnsicht('kalender')} style={{ width: '100%', padding: '16px', backgroundColor: colors.background, color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          Mein Tagebuch
        </button>
        {!alleAusgewaehlt && <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '8px' }}>Bitte alle drei Ratings ausfüllen</p>}
      </div>
    )
  }

  // ─── ANSICHT 2: Kalender ────────────────────────────────────────────────────
  if (ansicht === 'kalender') {
    const eintraegeTage = Object.keys(localStorage)
      .filter(k => k.startsWith('tagebuch_'))
      .map(k => k.replace('tagebuch_', ''))

    const ersterTag = new Date(kalenderJahr, kalenderMonat, 1)
    const letzterTag = new Date(kalenderJahr, kalenderMonat + 1, 0)
    const startWochentag = (ersterTag.getDay() + 6) % 7 // Montag = 0
    const anzahlTage = letzterTag.getDate()
    const monatName = ersterTag.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

    const vorherigerMonat = () => {
      if (kalenderMonat === 0) { setKalenderMonat(11); setKalenderJahr(j => j - 1) }
      else setKalenderMonat(m => m - 1)
    }
    const naechsterMonat = () => {
      if (kalenderMonat === 11) { setKalenderMonat(0); setKalenderJahr(j => j + 1) }
      else setKalenderMonat(m => m + 1)
    }

    const handleTagKlick = (tag) => {
      const datum = `${kalenderJahr}-${padZwei(kalenderMonat + 1)}-${padZwei(tag)}`
      const hatEintrag = eintraegeTage.includes(datum)
      if (hatEintrag) {
        setGewaehlterTag(datum)
        setAnsicht('lesen')
      } else if (datum === heute) {
        setAnsicht('eintrag')
      }
    }

    return (
      <div style={{ padding: '16px' }}>
        <button onClick={() => setAnsicht('eintrag')} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px' }}>Mein Tagebuch</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={vorherigerMonat} style={{ background: 'none', border: 'none', fontSize: '20px', color: colors.primary, cursor: 'pointer', padding: '4px 8px' }}>←</button>
          <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text, textTransform: 'capitalize' }}>{monatName}</span>
          <button onClick={naechsterMonat} style={{ background: 'none', border: 'none', fontSize: '20px', color: colors.primary, cursor: 'pointer', padding: '4px 8px' }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((t) => (
            <div key={t} style={{ fontSize: '12px', color: colors.textLight, padding: '8px 0', fontWeight: '600' }}>{t}</div>
          ))}

          {Array.from({ length: startWochentag }).map((_, i) => (
            <div key={`leer-${i}`} />
          ))}

          {Array.from({ length: anzahlTage }).map((_, i) => {
            const tag = i + 1
            const datum = `${kalenderJahr}-${padZwei(kalenderMonat + 1)}-${padZwei(tag)}`
            const hatEintrag = eintraegeTage.includes(datum)
            const istHeute = datum === heute

            return (
              <div key={tag} onClick={() => handleTagKlick(tag)} style={{ padding: '8px 0', cursor: hatEintrag || datum === heute ? 'pointer' : 'default', borderRadius: '10px', backgroundColor: istHeute ? colors.primaryLight : 'transparent', position: 'relative' }}>
                <span style={{ fontSize: '14px', color: istHeute ? colors.primary : colors.text, fontWeight: istHeute ? '700' : '400' }}>{tag}</span>
                {hatEintrag && (
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: colors.primary, margin: '3px auto 0' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── ANSICHT 3: Eintrag lesen ───────────────────────────────────────────────
  if (ansicht === 'lesen' && gewaehlterTag) {
    const eintrag = leseEintrag(gewaehlterTag)
    if (!eintrag) { setAnsicht('kalender'); return null }

    const datumObj = new Date(gewaehlterTag + 'T12:00:00')
    const datumText = datumObj.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div style={{ padding: '16px' }}>
        <button onClick={() => setAnsicht('kalender')} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück zum Kalender</button>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 24px', textTransform: 'capitalize' }}>{datumText}</h2>

        <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
          {[
            { label: 'Befinden', wert: eintrag.befinden },
            { label: 'Energie', wert: eintrag.energie },
            { label: 'Schlaf', wert: eintrag.schlaf },
          ].map((kat) => (
            <div key={kat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{kat.label}</span>
              {renderPunkte(kat.wert)}
            </div>
          ))}
        </div>

        {eintrag.notiz && (
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 8px' }}>Notiz</p>
            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{eintrag.notiz}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

function TherapeutenPlatzhalter() {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '40px', margin: '0 0 16px' }}>🗺️</p>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 10px' }}>Therapeutensuche</h2>
      <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.6' }}>Hier findest du bald Psychologen und Therapeuten in deiner Nähe.</p>
      <p style={{ fontSize: '13px', color: colors.textLight, marginTop: '16px' }}>Kommt in Version 2</p>
    </div>
  )
}

function Einstellungen() {
  const sektionen = [
    { titel: 'Konto', items: ['E-Mail-Adresse hinterlegen', 'App bewerten'] },
    { titel: 'Info', items: ['Neuigkeiten & Updates', 'Datenschutz', 'Impressum', 'Hilfe & FAQ'] },
  ]
  return (
    <div style={{ padding: '24px 16px 0' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: colors.text, margin: '0 0 24px' }}>Einstellungen</h1>
      {sektionen.map((sektion) => (
        <div key={sektion.titel} style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px 4px' }}>{sektion.titel}</p>
          <div style={{ backgroundColor: colors.background, borderRadius: '14px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {sektion.items.map((item, i) => (
              <div key={item} style={{ padding: '14px 16px', fontSize: '15px', color: colors.text, borderBottom: i < sektion.items.length - 1 ? `1px solid ${colors.border}` : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item}<span style={{ color: colors.textLight, fontSize: '16px' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('loading')
  useEffect(() => {
    const done = localStorage.getItem('onboarding_done')
    setScreen(done === 'true' ? 'app' : 'hallo')
  }, [])
  if (screen === 'loading') return null
  if (screen === 'hallo') return <HalloScreen onWeiter={() => setScreen('alter')} />
  if (screen === 'alter') return <AlterScreen onWeiter={() => setScreen('app')} onZurueck={() => setScreen('hallo')} />
  return <HauptApp />
}

export default App