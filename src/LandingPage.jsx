import { useState } from 'react'

const C = {
  bg: 'linear-gradient(160deg, #4c1d95 0%, #6d28d9 100%)',
  bgSolid: '#4c1d95',
  card: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.18)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.7)',
  btn: '#ffffff',
  btnText: '#4c1d95',
}

function PhoneMockup({ src, alt, tilt = 0 }) {
  return (
    <div style={{
      transform: `rotate(${tilt}deg)`,
      width: 140,
      flexShrink: 0,
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))',
    }}>
      <div style={{
        width: 140,
        height: 290,
        borderRadius: 28,
        border: '5px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Generic camera dot */}
        <div style={{
          position: 'absolute', top: 8, left: '50%',
          transform: 'translateX(-50%)',
          width: 8, height: 8,
          borderRadius: '50%', background: 'rgba(255,255,255,0.3)',
          zIndex: 10,
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
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1e0a3c', borderRadius: '24px 24px 0 0',
          padding: '32px 24px 40px', width: '100%', maxWidth: 480,
          border: '1px solid rgba(124,58,237,0.4)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }} />

        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: 20 }}>
          App installieren
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['ios', 'android'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 14,
              background: tab === t ? '#6d28d9' : 'transparent',
              color: '#fff', transition: 'background 0.2s',
            }}>
              {t === 'ios' ? 'iPhone' : 'Android'}
            </button>
          ))}
        </div>

        {/* Video placeholder */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: 16,
          height: 160, marginBottom: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          border: '1px dashed rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.4)', fontSize: 14, gap: 8,
        }}>
          <div style={{ fontSize: 32 }}>▶</div>
          <span>Video-Anleitung folgt</span>
        </div>

        {/* Steps */}
        {tab === 'ios' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Safari öffnen (nicht Chrome)',
              'Teilen-Symbol unten antippen',
              '"Zum Home-Bildschirm" wählen',
              '"Hinzufügen" tippen – fertig',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: '#fff' }}>{s}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Chrome öffnen',
              'Drei Punkte oben rechts antippen',
              '"App installieren" wählen',
              'Bestätigen – fertig',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14, color: '#fff' }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      width: '100%',
      color: C.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflowX: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>MeinPsyCheck</div>
      </div>

      {/* HEADLINE */}
      <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 100, padding: '5px 14px',
          fontSize: 12, fontWeight: 700, letterSpacing: 1,
          marginBottom: 16, color: 'rgba(255,255,255,0.9)',
        }}>
          KOSTENLOS · ANONYM · WISSENSCHAFTLICH
        </div>
        <h1 style={{
          fontSize: 'clamp(26px, 6vw, 38px)',
          fontWeight: 900, lineHeight: 1.2,
          margin: '0 auto', maxWidth: 380,
        }}>
          Orientierung für deine psychische Gesundheit
        </h1>
        <p style={{ fontSize: 16, color: C.muted, marginTop: 16, lineHeight: 1.6, maxWidth: 340, margin: '16px auto 0' }}>
          26 validierte Fragen. Sofortige Einschätzung. Kostenlos und anonym.
        </p>
      </div>

      {/* 3-COLUMN: Phone | Steps | Phone */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(8px, 3vw, 24px)',
        padding: '40px 16px 32px',
        flexWrap: 'nowrap',
        overflow: 'visible',
      }}>
        {/* Left phone */}
        <PhoneMockup src="/hauptseite.png" alt="Hauptseite" tilt={-5} />

        {/* Steps */}
        <div style={{ flex: '1 1 160px', maxWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { n: '1', title: '26 validierte Fragen', desc: 'PHQ-9, GAD-7, ASRS – klinisch geprüft' },
            { n: '2', title: 'Sofortige Einschätzung', desc: 'In drei Stufen – klar und verständlich' },
            { n: '3', title: 'Passende Ressourcen', desc: 'Schlaf, Antrieb, Stress – konkrete Hilfe' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14,
              }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right phone */}
        <PhoneMockup src="/ergebnis.png" alt="Ergebnis" tilt={5} />
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px 48px', textAlign: 'center' }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: C.btn, color: C.btnText,
            border: 'none', borderRadius: 100,
            padding: '18px 48px', fontSize: 18, fontWeight: 800,
            cursor: 'pointer', width: '100%', maxWidth: 360,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          App jetzt installieren
        </button>
        <p style={{ marginTop: 12, fontSize: 13, color: C.muted }}>
          Kein App Store. Direkt auf deinen Homebildschirm.
        </p>
      </div>

      {/* DISCLAIMER */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center', fontSize: 11,
        color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
      }}>
        Orientierungsangebot – kein Medizinprodukt. Ersetzt keine professionelle Diagnose.
        <br />© 2026 MeinPsyCheck
      </div>

      {/* MODAL */}
      {showModal && <InstallModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
