# OTDAV Connect — Application Depot

> **Organisme Tunisien des Droits d'Auteur et des Droits Voisins**
> (المؤسسة التونسية لحقوق المؤلف والحقوق المجاورة)
>
> Bilingual (FR/AR) web platform that digitizes the full life-cycle of copyright
> deposits (dépôts d'œuvres), renewal flows, and cultural-event authorizations
> (autorisations de spectacles) for the Tunisian copyright authority.

---

## 1. Project Context

OTDAV is the Tunisian public body in charge of registering creative works,
collecting fees, and issuing authorizations for events that exploit artistic
works. This project is a three-tier application that replaces the paper-based
workflow with a web platform split into three deployables:

| Tier | App | Audience | Purpose |
|------|-----|----------|---------|
| Frontend (client) | [client/](client/) | Deposants, organisateurs, internal agents | Submit dépôts, pay, renew, browse statistics, request spectacle authorizations |
| Frontend (admin) | [admin/](admin/) | OTDAV administrators | Review, accept/reject dépôts, manage users/organisateurs, drive the autorisation workflow, generate yearly fiscal reports |
| Backend (API) | [backend/](backend/) | Both frontends | REST API, PostgreSQL persistence, file uploads, JWT auth, cron jobs, transactional e-mails |

Key functional pillars:

1. **Dépôt d'œuvre** — A user registers an author/company (Déposant), an œuvre,
   one or several auteurs and pays 30 TND. The dépôt lives for 1 year and must
   be renewed; expiry reminders are sent by e-mail 30/23/16/9/1 days before
   the expiration date.
2. **Administration** — Admin panel to accept or reject dépôts (with a reason),
   delete deposants, edit user permissions (`canDepot`, `canFCS`), and produce
   fiscal / renewal yearly reports broken down by the 16 œuvre categories.
3. **Autorisation de spectacle** — A 4-step workflow (examen → traitement →
   facturation → délivrance) to authorize public shows. Each autorisation has
   one or more spectacles, each spectacle has artistes, and each artiste has
   dépenses (expense items with receipts).
4. **FCS & autres autorisations** — Reserved routes for future functional
   blocks (musique générale, salles de fêtes, cliniques, cafés, transport,
   hôtels, radios, TV, sociétés VA, etc.). UI shells already exist.
5. **Statistiques** — Registre général / annuel, répartition par catégorie,
   déposant, auteur, gouvernorat, licences.

Language handling is baked into the schema: user input is detected as Arabic
via the Unicode range `\u0600-\u06FF` and routed into `_ar` fields, otherwise
into `_fr` fields.

---

## 2. Technology Stack

### Backend
- **Node.js** + **Express 5** (CommonJS)
- **Prisma 5** ORM over **PostgreSQL**
- **JWT** for user + admin auth (separate token shape)
- **bcrypt** for password hashing
- **multer** for multipart file uploads (PDF/JPG/PNG, 5 MB cap)
- **nodemailer** (Gmail service) for transactional e-mails
- **node-cron** for daily renewal reminders (08:00 server time)

### Frontend (client + admin)
- **React 19** + **React Router 7** + **TypeScript**
- **Vite** bundler
- **TailwindCSS** (client uses v3, admin uses v4)
- **Recharts** for dashboards
- **axios** (admin) / **fetch** (client)
- **jspdf** + **html2canvas** (client) — print facture / register
- **xlsx-js-style** (admin) — export rapports as styled Excel

### Dev tooling
- ESLint 9 + typescript-eslint
- nodemon (backend dev loop)
- `backend/prisma/seed.js` — seeds 16 category rows + default admin (`admin@otdav.tn` / `Admin@2026`)

---

## 3. Project Tree

```
app-depot OTDAV/
├── PROJECT.md                                  ← this file
│
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma                       ← Prisma data model
│   │   ├── seed.js                             ← categories + admin seed
│   │   └── migrations/                         ← 26 migrations from 2026-03-02 onwards
│   │       ├── 20260302165612_init/
│   │       ├── 20260302215711_init/
│   │       ├── 20260302224430_add_missing_deposant_fields/
│   │       ├── 20260302230554_add_unique_cin_raison_sociale/
│   │       ├── 20260307212354_oeuvre_has_categorie/
│   │       ├── 20260308205308_add_auth_statut_payment/
│   │       ├── 20260311190343_add_motif_rejet/
│   │       ├── 20260312195742_add_deposant_files/
│   │       ├── 20260324120141_add_auteur_checkboxes/
│   │       ├── 20260324124232_update_adresse_fields/
│   │       ├── 20260326113025_numero_sequentiel_string/
│   │       ├── 20260326114814_fix_numero_sequentiel_int/
│   │       ├── 20260326183700_add_renewal_fields/
│   │       ├── 20260327042337_add_fullname_to_user/
│   │       ├── 20260327043112_add_user_permissions/
│   │       ├── 20260330063205_add_representant_legal/
│   │       ├── 20260330071356_add_facture_file/
│   │       ├── 20260406141100_add_autorisation_spectacle/
│   │       ├── 20260408075012_fix_autorisation_model/
│   │       ├── 20260408083703_add_numero_facture/
│   │       ├── 20260409185139_add_date_demande_autorisation/
│   │       ├── 20260415130522_add_autorisation_statut/
│   │       ├── 20260415132000_add_autorisation_enum_values/
│   │       ├── 20260415132001_set_autorisation_default_examen/
│   │       ├── 20260415140000_add_autorisation_workflow_fields/
│   │       └── 20260416181351_add_rne_to_organisateur/
│   ├── sql/                                    ← optional raw SQL bootstrap
│   ├── uploads/
│   │   └── documents/                          ← served as /uploads/* static
│   └── src/
│       ├── app.js                              ← express app wiring
│       ├── server.js                           ← entrypoint, loads .env + cron
│       ├── config/
│       │   ├── prisma.js                       ← shared PrismaClient
│       │   └── mailer.js                       ← nodemailer (Gmail) transport
│       ├── controller/
│       │   ├── admin.controller.js             ← admin login + all /admin endpoints
│       │   ├── auth.controller.js              ← register + login (users)
│       │   ├── autorisation.controller.js      ← spectacles + organisateurs
│       │   ├── categorie.controller.js         ← read-only 16 categories
│       │   ├── deposant.controller.js          ← direct deposant CRUD
│       │   ├── depot.controller.js             ← dépôt create, payer, renouveler
│       │   ├── oeuvre.controller.js            ← œuvre CRUD
│       │   └── auteur.controlleur.js           ← auteur CRUD (note spelling)
│       ├── routes/
│       │   ├── admin.routes.js
│       │   ├── auth.routes.js
│       │   ├── autorisation.routes.js
│       │   ├── categorie.routes.js
│       │   ├── deposant.routes.js
│       │   ├── depot.routes.js
│       │   ├── oeuvre.route.js
│       │   └── auteur.route.js
│       ├── middlewares/
│       │   ├── auth.middleware.js              ← Bearer JWT → req.userId
│       │   ├── admin.middleware.js             ← Bearer JWT w/ isAdmin → req.adminId
│       │   ├── upload.middleware.js            ← multer, 5 MB, PDF/JPG/PNG
│       │   └── errorHandler.js
│       ├── cron/
│       │   └── renewalReminder.js              ← daily 08:00, 30/23/16/9/1-day mails
│       ├── services/
│       │   └── depot.service.js
│       └── utils/
│           └── language.js                     ← Arabic detection helper
│
├── client/                                     ← public/déposant UI
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts · tsconfig*.json
│   ├── tailwind.config.js · postcss.config.js
│   ├── public/
│   └── src/
│       ├── App.tsx                             ← routing
│       ├── main.tsx · App.css · index.css
│       ├── assets/
│       │   ├── otdav-logo.png
│       │   └── react.svg
│       ├── types/
│       │   └── deposit.types.ts
│       ├── components/
│       │   ├── OtdavSidebar.tsx                ← login/register side panel
│       │   ├── WorkflowStepper.tsx             ← autorisation steps
│       │   └── layout/
│       │       ├── header.tsx
│       │       └── sidebar.tsx
│       └── pages/
│           ├── LoginPage.tsx                   ← /
│           ├── RegisterPage.tsx                ← /register
│           ├── Dashboard.tsx                   ← /dashboard (+ /depot /fcs /autorisation)
│           ├── DepositPage.tsx                 ← /deposit (create dépôt)
│           ├── MesDepots.tsx                   ← /mes-depots
│           ├── FacturePage.tsx                 ← /facture/:id (PDF facture + pay)
│           ├── RenouvellementPage.tsx          ← /renouvellement
│           ├── IndemnitesOccasionnellesPage.tsx
│           ├── FcsPage.tsx
│           ├── StatistiquesShared.tsx          ← /statistiques hub
│           ├── RegistreGeneral.tsx
│           ├── RegistreAnnuel.tsx
│           ├── ParCategorie.tsx
│           ├── ParDeposant.tsx
│           ├── ParAuteur.tsx
│           ├── ParGouvernorat.tsx
│           ├── RepartitionLicences.tsx
│           ├── AutorisationPages.tsx           ← all autorisation sub-pages (12 exports)
│           ├── SpectaclesPage.tsx              ← spectacle request form
│           ├── AutorisationFacturePage.tsx     ← /autorisation/facture/:id
│           └── gouvernoratsData.ts             ← TN gouvernorat list
│
└── admin/                                      ← OTDAV back-office UI
    ├── package.json
    ├── index.html
    ├── vite.config.ts · tsconfig*.json
    ├── public/
    └── src/
        ├── App.tsx
        ├── main.tsx · index.css
        ├── assets/
        ├── components/
        │   ├── AdminLayout.tsx                 ← sidebar + Outlet shell
        │   └── WorkflowStepper.tsx
        └── pages/
            ├── AdminLogin.tsx                  ← /
            ├── AdminDashboard.tsx              ← legacy single-page dashboard
            ├── DashboardHome.tsx               ← /dashboard (home cards)
            ├── DepotsPage.tsx                  ← /dashboard/depots
            ├── UtilisateursPage.tsx            ← /dashboard/utilisateurs
            ├── RapportsPage.tsx                ← /dashboard/rapports
            ├── ParametresPage.tsx              ← /dashboard/parametres
            ├── OrganisateursPage.tsx           ← /dashboard/organisateurs (+ bulk import)
            ├── AutorisationsSuiviPage.tsx     ← /dashboard/autorisations
            └── AutorisationDetailPage.tsx     ← /dashboard/autorisations/:id
```

---

## 4. Database Schema (PostgreSQL via Prisma)

File: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

### 4.1 Enums

| Enum | Values | Used by |
|------|--------|---------|
| `Statut` | `CERTIFIE`, `EN_ATTENTE_RENOUVELLEMENT` | `Depot.statut` |
| `AutorisationStatut` | `EN_COURS_EXAMEN`, `EN_COURS_TRAITEMENT`, `EN_ATTENTE_PAIEMENT`, `PAIEMENT_RECU`, `AUTORISE` | `AutorisationSpectacle.statut` |

Note: the code also uses string statuses `ACCEPTE` / `REJETE` / `RENOUVELE` on
`Depot` (see `admin.controller.js`, `depot.controller.js` and the cron job) —
treat `Statut` as the formal enum with informal string extensions.

### 4.2 Tables

#### `User` — platform end-users (déposants / organisateurs)
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | auto-increment |
| `fullName` | String | |
| `email` | String UNIQUE | lowercased on create |
| `password` | String | bcrypt hash |
| `createdAt` | DateTime | `now()` |
| `canDepot` | Boolean | default `false`, toggled by admin |
| `canFCS` | Boolean | default `false`, toggled by admin |
| `depots` | Depot[] | relation |

#### `Admin` — OTDAV back-office accounts
| Field | Type |
|-------|------|
| `id` | Int PK |
| `email` | String UNIQUE |
| `password` | String (bcrypt) |

#### `Categorie` — 16 official œuvre categories (seeded)
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `code` | Int UNIQUE | 1 → 16 |
| `nom_fr`, `nom_ar` | String | bilingual label |
| `oeuvres` | Oeuvre[] | |

#### `Deposant` — the moral/physical person filing a dépôt
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `nomComplet_fr`, `nomComplet_ar` | String? | auto-routed by script detection |
| `cin` | String? UNIQUE | national ID (physique) |
| `raisonSociale` | String? UNIQUE | (morale) |
| `registreCommerce`, `representantLegal` | String? | |
| `rue`, `cite`, `gouvernorat`, `ville`, `codePostal` | String? | address |
| `telephone`, `fax`, `email` | String? | |
| `fichierCIN`, `fichierRNE`, `fichierProcuration`, `fichierDossierJuridique` | String? | filename in `/uploads/documents` |
| `typeDeposant` | String? | `"PHYSIQUE"` or `"MORALE"` |
| `isAuteur`, `isNon`, `isCoAuteur` | Boolean? | author-relation flags |
| `depots` | Depot[] | |

#### `Auteur` — one dépôt may cite many authors
| Field | Type |
|------|------|
| `id` | Int PK |
| `nomComplet_fr`, `nomComplet_ar` | String? |
| `depotAuteurs` | DepotAuteur[] |

#### `Oeuvre` — the protected work itself
| Field | Type |
|------|------|
| `id` | Int PK |
| `titre_fr`, `titre_ar` | String? |
| `description_fr`, `description_ar` | String? |
| `typeSupport_fr`, `typeSupport_ar` | String? |
| `categorieId` | Int FK → Categorie |
| `depots` | Depot[] |

#### `Depot` — the main transactional record
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `numeroSequentiel` | Int? | assigned per category **on payment** |
| `numeroEnregistrementBureau` | String? | |
| `numeroRegistreInterne` | String? | |
| `dateDepot` | DateTime | user input |
| `numeroRecuPaiement` | String? | receipt number |
| `montant` | Decimal | default 30 (TND) |
| `numeroCertificat` | String? | |
| `dateEmissionCertificat`, `dateReceptionCertificat` | DateTime? | |
| `dateCreation` | DateTime | `now()` |
| `dateExpiration` | DateTime? | dateDepot + 1y on payment |
| `dateRenouvellement` | DateTime? | set on renew |
| `fichierDemandeRenouvellement` | String? | uploaded renewal doc |
| `statut` | Statut | default `CERTIFIE` |
| `konnectPaymentRef` | String? | online payment reference |
| `motifRejet` | String? | set on reject |
| `fichierFacture` | String? | invoice PDF/image |
| `userId` | Int FK → User | |
| `deposantId` | Int FK → Deposant | |
| `oeuvreId` | Int FK → Oeuvre | |
| `auteurs` | DepotAuteur[] | M2M via join |

#### `DepotAuteur` — join table `Depot ↔ Auteur` (composite PK)

#### `Organisateur` — entity requesting a spectacle authorization
| Field | Type |
|-------|------|
| `id` | Int PK |
| `nom` | String |
| `mf`, `rne` | String? (matricule fiscal, registre national) |
| `adresse`, `telephone` | String? |
| `createdAt` | DateTime |
| `autorisations` | AutorisationSpectacle[] |

#### `AutorisationSpectacle` — authorization request (one → many spectacles)
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `numeroAutorisation`, `numeroFacture` | String? | |
| `dateDemande`, `dateCommission` | DateTime? | |
| `isOrganisateur` | Boolean | is requester the organisateur or a prestataire |
| `sfat` | String? | SFAT reference |
| `hasArtistesEtrangers` | Boolean | |
| `pvCommission` | String? | commission minutes file |
| `nombreSpectacles` | Int | default 1 |
| `fichierFacture`, `paiementProofUrl` | String? | |
| `dateCreation` | DateTime | `now()` |
| `statut` | AutorisationStatut | default `EN_COURS_EXAMEN` |
| `prisEnChargeAt`, `paiementRecuAt`, `authoriseAt` | DateTime? | workflow timestamps |
| `organisateurId` | Int? FK | |
| `spectacles` | Spectacle[] | |

#### `Spectacle` — one show, cascades from AutorisationSpectacle
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `dateSpectacle` | DateTime | |
| `horaireSpectacle` | String? | |
| `lieuSpectacle` | String | |
| `typeSpectacle` | String | `'individuel'` / `'manifestation'` |
| `budget` | Decimal? | |
| `natureManif` | String? | `'locale'/'regionale'/'nationale'/'internationale'` |
| `hasEtrangers` | Boolean? | |
| `autorisationId` | Int FK → AutorisationSpectacle (ON DELETE CASCADE) |
| `artistes` | Artiste[] | |

#### `Artiste` — cascades from Spectacle
| Field | Type | Notes |
|------|------|-------|
| `id` | Int PK | |
| `nom` | String | |
| `nationalite` | String | `'tunisienne'` / `'autre'` |
| `pays` | String? | |
| `identite` | String? | file |
| `spectacleId` | Int FK (CASCADE) | |
| `depenses` | Depense[] | |

#### `Depense` — cascades from Artiste
| Field | Type |
|-------|------|
| `id` | Int PK |
| `type` | String |
| `montant` | Decimal (default 0) |
| `fichier` | String? (receipt) |
| `artisteId` | Int FK (CASCADE) |

---

## 5. Backend

### 5.1 Bootstrapping
- [backend/src/server.js](backend/src/server.js) loads `.env`, registers the cron job, starts Express on `process.env.PORT || 5000`.
- [backend/src/app.js](backend/src/app.js) configures CORS + JSON body, mounts routers, exposes `/uploads` as static, and provides `GET /` health + `GET /test-email` diagnostics.

### 5.2 Routers & Endpoints

All JSON; upload endpoints accept `multipart/form-data`. Protected endpoints
expect an `Authorization: Bearer <jwt>` header.

#### Public
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | inline | health check |
| GET | `/test-email` | inline | sends a test mail to `EMAIL_USER` |
| GET | `/uploads/:file` | `express.static` | serves uploaded documents |

#### `/auth` — [routes/auth.routes.js](backend/src/routes/auth.routes.js)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/auth/register` | `auth.register` | validates password (8+ / upper / lower / digit / symbol), creates `User`, sends bilingual welcome mail |
| POST | `/auth/login` | `auth.login` | returns JWT `{userId, email, canDepot, canFCS}` (7d) + user object |

#### `/admin` — [routes/admin.routes.js](backend/src/routes/admin.routes.js)
All routes except `/login` require `adminMiddleware`.

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/admin/login` | `admin.login` | JWT with `isAdmin: true` (7d) |
| GET | `/admin/depots` | `getAllDepots` | list all dépôts w/ deposant, oeuvre.categorie, auteurs, user |
| GET | `/admin/depots/:id` | `getDepotById` | single dépôt w/ relations |
| PUT | `/admin/depots/:id/accepter` | `accepterDepot` | sets `statut = "ACCEPTE"` |
| PUT | `/admin/depots/:id/rejeter` | `rejeterDepot` | requires `motifRejet`, sets `statut = "REJETE"` |
| DELETE | `/admin/depots/:id` | `deleteDepot` | |
| GET | `/admin/deposants` | `getAllDeposants` | with depot counts and statuses |
| DELETE | `/admin/deposants/:id` | `deleteDeposant` | refuses if deposant has dépôts |
| GET | `/admin/rapports/yearly?year=YYYY` | `getYearlyReport` | 16 × 12 matrix (count + amount `count*30`) on `dateDepot` |
| GET | `/admin/rapports/yearly-renouv?year=YYYY` | `getYearlyRenouvellementsReport` | same matrix on `dateRenouvellement` |
| PUT | `/admin/parametres/password` | `changePassword` | current+new (min 6 chars) |
| GET | `/admin/users` | `getAllUsers` | list users + `_count.depots` |
| PUT | `/admin/users/:id/permissions` | `updateUserPermissions` | toggle `canDepot`, `canFCS` |
| GET | `/admin/autorisations` | `getAllAutorisations` | aggregated list (lieu, natures, nb artistes) |
| GET | `/admin/autorisations/:id` | `getAutorisationById` | full tree (organisateur → spectacles → artistes → depenses) |
| PUT | `/admin/autorisations/:id/prendre-en-charge` | `prendreEnCharge` | `EN_COURS_EXAMEN → EN_COURS_TRAITEMENT` + timestamp |
| PUT | `/admin/autorisations/:id/generer-facture` | `genererFacture` | `EN_COURS_TRAITEMENT → EN_ATTENTE_PAIEMENT` |
| PUT | `/admin/autorisations/:id/delivrer` | `delivrerAutorisation` | `EN_ATTENTE_PAIEMENT`/`PAIEMENT_RECU` → `AUTORISE` + timestamp |

#### `/categories` — [routes/categorie.routes.js](backend/src/routes/categorie.routes.js) (public)
| Method | Path | Handler |
|--------|------|---------|
| GET | `/categories` | `getAllCategories` (sorted by `code`) |
| GET | `/categories/:id` | `getCategoryById` |

#### `/deposants` — [routes/deposant.routes.js](backend/src/routes/deposant.routes.js) (public CRUD; note: left unauth for now)
| Method | Path | Handler |
|--------|------|---------|
| POST | `/deposants` | `createDeposant` |
| GET | `/deposants` | `getAllDeposants` |
| GET | `/deposants/:id` | `getDeposantById` |
| PUT | `/deposants/:id` | `updateDeposant` |
| DELETE | `/deposants/:id` | `deleteDeposant` |

(`searchDeposant` is exported but not mounted.)

#### `/auteurs` — [routes/auteur.route.js](backend/src/routes/auteur.route.js) · full CRUD
#### `/oeuvres` — [routes/oeuvre.route.js](backend/src/routes/oeuvre.route.js) · full CRUD

#### `/depots` — [routes/depot.routes.js](backend/src/routes/depot.routes.js) — all require user JWT
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/depots` | `createDepot` | multipart: `fichierCIN`, `fichierRNE`, `fichierProcuration`, `fichierDossierJuridique`, `fichierFacture`. Transactional upsert of Deposant / Oeuvre / Auteurs / Depot |
| GET | `/depots` | `getAllDepots` | |
| GET | `/depots/mes-depots` | `getMesDepots` | filtered by `req.userId` |
| GET | `/depots/search?q=&fields=cin,mf,rne,numero` | `searchDepots` | deposant OR match |
| GET | `/depots/:id` | `getDepotById` | |
| DELETE | `/depots/:id` | `deleteDepot` | |
| PUT | `/depots/:id/payer` | `payerDepot` | uploads `fichierFacture`, assigns `numeroSequentiel` per category (counted among already-paid dépôts + 1), sets `dateExpiration = now + 1y` |
| PUT | `/depots/:id/renouveler` | `renouvelerDepot` | uploads `fichierDemandeRenouvellement`, pushes `dateExpiration += 1y` (from previous expiration, not today) |

#### `/autorisations` — [routes/autorisation.routes.js](backend/src/routes/autorisation.routes.js)
| Method | Path | Auth | Handler | Description |
|--------|------|------|---------|-------------|
| GET | `/autorisations/organisateurs` | user | `getAllOrganisateurs` | sorted by `nom` |
| POST | `/autorisations/organisateurs` | user | `createOrganisateur` | |
| POST | `/autorisations/organisateurs/bulk` | admin | `bulkCreateOrganisateurs` | used by admin Excel/CSV import |
| POST | `/autorisations/spectacles` | user + `upload.any()` | `createAutorisationSpectacle` | Accepts dynamic field names like `spectacle_{i}_artiste_{j}_identite` and `spectacle_{i}_artiste_{j}_depense_{type}`; runs in a transaction |
| GET | `/autorisations/spectacles` | user | `getAllAutorisations` | full tree |
| GET | `/autorisations/spectacles/:id` | user | `getAutorisationById` | |
| PUT | `/autorisations/spectacles/:id/payer` | user + `upload.any()` | `payerAutorisation` | uploads `fichierFacture`, sets `statut = PAIEMENT_RECU`, `paiementRecuAt = now()` |

### 5.3 Middlewares
- `auth.middleware.js` — decodes Bearer JWT, sets `req.userId`.
- `admin.middleware.js` — same but enforces `decoded.isAdmin`, sets `req.adminId`.
- `upload.middleware.js` — multer `diskStorage` → `uploads/documents`, filename `${field}-${Date.now()}${ext}`; accepts PDF/JPG/PNG up to 5 MB.
- `errorHandler.js` — generic error sink.

### 5.4 Services / Utils
- `services/depot.service.js` — extracted dépôt helpers.
- `utils/language.js` — Arabic detection (also inlined in controllers via the `\u0600-\u06FF` regex).

### 5.5 Cron
- [cron/renewalReminder.js](backend/src/cron/renewalReminder.js) — `0 8 * * *`
  - D-30: flip `statut` to `EN_ATTENTE_RENOUVELLEMENT` + first mail
  - D-23, D-16, D-9: reminder mail
  - D-1: red "URGENT" final warning
  - D≤0: flip `statut` to `REJETE` (if not already renewed)

### 5.6 Mailer
- Gmail transport via `EMAIL_USER` / `EMAIL_PASS` env vars.
- Templates are inlined HTML (bilingual FR/AR with OTDAV branding colors `#1a3c6e`).

### 5.7 Required environment variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5000
EMAIL_USER=...@gmail.com
EMAIL_PASS=<app-password>
```

---

## 6. Frontend — `client/` (public / déposants)

File: [client/src/App.tsx](client/src/App.tsx)

### 6.1 Routes
| Path | Page |
|------|------|
| `/` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/dashboard` | `DashboardPage` |
| `/dashboard/depot` | `DepotDashboard` (export from `Dashboard.tsx`) |
| `/dashboard/fcs` | `FcsDashboard` |
| `/dashboard/autorisation` | `AutorisationDashboard` |
| `/deposit` | `DepositPage` |
| `/mes-depots` | `MesDepotsPage` |
| `/facture/:id` | `FacturePage` (PDF) |
| `/renouvellement` | `RenouvellementPage` |
| `/indemnites-occasionnelles` | `IndemnitesOccasionnellesPage` |
| `/fcs` | `FcsPage` |
| `/statistiques` | `StatistiquesPage` (hub) |
| `/statistiques/registre-general` | `RegistreGeneralPage` |
| `/statistiques/registre-annuel` | `RegistreAnnuelPage` |
| `/statistiques/par-categorie` | `ParCategoriePage` |
| `/statistiques/par-deposant` | `ParDeposantPage` |
| `/statistiques/par-auteur` | `ParAuteurPage` |
| `/statistiques/par-gouvernorat` | `ParGouvernoratPage` |
| `/statistiques/repartition-licences` | `RepartitionLicencesPage` |
| `/autorisation/facture/:id` | `AutorisationFacturePage` |
| `/autorisation/spectacles` | `SpectaclesPage` |
| `/autorisation/musique-generale` | `MusiqueGeneralePage` |
| `/autorisation/salles-fetes` | `SallesFetesPage` |
| `/autorisation/cliniques` | `CliniquesPage` |
| `/autorisation/cafes-restaurants` | `CafesRestaurantsPage` |
| `/autorisation/salles-sport` | `SallesSportPage` |
| `/autorisation/transport` | `TransportPage` |
| `/autorisation/hotels` | `HotelsPage` |
| `/autorisation/radios` | `RadiosPage` |
| `/autorisation/televisions` | `TelevisionsPage` |
| `/autorisation/societes-va` | `SocietesVaPage` |
| `/autorisation/statistiques` | `AutorisationStatistiquesPage` |

### 6.2 Client API Modules

The client uses `fetch` directly inside each page (no central axios instance).
API base URL is hard-coded to `import.meta.env.VITE_API_URL`. Auth token is pulled
from `localStorage.getItem("token")` and sent as `Authorization: Bearer ...`.

| Page | Backend calls |
|------|---------------|
| [LoginPage.tsx](client/src/pages/LoginPage.tsx) | `POST /auth/login` |
| [RegisterPage.tsx](client/src/pages/RegisterPage.tsx) | `POST /auth/register` |
| [DepositPage.tsx](client/src/pages/DepositPage.tsx) | `GET /categories`, `POST /depots` (multipart) |
| [FacturePage.tsx](client/src/pages/FacturePage.tsx) | `GET /depots/:id`, `PUT /depots/:id/payer` (multipart) |
| [MesDepots.tsx](client/src/pages/MesDepots.tsx) | `GET /depots/mes-depots` |
| [RenouvellementPage.tsx](client/src/pages/RenouvellementPage.tsx) | `PUT /depots/:id/renouveler` (multipart) |
| [RegistreGeneral.tsx](client/src/pages/RegistreGeneral.tsx) | `GET /depots` |
| [RegistreAnnuel.tsx](client/src/pages/RegistreAnnuel.tsx) | `GET /depots` |
| [ParCategorie.tsx](client/src/pages/ParCategorie.tsx) | `GET /depots`, `GET /categories` |
| [ParDeposant.tsx](client/src/pages/ParDeposant.tsx) | `GET /depots`, `GET /depots/search?q=&fields=` |
| [ParAuteur.tsx](client/src/pages/ParAuteur.tsx) | `GET /depots`, `GET /depots/search?q=&fields=` |
| [ParGouvernorat.tsx](client/src/pages/ParGouvernorat.tsx) | `GET /depots` |
| [SpectaclesPage.tsx](client/src/pages/SpectaclesPage.tsx) | `GET/POST /autorisations/organisateurs`, `POST /autorisations/spectacles` (multipart, dynamic fields) |
| [AutorisationFacturePage.tsx](client/src/pages/AutorisationFacturePage.tsx) | `GET /autorisations/spectacles/:id`, `PUT /autorisations/spectacles/:id/payer` |

### 6.3 Key components
- `OtdavSidebar` — left-side decorative / logout panel for login & register.
- `WorkflowStepper` — horizontal stepper for the autorisation workflow.
- `layout/header.tsx` + `layout/sidebar.tsx` — in-app shell used by dashboard pages.

### 6.4 Notable PDF / Export utilities
- `FacturePage` renders a facture then prints it via `jspdf + html2canvas`.
- `RegistreGeneralPage` / `RegistreAnnuelPage` export Tunisian registers.

---

## 7. Frontend — `admin/`

File: [admin/src/App.tsx](admin/src/App.tsx)

### 7.1 Routes (all under `AdminLayout` except login)
| Path | Page |
|------|------|
| `/` | `AdminLogin` |
| `/dashboard` | `DashboardHome` |
| `/dashboard/depots` | `DepotsPage` |
| `/dashboard/utilisateurs` | `UtilisateursPage` |
| `/dashboard/rapports` | `RapportsPage` |
| `/dashboard/parametres` | `ParametresPage` |
| `/dashboard/organisateurs` | `OrganisateursPage` |
| `/dashboard/autorisations` | `AutorisationsSuiviPage` |
| `/dashboard/autorisations/:id` | `AutorisationDetailPage` |

### 7.2 Admin API Modules

Admin uses `fetch` with `localStorage.getItem("adminToken")` as the Bearer
header. Some pages also import `axios` (declared in package.json), but the
majority use `fetch`.

| Page | Backend calls |
|------|---------------|
| [AdminLogin.tsx](admin/src/pages/AdminLogin.tsx) | `POST /admin/login` |
| [DashboardHome.tsx](admin/src/pages/DashboardHome.tsx) | `GET /admin/depots` (aggregates cards) |
| [DepotsPage.tsx](admin/src/pages/DepotsPage.tsx) | `GET /admin/depots`, `PUT /admin/depots/:id/accepter`, `PUT /admin/depots/:id/rejeter`, `DELETE /admin/depots/:id` |
| [UtilisateursPage.tsx](admin/src/pages/UtilisateursPage.tsx) | `GET /admin/users`, `PUT /admin/users/:id/permissions` |
| [RapportsPage.tsx](admin/src/pages/RapportsPage.tsx) | `GET /admin/rapports/yearly?year=`, `GET /admin/rapports/yearly-renouv?year=` — renders 16 × 12 tables + Excel export via `xlsx-js-style` |
| [ParametresPage.tsx](admin/src/pages/ParametresPage.tsx) | `PUT /admin/parametres/password` |
| [OrganisateursPage.tsx](admin/src/pages/OrganisateursPage.tsx) | `GET /autorisations/organisateurs`, `POST /autorisations/organisateurs/bulk` (Excel import) |
| [AutorisationsSuiviPage.tsx](admin/src/pages/AutorisationsSuiviPage.tsx) | `GET /admin/autorisations` |
| [AutorisationDetailPage.tsx](admin/src/pages/AutorisationDetailPage.tsx) | `GET /admin/autorisations/:id`, `PUT /admin/autorisations/:id/prendre-en-charge`, `.../generer-facture`, `.../delivrer` |
| [AdminDashboard.tsx](admin/src/pages/AdminDashboard.tsx) | legacy page — same calls as `DepotsPage` |

### 7.3 Shared admin components
- `AdminLayout` — fixed left sidebar (7 items) + `<Outlet />` + guards on `localStorage.adminToken`.
- `WorkflowStepper` — autorisation workflow visual (shared concept with client).

---

## 8. Business Workflows

### 8.1 Dépôt creation + payment
1. User logs in → JWT stored in `localStorage`.
2. `/deposit` — form collects Déposant, Oeuvre, Auteurs, uploads (CIN / RNE / Procuration / Dossier juridique).
3. `POST /depots` runs a transaction:
   - Upsert deposant by `cin` (physique) or `raisonSociale` (morale)
   - Create `Oeuvre` (bilingual split by Arabic detection)
   - Create `Auteur` rows + `DepotAuteur` links
   - Create `Depot` with `montant = 30`, `statut = CERTIFIE`
4. User goes to `/facture/:id`, uploads the invoice file, and submits.
5. `PUT /depots/:id/payer` assigns `numeroSequentiel` per category (global count among already-paid dépôts + 1) and stamps `dateExpiration = now + 1 year`.

### 8.2 Renouvellement
- Cron flags dépôts 30 days before `dateExpiration` as `EN_ATTENTE_RENOUVELLEMENT` and sends e-mail reminders.
- User submits `/renouvellement` with a request file.
- `PUT /depots/:id/renouveler` advances `dateExpiration` by +1 year (from the **previous** expiration, not today) and stamps `dateRenouvellement`.

### 8.3 Spectacle authorization — 4-step admin workflow
| Step | Transition | Endpoint | Timestamp set |
|------|------------|----------|---------------|
| 1 | create | user `POST /autorisations/spectacles` → `EN_COURS_EXAMEN` | `dateCreation` |
| 2 | prendre en charge | `PUT /admin/autorisations/:id/prendre-en-charge` → `EN_COURS_TRAITEMENT` | `prisEnChargeAt` |
| 3 | générer facture | `PUT /admin/autorisations/:id/generer-facture` → `EN_ATTENTE_PAIEMENT` | — |
| 3.5 | user pays | `PUT /autorisations/spectacles/:id/payer` → `PAIEMENT_RECU` | `paiementRecuAt` |
| 4 | délivrer | `PUT /admin/autorisations/:id/delivrer` → `AUTORISE` | `authoriseAt` |

### 8.4 Admin dépôt triage
- `PUT /admin/depots/:id/accepter` → `statut = "ACCEPTE"`
- `PUT /admin/depots/:id/rejeter` with `motifRejet` (required) → `statut = "REJETE"`
- `DELETE /admin/depots/:id`

### 8.5 User permissions
- Default user has `canDepot = false`, `canFCS = false`.
- Admin toggles via `PUT /admin/users/:id/permissions`. The JWT payload carries these flags (no re-login logic enforces them, currently client-side only).

---

## 9. File Uploads Map

All files land in `backend/uploads/documents/` (served at `/uploads`).

| Feature | Multer field(s) | Stored on |
|---------|-----------------|-----------|
| Dépôt creation | `fichierCIN`, `fichierRNE`, `fichierProcuration`, `fichierDossierJuridique` | `Deposant` |
| Dépôt payment | `fichierFacture` | `Depot.fichierFacture` |
| Dépôt renewal | `fichierDemandeRenouvellement` | `Depot.fichierDemandeRenouvellement` |
| Spectacle creation | `pvCommission`, dynamic `spectacle_{i}_artiste_{j}_identite`, `spectacle_{i}_artiste_{j}_depense_{type}` | `AutorisationSpectacle.pvCommission`, `Artiste.identite`, `Depense.fichier` |
| Spectacle payment | `fichierFacture` | `AutorisationSpectacle.fichierFacture` + `paiementProofUrl` |

Constraints: PDF / JPG / JPEG / PNG only, 5 MB max per file (per `upload.middleware.js`).

---

## 10. Auth & Storage Conventions

| Actor | LocalStorage key (frontend) | JWT payload |
|-------|-----------------------------|-------------|
| User | `token`, `user` | `{ userId, email, canDepot, canFCS }` |
| Admin | `adminToken` | `{ adminId, email, isAdmin: true }` |

Both tokens expire in 7 days. The two frontends are siloed — an `adminToken`
is rejected by `auth.middleware.js` and vice versa.

---

## 11. Running Locally

```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev                # nodemon on :5000

# Client
cd ../client
npm install
npm run dev                # vite

# Admin
cd ../admin
npm install
npm run dev                # vite
```

Default admin: `admin@otdav.tn` / `Admin@2026` (from `seed.js`).

---

## 12. Conventions & Gotchas

- **Bilingual fields** — any user-typed string that matches the Arabic unicode
  range `\u0600-\u06FF` is routed into the `_ar` column; otherwise `_fr`.
  Duplicate this logic when adding new free-text fields.
- **`numeroSequentiel`** — nullable on creation; assigned only on `PUT .../payer` to give admins a deterministic per-category invoice number.
- **`Statut` enum drift** — the formal enum has 2 values but runtime also uses
  `"ACCEPTE"`, `"REJETE"`, `"RENOUVELE"` as strings. When reading `statut`,
  allow the full set.
- **Organisateur bulk import** — accepts `{ organisateurs: [{nom, mf, adresse, telephone}] }` with `skipDuplicates: true` (RNE is added in the latest migration).
- **File storage is local** — `backend/uploads` is committed partially (old
  files present in repo). Consider moving to object storage before deploy.
- **CORS** — currently open via `cors()` with defaults. Lock down origins for production.
- **API base URL** — hard-coded `import.meta.env.VITE_API_URL` across client pages. Centralize before shipping.
