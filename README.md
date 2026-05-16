# ArtFlow

Application mobile de pratique artistique hebdomadaire. Chaque semaine, ArtFlow génère des missions personnalisées selon les axes de progression que tu as choisis, analyse tes soumissions par IA et te fait monter en niveau au fil du temps.

---

## Comment ça fonctionne

### 1. Choisis ton plan

Au premier lancement, tu sélectionnes les **axes** sur lesquels tu veux progresser. Chaque axe représente une compétence artistique fondamentale :

| Axe | Description |
|-----|-------------|
| 🦴 Anatomie | Proportions, figure humaine, corps en mouvement |
| 📐 Perspective | Construction spatiale, points de fuite, volumes |
| 🖼️ Composition | Équilibre visuel, règle des tiers, flux du regard |
| 🌑 Valeurs | Lumière, ombre, contraste, dégradés |
| 🎨 Couleurs | Théorie des couleurs, harmonies, température |
| ✨ Trouver mon style | Exploration personnelle, identité visuelle |

Tu peux activer ou désactiver un axe à tout moment depuis ton plan. Seuls les axes **actifs** génèrent des missions.

---

### 2. Les missions hebdomadaires

Chaque semaine, **une mission est générée par axe actif**. Les missions sont créées automatiquement à la première visite de la semaine via l'IA Gemini, adaptées à ton niveau actuel sur chaque axe.

**Exemple de mission niveau 1 — Anatomie :**
> *"Dessine 5 mains depuis différents angles. Concentre-toi sur les proportions et le placement des articulations. Passe au moins 10 minutes par main."*

**Exemple de mission niveau 4 — Composition :**
> *"Réalise une scène avec 3 points d'intérêt distincts reliés par une ligne de lecture implicite. L'œil du spectateur doit parcourir naturellement les trois éléments."*

Les missions s'adaptent à ton niveau — plus tu progresses, plus elles deviennent exigeantes et précises.

---

### 3. Soumettre ton travail

Quand tu as terminé une mission, tu soumets une photo de ton œuvre directement depuis l'app. L'IA analyse l'image et te renvoie un **feedback structuré** :

```
Score : 7/10

✅ Points forts :
- Bonne maîtrise des proportions générales
- Le contraste de valeurs est cohérent

💡 Axes d'amélioration :
- Travailler la fluidité des courbes
- Varier l'épaisseur du trait pour créer de la profondeur
```

---

### 4. Système de progression (XP & Niveaux)

Chaque mission complétée rapporte des **XP** sur l'axe concerné et sur ton profil global.

**Formule d'XP par mission :**
```
xpReward = 100 + (niveau_actuel - 1) × 10
```
Niveau 1 → 100 XP, Niveau 2 → 110 XP, Niveau 3 → 120 XP...

**Seuil de montée de niveau :**
```
XP requis pour level up = niveau_actuel × 200
```
- Niveau 1 → 2 : 200 XP (≈ 2 missions)
- Niveau 2 → 3 : 400 XP (≈ 3-4 missions)
- Niveau 5 → 6 : 1000 XP (≈ 8 missions)

Chaque axe monte en niveau **indépendamment**. Tu peux être niveau 6 en Composition et niveau 2 en Couleurs.

---

### 5. Streak & badges

L'app track ton **streak hebdomadaire** : soumettre au moins une mission par semaine maintient la série en cours.

Les **badges** se débloquent automatiquement selon tes accomplissements :

| Badge | Condition | XP bonus |
|-------|-----------|----------|
| 🎯 First Steps | Première soumission | +50 XP |
| 🔥 4-Week Streak | 4 semaines consécutives | +150 XP |
| 🔥🔥 8-Week Streak | 8 semaines consécutives | +300 XP |
| ⭐ Level 5 | Niveau 5 sur un axe | +200 XP |
| 💎 Level 10 | Niveau 10 sur un axe | +500 XP |
| ✨ Style Found | Soumission sur l'axe Style | +250 XP |
| 🏆 Project Completed | Terminer un projet long | +200 XP |

---

### 6. Projets long terme

En parallèle des missions hebdomadaires, tu peux créer des **projets long terme** — une série de portraits, une illustration complexe, un carnet de croquis. Tu y ajoutes des photos au fil du temps pour documenter ta progression, et l'IA commente chaque étape.

---

## Stack technique

**Backend** — NestJS · Prisma 7 · PostgreSQL (Supabase) · JWT · Gemini AI · Supabase Storage

**Mobile** — Expo 54 · React Native · NativeWind (Tailwind CSS) · React Query · Zustand · React Navigation

---

## Lancer le projet

### Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) avec les tables créées
- Une clé API [Google Gemini](https://aistudio.google.com)

### Backend

```bash
cd backend
npm install
```

Crée un fichier `.env` :

```env
DATABASE_URL="postgresql://postgres.XXXXX:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres"

JWT_SECRET="un_secret_solide"

GEMINI_API_KEY="ta_clé_gemini"

SUPABASE_URL="https://XXXXX.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

Build et démarrage :

```bash
npm run build
node dist/src/main.js
```

Le serveur tourne sur `http://localhost:3000`.

---

### Mobile — Web (sans Xcode)

```bash
cd mobile
npm install
npx expo start --web
```

Ouvre `http://localhost:8081` dans le navigateur.

---

### Mobile — iOS Simulateur (nécessite Xcode)

```bash
cd mobile
npx expo start --ios
```

Le simulateur iPhone s'ouvre automatiquement.

---

### Mobile — iPhone physique

1. Installe **Expo Go** depuis l'App Store
2. Assure-toi que ton iPhone et ton Mac sont sur le **même réseau Wi-Fi**
3. Dans `mobile/src/api/client.ts`, vérifie que l'IP correspond à celle de ton Mac :

```ts
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : __DEV__
    ? 'http://192.168.1.XX:3000'   // ← IP locale de ton Mac
    : 'https://ton-backend-prod.com';
```

4. Lance `npx expo start` et scanne le QR code avec Expo Go

---

### Trouver l'IP locale de ton Mac

```bash
ipconfig getifaddr en0
```
