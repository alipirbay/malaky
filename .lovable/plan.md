

## Plan: Sons fonctionnels + Paramètres revus

### Modifications demandees

1. **SettingsScreen** - Refonte complete
   - Supprimer l'option "Langue"
   - Son: switch on/off fonctionnel + slider de volume (0-100%)
   - Vibrations: switch on/off fonctionnel
   - Confidentialite: garde tel quel
   - Footer: "Made with ❤️ by APli"
   - Persister les settings dans le store (zustand persist)

2. **Sound system** - Nouveau hook `useSounds.ts`
   - Creer un hook centralise qui gere tous les sons via Web Audio API (pas besoin d'ElevenLabs, sons generes programmatiquement)
   - Sons a implementer:
     - **Clic bouton**: court "pop" synthetique
     - **Chrono tick**: bip a chaque seconde pendant le countdown
     - **Chrono fin**: alarme/buzzer quand temps ecoule
     - **Transition carte**: whoosh leger au changement de carte
     - **Vote dilemme**: son de confirmation
   - Le hook lit `soundEnabled` et `soundVolume` depuis le store
   - Sons generes via `OscillatorNode` + `GainNode` (zero fichier audio a charger)

3. **GameStore** - Ajout settings
   - Ajouter `soundEnabled: boolean`, `soundVolume: number`, `vibrationEnabled: boolean`
   - Actions: `toggleSound`, `setSoundVolume`, `toggleVibration`
   - Persister ces valeurs dans le localStorage via `partialize`

4. **Integration des sons dans les composants**
   - `GameScreen`: son tick chrono, buzzer fin, whoosh carte next
   - `HomeScreen` / boutons: son clic
   - `DailyDilemme`: son confirmation vote
   - Bouton Volume2 dans GameScreen: toggle mute rapide

### Details techniques

- Sons synthetiques via Web Audio API (`AudioContext`, `OscillatorNode`) - pas de fichiers audio, chargement instantane
- Le slider volume utilise le composant `Slider` deja present dans le projet
- Le switch utilise le composant `Switch` deja present
- Vibration via `navigator.vibrate()` (mobile uniquement, silencieux sur desktop)

