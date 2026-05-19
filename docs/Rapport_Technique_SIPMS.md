# RAPPORT TECHNIQUE DU PROJET DE FIN ÉTUDES

---

# SMART INTERNSHIP & PROJECT MANAGEMENT SYSTEM (SIPMS)

### Système Intelligent de Gestion des Stages et Projets

---

**Université**: Institut International de Technologie - Sfax
**École**: IIT - Institut International de Technologie
**Filière**: Génie Informatique
**Année Universitaire**: 2025-2026

---

**Étudiant**: Ayadi Youssef
**Encadré par**: Rahma Bouaziz
**Entreprise**: Clinisys
**Date**: Mai 2026

---

<div style="page-break-after: always;"></div>

# TABLE DES MATIÈRES

[À compléter après rédaction]

---

<div style="page-break-after: always;"></div>

# CHAPITRE 1: INTRODUCTION GÉNÉRALE

## 1.1 Contexte du Projet

Dans le contexte économique actuel caractérisé par une数字化transformation accélérée et une concurrence croissante dans le marché du travail, la gestion efficace des processus de recrutement de stagiaires et de projets académiques devient un défi majeur pour les organisations. Les méthodes traditionnelles de gestion manuelle des candidatures, basées sur des dossiers physiques et des processus papier, présentent de nombreuses limitations: perte de documents, délais de traitement longs, manque de traçabilité, et inefficacité dans l'évaluation des compétences des candidats.

Le **Smart Internship & Project Management System (SIPMS)** est une plateforme web full-stack conçue pour numériser et automatiser l'ensemble du processus de gestion des stages et des projets académiques. Ce système intègre des fonctionnalités avanzadas d'intelligence artificielle pour l'analyse et le classement des projets soumis par les candidats, ainsi que pour l'appariement intelligent entre les candidats et les superviseurs disponibles.

## 1.2 Objectifs du Projet

L'objectif principal de ce projet est de développer une application web professionnelle permettant:

1. **Digitalisation du Processus de Candidature**: Permettre aux candidats de soumettre leurs dossiers en ligne, incluant leur CV et leur idée de projet.

2. **Automatisation de l'Évaluation**: Implémenter un système de quiz technique automatisé avec correction instantanée pour évaluer les compétences techniques des candidats.

3. **Intégration de l'IA**: Utiliser des algorithmes d'intelligence artificielle pour analyser et classer les projets soumis, ainsi que pour suggérer l'encadrant le plus adapté à chaque projet.

4. **Gestion des Rôles (RBAC)**: Implémenter un système d'accès basé sur les rôles permettant à différents types d'utilisateurs (Admin, Manager, Réceptionniste, Candidat) d'accéder aux fonctionnalités appropriées.

5. **Notifications Automatisées**: Déclencher des notifications automatiques par email et in-app à chaque étape clé du processus de sélection.

## 1.3 Portée du Projet

Le système SIPMS couvre les fonctionnelités suivantes:

- **Module d'Authentification**: Connexion sécurisée avec JWT et gestion des rôles
- **Module de Gestion des Candidatures**: Soumission en ligne et enregistrement physique
- **Module d'Évaluation**: Quiz technique chronométré avec correction automatique
- **Module IA**: Classement des projets et appariement candidat-superviseur
- **Module de Décision**: Workflow de validation avec acceptation/refusement
- **Module de Notifications**: Notifications in-app et par email

## 1.4 Définition du Problème

Les organisations académiques et les entreprises font face à plusieurs défis dans la gestion des stages:

| Problème Identifié | Solution SIPMS |
|-----------------|----------------|
| Gestion manuelle des dossiers physiques | Numérisation complète |
| Délais de traitement longs | Automatisation des processus |
| Manque de traçabilité | Audit logs complets |
| Évaluation subjective | Quiz standardisé + IA |
| Difficulté de matching superviseur/projet | Algorithme de matching |
| Communication inefficace | Notifications automatiques |

---

<div style="page-break-after: always;"></div>

# CHAPITRE 2: ÉTUDE DE L'EXISTANT ET ANALYSE DES BESOINS

## 2.1 Étude de l'Existant

### 2.1.1 Situation Actuelle

Dans le système traditionnel de gestion des stages, le processus se déroule comme suit:

