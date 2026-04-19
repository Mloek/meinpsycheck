import { useState, useEffect, useRef, useCallback } from 'react'

// ── INSTALL ANIMATION ──────────────────────────────────────────────
const IOS_STEPS = [
  {
    label: 'meinpsycheck.de in Safari öffnen',
    screen: ({ pulse }) => (
      <div style={{ width: '100%', height: '100%', background: '#f2f2f7', display: 'flex', flexDirection: 'column' }}>
        {/* Status bar */}
        <div style={{ background: '#fff', padding: '10px 14px 6px', fontSize: 11, fontWeight: 600, color: '#000', display: 'flex', justifyContent: 'space-between' }}>
          <span>9:41</span><span>●●● WiFi</span>
        </div>
        {/* URL bar */}
        <div style={{ background: '#fff', padding: '6px 10px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ background: '#e9e9eb', borderRadius: 10, padding: '5px 10px', fontSize: 12, color: '#333', textAlign: 'center' }}>
            meinpsycheck.de
          </div>
        </div>
        {/* Page content mock */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#5B21B6' }} />
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1c1c1e' }}>MeinPsyCheck</div>
          <div style={{ width: '80%', height: 6, borderRadius: 3, background: '#e0e0e0' }} />
          <div style={{ width: '60%', height: 6, borderRadius: 3, background: '#e0e0e0' }} />
        </div>
        {/* Safari bottom bar */}
        <div style={{ background: '#f9f9f9', borderTop: '1px solid #e0e0e0', padding: '8px 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: '#999' }}>←</span>
          <span style={{ fontSize: 18, color: '#999' }}>→</span>
          <div style={{
            fontSize: 18, color: '#007AFF', fontWeight: 400,
            transform: pulse ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.3s',
          }}>⬆</div>
          <span style={{ fontSize: 18, color: '#999' }}>⧉</span>
          <span style={{ fontSize: 18, color: '#999' }}>⋮</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Teilen-Symbol antippen',
    screen: () => (
      <div style={{ width: '100%', height: '100%', background: '#f2f2f7', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ background: '#fff', padding: '10px 14px 6px', fontSize: 11, fontWeight: 600, color: '#000', display: 'flex', justifyContent: 'space-between' }}>
          <span>9:41</span><span>●●● WiFi</span>
        </div>
        <div style={{ background: '#fff', padding: '6px 10px', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ background: '#e9e9eb', borderRadius: 10, padding: '5px 10px', fontSize: 12, color: '#333', textAlign: 'center' }}>meinpsycheck.de</div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Share sheet */}
        <div style={{ background: '#f2f2f7', borderRadius: '16px 16px 0 0', padding: '12px 0 8px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ width: 36, height: 4, background: '#c8c8c8', borderRadius: 2, margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 12px 12px', justifyContent: 'center' }}>
            {['Kopieren', 'Safari', 'Notizen', 'Mail'].map(l => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0e0e0' }} />
                <span style={{ fontSize: 9, color: '#555' }}>{l}</span>
              </div>
            ))}
          </div>
          {/* Highlighted option */}
          <div style={{ margin: '0 12px 6px', background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, background: '#e8f0ff' }}>
              <span style={{ fontSize: 18 }}>➕</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#007AFF' }}>Zum Home-Bildschirm</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18, color: '#999' }}>🔖</span>
              <span style={{ fontSize: 14, color: '#333' }}>Lesezeichen hinzufügen</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: '"Zum Home-Bildschirm" wählen',
    screen: () => (
      <div style={{ width: '100%', height: '100%', background: '#f2f2f7', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', padding: '10px 14px 6px', fontSize: 11, color: '#000', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span style={{ color: '#007AFF' }}>Abbrechen</span><span>Zum Homebildschirm</span><span style={{ color: '#007AFF', fontWeight: 700 }}>Hinzufügen</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #5B21B6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, color: '#fff' }}>🧠</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1c1c1e' }}>MeinPsyCheck</div>
            <div style={{ fontSize: 12, color: '#8e8e93' }}>meinpsycheck.de</div>
          </div>
          <div style={{ background: '#007AFF', borderRadius: 12, padding: '12px 32px' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Hinzufügen</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'App ist installiert!',
    screen: ({ pulse }) => (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1a0533 0%, #2A0A4E 100%)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 14px 6px', fontSize: 11, color: '#fff', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span>9:41</span><span>●●● WiFi</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 12, padding: '20px 16px' }}>
          {['📷', '⚙️', '💬', '🗺️'].map((e, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.15)' }} />
          ))}
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #5B21B6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: pulse ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.4s',
            boxShadow: pulse ? '0 0 20px rgba(124,58,237,0.8)' : 'none',
          }}>
            <span style={{ fontSize: 22, color: '#fff' }}>🧠</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 12, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
          MeinPsyCheck auf dem Homebildschirm
        </div>
      </div>
    ),
  },
]

const ANDROID_STEPS = [
  {
    label: 'meinpsycheck.de in Chrome öffnen',
    screen: ({ pulse }) => (
      <div style={{ width: '100%', height: '100%', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#1a73e8', padding: '10px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>9:41</span>
          <span style={{ fontSize: 11, color: '#fff' }}>● WiFi</span>
        </div>
        <div style={{ background: '#fff', padding: '8px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, background: '#f1f3f4', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#333' }}>meinpsycheck.de</div>
          <div style={{
            fontSize: 18, color: '#5f6368',
            transform: pulse ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.3s',
          }}>⋮</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#5B21B6' }} />
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1c1c1e' }}>MeinPsyCheck</div>
          <div style={{ width: '80%', height: 6, borderRadius: 3, background: '#e0e0e0' }} />
          <div style={{ width: '60%', height: 6, borderRadius: 3, background: '#e0e0e0' }} />
        </div>
      </div>
    ),
  },
  {
    label: 'Drei Punkte oben rechts antippen',
    screen: () => (
      <div style={{ width: '100%', height: '100%', background: '#f8f9fa', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ background: '#1a73e8', padding: '10px 14px 8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>9:41</span>
          <span style={{ fontSize: 11, color: '#fff' }}>● WiFi</span>
        </div>
        <div style={{ background: '#fff', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, background: '#f1f3f4', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#333' }}>meinpsycheck.de</div>
          <span style={{ fontSize: 18, color: '#1a73e8', fontWeight: 700 }}>⋮</span>
        </div>
        {/* Dropdown menu */}
        <div style={{ position: 'absolute', top: 60, right: 8, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: 180, zIndex: 10, overflow: 'hidden' }}>
          {['Neuer Tab', 'Verlauf', 'Lesezeichen'].map(item => (
            <div key={item} style={{ padding: '11px 16px', fontSize: 13, color: '#333', borderBottom: '1px solid #f0f0f0' }}>{item}</div>
          ))}
          <div style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#1a73e8', background: '#e8f0fe' }}>
            Zum Startbildschirm hinzufügen
          </div>
          <div style={{ padding: '11px 16px', fontSize: 13, color: '#333' }}>Einstellungen</div>
        </div>
      </div>
    ),
  },
  {
    label: '"Zum Startbildschirm hinzufügen" tippen',
    screen: () => (
      <div style={{ width: '100%', height: '100%', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#1a73e8', padding: '10px 14px 8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>9:41</span>
          <span style={{ fontSize: 11, color: '#fff' }}>● WiFi</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #5B21B6, #7c3aed)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, color: '#fff' }}>🧠</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#1c1c1e' }}>MeinPsyCheck</div>
            <div style={{ fontSize: 11, color: '#8e8e93', marginBottom: 16 }}>meinpsycheck.de</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12, color: '#666', textAlign: 'center' }}>Abbrechen</div>
              <div style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#1a73e8', fontSize: 12, color: '#fff', fontWeight: 700, textAlign: 'center' }}>Hinzufügen</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'App ist installiert!',
    screen: ({ pulse }) => (
      <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'transparent', padding: '10px 14px 8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>9:41</span>
          <span style={{ fontSize: 11, color: '#fff' }}>● WiFi</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 16, padding: '16px 12px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)' }} />
          ))}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #5B21B6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: pulse ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.4s',
            boxShadow: pulse ? '0 0 20px rgba(124,58,237,0.8)' : 'none',
          }}>
            <span style={{ fontSize: 22, color: '#fff' }}>🧠</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 12, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
          MeinPsyCheck auf dem Homebildschirm
        </div>
      </div>
    ),
  },
]

function InstallAnimation({ platform }) {
  const steps = platform === 'ios' ? IOS_STEPS : ANDROID_STEPS
  const [step, setStep] = useState(0)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setStep(0)
    setPulse(false)
  }, [platform])

  useEffect(() => {
    const t = setTimeout(() => {
      setPulse(true)
      setTimeout(() => {
        setPulse(false)
        setStep(s => (s + 1) % steps.length)
      }, 600)
    }, 2200)
    return () => clearTimeout(t)
  }, [step, platform])

  const Screen = steps[step].screen
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Phone frame */}
      <div style={{
        width: 180, height: 320,
        borderRadius: 28, border: '4px solid rgba(255,255,255,0.2)',
        overflow: 'hidden', background: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <Screen pulse={pulse} />
      </div>
      {/* Step label */}
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center',
        minHeight: 36, fontWeight: 500, lineHeight: 1.4, maxWidth: 240,
      }}>
        {steps[step].label}
      </div>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? '#fff' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function PhoneMockup({ src, alt, tilt = 0, width }) {
  return (
    <div style={{ transform: `rotate(${tilt}deg)`, flexShrink: 0, filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.45))' }}>
      <div style={{
        width, height: `calc(${width} * 2.1)`,
        borderRadius: 28, border: '4px solid rgba(255,255,255,0.22)',
        background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', zIndex: 10,
        }} />
        {src
          ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)' }} />
        }
      </div>
    </div>
  )
}

function InstallModal({ onClose }) {
  const [tab, setTab] = useState('ios')
  const startY = useRef(0)

  const steps = {
    ios: ['Safari öffnen (nicht Chrome)', 'Teilen-Symbol unten antippen', '"Zum Home-Bildschirm" wählen', '"Hinzufügen" tippen – fertig'],
    android: ['Chrome öffnen', 'Drei Punkte oben rechts antippen', '"Zum Startbildschirm hinzufügen" wählen', '"Hinzufügen" tippen – fertig'],
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { startY.current = e.touches[0].clientY }}
        onTouchEnd={e => { if (e.changedTouches[0].clientY - startY.current > 80) onClose() }}
        style={{
          background: '#1e0a3c', borderRadius: '28px 28px 0 0',
          padding: '28px 24px 40px', width: '100%', maxWidth: 520,
          border: '1px solid rgba(124,58,237,0.4)',
        }}
      >
        {/* Swipe handle */}
        <div style={{ width: 44, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)', margin: '0 auto 24px', cursor: 'grab' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: 20 }}>App installieren</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {['ios', 'android'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 15, background: tab === t ? '#6d28d9' : 'transparent', color: '#fff',
            }}>{t === 'ios' ? 'iPhone' : 'Android'}</button>
          ))}
        </div>

        {/* Live Animation */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <InstallAnimation platform={tab} />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps[tab].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '13px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: 14 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{i + 1}</span>
              <span style={{ fontSize: 15, color: '#fff' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false)
  const vw = useWindowWidth()
  const isMobile = vw < 680

  const phoneW = isMobile ? `${Math.round(vw * 0.38)}px` : `${Math.round(Math.min(vw * 0.22, 240))}px`
  const phonWTherapie = isMobile ? `${Math.round(vw * 0.7)}px` : `${Math.round(Math.min(vw * 0.26, 280))}px`

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden', color: '#fff' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(160deg, #3b0764 0%, #6d28d9 100%)', width: '100%', boxSizing: 'border-box', padding: isMobile ? '40px 20px 48px' : '60px 40px 72px' }}>

        {/* Logo + badge */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 44 }}>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, marginBottom: 14 }}>MeinPsyCheck</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', fontSize: isMobile ? 11 : 13, fontWeight: 700, letterSpacing: 1.5 }}>
            KOSTENLOS · ANONYM · WISSENSCHAFTLICH
          </div>
        </div>

        {isMobile ? (
          /* ── MOBILE: Headline → Phones → Steps ── */
          <>
            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, textAlign: 'center', margin: '0 0 16px' }}>
              Orientierung für deine psychische Gesundheit
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
              Wissenschaftlich validierte Fragebögen. Sofortige Einschätzung. Keine Registrierung.
            </p>

            {/* Two phones side by side */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 36, alignItems: 'flex-end' }}>
              <PhoneMockup src="/hauptseite.png" alt="Hauptseite" tilt={-5} width={phoneW} />
              <PhoneMockup src="/ergebnis.png" alt="Ergebnis" tilt={5} width={phoneW} />
            </div>

            {/* Steps below */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400, margin: '0 auto' }}>
              {[
                { n: '1', title: '26 validierte Fragen', desc: 'PHQ-9, GAD-7, ASRS – klinisch geprüfte Instrumente' },
                { n: '2', title: 'Sofortige Einschätzung', desc: 'Drei Stufen – von unauffällig bis klinisch relevant' },
                { n: '3', title: 'Passende Ressourcen', desc: 'Konkrete nächste Schritte für deine Situation' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── DESKTOP: Phone | Steps | Phone ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, maxWidth: 1100, margin: '0 auto' }}>
            <PhoneMockup src="/hauptseite.png" alt="Hauptseite" tilt={-6} width={phoneW} />
            <div style={{ flex: '1 1 200px', maxWidth: 380 }}>
              <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 20px', textAlign: 'center' }}>
                Orientierung für deine psychische Gesundheit
              </h1>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.6, margin: '0 0 32px' }}>
                Wissenschaftlich validierte Fragebögen. Sofortige Einschätzung. Keine Registrierung.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { n: '1', title: '26 validierte Fragen', desc: 'PHQ-9, GAD-7, ASRS – klinisch geprüfte Instrumente aus der Psychiatrie' },
                  { n: '2', title: 'Sofortige Einschätzung', desc: 'Drei Stufen – von unauffällig bis klinisch relevant' },
                  { n: '3', title: 'Passende Ressourcen', desc: 'Schlaf, Antrieb, Stress – konkrete nächste Schritte' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PhoneMockup src="/ergebnis.png" alt="Ergebnis" tilt={6} width={phoneW} />
          </div>
        )}
      </div>

      {/* ── THERAPEUTEN ── */}
      <div style={{ background: 'linear-gradient(160deg, #5b21b6 0%, #7c3aed 100%)', width: '100%', boxSizing: 'border-box', padding: isMobile ? '48px 20px' : '64px 40px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 32 : 60, maxWidth: 1100, margin: '0 auto' }}>
          {!isMobile && <PhoneMockup src="/therapeuten.png" alt="Therapeuten" tilt={-3} width={phonWTherapie} />}
          <div style={{ flex: '1 1 260px', maxWidth: 460, textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>KOMMT IN VERSION 2</div>
            <h2 style={{ fontSize: isMobile ? 24 : 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px' }}>
              Therapeuten in deiner Nähe finden
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 'clamp(14px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0 }}>
              Nach dem Screening siehst du, welche Unterstützung zu dir passt – und findest direkt Therapeuten mit freien Terminen in deiner Stadt.
            </p>
          </div>
          {isMobile && <PhoneMockup src="/therapeuten.png" alt="Therapeuten" tilt={2} width={phonWTherapie} />}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: '#2e1065', width: '100%', boxSizing: 'border-box', padding: isMobile ? '48px 20px' : '72px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: isMobile ? 24 : 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, marginBottom: 14 }}>Jetzt kostenlos starten</h2>
        <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.6)', marginBottom: 36, lineHeight: 1.6 }}>
          Kein App Store. Kein Konto. Direkt auf deinen Homebildschirm.
        </p>
        <button onClick={() => setShowModal(true)} style={{
          background: '#fff', color: '#3b0764', border: 'none', borderRadius: 100,
          padding: isMobile ? '18px 40px' : '20px 72px',
          fontSize: isMobile ? 18 : 22, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          width: isMobile ? '100%' : 'auto', maxWidth: 440,
        }}>
          App jetzt installieren
        </button>
        <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Orientierungsangebot – kein Medizinprodukt · © 2026 MeinPsyCheck
        </p>
      </div>

      {showModal && <InstallModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
