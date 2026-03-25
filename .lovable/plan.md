

## Plan: Désactiver paiement mobile + Supprimer formes des ambiances

### 1. Supprimer les formes SVG dans VibeScreen

- Retirer le composant `VibePattern` et tout le bloc `vibePatterns` (lignes 20-209)
- Retirer le `<div>` qui affiche les formes (lignes 252-255)
- Les cartes gardent leurs couleurs de fond (gradients) sans aucune décoration

### 2. Désactiver le paiement dans PacksScreen

- Au lieu de lancer le processus VPI, le bouton "Acheter" débloque directement le pack (appel `unlockVibe` ou `unlockBundle`)
- Supprimer le modal de choix Mobile Money / Carte bancaire
- Supprimer les imports `usePayment`, `CreditCard`, `Smartphone`, `Loader2`
- Le bouton affichera toujours le prix mais débloquera gratuitement en un clic (mode test)
- Ajouter un petit toast "Pack débloqué !" pour confirmer

### Details techniques

- `VibeScreen.tsx`: suppression de ~190 lignes de SVG, le fichier passe de 278 à ~80 lignes
- `PacksScreen.tsx`: `handleBuy` appelle directement `unlockVibe(pack.vibe)` ou `unlockBundle()` sans passer par VPI
- Le code VPI (edge functions, hook) reste intact pour réactivation future