1. **Réception des Dossiers Physiques**: Les candidats apportent leurs dossiers en personne au service de.stage
2. **Classement Manuel**: Les réceptionnistes trient et classent les dossiers
3. **Évaluation Papier**: Les managers évaluent les projets manuellement
4. **Décision par Discussion**: Les décisions sont prises lors de réunions
5. **Communication par Téléphone/Email**: Les candidats sont informés individuellement

### 2.1.2 Inconvénients du Système Actuel

- **Perte de Documents**: Risque élevé de perte ou de malclassement
- **Temps de Traitement**: Délai moyen de 2-3 semaines
- **Couts**: Frais de stockage et de personnel
- **Pas d'Historique**: Difficulté à consulter les anciennes candidatures
- **Statistiques Difficultiles**: Impossible de générer des rapports

## 2.2 Analyse des Besoins

### 2.2.1 Besoins Fonctionnels

| Besoin | Priorité | Description |
|--------|---------|-------------|
| Authentication | Haute | Connexion sécurisée avec JWT |
| Inscription Candidat | Haute | Formulaire en ligne |
| Soumission Projet | Haute | Interface de soumission |
| Quiz Technique | Haute | Évaluation automatisée |
| Classement IA | Moyenne | Analyse des projets |
| Matching Superviseur | Moyenne | Suggestion d'encadrant |
| Décision Manager | Haute | Acceptation/Refusement |
| Notifications | Moyenne | Emails automatiques |

### 2.2.2 Besoins Non-Fonctionnels

- **Performance**: Temps de réponse < 2 secondes
- **Sécurité**: Chiffrement JWT, protection against XSS/SQLi
- **Disponibilité**: 99.5% uptime
- **Évolutivité**: Architecture modulaire
- **Maintenabilité**: Code documenté, tests unitaires

## 2.3 Règles Métier (Business Rules)

| Règle ID | Description |
|---------|------------|
| BR-01 | Toute demande physique doit être scannée et associée à un compte candidat |
| BR-02 | Un candidat doit passer le quiz (≥60%) avant l'entretien |
| L'IA ne prend pas de décision finale; elle fournit un score de confiance |
| BR-04 | Un superviseur ne peut pas gérer plus de 3 stagiaires simultanément |
| BR-05 | Tout changement de statut déclenche un email automatique |

---

<div style="page-break-after: always;"></div>

# CHAPITRE 3: ÉTUDE TECHNIQUE

## 3.1 Choix Technologiques

### 3.1.1 Frontend

| Technologie | Version | Justification |
|------------|---------|----------------|
| React | 18.x | Framework moderne, grande communauté |
| Vite | 5.x | Build tool rapide |
| Tailwind CSS | 3.x | Styling utility-first |
| Axios | 1.x | Client HTTP |
| React Router | 6.x | Routing |

### 3.1.2 Backend

| Technologie | Version | Justification |
|------------|---------|----------------|
| Spring Boot | 3.2.5 | Framework Java enterprise |
| Spring Security | 6.x | Sécurité intégrée |
| JWT | 0.12.5 | Authentication stateless |
| MySQL | 8.0 | Base de données relationnelle |
| JPA/Hibernate | 6.4 | ORM |

### 3.1.3 Architecture du Système

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                    http://localhost:5173                        │
└─────────────────────────────┬────────────────────────���─────────┘
                               │
                    ┌────────▼────────┐
                    │   Vite Proxy     │
                    │  (Port 5173)     │
                    └────────┬────────┘
                               │
                    ┌────────▼────────┐
                    │   Spring Boot    │
                    │  (Port 8080)     │
                    └────────┬────────┘
                               │
                    ┌────────▼────────┐
                    │     MySQL        │
                    │   (Port 3306)    │
                    └─────────────────┘
