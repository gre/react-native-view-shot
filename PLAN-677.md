# Plan — Issue #677 : contenu blanc sous `useRenderInContext` + `borderWidth` (iOS/Fabric)

> Approche TDD : on écrit d'abord un test qui **échoue** en reproduisant le bug,
> puis on corrige. Aucune étape de fix n'est entamée avant que l'étape 3 soit rouge
> pour la bonne raison.

---

## 0. État des lieux (vérifié, 2026-09-05)

### Ce qu'on sait de source sûre

| Fait                                           | Preuve                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Aucune PR ouverte ne corrige ça                | Sur les 20 PRs, seule #683 touche `ios/RNViewShot.mm`, et uniquement `releaseCapture`.                                                                                                                                                                 |
| `useRenderInContext` n'est **jamais** exercé   | 4 occurrences dans tout le repo : `README.md:150`, `CLAUDE.md:54`, `ios/RNViewShot.mm:73`, `src/index.tsx:75`. Zéro écran, zéro test E2E.                                                                                                              |
| `ScrollViewTestScreen` ne couvre pas le cas    | Il utilise `snapshotContentContainer: true` mais **sans** `useRenderInContext`, et ses `borderWidth: 1` sont sur le wrapper externe (`captureArea`) et `previewImage`, **pas sur les items dans le contenu scrollé** (`colorItem` n'a aucune bordure). |
| iOS ne supporte pas `format: 'raw'`            | `src/index.tsx:112` — `raw` est concaténé seulement si `Platform.OS === "android"`. Donc **pas d'accès aux pixels depuis le JS sur iOS**.                                                                                                              |
| Le comparateur E2E actuel est inutilisable ici | `example/e2e/helpers/snapshot-matcher.js` compare la **taille en octets** de PNG avec 5 % de tolérance, sur un `device.takeScreenshot()` (écran, pas la capture). Ne peut pas détecter ce bug.                                                         |

### Mécanisme (lu dans `example/node_modules/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm`, RN 0.84.1)

1. **`:968`** — `useCoreAnimationBorderRendering` est vrai seulement si la bordure est uniforme **et** (`borderWidths.left == 0` **ou** `clipsToBounds` **ou** bordure transparente).

   Le style du rapporteur (`borderWidth: 1`, `borderColor: '#F6F6F6'` opaque, **pas de `overflow: hidden`**) fait basculer ce booléen à **`false`**.

2. **`:994`** — dans ce cas RN abandonne `layer.backgroundColor` et **ajoute des sous-couches** :

   ```objc
   layer.backgroundColor = nil;
   _backgroundColorLayer = [CALayer layer];
   _backgroundColorLayer.zPosition = BACKGROUND_COLOR_ZPOSITION;  // = -1024.0f  (:37)
   [layer addSublayer:_backgroundColorLayer];
   ```

   Idem pour `_borderLayer` (`:1016`, zPosition `-1023`).

3. RN compte sur `zPosition = -1024` pour que ces calques restent **derrière** les sous-vues. Le compositeur Core Animation respecte `zPosition` → **correct à l'écran**.

4. **`CALayer renderInContext:` ignore `zPosition`** et dessine les sous-couches dans l'ordre du tableau `sublayers`. Le calque de fond, ajouté en dernier par `addSublayer:`, est donc **peint par-dessus le texte**.

   → _« The missing area is rendered as an empty white block »_, et la couleur correspond : leur `content` est `backgroundColor: '#FFFFFF'`.

5. Leur workaround (bordure déportée sur un wrapper en `backgroundColor` + `padding`) garde toutes les vues en mode CoreAnimation → aucune sous-couche ajoutée → ça marche.

**Corollaires importants pour le plan :**

- `snapshotContentContainer` et le ScrollView ne sont **pas** nécessaires au bug. Ce sont des circonstances, pas des causes. Le repro minimal est **une View avec bordure + du texte, capturée avec `useRenderInContext: true`**. C'est ce qu'on teste.
- Le bug est **indépendant du fait que ce soit du texte** : n'importe quel enfant est masqué.
- `drawViewHierarchyInRect` (le défaut) passe par le render server et respecte `zPosition` → non affecté. Le test doit donc capturer **les deux** et les comparer.

### Incertitude assumée

Le rapporteur n'a pas montré `overflow: hidden`. S'il l'avait, on tomberait sur une autre branche
(`:1253`, masque `CAShapeLayer`, dont `renderInContext:` ne gère pas non plus le rendu) qui produit
un symptôme voisin par un chemin différent. **L'étape 3 tranche** : on teste les deux variantes.

### Partie « shadow lente » de l'issue

`snapshotContentContainer` redimensionne `scrollView.frame` à la taille totale du contenu
(`ios/RNViewShot.mm`, bloc « Save scroll & frame »), ce qui force un layout synchrone de tous les
items ; chacun régénère son image de box-shadow (boucle `_boxShadowLayers`, `RCTViewComponentView.mm:1200`).
C'est du O(N) côté RN, **pas** côté view-shot.

→ **Hors scope de ce plan.** À traiter comme une note dans la réponse à l'issue, pas comme un fix.

---

## 1. Ajouter l'outillage de comparaison de pixels

Le blocage principal : il n'existe aujourd'hui aucun moyen d'asserter sur le **contenu d'une capture**.

```bash
cd example
npm i -D pngjs pixelmatch
```

Créer `example/e2e/helpers/pixels.js` :

- `readPng(filePath)` → `{ width, height, data }` via `pngjs`.
- `regionStats(png, {x, y, w, h})` → `{ meanR, meanG, meanB, uniqueColors, nonWhiteRatio }`.
- `diffRatio(pngA, pngB)` → via `pixelmatch`, ratio de pixels différents (0..1).

> Note : ce helper est **complémentaire**, pas un remplacement de `snapshot-matcher.js`.
> On ne touche pas à l'existant dans ce plan — les 9 snapshots de référence par plateforme
> restent valides. (Refondre `compareImages` en vraie comparaison pixel est un chantier
> séparé qui mérite sa propre PR.)

**Comment le test accède au fichier :** avec `result: 'tmpfile'`, `captureRef` renvoie un chemin
dans le tmp du simulateur, qui est **directement lisible depuis le host macOS**. L'écran affiche
l'URI dans un `<Text testID="...-uri">`, et Detox le récupère via `getAttributes()`
(`.text`). Pattern non encore utilisé dans ce repo — à valider tôt (voir étape 3, garde-fou).

---

## 2. Écrire l'écran de repro

**Nouveau fichier :** `example/src/screens/RenderInContextTestScreen.tsx`

Ne pas greffer ça sur `ScrollViewTestScreen` : le sujet est `useRenderInContext`, pas le scroll.
Un écran dédié documente une option publique aujourd'hui totalement non testée.

### Contenu

Trois cartes, **volontairement identiques en contenu**, ne différant que par le style qui
déclenche (ou non) le basculement `useCoreAnimationBorderRendering` :

| testID                    | Style                                        | Mode RN attendu                          |
| ------------------------- | -------------------------------------------- | ---------------------------------------- |
| `ric-card-plain`          | `backgroundColor: '#FFFFFF'`, aucune bordure | CoreAnimation → OK                       |
| `ric-card-border`         | `+ borderWidth: 1, borderColor: '#F6F6F6'`   | **couches ajoutées → bug**               |
| `ric-card-border-clipped` | `+ borderWidth: 1 + overflow: 'hidden'`      | branche masque — départage l'incertitude |

Chaque carte contient du **texte noir sur fond blanc**, bien contrasté et couvrant une large
part de la surface (c'est ce qui rend la disparition mesurable). Taille fixe et connue,
p.ex. 300×120, pour que les régions testées soient déterministes.

### Contrôles

- Bouton `ric-capture-drawhierarchy` → capture les 3 cartes avec `useRenderInContext: false`
- Bouton `ric-capture-renderincontext` → idem avec `useRenderInContext: true`
- Options communes : `{ format: 'png', quality: 1, result: 'tmpfile' }`
- Chaque résultat expose :
  - `<Text testID="ric-uri-{mode}-{card}">{uri}</Text>`
  - un `<Image testID="ric-preview-{mode}-{card}">` pour l'inspection visuelle manuelle

### Enregistrement

- `example/App.tsx` : ajouter `RenderInContext: undefined` à `RootStackParamList`, l'import,
  et le `<Stack.Screen>`.
- `example/src/screens/HomeScreen.tsx` : entrée dans la catégorie `🔴 RENDERING CORRECTNESS`
  (à côté de `StyleFilters`), avec `status: 'bug'` :

  ```ts
  {
    key: 'RenderInContext',
    title: 'RenderInContext',
    description: 'useRenderInContext + borderWidth — content disappears (#677)',
    emoji: '🩹',
    priority: 'high',
    status: 'bug',
  }
  ```

  → le testID de navigation devient `nav-renderincontext`
  (pattern `nav-${title.toLowerCase().replace(/\s+/g,'-')}`, `HomeScreen.tsx:183`).

---

## 3. Écrire le test qui échoue ⛔ **← le cœur du TDD**

**Nouveau fichier :** `example/e2e/tests/render-in-context.test.js`

Structure calquée sur `snapshot-content-container.test.js` (helper `goBackToHome`, navigation
par testID avec fallback texte, `launchArgs: { detoxEnableSynchronization: 0 }`).

### Assertions, de la plus robuste à la plus fine

L'assertion **ne doit pas** dépendre d'un PNG de référence : c'est une propriété invariante,
pas un pixel-perfect. On compare les deux modes entre eux.

```
Pour chaque carte C :
  uriA = capture(C, useRenderInContext: false)   // référence connue-bonne
  uriB = capture(C, useRenderInContext: true)

  1. ASSERTION PRINCIPALE (indépendante de la plateforme)
     regionStats(B, centre).uniqueColors > 1
     → « la carte capturée n'est pas un aplat uni »
     C'est exactement le symptôme rapporté : bloc blanc vide.

  2. ASSERTION DE NON-RÉGRESSION CROISÉE
     diffRatio(A, B) < 0.02
     → les deux stratégies doivent produire le même rendu pour du contenu statique

  3. GARDE-FOU (doit passer AVANT et APRÈS le fix)
     Sur `ric-card-plain` : les deux modes matchent déjà.
     Si celui-ci échoue, c'est l'outillage qui est cassé, pas la lib.
```

### Résultat attendu à cette étape

```
✅ ric-card-plain            — les deux modes concordent
❌ ric-card-border           — mode renderInContext = aplat uni  ← LE BUG
?  ric-card-border-clipped   — départage la branche masque
```

**Ne pas passer à l'étape 4 tant que :**

- le garde-fou (3) ne passe pas — sinon on chasse un fantôme d'outillage ;
- `ric-card-border` n'échoue pas — sinon on n'a pas reproduit #677.

Vérifier aussi visuellement le `ric-preview-*` correspondant : le bloc blanc doit être
**visible à l'œil** dans l'app. Si le test est rouge mais que l'aperçu est correct, c'est
l'assertion qui est mauvaise.

### Si ça ne reproduit pas

Ne pas forcer l'assertion. Explorer dans cet ordre :

1. Vérifier que le simulateur tourne bien en **Fabric** (le bug est spécifique au nouveau
   moteur — Paper dessinait les bordures dans `layer.contents`, sans sous-couche ajoutée).
2. Ajouter une variante avec `borderRadius` non uniforme (autre déclencheur de la même branche).
3. Ajouter une variante avec `boxShadow` (crée aussi des sous-couches, `:1200`).
4. En dernier recours, dumper l'arbre de calques avec un `RCT_EXPORT_METHOD` de debug
   temporaire pour confirmer la présence de `_backgroundColorLayer`.

---

## 3bis. Résultats mesurés (2026-09-05, iPhone 17 Pro, RN 0.84.1)

Étape 3 exécutée. Mesures au pixel, avant fix :

| carte            | uniqueColors (ric) | diff draw↔ric | verdict                                     |
| ---------------- | ------------------ | -------------- | ------------------------------------------- |
| `plain`          | 16                 | 0.0000         | ✓ garde-fou                                 |
| `border`         | **1**              | **0.1092**     | ✕ **bug reproduit**                         |
| `border-clipped` | 16                 | 0.0000         | ✓ non affectée                              |
| `nested-border`  | —                  | —              | ✕ casse aussi                               |
| `scroll-border`  | 16                 | < 0.02         | ✓ **le cas du rapporteur NE reproduit PAS** |

Trois conclusions :

1. **La branche masque est hors de cause.** `overflow: hidden` rebascule
   `useCoreAnimationBorderRendering` à `true` (`RCTViewComponentView.mm:968`,
   clause `|| clipsToBounds`) : aucune sous-couche n'est ajoutée. L'incertitude
   de l'étape 0 est levée, et **l'Option B suffit**.
2. **La vue bordée n'a pas besoin d'être la racine de la capture** —
   `nested-border` casse aussi. L'hypothèse « c'est un effet de racine » est
   fausse.
3. **⚠️ Le cas exact de l'issue ne reproduit pas.** ScrollView +
   `snapshotContentContainer` + items bordés rend identiquement dans les deux
   modes, avec ou sans fix. Ce qui est reproduit ici a la signature de #677
   (vue bordée + `renderInContext` → bloc uni) sans être prouvé être la même
   instance.

Ce qui distingue `nested-border` (casse) de `scroll-border` (passe) n'est pas
établi. Piste non vérifiée : `snapshotContentContainer` redimensionne
`scrollView.frame`, ce qui force une passe de layout — laquelle pourrait
remonter les calques de contenu après le calque de fond, et rendre l'ordre
correct par accident. Si c'est ça, le bug dépend de l'ordre de montage et est
donc intermittent, ce qui expliquerait qu'il touche certains items du
rapporteur et pas d'autres.

**Conséquence pour l'étape 6 :** on ne peut pas annoncer au rapporteur que
#677 est corrigé. On peut dire qu'un bug réel de la même famille est corrigé,
et lui demander de vérifier sur son app.

---

## 4. Corriger

⚠️ **Ne rien écrire ici avant que l'étape 3 soit rouge pour la bonne raison.**
Le choix ci-dessous dépend de ce que l'étape 3 révèle, notamment du sort de
`ric-card-border-clipped`.

### Option A — rendu manuel trié par `zPosition` (le vrai fix)

Dans `ios/RNViewShot.mm`, remplacer l'appel unique

```objc
[rendered.layer renderInContext:rendererContext.CGContext];
```

par une descente récursive qui, à chaque niveau, trie `layer.sublayers` par `zPosition`
(tri **stable**, pour préserver l'ordre du tableau à zPosition égale — c'est la sémantique
de Core Animation) avant de rendre chaque sous-couche dans son propre espace de coordonnées.

- ✅ Corrige la classe entière de bugs, pas juste `borderWidth` : shadows, backgrounds
  non uniformes, tout ce qui repose sur `zPosition`.
- ❌ Réimplémente une partie du compositeur : `mask`, `masksToBounds`, `transform`,
  `shouldRasterize`, `opacity` composé. Risque réel de régression sur des cas aujourd'hui OK.
- ❌ Ne corrige **pas** la branche masque (`:1253`) — `renderInContext:` ignore aussi `mask`.

### Option B — gérer uniquement `zPosition`, garder `renderInContext` sinon

Trier les sous-couches par `zPosition` **sans** réimplémenter le rendu : réordonner
temporairement le tableau `sublayers` autour de l'appel, puis restaurer.

- ✅ Beaucoup plus petit, et cible précisément le mécanisme identifié.
- ❌ Mute l'arbre de calques pendant la capture — à faire strictement sur le thread UI et à
  restaurer dans tous les cas (y compris exception). Peut provoquer un flash visible.
- ❌ Ne couvre toujours pas la branche masque.

### Option C — documenter, ne pas corriger

Si A et B s'avèrent trop risquées, l'écran + le test restent le livrable de valeur : ils
transforment un rapport flou en gap **connu, reproductible et surveillé**.

> Cf. le précédent `StyleFilters` (#578) : écran avec `status: 'bug'`, pas de fix.
> Une note courte suffit — pas de doc de troubleshooting multi-paragraphes.

**Décidé après l'étape 3 : Option B.** Implémentée dans `ios/RNViewShot.mm`
(`RNViewShotSortSublayersByZPosition` + restauration sous `CATransaction` avec
actions désactivées). Les 5 cartes passent avec le fix, dont `border` et
`nested-border` qui échouaient.

---

## 5. Marquer le test comme attendu-vert

Une fois le fix en place :

- Retirer tout `.failing` / `.skip` posé à l'étape 3.
- Faire tourner **l'ensemble** de la suite iOS, pas seulement le nouveau test — l'Option A
  ou B touche le chemin de rendu partagé, et les 9 snapshots de référence iOS existants
  sont le filet de sécurité.
- Basculer l'entrée HomeScreen de `status: 'bug'` à `status: 'tested'`.

```bash
cd example
npm run build:e2e:ios
npm run test:e2e:ios
```

⚠️ **Ne pas** lancer `UPDATE_SNAPSHOTS=true` par réflexe si des références bougent :
sur ce fix précis, une référence qui change est soit une vraie correction (à valider à l'œil,
image avant/après), soit une régression. Regarder avant d'écraser.

---

## 6. Répondre à l'issue

**À faire seulement après validation, et à me faire relire avant post** (aucune action publique
sans feu vert explicite).

Contenu utile, court :

- Cause confirmée, avec le pointeur exact : `RCTViewComponentView.mm:968` et `:994`,
  `BACKGROUND_COLOR_ZPOSITION = -1024`, et le fait que `renderInContext:` ignore `zPosition`.
- Sa demande de repro minimal devient inutile : on a le mécanisme et un écran dédié.
- Confirmer que son workaround est correct **et expliquer pourquoi** (il garde les vues en
  mode CoreAnimation) — c'est ce qui lui permettra de généraliser à d'autres styles.
- La lenteur des shadows est distincte : layout O(N) déclenché par le resize de frame de
  `snapshotContentContainer`, côté RN. Le mentionner, ne pas le traiter ici.

---

## Ordre d'exécution et interaction avec les PRs

Ce chantier touche `ios/RNViewShot.mm` (chemin de **capture**), `example/App.tsx`,
`example/src/screens/HomeScreen.tsx`, plus des fichiers neufs.

- **#683** touche `ios/RNViewShot.mm` mais uniquement `releaseCapture` → zones disjointes,
  pas de conflit réel, mais git le signalera peut-être. Merger #683 **avant** d'attaquer
  l'étape 4 évite d'avoir à arbitrer.
- **#685** et **#692** touchent `example/src/screens/` → aucun chevauchement de fichier
  avec les nôtres.
- Aucune PR ne touche `App.tsx` ni `HomeScreen.tsx` → l'étape 2 est sûre dès maintenant.

**Les étapes 1 à 3 sont indépendantes de tout le backlog de PRs et peuvent démarrer
immédiatement.**

---

## Récapitulatif des fichiers

| Fichier                                             | Action                                         |
| --------------------------------------------------- | ---------------------------------------------- |
| `example/package.json`                              | + `pngjs`, `pixelmatch` en devDeps             |
| `example/e2e/helpers/pixels.js`                     | **créer**                                      |
| `example/src/screens/RenderInContextTestScreen.tsx` | **créer**                                      |
| `example/App.tsx`                                   | + route `RenderInContext`                      |
| `example/src/screens/HomeScreen.tsx`                | + entrée dans `🔴 RENDERING CORRECTNESS`       |
| `example/e2e/tests/render-in-context.test.js`       | **créer** — doit être ROUGE d'abord            |
| `ios/RNViewShot.mm`                                 | fix (étape 4) — **pas avant que 3 soit rouge** |
