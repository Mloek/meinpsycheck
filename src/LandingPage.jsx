import { useState, useEffect } from 'react'

const COLORS = {
  bg: '#0f0520',
  bgCard: '#1a0a30',
  purple: '#5B21B6',
  purpleLight: '#7C3AED',
  purplePale: '#a855f7',
  accent: '#c084fc',
  text: '#f3f0ff',
  textMuted: '#a78bfa',
  green: '#10b981',
}

function PhoneMockup({ screenshot, alt, tilt = 0 }) {
  return (
    <div style={{
      transform: `rotate(${tilt}deg)`,
      flexShrink: 0,
      width: 200,
      filter: 'drop-shadow(0 24px 48px rgba(91,33,182,0.5))',
    }}>
      <div style={{
        width: 200,
        height: 400,
        borderRadius: 36,
        border: '6px solid #3b1d6e',
        background: '#1a0a30',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 60, height: 20, background: '#0f0520', borderRadius: '0 0 16px 16px',
          zIndex: 10,
        }} />
        {screenshot
          ? <img src={screenshot} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #2A0A4E 0%, #5B21B6 100%)' }} />
        }
      </div>
    </div>
  )
}

function Step({ number, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', textAlign: 'left' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 18, color: 'white',
      }}>{number}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: COLORS.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  )
}

function InstallStep({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(91,33,182,0.15)', borderRadius: 12,
      padding: '12px 16px', border: '1px solid rgba(124,58,237,0.3)',
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.4 }}>{text}</span>
    </div>
  )
}

export default function LandingPage() {
  const [isIOS, setIsIOS] = useState(true)
  const [tab, setTab] = useState('ios')

  useEffect(() => {
    const android = /android/i.test(navigator.userAgent)
    setIsIOS(!android)
    setTab(android ? 'android' : 'ios')
  }, [])

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: '100vh',
      color: COLORS.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflowX: 'hidden',
    }}>

      {/* ── HERO ── */}
      <div style={{
        padding: '60px 24px 40px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, #2d0f5e 0%, #0f0520 60%)',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 100, padding: '6px 16px',
          fontSize: 13, color: COLORS.accent, fontWeight: 600, marginBottom: 24,
          letterSpacing: 1,
        }}>
          KOSTENLOS · ANONYM · WISSENSCHAFTLICH
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 42px)',
          fontWeight: 900, lineHeight: 1.15,
          margin: '0 0 20px',
          background: 'linear-gradient(135deg, #fff 40%, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Habe ich genug Symptome,<br />um zum Psychologen zu gehen?
        </h1>

        <p style={{
          fontSize: 17, color: COLORS.textMuted, lineHeight: 1.6,
          maxWidth: 420, margin: '0 auto 36px',
        }}>
          MeinPsyCheck gibt dir in 5–10 Minuten eine wissenschaftlich fundierte Einschätzung –
          ohne Wartezeit, ohne Registrierung.
        </p>

        {/* Phone mockups - hero */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          gap: 16, margin: '0 0 48px', overflow: 'visible',
        }}>
          <PhoneMockup screenshot="/screenshots/hauptseite.png" alt="Hauptseite" tilt={-6} />
          <div style={{ marginBottom: 20 }}>
            <PhoneMockup screenshot="/screenshots/ergebnis.png" alt="Ergebnis" tilt={0} />
          </div>
          <PhoneMockup screenshot="/screenshots/ressourcen.png" alt="Ressourcen" tilt={6} />
        </div>
      </div>

      {/* ── WIE ES FUNKTIONIERT ── */}
      <div style={{ padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
          Wie es funktioniert
        </h2>
        <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 14, marginBottom: 32 }}>
          In drei Schritten zu deiner Einschätzung
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Step number="1" title="26 validierte Fragen" desc="PHQ-9, GAD-7, ASRS – dieselben Instrumente, die Psychologen in der Praxis nutzen." />
          <Step number="2" title="Sofortige Einschätzung" desc="Du bekommst eine Einschätzung in drei Stufen – von unauffällig bis klinisch relevant." />
          <Step number="3" title="Passende Ressourcen" desc="Schlaf, Antrieb, Grübeln – konkrete Hilfestellungen für deine Situation." />
        </div>
      </div>

      {/* ── INSTALL ── */}
      <div style={{
        margin: '0 24px 48px',
        background: 'linear-gradient(135deg, #1a0a30, #2a1050)',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: 24, padding: '32px 24px', maxWidth: 480,
        marginLeft: 'auto', marginRight: 'auto',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
          Jetzt installieren
        </h2>
        <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
          Kein App Store. Direkt auf deinen Homebildschirm.
        </p>

        {/* OS Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12,
          padding: 4, marginBottom: 24,
        }}>
          {['ios', 'android'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
              background: tab === t ? COLORS.purple : 'transparent',
              color: tab === t ? 'white' : COLORS.textMuted,
            }}>
              {t === 'ios' ? '🍎  iPhone' : '🤖  Android'}
            </button>
          ))}
        </div>

        {tab === 'ios' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InstallStep icon="1️⃣" text='Öffne diese Seite in Safari (nicht Chrome)' />
            <InstallStep icon="⬆️" text='Tippe auf das Teilen-Symbol unten in der Mitte' />
            <InstallStep icon="➕" text='Scrolle runter → "Zum Home-Bildschirm"' />
            <InstallStep icon="✅" text='Tippe auf "Hinzufügen" – fertig!' />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InstallStep icon="1️⃣" text='Öffne diese Seite in Chrome' />
            <InstallStep icon="⋮" text='Tippe auf die drei Punkte oben rechts' />
            <InstallStep icon="➕" text='"App installieren" oder "Zum Startbildschirm"' />
            <InstallStep icon="✅" text='Bestätigen – fertig!' />
          </div>
        )}
      </div>

      {/* ── FEATURES ── */}
      <div style={{ padding: '0 24px 48px', maxWidth: 480, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>
          Was dich erwartet
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🔬', title: 'Wissenschaftlich', desc: 'Validierte Instrumente aus der Psychiatrie' },
            { icon: '🔒', title: 'Anonym', desc: 'Alle Daten bleiben auf deinem Gerät' },
            { icon: '⚡', title: '5–10 Minuten', desc: 'Schnell, klar, ohne Anmeldung' },
            { icon: '🆓', title: 'Kostenlos', desc: 'Ohne Abo, ohne versteckte Kosten' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'rgba(91,33,182,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 16, padding: '20px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{
        padding: '24px', textAlign: 'center',
        borderTop: '1px solid rgba(124,58,237,0.2)',
        color: COLORS.textMuted, fontSize: 12, lineHeight: 1.6,
        maxWidth: 480, margin: '0 auto',
      }}>
        MeinPsyCheck ist ein Orientierungsangebot – kein Medizinprodukt und ersetzt keine professionelle Diagnose.
        <br />
        <span style={{ opacity: 0.6 }}>© 2026 MeinPsyCheck · meinpsycheck.de</span>
      </div>
    </div>
  )
}