```

## 3.2 Conception UML

### 3.2.1 Diagramme des Cas d'Utilisation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  Smart Internship & Project Management System       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌─────────────┐                                                   │
│   │  S'authentifier  │────── ┌─────────────┐                        │
│   │  Gérer Profil    │      │     ADMIN    │                        │
│   └────────────────┘      └──────────────┘                        │
│          │                          │                                 │
│          │             ┌────────────┼────────────┐                  │
│          │             │            │            │                   │
│   ┌──────▼──────┐  ┌───▼────┐  ┌───▼────┐  ┌────▼────┐          │
│   │  CANDIDAT   │  │MANAGER│  │RECEPT.│  │   IA    │          │
│   └──────┬──────┘  └───┬────┘  └───┬────┘  └───┬─────┘          │
│          │             │           │           │                    │
│          │    ┌────────┴──────────┴──────────┘                  │
│          │    │                                                 │
│   ┌──────▼─────────────────────────────────────────┐              │
│   │              APPLICATION & WORKFLOW            │              │
│   │  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │              │
│   │  │  Soumettre  │  │  Évaluer   │  │ Décider │ │              │
│   │  │ Candidat.  │  │   (Quiz)   │  │        │ │              │
│   │  └─────────────┘  └─────────────┘  └────────┘ │              │
│   └────────────────────────────────────────────────┘              │
└──────────────────���─���─────────────────────────────────────────────┘
```

### 3.2.2 Diagramme de Classes

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           CLASS DIAGRAM                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │      User        │         │      Role         │                │
│  ├──────────────────┤         ├──────────────────┤                 │
│  │ - id: Long       │◄──M:N───│ - id: Long        │                 │
│  │ - firstName     │         │ - name: String    │                 │
│  │ - lastName      │         └──────────────────┘                 │
│  │ - email         │                                       │         │
│  │ - passwordHash  │                                       │         │
│  │ - roles: Set    │         ┌────────────────────────┘         │
│  └───────┬─────────┘                                               │
│          │ 1:1                                                    │
│          ▼                                                        │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │    Candidate    │         │    Supervisor   │                │
│  ├──────────────────┤         ├──────────────────┤                 │
│  │ - id: Long       │         │ - id: Long       │                 │
│  │ - user: User    │         │ - user: User     │                 │
│  │ - university    │         │ - fullName       │                 │
│  │ - degree        │         │ - department    │                 │
│  │ - skillsTags    │         │ - expertiseTags │                 │
│  │ - cvFilePath    │         │ - maxInterns     │                 │
│  └───────┬─────────┘         │ - currentInterns│                 │
│          │ 1:*              └────────┬─────────┘                 │
│          ▼                             │                           │
│  ┌──────────────────────────────┐      │ 1:*                      │
│  │      Application            │◄─────┘                          │
│  ├──────────────────────────────┤                                  │
│  │ - id: Long                  │                                  │
│  │ - candidate: Candidate    │         ┌────────────────┐         │
│  │ - project: Project         │         │    Project    │         │
│  │ - supervisor: Supervisor  │         ├───────────────┤         │
│  │ - status: ApplicationStatus         │ - id: Long   │         │
│  │ - intakeMethod: Intake     │         │ - title      │         │
│  │ - aiMatchScore: Double    │         │ - description│         │
│  └──────────────┬─────────────┘         │ - aiScore   │         │
│                 │                     └────────────────┘           │
│                 │ 1:1                                              │
│                 ▼                                                  │
│  ┌────────────────────┐     ┌────────────────────┐                 │
│  │    QuizAttempt    │     │      Quiz         │                  │
│  ├───────────────────┤     ├───────────────────┤                 │
│  │ - id: Long       │◄────│ - id: Long         │                 │
│  │ - quiz: Quiz    │     │ - title          │                  │
│  │ - candidate    │     │ - durationMins   │                  │
│  │ - score: Int   │     │ - passingScore   │                  │
│  │ - percentage  │     │ - questions     │                  │
│  │ - passed      │     └──────────────────┘                      │
│  └─────────────────┘                                              │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2.3 Diagrammes de Séquence

#### Séquence 1: Authentification

```
┌──────────┐      ┌────────────┐      ┌─────────────┐
│ Candidat │      │  Système   │      │  Database  │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘
     │                  │                     │
     │1: Submit credentials│                   │
     ├──────────────────>│                     │
     │                  │                     │
     │                  │2: Verify credentials│
     │                  ├───────────────────>│
     │                  │                     │
     │                  │3: Return user + role │
     │                  ├<───────────────────│
     │                  │                     │
     │4: JWT Token      │                     │
     ├<────────────────┤                     │
     │                  │                     │
     │5: Redirect to dashboard│              │
     ├──────────────────>│                   │
     │                  │                     │
```

