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
  { id: 'phq4_1', text: 'Wenig Interesse oder Freude an deinen Aktivitäten' },
  { id: 'phq4_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq4_3', text: 'Nervosität, Ängstlichkeit oder innere Anspannung' },
  { id: 'phq4_4', text: 'Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren' },
]

// PHQ9 hat jetzt nur noch 8 Fragen – die Suizid-Frage (Item 9) ist ein eigener Screen
const PHQ9_FRAGEN = [
  { id: 'phq9_1', text: 'Wenig Interesse oder Freude an deinen Aktivitäten' },
  { id: 'phq9_2', text: 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit' },
  { id: 'phq9_3', text: 'Schwierigkeiten, ein- oder durchzuschlafen, oder zu viel schlafen' },
  { id: 'phq9_4', text: 'Müdigkeit oder Gefühl, keine Energie zu haben' },
  { id: 'phq9_5', text: 'Verminderter Appetit oder übermäßiges Essen' },
  { id: 'phq9_6', text: 'Schlechte Meinung von dir selbst – Gefühl, ein Versager zu sein oder andere enttäuscht zu haben' },
  { id: 'phq9_7', text: 'Schwierigkeiten, dich auf Dinge zu konzentrieren' },
  { id: 'phq9_8', text: 'Machst du Dinge ungewöhnlich langsam, oder bist du besonders rastlos und zappelig?' },
]

const GAD7_FRAGEN = [
  { id: 'gad7_1', text: 'Nervosität, Ängstlichkeit oder innere Anspannung' },
  { id: 'gad7_2', text: 'Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren' },
  { id: 'gad7_3', text: 'Übermäßige Sorgen bezüglich verschiedener Angelegenheiten' },
  { id: 'gad7_4', text: 'Schwierigkeiten, sich zu entspannen' },
  { id: 'gad7_5', text: 'Rastlosigkeit, sodass Stillsitzen schwerfällt' },
  { id: 'gad7_6', text: 'Schnelle Verärgerung oder Reizbarkeit' },
  { id: 'gad7_7', text: 'Angst, dass etwas Schreckliches passieren könnte' },
]

const ASRS_FRAGEN = [
  { id: 'asrs_1', text: 'Schwierigkeiten, eine Aufgabe zu beenden, nachdem der schwierige Teil erledigt ist' },
  { id: 'asrs_2', text: 'Schwierigkeiten, dich zu organisieren, wenn du eine Aufgabe erledigen musst' },
  { id: 'asrs_3', text: 'Schwierigkeiten, Termine einzuhalten oder Verpflichtungen nachzukommen' },
  { id: 'asrs_4', text: 'Aufgaben vermeiden oder aufschieben, die gründliches Nachdenken erfordern' },
  { id: 'asrs_5', text: 'Dinge verlegen oder nicht mehr finden, wenn du sie brauchst' },
  { id: 'asrs_6', text: 'Durch äußere Dinge oder Geräusche abgelenkt werden' },
]

const ANTWORTEN_STANDARD = [
  { wert: 0, label: 'Überhaupt nicht' },
  { wert: 1, label: 'An einzelnen Tagen' },
  { wert: 2, label: 'An mehr als der Hälfte der Tage' },
  { wert: 3, label: 'Beinahe jeden Tag' },
]

const ANTWORTEN_ASRS = [
  { wert: 0, label: 'Nie' },
  { wert: 1, label: 'Selten' },
  { wert: 2, label: 'Manchmal' },
  { wert: 3, label: 'Oft' },
  { wert: 4, label: 'Sehr oft' },
]

const INSTRUMENTE = ['PHQ9', 'GAD7', 'ASRS']

const INSTRUMENT_CONFIG = {
  PHQ9: { fragen: PHQ9_FRAGEN, antworten: ANTWORTEN_STANDARD, titel: 'Stimmung & Befinden', untertitel: 'Wie oft haben dich folgende Dinge in den letzten 2 Wochen belastet?' },
  GAD7: { fragen: GAD7_FRAGEN, antworten: ANTWORTEN_STANDARD, titel: 'Angst & Sorgen', untertitel: 'Wie oft haben dich folgende Dinge in den letzten 2 Wochen belastet?' },
  ASRS: { fragen: ASRS_FRAGEN, antworten: ANTWORTEN_ASRS, titel: 'Konzentration & Aufmerksamkeit', untertitel: 'Wie häufig tritt das bei dir auf?' },
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

function ScreeningFragen({ fragen, antworten: antwortOptionen, titel, untertitel, onFertig, onZurueck, bisherFragen }) {
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

      {aktuelleIndex === 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>{titel}</h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, lineHeight: '1.5' }}>{untertitel}</p>
        </div>
      )}

      <div style={{ flex: 1 }}>
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

