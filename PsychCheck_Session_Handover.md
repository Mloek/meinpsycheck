# PsychCheck – Übergabe für neuen Chat
Stand: 06. April 2026

---

## Wer bin ich?
Ich bin Midhad. Ich entwickle zusammen mit Claude eine PWA App namens **MeinPsyCheck** – eine wissenschaftlich fundierte Orientierungs-App für psychische Gesundheit. Claude ist mein Entwicklungspartner: erst Forscher/Konzepter, jetzt Programmierer.

---

## Dein Prompt zum Start
"Du bist mein Entwicklungspartner für die PsychCheck App. Lies diese Übergabe-Datei komplett durch und mach dann genau dort weiter wo wir aufgehört haben."

---

## Was bereits fertig ist

### Inhalt (100% abgeschlossen)
- Ergebnistexte für alle 4 Störungsbilder (Kurzversion + Langversion + Quellen)
- ADHS-Chips: Psychoedukation statt Selbsthilfe (3 Informations-Chips mit validierten Quellen)
- WHO-5 Zuordnung: Chip "Chronischer Stress" 
- Alle Disclaimer-Texte finalisiert
- Ressourcenkatalog komplett (Schlaf, Grübeln, Antrieb, Konzentration, Innere Unruhe, Reizbarkeit, Stress, Sozialer Rückzug)

### Technische Basis (aufgesetzt, läuft)
- React + Vite Projekt läuft lokal auf http://localhost:5173
- Ordner: ~/Documents/Meinpsycheck
- Navigation funktioniert: Home → Screening → Zurück / Home → Tagebuch → Zurück
- Node.js v24.14.1 installiert

### Accounts & Tools
- Domain: meinpsycheck.de (gekauft)
- Netlify Account: erstellt
- GitHub Account: erstellt  
- Cursor: installiert (Code-Editor)

---

## App-Konzept (Kurzfassung)

**Was:** PWA – Progressive Web App, läuft im Browser, installierbar wie eine echte App
**Zielgruppe:** Erwachsene ab 18 Jahren in Deutschland
**Kernfunktion:** Symptom-Screening nach validierten Instrumenten + Ressourcen

### Navigation: 2 Tabs
- Tab 1: Screening
- Tab 2: Tagebuch

### Screening-Logik (Trichter)
- Eingang: PHQ-4 (PHQ-2 + GAD-2)
- Depression: PHQ-9, Cut-Off ≥ 10
- Angst: GAD-7, Cut-Off ≥ 10
- ADHS: ASRS v1.1, Cut-Off ≥ 4
- Stress: WHO-5, Cut-Off ≤ 13
- Suizidalität: PHQ-9 Item 9 > 0 → sofort CrisisScreen

### Ergebnisstruktur: 3 Stufen
- Stufe 1: Psychologe empfohlen
- Stufe 2: Subklinisch / Ressourcen
- Stufe 3: Unauffällig

### Onboarding-Flow (noch nicht gebaut)
1. Hallo-Page + Disclaimer (Vollbild, einmalig)
2. Alter + Geschlecht eingeben
3. Tab-Übersicht (einmalige Erklärung beider Tabs)
4. Erster Klick auf Tab 1 → Erklärung was kommt
5. Nach erstem Ergebnis → Erklärung was die Stufen bedeuten
6. Erster Klick auf Tab 2 → Erklärung Tagebuch

---

## Aktueller Code-Stand (App.jsx)

```jsx
import { useState } from 'react'

function App() {
  const [currentScreen, setCurrentScreen] = useState('home')

  return (
    <div style={{
      maxWidth: '430px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      {currentScreen === 'home' && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', color: '#1a1a2e', marginBottom: '8px' }}>
            PsychCheck
          </h1>
          <p style={{ color: '#666', marginBottom: '40px', fontSize: '16px' }}>
            Deine erste Orientierung – wissenschaftlich, kostenlos, anonym.
          </p>
          <button
            onClick={() => setCurrentScreen('screening')}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '12px'
            }}
          >
            Screening starten
          </button>
          <button
            onClick={() => setCurrentScreen('journal')}
            style={{
              backgroundColor: 'white',
              color: '#4f46e5',
              border: '2px solid #4f46e5',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Tagebuch öffnen
          </button>
        </div>
      )}

      {currentScreen === 'screening' && (
        <div style={{ padding: '40px 24px' }}>
          <button onClick={() => setCurrentScreen('home')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', marginBottom: '24px', color: '#4f46e5' }}>
            ← Zurück
          </button>
          <h2 style={{ fontSize: '22px', color: '#1a1a2e' }}>Screening</h2>
          <p style={{ color: '#666' }}>Hier kommt der Fragebogen.</p>
        </div>
      )}

      {currentScreen === 'journal' && (
        <div style={{ padding: '40px 24px' }}>
          <button onClick={() => setCurrentScreen('home')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', marginBottom: '24px', color: '#4f46e5' }}>
            ← Zurück
          </button>
          <h2 style={{ fontSize: '22px', color: '#1a1a2e' }}>Tagebuch</h2>
          <p style={{ color: '#666' }}>Hier kommt das Tagebuch.</p>
        </div>
      )}

    </div>
  )
}

export default App
```

---

## Nächster Schritt (genau hier weitermachen)

**Onboarding Screen bauen** – das ist der erste Bildschirm den ein neuer User sieht.

Struktur:
- Vollbild, dunkler Hintergrund oder sanfte Farbe
- Logo / App-Name oben
- Willkommenstext (aus Masterplan: "Du fragst dich, wie es dir wirklich geht...")
- Krise-Hinweis: 0800 111 0 111
- Button: "Verstanden – App starten"
- Danach: Alter + Geschlecht Eingabe

Danach kommt das richtige Design (Farben, Schriften, Spacing).

---

## Wichtige Entscheidungen die getroffen wurden
- Kein Backend, alles in localStorage
- Keine App Store Version in V1, nur PWA
- Hosting: Netlify (kostenlos)
- Sprache: Nur Deutsch in V1
- Rechtlich: Kein Medizinprodukt, Orientierungsangebot
- PHQ-9 + GAD-7: Public Domain, keine Lizenz nötig
- Design-Referenzen: noch ausstehend (Midhad sucht noch)
- Wissenschaftlicher Ansatz: nur validierte Quellen (Kroenke, Spitzer, Löwe, Kessler, Topp)

---

## Technische Architektur (geplant, noch nicht gebaut)

```
src/
├── pages/
│   ├── Onboarding.jsx
│   ├── Screening.jsx
│   ├── Result.jsx
│   ├── ResourceDetail.jsx
│   └── Journal.jsx
├── components/
│   ├── QuestionCard.jsx
│   ├── SymptomChip.jsx
│   ├── ResultCard.jsx
│   ├── CrisisScreen.jsx
│   └── DisclaimerBanner.jsx
├── data/
│   ├── questions.js
│   ├── results.js
│   └── resources.js
├── logic/
│   └── scoring.js
└── storage/
    └── store.js
```

---

## Wie Claude als Partner arbeitet
- Wissenschaftlich: nur validierte Quellen, keine Erfindungen
- Erklärt alles verständlich (Midhad ist neu im Coding)
- Führt durch jeden Schritt im Terminal und in Cursor
- Warnt bevor etwas Wichtiges passiert
- Arbeitet im Zwei-Ebenen-Prinzip: erst Konzept absegnen, dann coden