#### Séquence 2: Soumission de Candidature

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌─────────┐
│ Candidat │      │ Application│      │Notification│    │   IA    │
│          │      │  Service   │      │  Service   │    │ Engine  │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                     │                │
     │1: Submit project idea│                  │                │
     ├──────────────────>│                     │                │
     │                  │                     │                │
     │                  │2: Validate + Save   │
     │                  ├───────────────────>│                │
     │                  │                     │                │
     │                  │3: Create notification│            │
     │                  ├──────────────────>│                 │
     │                  │                     │                │
     │4: Trigger AI analysis│                   │                │
     │                  ├────────────────────────>│           │
     │                  │                     │    │           │
     │                  │                     │    │           │
     │                  │5: Calculate relevance│    │         │
     │                  │<════════════════════════┤           │
     │                  ��                     │                │
     │6: Update with AI score│                  │                │
     ├<───────────────────┤                     │                │
     │                  │                     │                │
```

#### Séquence 3: Quiz et Auto-évaluation

```
┌──────────┐      ┌────────────┐      ┌─────────────┐
│ Candidat │      │ QuizService│     │ Application │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘
     │                  │                     │
     │1: Start quiz    │                     │
     ├────────────────>│                     │
     │                  │                     │
     │                  │2: Start timer     │
     │                  │3: Get questions  │
     │                  ├──────────────────>│
     │                  │                     │
     │4: Display quiz │                     │
     ├<────────────────┤                     │
     │                  │                     │
     │5: Submit answers│                    │
     ├────────────────>│                     │
     │                  │                     │
     │                  │6: Auto-grade     │
     │                  │7: Calculate score│
     │                  │                  │              │
     │                  │8: Save attempt   │
     │                  ├─────────────────────────────>│
     │                  │                     │
     │                  │9: Update status to QUIZ_COMPLETED│
     │                  ├──────────────────────────────────>│
     │                  │                     │
     │10: Show result  │                    │
     ├<────────────────┤                    │
     │                  │                    │
```

#### Séquence 4: Décision et Notification

```
┌──────────┐      ┌────────────┐      ┌─────────────┐    ┌─────────┐
│ Manager  │      │Application│      │ Notification│   │  Email  │
│          │      │  Service  │      │  Service    │   │ Service │
└────┬─────┘      └─────┬──────┘      └──────┬──────┘    └────┬───┘
     │                  │                     │                │
     │1: Update status (ACCEPTED/REJECTED)  │
     ├──────────────────>│                     │
     │                  │                     │
     │                  │2: Validate transition│
     │                  │3: Save new status │
     │                  ├───────────────────>│
     │                  │                     │
     │                  │4: Create in-app notification │          │
     │                  ├──────────────────>│
     │                  │                     │
     │                  │5: Send email notification│
     │                  ├──────────────────────────────────────>│
     │                  │                     ���    │            │
     │                  │                     │    │            │
     │                  │6: Email delivered│    │            │
     │                  │<═════════════════════════════         │
     │                  │                     │                │
     │7: Confirmation  │                     │
     ├<─────────────────┤                     │
     │                  │                     │