// ─── NEU: Suizid-Frage als eigener, separater Screen ─────────────────────────
// Diese Komponente ist komplett unabhängig vom normalen Fragen-Flow.
// Sie hat nur zwei Buttons – kein komplizierter State, keine Race Condition möglich.
function SuizidScreen({ onNein, onJa }) {
  return (
    <div style={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Fortschrittsbalken zeigt 100% – wir sind bei Frage 26 von 26 */}
      <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '2px', marginBottom: '8px' }}>
        <div style={{ height: '4px', backgroundColor: colors.primary, borderRadius: '2px', width: '100%' }} />
      </div>
      <p style={{ fontSize: '12px', color: colors.textLight, margin: '0 0 32px' }}>Frage 26 von 26</p>

      {/* Hinweis-Box */}
      <div style={{ backgroundColor: colors.crisisBg, borderRadius: '10px', padding: '12px 14px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: colors.crisis, margin: 0, lineHeight: '1.5' }}>
          Bitte beantworte die Frage bezogen auf die letzten 2 Wochen.
        </p>
      </div>

      {/* Die eigentliche Frage */}
      <p style={{ fontSize: '20px', fontWeight: '600', color: colors.text, lineHeight: '1.5', margin: '0 0 32px', flex: 1 }}>
        Hattest du in den letzten 2 Wochen Gedanken, dass du lieber tot wärst oder dir selbst Schaden zufügen möchtest?
      </p>

      {/* Zwei klare Buttons – kein Weiter-Button nötig */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={onNein}
          style={{ padding: '18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', backgroundColor: colors.background, color: colors.text, cursor: 'pointer', fontWeight: '400' }}
        >
          Nein, solche Gedanken hatte ich nicht
        </button>
        <button
          onClick={onJa}
          style={{ padding: '18px', textAlign: 'left', fontSize: '15px', border: `1.5px solid ${colors.border}`, borderRadius: '12px', backgroundColor: colors.background, color: colors.text, cursor: 'pointer', fontWeight: '400' }}
        >
          Ja, solche Gedanken hatte ich
        </button>
      </div>
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

  // User hat "Nein" auf Suizid-Frage geantwortet → Ergebnis berechnen
  const handleSuizidNein = () => {
    const merged = { ...alleAntworten, phq9_9: 0 }
    setErgebnisse(berechneErgebnisse(merged))
    setPhase('ergebnis')
  }

  // User hat "Ja" auf Suizid-Frage geantwortet → Krisen-Screen
  const handleSuizidJa = () => {
    setPhase('krise')
  }

  if (phase === 'einstieg') {
    return <ScreeningEinstieg symptomAuswahl={symptomAuswahl} setSymptomAuswahl={setSymptomAuswahl} onWeiter={() => setPhase('phq4')} onZurueck={onZurueck} />
  }

  if (phase === 'phq4') {
    return <ScreeningFragen fragen={PHQ4_FRAGEN} antworten={ANTWORTEN_STANDARD} titel="Eingangsscreening" untertitel="Wie oft haben dich folgende Dinge in den letzten 2 Wochen belastet?" onFertig={handlePHQ4Fertig} onZurueck={() => setPhase('einstieg')} bisherFragen={0} />
  }

  if (phase === 'vertiefung') {
    const c = INSTRUMENT_CONFIG[INSTRUMENTE[aktuellesInstrument]]
    return <ScreeningFragen
      key={INSTRUMENTE[aktuellesInstrument]}
      fragen={c.fragen}
      antworten={c.antworten}
      titel={c.titel}
      untertitel={c.untertitel}
      onFertig={handleVertiefungFertig}
      onZurueck={() => {
        if (aktuellesInstrument > 0) setAktuellesInstrument(aktuellesInstrument - 1)
        else setPhase('phq4')
      }}
      bisherFragen={bisherFragenProInstrument[aktuellesInstrument]}
    />
  }

  if (phase === 'suizid') {
    return <SuizidScreen onNein={handleSuizidNein} onJa={handleSuizidJa} />
  }

  if (phase === 'krise') {
    return <KrisenScreen />
  }

  if (phase === 'ergebnis') {
    return <ScreeningErgebnis ergebnisse={ergebnisse} onNeustart={() => { setPhase('einstieg'); setAlleAntworten({}); setSymptomAuswahl([]) }} onZurueck={onZurueck} />
  }

  return null
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

function ScreeningErgebnis({ ergebnisse, onNeustart, onZurueck }) {
  const höchsteStufe = Math.min(...ergebnisse.map(e => e.stufe))
  const stufe1 = ergebnisse.filter(e => e.stufe === 1)
  const stufe2 = ergebnisse.filter(e => e.stufe === 2)
  const hatStufe1 = stufe1.length > 0

  useEffect(() => {
    localStorage.setItem('screening_datum', new Date().toISOString())
    localStorage.setItem('screening_ergebnis', JSON.stringify(ergebnisse))
  }, [])

  return (
    <div style={{ padding: '16px', paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 20px' }}>Dein Ergebnis</h2>

      {stufe1.map((res) => (
        <div key={res.instrument} style={{ backgroundColor: '#FFEBEE', borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: colors.text, margin: 0 }}>{res.label}</p>
            <span style={{ fontSize: '12px', color: colors.textLight, backgroundColor: colors.surface, padding: '3px 8px', borderRadius: '6px' }}>{res.instrument}</span>
          </div>
          <p style={{ fontSize: '14px', color: colors.text, lineHeight: '1.7', margin: 0 }}>
            Deine Angaben liegen oberhalb des Schwellenwerts. Ein Gespräch mit einem Psychologen oder Arzt wird empfohlen.
          </p>
        </div>
      ))}

      {stufe2
        .filter(res => (res.chips ?? []).length > 0)
        .map((res) => (
          <div key={res.instrument} style={{ backgroundColor: colors.background, borderRadius: '14px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: '0 0 12px' }}>
              In einigen Symptombereichen zeigen deine Angaben erhöhte Werte:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {(res.chips ?? []).map((chip) => (
                <div key={chip} style={{ padding: '8px 14px', backgroundColor: colors.primaryLight, borderRadius: '20px', fontSize: '13px', color: colors.primary, fontWeight: '500', border: `1px solid ${colors.primary}30` }}>{chip}</div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: colors.textLight, margin: 0, lineHeight: '1.6' }}>
              Ressourcen zu diesen Themen folgen in einer späteren Version.
            </p>
          </div>
        ))}

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

function HauptApp() {
  const [aktiveTab, setAktiveTab] = useState('home')
  const [tagebuchOffen, setTagebuchOffen] = useState(false)
  const [screeningOffen, setScreeningOffen] = useState(false)

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', backgroundColor: colors.surface, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {aktiveTab === 'home' && !tagebuchOffen && !screeningOffen && <Hauptseite onTagebuchOeffnen={() => setTagebuchOffen(true)} onScreeningOeffnen={() => setScreeningOffen(true)} />}
        {aktiveTab === 'home' && tagebuchOffen && <TagebuchEintrag onZurueck={() => setTagebuchOffen(false)} />}
        {aktiveTab === 'home' && screeningOffen && <ScreeningFlow onZurueck={() => setScreeningOffen(false)} />}
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

function Hauptseite({ onTagebuchOeffnen, onScreeningOeffnen }) {
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
    </div>
  )
}

function TagebuchEintrag({ onZurueck }) {
  const [werte, setWerte] = useState({ befinden: 0, energie: 0, schlaf: 0 })
  const [notiz, setNotiz] = useState('')
  const [gespeichert, setGespeichert] = useState(false)
  const [heuteGeladen, setHeuteGeladen] = useState(false)
  const heute = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const gespeicherterEintrag = localStorage.getItem(`tagebuch_${heute}`)
    if (gespeicherterEintrag) {
      const daten = JSON.parse(gespeicherterEintrag)
      setWerte(daten.werte)
      setNotiz(daten.notiz)
      setHeuteGeladen(true)
    }
  }, [])

  const handleSpeichern = () => {
    localStorage.setItem(`tagebuch_${heute}`, JSON.stringify({ datum: heute, werte, notiz, gespeichertUm: new Date().toISOString() }))
    setGespeichert(true)
    setTimeout(() => onZurueck(), 1200)
  }

  const kategorien = [
    { key: 'befinden', label: 'Befinden', links: 'Schlecht', rechts: 'Sehr gut' },
    { key: 'energie', label: 'Energie', links: 'Wenig', rechts: 'Viel' },
    { key: 'schlaf', label: 'Schlaf', links: 'Schlecht', rechts: 'Gut' },
  ]

  const alleAusgewaehlt = werte.befinden > 0 && werte.energie > 0 && werte.schlaf > 0

  return (
    <div style={{ padding: '16px' }}>
      <button onClick={onZurueck} style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '15px', cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Zurück</button>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>Tagebuch</h2>
      <p style={{ fontSize: '13px', color: colors.textLight, margin: '0 0 24px' }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      {heuteGeladen && (
        <div style={{ backgroundColor: colors.primaryLight, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: colors.primary, margin: 0, fontWeight: '500' }}>Du hast heute bereits einen Eintrag gespeichert. Du kannst ihn hier anpassen.</p>
        </div>
      )}
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
      <button onClick={handleSpeichern} disabled={!alleAusgewaehlt || gespeichert} style={{ width: '100%', padding: '16px', backgroundColor: gespeichert ? '#4CAF50' : alleAusgewaehlt ? colors.primary : colors.border, color: alleAusgewaehlt || gespeichert ? '#fff' : colors.textLight, border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: alleAusgewaehlt && !gespeichert ? 'pointer' : 'default', transition: 'background 0.2s' }}>
        {gespeichert ? 'Gespeichert ✓' : 'Eintrag speichern'}
      </button>
      {!alleAusgewaehlt && <p style={{ fontSize: '12px', color: colors.textLight, textAlign: 'center', marginTop: '8px' }}>Bitte alle drei Ratings ausfüllen</p>}
    </div>
  )
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