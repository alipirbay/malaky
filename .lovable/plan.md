

# Plan : Landscape + Tilt fonctionnel pour Tilt Up

## Problème
L'utilisateur tient le téléphone **horizontalement sur son front**. L'interaction se fait par **tilt** (incliner vers le bas = trouvé, vers le haut = passer), pas par des boutons gauche/droite. Les boutons "Passer" et "Trouvé" actuels en bas de l'écran sont un **fallback uniquement** (desktop/navigateurs sans gyroscope), pas le mode principal.

L'écran de jeu doit être en **mode landscape** avec le mot centré, sans boutons proéminents qui gênent le gameplay tilt.

## Modifications

### 1. Forcer le landscape sur `TiltUpPlaying` (`HeadsUpScreen.tsx`)

- Au mount de `TiltUpPlaying` : appeler `screen.orientation?.lock('landscape-primary').catch(() => {})`.
- Au unmount : appeler `screen.orientation?.unlock()`.
- **Fallback CSS** si lock échoue : wrapper avec `transform: rotate(90deg)`, `width: 100vh`, `height: 100vw`, `transform-origin: center`.
- Détecter via `window.matchMedia('(orientation: landscape)')` si la rotation CSS est nécessaire.

### 2. Adapter le layout Playing pour landscape + tilt

Le layout actuel (portrait avec boutons bas) devient :
- **Mot géant au centre** de l'écran landscape, ultra lisible (taille 6xl+).
- **Timer discret** en haut à gauche.
- **Score** (trouvés/passés) en haut à droite.
- **Bouton pause** petit, coin supérieur.
- **Supprimer les gros boutons Passer/Trouvé du layout principal**. Les remplacer par une petite zone discrète en bas avec des boutons plus petits marqués "fallback" — visibles seulement si le tilt n'est PAS supporté ou permission refusée.
- Si tilt supporté et actif : afficher un hint discret "↕ Incline pour jouer".
- Si tilt NON supporté : afficher les boutons fallback en plein.

### 3. Vérifier et robustifier `useDeviceTilt.ts`

Le hook actuel est bien structuré (calibration baseline, cooldown, thresholds). Points à vérifier/améliorer :
- **Calibration** : les 5 premières lectures calibrent la baseline — quand le téléphone est tenu horizontalement sur le front, beta sera ~90°. La calibration actuelle gère ça correctement.
- **Thresholds** : `foundThreshold = 50` (tilt avant) et `passThreshold = -30` (tilt arrière). En landscape sur le front, ces valeurs sont cohérentes. Ajuster légèrement si besoin (`foundThreshold = 40`, `passThreshold = -25`) pour plus de réactivité.
- **Cooldown** : 1200ms actuel est bon pour éviter les double-triggers.
- **Cleanup** : le listener est bien nettoyé au unmount.
- **Permission iOS** : le flow `requestPermission` est correct.
- S'assurer que le hook est bien appelé avec `enabled: store.roundRunning && !showMenu` (c'est déjà le cas).

### 4. Nouvelle icône SVG pour Tilt Up (`config.ts` + `ModeScreen.tsx`)

Créer un composant `TiltUpIcon` : SVG inline montrant un rectangle (téléphone) avec deux flèches courbes bidirectionnelles (arcs ↺↻) sur les côtés, symbolisant le mouvement de tilt.
- Remplacer l'emoji `📱` dans `GAME_MODES` par un identifiant spécial (ex: `"tilt_up_icon"`).
- Dans `ModeScreen.tsx`, rendre le composant SVG quand l'emoji est `"tilt_up_icon"`.
- Utiliser aussi cette icône dans `CategoryPicker` et `Instructions`.

### 5. Instructions mises à jour

Adapter l'écran Instructions pour refléter le mode landscape :
- "Tourne ton téléphone en mode paysage"
- "Place-le sur ton front, écran face aux autres"
- "Incline vers le **bas** = Trouvé ✓"
- "Incline vers le **haut** = Passer ✗"

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/screens/HeadsUpScreen.tsx` | Landscape lock/unlock, layout horizontal, boutons fallback conditionnels, instructions mises à jour |
| `src/hooks/useDeviceTilt.ts` | Ajustement thresholds pour meilleure réactivité, aucun changement structurel |
| `src/data/config.ts` | Icône custom pour Tilt Up |
| `src/components/screens/ModeScreen.tsx` | Support rendu icône SVG custom |