```

---

<div style="page-break-after: always;"></div>

# CHAPITRE 4: DÉVELOPPEMENT ET IMPLEMENTATION

## 4.1 Structure du Projet

```
SIPMS/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/project/sipms/
│   │   ├── controller/       # REST APIs
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Data transfer objects
│   │   ├── security/         # JWT & auth
│   │   ├── ai/               # AI algorithms
│   │   └── common/           # Utilities
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                  # React Application
│   ├── src/
│   │   ├── pages/            # Dashboard pages
│   │   ├── components/       # Reusable components
│   │   ├── api/              # Axios config
│   │   ├── context/          # React contexts
│   │   └── layouts/          # Layout components
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql           # Database schema
│   └── data.sql             # Sample data
│
└── docs/                    # Documentation
```

## 4.2 Phases de Développement

### Phase 1: Configuration et Infrastructure (Semaine 1-2)

- Configuration de l'environnement de développement
- Création du projet Spring Boot avec dépendances
- Setup React avec Vite et Tailwind
- Configuration MySQL et JPA
- Mise en place du système d'authentification JWT

### Phase 2: Gestion des Utilisateurs (Semaine 3-4)

- Inscription et connexion
- Gestion des rôles (Admin, Manager, Réceptionniste, Candidat)
- Profil utilisateur
- JWT token management

### Phase 3: Module Candidature (Semaine 5-6)

- Soumission en ligne
- Enregistrement physique par réceptionniste
- Upload de CV et documents
- Gestion du statut des candidatures

### Phase 4: Module Quiz (Semaine 7-8)

- Création de quiz avec questions
- Timer chronométré
- Auto-correction
- Calcul du score et passage/réussite

### Phase 5: Intelligence Artificielle (Semaine 9-10)

- Analyse des projets soumis
- Scoring de pertinence
- Matching candidat-superviseur
- Classement automatique

### Phase 6: Notifications (Semaine 11)

- Notifications in-app
- Emails transactionnels
- Rappels automatiques

### Phase 7: Tests et Déploiement (Semaine 12)

- Tests unitaires
- Tests d'intégration
- Bug fixing
- Préparation au déploiement

## 4.3 Modèle de Base de Données

### Schéma Conceptuel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌──────────────┐      ┌──────────────┐      ┌──────────────┐          │
│ │    users    │      │    roles     │      │  user_roles  │          │
│ ├──────────────┤      ├──────────────┤      ├──────────────┤          │
│ │ id (PK)     │      │ id (PK)      │      │ user_id (FK)│          │
│ │ first_name │──────│ name         │      │ role_id (FK)│          │
│ │ last_name  │      │              │      │              │          │
│ │ email      │      └──────────────┘      └──────────────┘          │
│ │ password   │                                                      │
│ │ active    │                ┌────────────────┐                    │
│ └───────────┘                │  candidates   │                    │
│         │                    ├────────────────┤                    │
│         │ 1:1                │ id (PK)       │                    │
│         ▼                   │ user_id (FK)  │◄─────┐             │
│ ┌──────────────┐             │ university    │      │             │
│ │ supervisors │             │ degree        │      │             │
│ ├──────────────┤             │ skills_tags  │      │             │
│ │ id (PK)     │             │ cv_file_path │      │             │
│ │ user_id(FK) │             └───────────────┘      │             │
│ │ full_name  │                    │               │             │
│ │ department                  │ 1:N              │             │
│ │ expertise_tags           └────────┬──────────┘             │
│ │ max_interns                  ▼                                │
│ │ current_interns           ┌───────────────┐                    │
│ └──────────────┘           │ applications │                    │
│         │                  ├──────────────┤                    │
│         │ 1:N               │ id (PK)      │                    │
│         ▼                  │ candidate_id │                    │
│ ┌──────────────┐          │ project_id   │                    │
│ │   projects   │          │ supervisor_id│                    │
│ ├──────────────┤          │ status       │                    │
│ │ id (PK)     │          │ intake_method│                    │
│ │ title      │          │ ai_match_score                  │
│ │ description          └───────────────┘                    │
│ │ domain               │         │                           │
│ │ ai_score            │         │ 1:1                       │
│ │ status              │         ▼                           │
│ └──────────────┘     ┌───────────────┐                     │
│                       │ quiz_attempts │                    │
│                       ├───────────────┤                    │
│                       │ id (PK)       │◄──────┐            │
│                       │ quiz_id (FK)  │      │            │
│                       │ candidate_id │      │            │
│                       │ score        │      │            │
│                       │ passed       │      │            │
│                       └──────────────┘      │            │
│                                          │              │
│                       ┌──────────────────┘              │
│                       │                               │
│                       ▼                               │
│                  ┌─────────────────┐                   │
│                  │ notifications  │                   │
│                  ├──────────────────┤                   │
│                  │ id (PK)        │                   │
│                  │ user_id (FK)    │                   │
│                  │ title          │                   │
│                  │ message        │                   │
│                  │ type           │                   │
│                  │ is_read        │                   │
│                  └─────────────────┘                   │
└────────────────────────────────────────────────────────────┘
```

### Descriptions des Tables

#### Table: users
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Primary key |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| email | VARCHAR(255) | Email unique |
| password_hash | VARCHAR(255) | Mot de passe chiffré |
| phone | VARCHAR(20) | Téléphone |
| avatar_url | VARCHAR(500) | URL photo profil |
| active | BOOLEAN | Statut actif |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

#### Table: applications
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Primary key |
| candidate_id | BIGINT | Référence candidat |
| project_id | BIGINT | Référence projet |
| supervisor_id | BIGINT | Référence superviseur |
| status | ENUM | Statut workflow |
| intake_method | ENUM | ONLINE/PHYSICAL |
| registered_by | BIGINT | Réceptionniste |
| manager_notes | TEXT | Notes décision |
| decision_date | TIMESTAMP | Date décision |
| ai_match_score | DOUBLE | Score IA |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

