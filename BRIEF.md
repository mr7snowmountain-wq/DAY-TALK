# DayTalk — Brief Projet

## Concept
App de planning vocal AI, unisexe, pour tout le monde (perso + pro).
Dicte ta journée en langage naturel, DayTalk génère ton planning.

## Live & Repo
- Repo : https://github.com/mr7snowmountain-wq/DAY-TALK
- Stack : React + Vite + Supabase + Claude API (Haiku)

## Design
- Font : Nunito partout
- Couleurs : Teal #00C2B8, Bleu #2B5CE6, Cyan #00E5D4, Navy #0D1B4B
- Style : Glassmorphism, cards arrondies, mobile-first
- Logo : goutte d'eau avec micro (teal → bleu gradient)

## Supabase
Partage le projet Supabase d'Aliyah, tables préfixées `dt_`
- dt_profiles
- dt_plannings  
- dt_push_subscriptions

## Fonctionnalités
- [x] Auth (email/password)
- [x] Onboarding 2 étapes
- [x] Dashboard home
- [x] Planning vocal (Web Speech API + Claude Haiku)
- [x] Carrousel vertical de tâches
- [x] Sauvegarde Supabase
- [x] PWA + Push notifications
- [ ] Vue semaine
- [ ] Vue mois
- [ ] Sync Google Calendar

## Variables Vercel
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY,
VITE_VAPID_PUBLIC_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY,
SUPABASE_SERVICE_KEY, CRON_SECRET
