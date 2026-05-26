# TraceChain

Prototype de traçabilité blockchain pour la filière alimentaire bio, développé dans le cadre du Projet Technique Tutoré (Mastère Spécialisé Blockchain Strategy, PST&B).

L'application suit un produit agricole de la parcelle au consommateur, en inscrivant chaque étape de manière immuable sur la blockchain : enregistrement par le **producteur**, mise en lot et contrôle qualité par la **coopérative**, transfert et réception par le **distributeur**, et vérification publique par le **consommateur**.

---

## Périmètre de ce prototype

Ce dépôt est un **prototype démontrable de bout en bout**, pas un système de production. Il couvre le cœur fonctionnel de la traçabilité : un smart contract, ses tests, son déploiement (local et sur le réseau de test Sepolia), et une interface web à quatre rôles.

Choix techniques assumés, et ce qui n'est volontairement **pas** couvert :

- **Stack** : Solidity + Hardhat + React (Vite) + ethers.js, plutôt que Hyperledger Fabric / Go décrit dans le rapport. Ce choix privilégie un prototype réellement livrable et réutilise un socle EVM maîtrisé. L'architecture Fabric reste l'orientation cible documentée dans le rapport.
- **Un seul contrat** (`TraceChain.sol`) regroupant la logique, au lieu de cinq contrats séparés.
- **Pas de backend** : le front communique directement avec la blockchain. Aucune base de données (PostgreSQL/MongoDB/Redis), pas d'API REST, pas de JWT, pas d'IPFS.
- **Stockage des documents** : non implémenté (un champ certification en texte tient lieu de justificatif).

---

## Architecture

```
tracechain/
├── contracts/
│   └── TraceChain.sol          # Smart contract (rôles, produits, lots, transferts)
├── scripts/
│   ├── deploy.js               # Déploiement sur la blockchain locale Hardhat
│   └── deploySepolia.js        # Déploiement sur le réseau de test Sepolia
├── test/
│   └── TraceChain.test.js      # Tests unitaires (parcours complet + contrôle d'accès)
├── hardhat.config.js
├── .env                        # Variables sensibles (NON versionné)
└── frontend/
    └── src/
        ├── contractInfo.js     # Adresse du contrat déployé + ABI
        ├── contract.js         # Helpers ethers (instances signée / lecture seule)
        ├── App.jsx             # Connexion wallet, détection des rôles, routage des vues
        ├── ProducerPanel.jsx   # Vue producteur
        ├── CoopPanel.jsx       # Vue coopérative
        ├── DistributorPanel.jsx# Vue distributeur
        ├── ConsumerView.jsx    # Vue consommateur (traçabilité publique)
        └── App.css
```

### Le smart contract en bref

Les rôles sont gérés par `AccessControl` (OpenZeppelin) : `PRODUCER_ROLE`, `COOP_ROLE`, `DISTRIBUTOR_ROLE`, et l'admin (déployeur).

| Acteur | Fonctions |
|--------|-----------|
| Producteur | `registerProduct`, `addCertification`, `markHarvested` |
| Coopérative | `createBatch`, `addQualityCheck`, `initiateTransfer` |
| Distributeur | `confirmReception` |
| Lecture publique | `getProduct`, `getBatch` + lecture des *events* pour la timeline |

Chaque action émet un *event*, ce qui permet de reconstruire la timeline complète d'un lot côté consommateur.

---

## Prérequis

- Node.js 18, 20 ou 22
- MetaMask (extension navigateur)
- Pour Sepolia : une URL RPC (Alchemy/Infura) et un compte alimenté en ETH de test

---

## Installation

```bash
# À la racine du projet
npm install

# Front
cd frontend
npm install
cd ..
```

---

## Lancement en local (recommandé pour développer)

Trois terminaux, à la racine du projet sauf indication.

**Terminal 1 — la blockchain locale** (laisser tourner) :
```bash
npx hardhat node
```