#### Statuts des Candidatures (Workflow)
```
PENDING → UNDER_REVIEW → QUIZ_PENDING → QUIZ_COMPLETED 
         → AI_EVALUATING → MANAGER_REVIEW → ACCEPTED/REJECTED
```

---

<div style="page-break-after: always;"></div>

# CHAPITRE 5: INTERFACE UTILISATEUR

## 5.1 Design System

### Palette de Couleurs

| Couleur | Hex Code | Utilisation |
|--------|---------|-------------|
| Primary | #4F46E3 | Boutons principaux, liens |
| Primary Light | #818CF8 | Hover states |
| Primary Dark | #3730A3 | Active states |
| Success | #10B981 | Statut accepté, succès |
| Warning | #F59E0B | Avertissements |
| Error | #EF4444 | Erreurs, refus |
| Surface 50 | #F9FAFB | Background |
| Surface 100 | #F3F4F6 | Cartes |
| Surface 200 | #E5E7EB | Bordures |
| Surface 500 | #6B7280 | Text secondaire |
| Surface 900 | #111827 | Text principal |

### Typographie

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 32px | 700 |
| H2 | Inter | 24px | 700 |
| H3 | Inter | 20px | 600 |
| Body | Inter | 14px | 400 |
| Caption | Inter | 12px | 400 |

## 5.2 Écrans Principaux

### 5.2.1 Page de Connexion

L'écran de connexion dispose des él��ments suivants:
- Logo SIPMS
- Formulaire email/mot de passe
- Bouton "Se connecter"
- Lien "Créer un compte"
- Design épuré avec fond dégradé

### 5.2.2 Dashboard Administrateur

Le dashboard administrateur comprend:
- **Sidebar**: Navigation principale
- **Statistiques**: Cartes avec chiffres clés
- **Tableau de données**: Liste des candidatures
- **Filtres**: Par statut, date
- **Actions**: Modifier, assigner superviseur, décider

### 5.2.3 Page des Candidatures

Fonctionnalités:
- Liste paginée des candidatures
- Détails candidat et projet
- Changement de statut
- Assignation de superviseur
- Notes du manager
- Score IA affiché

### 5.2.4 Page du Quiz

L'interface du quiz comprend:
- Chronomètre visible
- Questions à choix multiples (A, B, C, D)
- Navigation entre questions
- Submission automatique à la fin
- Résultat immédiat avec score

### 5.2.5 Page IA Insights

Cette page affiche:
- Projets classifiés par score IA
- Matching superviseur/candidat
- Graphiques de distribution
- Suggestions d'appariement

## 5.3 Composants UI Réutilisables

| Composant | Description | États |
|-----------|-------------|-------|
| Button | Bouton d'action | default, hover, active, disabled |
| Input | Champ de saisie | default, focus, error, disabled |
| Select | Liste déroulante | default, open, selected |
| Badge | Badge de statut | info, success, warning, error |
| Table | Tableau de données | default, loading, empty |
| Modal | Fenêtre popup | open, closed |
| Card | Carte d'information | default, hover |
| StatCard | Carte statistique | default |
| Loading | Indicateur de chargement | loading |

---

<div style="page-break-after: always;"></div>

# CHAPITRE 6: DÉFIS ET SOLUTIONS

## 6.1 Défis Techniques

### Défi 1: Authentification Sécurisée

**Problème**: Implémenter une authentification sécurisée sans session serveur.

**Solution**: 
- Utilisation de JWT (JSON Web Tokens)
- Stockage du token dans localStorage
- Intercepteurs Axios pour attachment automatique
- Renouvellement automatique du token

### Défi 2: Upload de Fichiers

**Problème**: Gérer l'upload de fichiers (CV, photos) de manière sécurisée.

**Solution**:
- Service de stockage local avec chemin configurable
- Validation du type de fichier
- Limitation de taille (10MB max)
- Génération de noms de fichiers uniques

### Défi 3: Quiz en Temps Réel

**Problème**: Implémenter un timer précis et éviter la triche.

**Solution**:
- Timer côté serveur et client
- Calcul du temps restant au moment de la soumission
- Validation des réponses par rapport au temps
- Score = 0 si temps dépassé

