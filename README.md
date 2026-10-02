# Pour toi, Mabelle ❤️

Une petite expérience web romantique, interactive et cinématique, créée spécialement pour **Mabelle**.

## Ouvrir l'expérience

Il suffit d'ouvrir le fichier `index.html` dans un navigateur (double-clic).
Aucune installation, aucun serveur, aucun backend requis : tout fonctionne en local.

> Idéalement, envoie le dossier complet `melanie-love/` (pas seulement le fichier HTML),
> pour que la feuille de style, le script et les assets soient bien chargés.

## Pour envoyer l'expérience

Compresse le dossier `melanie-love` en **ZIP** et envoie-le. La personne qui le reçoit
décompresse le ZIP puis ouvre simplement `index.html` (double-clic). C'est tout.

## Ajouter du son (optionnel)

Tous les sons sont **facultatifs** : si les fichiers n'existent pas, tout fonctionne
parfaitement, sans aucun message d'erreur visible.

- `assets/music.m4a`  → musique de fond (bouton **♫** en haut à droite, jamais de lecture automatique)
- `assets/click.mp3`  → petit son de clic
- `assets/flower.mp3` → son lors du choix d'une fleur
- `assets/reveal.mp3` → son lors de la révélation du secret

## Structure

```
melanie-love/
  index.html      → structure des 10 chapitres
  style.css       → design, animations, responsive
  script.js       → navigation, particules, bouquet, lettre, sons, séquences
  assets/
    music.m4a     → (optionnel)
    click.mp3     → (optionnel)
    flower.mp3    → (optionnel)
    reveal.mp3    → (optionnel)
```

## Les 10 chapitres

1. Introduction cinématique (noir, lumière, « Mabelle ❤️ »)
2. Ouverture — effet « wow » plein écran
3. Message d'introduction
4. Le bouquet qui s'éveille (graine → tige → feuilles → fleurs)
5. Choisis une fleur (petite interaction personnelle)
6. « Pourquoi toi ? » (cartes animées)
7. Une petite question interactive
8. La lettre (écriture progressive, mots mis en évidence)
9. Un petit secret (explosion douce de particules)
10. Le grand moment final (cinématique)

## Notes

- Conçu **mobile-first**, testé pour téléphone et ordinateur.
- Les animations respectent `prefers-reduced-motion` (accessibilité).
- Tout est en CSS/JS natif : aucune bibliothèque externe hormis les polices Google Fonts.