**Terminal 2 — déployer le contrat dessus :**
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Le script attribue les rôles aux comptes de test #1 (producteur), #2 (coopérative) et #3 (distributeur), et affiche l'adresse du contrat.

> Si l'adresse affichée diffère de celle dans `frontend/src/contractInfo.js`, mettre à jour `CONTRACT_ADDRESS` en conséquence. Dans `App.jsx`, `EXPECTED_CHAIN_ID` doit valoir `31337n` pour le local.

**Terminal 3 — le front :**
```bash
cd frontend
npm run dev
```
Ouvrir l'URL affichée (par défaut `http://localhost:5173`).

**Configurer MetaMask pour le local :**
1. Ajouter un réseau manuel : nom `Hardhat Local`, RPC `http://127.0.0.1:8545`, chainId `31337`, symbole `ETH`.
2. Importer un compte via sa clé privée (affichée par le Terminal 1). Le compte #1 = producteur, #2 = coopérative, #3 = distributeur.
3. Changer de compte dans MetaMask pour incarner chaque acteur.

> Fermer le Terminal 1 réinitialise la blockchain : le contrat et toutes les données disparaissent. Il faut alors redéployer (et effacer les données d'activité du compte dans MetaMask → Réglages → Avancés).

---

## Lancement sur Sepolia (pour une démo accessible en ligne)

**Configurer le `.env`** à la racine (voir `.env.example`) :
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE
PRIVATE_KEY=votre_cle_privee_sans_prefixe_0x
```

**Déployer :**
```bash
npx hardhat run scripts/deploySepolia.js --network sepolia
```
Le compte de déploiement reçoit les quatre rôles (un seul wallet incarne tous les acteurs).

**Pointer le front sur Sepolia :**
- Dans `frontend/src/contractInfo.js` : mettre l'adresse renvoyée par le déploiement.
- Dans `frontend/src/App.jsx` : `EXPECTED_CHAIN_ID = 11155111n`.
- Dans MetaMask : passer sur le réseau Sepolia et sélectionner le compte de déploiement.

---

## Déploiement de référence (Sepolia)

- **Contrat** : `0x152F9caFf20b70531d648EBf90C9236D143290da`
- **Etherscan** : https://sepolia.etherscan.io/address/0x152F9caFf20b70531d648EBf90C9236D143290da

---

## Scénario de démonstration

En incarnant successivement chaque acteur (changer de compte en local, ou rester sur le compte unique en Sepolia) :

1. **Producteur** — enregistrer `PROD-001` (Tomate, Cœur de bœuf, Parcelle A12), ajouter la certification `AB - FR-BIO-01`, marquer récolté.
2. **Coopérative** — créer le lot `LOT-001` contenant `PROD-001`, ajouter un contrôle qualité, initier le transfert vers le distributeur (bouton « Utiliser mon adresse » sur Sepolia).
3. **Distributeur** — confirmer la réception de `LOT-001`.
4. **Consommateur** — saisir `LOT-001` dans « Vérification consommateur » : la timeline complète s'affiche, reconstruite depuis les events on-chain.

---

## Tests

```bash
npx hardhat test
```
Couvre l'enregistrement, le parcours complet producteur → coopérative → distributeur, et le rejet des actions non autorisées (contrôle d'accès, doublons, produits inexistants).

---

## Sécurité

- Le fichier `.env` contient une clé privée et **ne doit jamais être versionné** (présent dans `.gitignore`).
- Les clés privées des comptes Hardhat sont publiques et ne servent qu'en local.
- Ne jamais utiliser une clé détenant des fonds réels.

---

## Pistes d'évolution

Vers un système plus proche de la production : stockage des justificatifs sur IPFS, backend API avec authentification, indexation des events (The Graph) pour une lecture performante sur réseau public, génération de QR codes physiques, et migration vers Hyperledger Fabric pour un cadre permissionné conforme au rapport.