### Défi 4: IA Locale

**Problème**: Implémenter des fonctionnalités IA sans API externe.

**Solution**:
- Algorithme de scoring TF-IDF local
- Comparaison par similarité textuelle
- Matching par tags d'expertise
- Pas de dépendance externe

### Défi 5: Notifications Email

**Problème**: Envoyer des emails transactionnels.

**Solution**:
- Intégration Spring Mail
- Templates d'emails
- Envoi asynchrone (@Async)
- Configuration SMTP flexible

## 6.2 Défis Métier

### Défi 6: Workflow Complexe

**Problème**: Gérer les transitions de statut complexes avec validation.

**Solution**:
- Enum des statuts avec transitions autorisées
- Méthode validateStatusTransition()
- Exceptions métier claires
- Audit logs des décisions

### Défi 7: Capacité des Superviseurs

**Problème**: Limiter le nombre de stagiaires par superviseur.

**Solution**:
- Champ maxInterns dans l'entité Supervisor
- Vérification avant assignment
- Exception si capacité atteinte
- Mise à jour automatique

---

<div style="page-break-after: always;"></div>

# CHAPITRE 7: CONCLUSION ET PERSPECTIVES

## 7.1 Résumé du Projet

Le **Smart Internship & Project Management System (SIPMS)** est une application web complète qui permet de:

1. **Digitaliser** l'ensemble du processus de gestion des stages
2. **Automatiser** les évaluations techniques par quiz
3. **Intégrer** des fonctionnalités d'intelligence artificielle
4. **Sécuriser** l'accès par authentification JWT et RBAC
5. **Notifier** automatiquement les utilisateurs par email et in-app

## 7.2 Résultats Obtenus

| Module | Fonctionnalité | Status |
|--------|----------------|--------|
| Auth | Connexion JWT | ✅ |
| Gestion | CRUD Utilisateurs | ✅ |
| Candidature | Soumission en ligne | ✅ |
| Réception | Dossiers physiques | ✅ |
| Quiz | Évaluation auto | ✅ |
| IA | Classement projets | ✅ |
| IA | Matching superviseur | ✅ |
| Notifications | In-app + Email | ✅ |
| Dashboard | Statistiques | ✅ |

## 7.3 Améliorations Futures

Plusieurs fonctionnalités peuvent être ajoutées:

1. **Video Interview**: Intégration de visioconférence
2. **Calendar**: Planification des entretiens
3. **Reporting**: Génération de rapports PDF
4. **Multi-lingual**: Support Arabic/English/French
5. **Mobile App**: Application mobile native
6. **API Publique**: Pour intégration externe

## 7.4 Leçons Apprises

Ce projet a permis de:
- Maîtriser le développement full-stack avec Spring Boot et React
- Comprendre les problématiques de sécurité web
- Implémenter des algorithmes d'IA simples
- Travailler en méthodologies agiles
- Documenter techniquement un projet

---

# ANNEXES

## Annexe A: Code Source Sélectionné

### A.1 Configuration de l'Application

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/sipms_db
spring.datasource.username=root
spring.datasource.password=12345

app.jwt.secret=SIPMS_Super_Secret_Key_2024
app.jwt.expiration-ms=86400000

app.cors.allowed-origins=http://localhost:5173
```

### A.2 Configuration de Sécurité

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/ai/**").hasAnyRole("ADMIN", "MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

---

## Annexe B: Glossaire

| Terme | Définition |
|------|-----------|
| JWT | JSON Web Token - Standard pour l'authentification stateless |
| RBAC | Role-Based Access Control - Contrôle d'accès basé sur les rôles |
| ORM | Object-Relational Mapping - Mapping objet-relationnel |
| API | Application Programming Interface |
| TF-IDF | Term Frequency-Inverse Document Frequency |
| Quiz | Évaluation technique en ligne |

---

## Annexe C: Références

1. Spring Boot Documentation - https://spring.io/projects/spring-boot
2. React Documentation - https://react.dev
3. JWT Documentation - https://jwt.io
4. Tailwind CSS - https://tailwindcss.com
5. Hibernate ORM - https://hibernate.org/orm

---

**Document préparé par**: [Votre Nom]
**Date**: Mai 2026
**École**: ENSATé - École Nationale des Sciences Appliquées Tétouan

---

*Fin du Rapport*