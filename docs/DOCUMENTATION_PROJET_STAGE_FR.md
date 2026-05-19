# DOCUMENTATION COMPLÈTE DU PROJET DE STAGE

## SIPMS – Smart Internship & Project Management System

---

## TABLE DES MATIÈRES

1. [Résumé Exécutif](#1-résumé-exécutif)
2. [Présentation de l'Entreprise](#2-Présentation-de-lentreprise)
3. [Problématique et Contexte](#3-Problématique-et-contexte)
4. [Objectifs du Projet](#4-Objectifs-du-Projet)
5. [Détail des Tâches](#5-Détail-des-tâches)
6. [Spécifications Techniques](#6-Spécifications-techniques)
7. [Méthodologie et Approche](#7-Méthodologie-et-approche)
8. [Calendrier et Diagramme de Gantt](#8-Calendrier-et-diagramme-de-gantt)
9. [Analyse des Risques](#9-Analyse-des-risques)
10. [Prérequis](#10-Prérequis)
11. [Ressources Requises](#11-Ressources-requises)
12. [Développement des Compétences](#12-Développement-des-compétences)
13. [Livrables](#13-Livrables)
14. [Critères d'Évaluation](#14-Critères-dévaluation)
15. [Annexes](#15-Annexes)

---

## 1. RÉSUMÉ EXÉCUTIF

### 1.1 Aperçu du Projet

**SIPMS** (Smart Internship & Project Management System) est une application web complète conçue pour révolutionner la gestion des stages et des projets académiques au sein des institutions d'enseignement et des entreprises partenaires.

Le système numérise et automatise l'ensemble du cycle de stage, depuis :
- **La soumission initiale des candidatures** par les candidats
- **La proposition de projets** par les superviseurs
- **L'appariement intelligent par IA** entre candidats et projets
- **Le système d'évaluation par quiz**
- **Les notifications en temps réel** et le suivi du statut
- **Les rapports analytiques** pour la prise de décision

### 1.2 Indicateurs Clés

| Métrique | Valeur |
|----------|--------|
| Durée du Projet | 6 mois (18 semaines) |
| Phases de Développement | 5 phases distinctes |
| Pages Frontend | 16+ pages |
| APIs Backend | 40+ endpoints REST |
| Tables de Base de Données | 12 tables interconnectées |
| Rôles Utilisateurs | 4 rôles définis |
| Algorithme IA | Appariement basé sur TF-IDF |

### 1.3 Stack Technologique

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        STACK TECHNOLOGIQUE                                │
├──────────────────────┬──────────────────────────────────────────────┤
│ Frontend            │ React 18, Vite, Tailwind CSS, Recharts        │
│ Backend             │ Spring Boot 3.2, Java 17, JWT, Lombok         │
│ Database            │ MySQL 8.0, Hibernate, JPA                     │
│ Sécurité            │ Spring Security, BCrypt, Rate Limiting        │
│ Documentation       │ Swagger/OpenAPI                               │
│ Contrôle de Version │ Git, GitHub                                   │
└──────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. PRÉSENTATION DE L'ENTREPRISE

### 2.1 Clinisys – Entreprise d'Accueil

**Clinisys** est une entreprise technologique leader spécialisée dans les systèmes d'information de santé et les solutions de transformation numérique pour les institutions médicales.

| Aspect | Détails |
|--------|---------|
| **Nom de l'Entreprise** | Clinisys |
| **Secteur** | IT Santé / Santé Numérique |
| **Siège** | Sfax, Tunisie |
| **Fondée** | 2010 |
| **Employés** | 150+ |
| **Services** | Systèmes d'Information Hospitaliers, EMR, EHR, Analytique Santé |

### 2.2 Mission de l'Entreprise

Clinisys vise à fournir des solutions technologiques innovantes qui améliorent les soins aux patients, rationalisent les opérations hospitalières et permettent des décisions fondées sur les données.

### 2.3 Rôle dans le Stage

Clinisys fournit :
- Un environnement professionnel réel
- Infrastructure et outils techniques
- Encadrement par des développeurs expérimentés
- Accès aux systèmes de production pour observation
- Contexte métier pour les exigences du projet

### 2.4 Superviseur Professionnel

| Rôle | Détails |
|------|---------|
| **Nom** | Rahma Bouaziz |
| **Poste** | Directeur Technique / Chef de Projet |
| **Expérience** | 10+ ans en développement logiciel |
| **Rôle** | Mentor principal et évaluateur |

### 2.5 Institution Académique

| Aspect | Détails |
|--------|---------|
| **Institution** | IIT – Institut International de Technologie Sfax |
| **Département** | Ingénierie Informatique |
| **Niveau** | 3ème Année Cycle Ingénieur |
| **Durée** | 6 mois (Janvier – Juin 2026) |

---

## 3. PROBLÉMATIQUE ET CONTEXTE

### 3.1 Analyse de l'État Actuel

#### 3.1.1 Gestion Traditionnelle des Stages

Le processus actuel de gestion des stages dans les institutions académiques implique généralement :

1. **Collecte Manuelle des Données**
   - Tableurs Excel pour les informations des candidats
   - Échanges par courrier électronique pour les candidatures
   - Documents papier pour les évaluations
   - Dossiers physiques pour le stockage

2. **Processes Laborieux**
   - Tri manuel des candidatures
   - Réponses individuelles par email
   - Appels téléphoniques pour les suivre
   - Réunions en personne pour les mises à jour

3. **Communication Fragmentée**
   - Pas de plateforme centralisée
   - Mises à jour de statut incohérentes
   - Multiples canaux de communication
   - Silos d'information

#### 3.1.2 Points de Douleur Identifiés

| Point de Douleur | Impact | Fréquence |
|---------------|--------|----------|
| Candidatures perdues | Perte critique de données | Rare |
| Réponses retardées | Insatisfaction des candidats | Fréquent |
| Erreurs d'appariement手册 | Mauvaises affectations | Occasionnel |
| Manque de visibilité | Mauvaise prise de décision | Constant |
| Pas d'analytique | Pas de perspectives | Constant |
| Écart de communication | Confusion | Fréquent |
| Travail dupliqué | Ressources gaspillées | Fréquent |
| Pas de traçabilité | Problèmes de responsabilité | Occasionnel |

#### 3.1.3 Statistiques (Illustratives)

Basées sur la recherche et les références du secteur :

```
┌───────────────────────────────────────────────────────────────────┐
│         ÉTAT ACTUEL STATISTIQUES                           │
├───────────────────────────────────────────────────────────┤
│ Temps passé sur traitement manuel    │ 60%            │
│ Temps de traitement des candidatures │ 5-7 jours     │
│ Taux de satisfaction des candidats    │ 45%            │
│ Précision d'affectation des superviseurs│ 70%           │
│ Temps de récupération des données      │ 30+ minutes    │
│ Surcharge de communication        │ 40%            │
│ Taux d'erreur dans l'appariement  │ 25%            │
│ Complétude de la documentation     │ 30%            │
└───────────────────────────────────────────────────────��───┘
```

### 3.2 Problématique

**PROBLÈME PRINCIPAL** : 

> "Comment moderniser et automatiser le cycle complet de gestion des stages et des projets, depuis la soumission des candidatures jusqu'à l'évaluation finale, tout en intégrant une intelligence artificielle pour optimiser l'appariement candidat-projet-superviseur ?"

### 3.3 Questions de Support

Le problème principal se décompose en questions opérationnelles suivantes :

| # | Question | Objectif |
|---|----------|----------|
| Q1 | Comment centraliser toutes les données relatives aux candidats, projets et superviseurs dans une seule plateforme ? | Centralisation des Données |
| Q2 | Comment automatiser le processus de soumission et d'évaluation des candidatures ? | Automatisation du Processus |
| Q3 | Comment intégrer l'IA pour apparier intelligemment les candidats aux projets ? | Appariement Intelligent |
| Q4 | Comment assurer une communication en temps réel entre toutes les parties prenantes ? | Communication |
| Q5 | Comment générer des rapports analytiques pour des décisions fondées sur les données ? | Analytique |
| Q6 | Comment maintenir la sécurité et la confidentialité des données sensibles ? | Sécurité |
| Q7 | Comment faire évoluer le système avec la base d'utilisateurs ? | Extensibilité |

### 3.4 Analyse des Causes Racines

```
                    ┌─────────────────────┐
                    │   GESTION          │
                    │   INEFFICACE DES   │
                    │   STAGES          │
                    └──────────┬──────────┘
                               │
           ┌─────────────────────┼─────────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   PROCESSUS │   │   MANQUE    │   │   ABSENCE   │
    │   MANUELS  │   │   D'IA     │   │   D'IA     │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### 3.5 Solution Proposée

**SIPMS**.addresse tous les problèmes identifiés à travers :

1. **Plateforme Numérique** : Application web centralisée
2. **Workflows Automatisés** : Automatisation des processus métier
3. **Moteur IA** : Algorithme d'appariement TF-IDF
4. **Notifications en Temps Réel** : Communication instantanée
5. **Tableau de Bord Analytique** : Perspectives fondées sur les données
6. **Accès Basé sur les Rôles** : Contrôle d'accès sécurisé
7. **Architecture Extensible** : Conception prête pour le cloud

---

## 4. OBJECTIFS DU PROJET

### 4.1 Objectif Général

**Objectif Principal** : Concevoir, développer et déployer une application web complète (SIPMS) qui numérise et automatise le processus de gestion des stages et des projets académiques, avec un composant d'intelligence artificielle pour l'appariement intelligent candidat-projet.

### 4.2 Détail des Objectifs Spécifiques

| ID | Objectif | Description | Métrique de Succès |
|----|-----------|-------------|-------------------|
| OG1 | Gestion des Utilisateurs | Centraliser la gestion des candidats, superviseurs et administrateurs | 100% du cycle de vie utilisateur |
| OG2 | Automatisation des Candidatures | Automatiser le workflow complet de candidature et d'évaluation | Zéro intervention manuelle |
| OG3 | Système de Quiz | Développer un système de quiz en ligne avec correction automatique | Correction automatique opérationnelle |
| OG4 | Appariement IA | Implémenter un moteur de recommandation basé sur l'IA | Précision d'appariement > 85% |
| OG5 | Analytique | Créer un tableau de bord analytique | 10+ graphiques/rapports |
| OG6 | Notifications | Implémenter un système de notification en temps réel | Notifications instantanées |
| OG7 | Documentation | Fournir une documentation technique et utilisateur complète | 100% de couverture |

### 4.3 Hiérarchie des Objectifs

```
┌─────────────────────────────────────────────────────────────────┐
│              HIÉRARCHIE DES OBJECTIFS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│           OBJECTIF GÉNÉRAL                               │
│     "Développer l'Application SIPMS"                     │
│                                                              │
│              │                                             │
│     ┌────────┼────────┐                                      │
│     │        │        │                                      │
│     ▼        ▼        ▼                                      │
│  OG1       OG2       OG3                                     │
│  Gestion  Automat: Quiz    ...                            │
│  Utilisat. Candidatures Système                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Indicateurs de Succès

| Indicateur | Cible | Méthode de Mesure |
|------------|--------|-------------------|
| Complétude de l'application | 100% | Toutes les fonctionnalités implémentées |
| Disponibilité du système | 99.5% | Surveillance production |
| Temps de réponse | < 2 secondes | Test de performance |
| Satisfaction utilisateur | > 85% | Enquête utilisateur |
| Précision appariement IA | > 85% | Test de validation |
| Couverture de tests | > 80% | Rapport de tests |
| Documentation | 100% | Revue de checklist |

---

## 5. DÉTAIL DES TÂCHES

### 5.1 Phase 1 : Analyse et Conception (Semaines 1-3)

#### Semaine 1 : Analyse des Besoins

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T1.1.1 | Étude du système existant | Rapport d'Analyse | 8h |
| T1.1.2 | Entretiens avec les parties prenantes | Notes d'Entretien | 8h |
| T1.1.3 | Analyse comparative | Analyse Concurrentielle | 8h |
| T1.1.4 | Élicitation des exigences | Document d'Exigences | 8h |

#### Semaine 2 : Conception Fonctionnelle

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T1.2.1 | Diagramme des cas d'utilisation | Cas d'Utilisation | 8h |
| T1.2.2 | Spécifications fonctionnelles | Spécif Fonctionnelles | 8h |
| T1.2.3 | Histoires utilisateur | Histoires Utilisateur | 8h |
| T1.2.4 | Diagrammes d'activité | Diagrammes | 8h |

#### Semaine 3 : Conception Technique

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T1.3.1 | Conception de la base de données | Schéma ERD | 8h |
| T1.3.2 | Diagrammes de classes | Diagrammes UML | 8h |
| T1.3.3 | Diagrammes de séquences | Diagrammes de Séquences | 8h |
| T1.3.4 | Définition de l'architecture | Doc Architecture | 8h |

**Sous-total Phase 1** : 32 heures

### 5.2 Phase 2 : Développement Backend (Semaines 4-8)

#### Semaine 4 : Configuration & Auth

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T2.4.1 | Initialisation du projet | Projet Spring Boot | 8h |
| T2.4.2 | Configuration de la base de données | MySQL Connecté | 4h |
| T2.4.3 | Authentification JWT | Module Auth | 8h |
| T2.4.4 | Configuration de sécurité | Config Sécurité | 8h |

#### Semaines 5-6 : Modules PRINCIPAUX

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T2.5.1 | Gestion des utilisateurs CRUD | Controller/Service Utilisateur | 8h |
| T2.5.2 | Gestion des candidats | Module Candidats | 8h |
| T2.5.3 | Gestion des superviseurs | Module Superviseurs | 8h |
| T2.5.4 | Gestion des projets | Module Projets | 8h |
| T2.6.1 | Workflow des candidatures | Module Candidatures | 8h |
| T2.6.2 | Transitions de statut | Logique Workflow | 8h |
| T2.6.3 | Gestion des quiz | Module Quiz | 8h |
| T2.6.4 | Correction automatique | Logique de Correction | 8h |

#### Semaine 7 : Moteur IA

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T2.7.1 | Service d'analyse CV | Analyseur CV | 8h |
| T2.7.2 | Implémentation TF-IDF | Algorithme | 8h |
| T2.7.3 | Moteur de classement | Moteur de Classement | 8h |
| T2.7.4 | API d'appariement | Endpoint d'Appariement | 8h |

#### Semaine 8 : Notifications & Rapports

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T2.8.1 | Service de notifications | Module Notifications | 8h |
| T2.8.2 | API du tableau de bord | Endpoints Statistiques | 8h |
| T2.8.3 | Documentation | Docs Swagger | 8h |
| T2.8.4 | Tests et corrections | Problèmes Corrigés | 8h |

**Sous-total Phase 2** : 80 heures

### 5.3 Phase 3 : Développement Frontend (Semaines 9-12)

#### Semaine 9 : Configuration & UI d'Auth

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T3.9.1 | Configuration du projet React | Projet React | 4h |
| T3.9.2 | Configuration Tailwind | CSS Configuré | 4h |
| T3.9.3 | Page de connexion | UI Connexion | 8h |
| T3.9.4 | Page d'inscription | UI Inscription | 8h |

#### Semaine 10 : Tableau de Bord Admin

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T3.10.1 | Mise en page du tableau de bord | Mise en Page Principale | 8h |
| T3.10.2 | Navigation latérale | Navigation | 8h |
| T3.10.3 | Aperçu des statistiques | Cartes Stats | 8h |
| T3.10.4 | Intégration des graphiques | Graphiques | 8h |

#### Semaine 11 : Pages de Gestion

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T3.11.1 | Page des candidats | UI Candidats | 8h |
| T3.11.2 | Page des projets | UI Projets | 8h |
| T3.11.3 | Page des superviseurs | UI Superviseurs | 8h |
| T3.11.4 | Page des candidatures | UI Candidatures | 8h |

#### Semaine 12 : Fonctionnalités Candidat

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T3.12.1 | Formulaire de candidature | UI Postuler | 8h |
| T3.12.2 | Téléversement CV | UI Téléversement | 8h |
| T3.12.3 | Interface du quiz | UI Quiz | 8h |
| T3.12.4 | Paramètres et Profil | UI Paramètres | 8h |

**Sous-total Phase 3** : 80 heures

### 5.4 Phase 4 : Intégration et Tests (Semaines 13-15)

#### Semaine 13 : Intégration

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T4.13.1 | Intégration API | API Connecté | 8h |
| T4.13.2 | Test du flux de données | Flux Vérifié | 8h |
| T4.13.3 | Gestion des erreurs | Erreurs Gérées | 8h |
| T4.13.4 | Test de performance | Perf Vérifiée | 8h |

#### Semaine 14 : Tests Unitaires

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T4.14.1 | Tests unitaires backend | Tests Backend | 8h |
| T4.14.2 | Tests unitaires frontend | Tests Frontend | 8h |
| T4.14.3 | Tests d'intégration | Tests d'Intégration | 8h |
| T4.14.4 | Rapports de tests | Rapport de Tests | 8h |

#### Semaine 15 : UAT et Corrections

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T4.15.1 | Tests d'acceptation utilisateur | UAT | 8h |
| T4.15.2 | Identification des bugs | Liste de Bugs | 8h |
| T4.15.3 | Correction des bugs | Bugs Corrigés | 8h |
| T4.15.4 | Vérification finale | Vérifié | 8h |

**Sous-total Phase 4** : 32 heures

### 5.5 Phase 5 : Documentation et Déploiement (Semaines 16-18)

#### Semaine 16 : Documentation Technique

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T5.16.1 | Documentation de l'architecture | Guide Architecture | 8h |
| T5.16.2 | Documentation API | Guide API | 8h |
| T5.16.3 | Guide d'installation | Guide Installation | 8h |
| T5.16.4 | Doc schéma base de données | Guide BDD | 8h |

#### Semaine 17 : Documentation Utilisateur

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T5.17.1 | Manuel utilisateur | Guide Utilisateur | 8h |
| T5.17.2 | Manuel administrateur | Guide Admin | 8h |
| T5.17.3 | Document FAQ | FAQ | 8h |
| T5.17.4 | Guide de démarrage rapide | Démarrage Rapide | 8h |

#### Semaine 18 : Finalisation

| Tâche | Description | Livrable | Heures |
|-------|-------------|----------|--------|
| T5.18.1 | Rédaction du rapport de stage | Rapport | 8h |
| T5.18.2 | Nettoyage du code | Code Propre | 4h |
| T5.18.3 | Préparation de la présentation | Diapositives | 8h |
| T5.18.4 | Revue finale | Revue Finale | 8h |

**Sous-total Phase 5** : 36 heures

### 5.6 Résumé des Heures Totales

| Phase | Heures |
|-------|-------|
| Phase 1 : Analyse et Conception | 32h |
| Phase 2 : Développement Backend | 80h |
| Phase 3 : Développement Frontend | 80h |
| Phase 4 : Intégration et Tests | 32h |
| Phase 5 : Documentation | 36h |
| **TOTAL** | **260h** |

---

## 6. SPÉCIFICATIONS TECHNIQUES

### 6.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE DE L'APPLICATION                │
├─────────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────────┐    │
│   │                 FRONTEND (React)                     │    │
│   │   Pages → Composants → API → Contexte                  │    │
│   └────────────────────────┬─────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│   ┌──────────────────────────────────────────────────────┐    │
│   │              API REST (JSON)                         │    │
│   │   Endpoints → Contrôleurs → Services                │    │
│   └────────────────────────┬─────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│   ┌──────────────────────────────────────────────────────┐    │
│   │           BACKEND (Spring Boot)                        │    │
│   │   Controller → Service → Repository → Entité            │    │
│   └────────────────────────┬─────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│   ┌──────────────────────────────────────────────────────┐    │
│   │              BASE DE DONNÉES (MySQL)                   │    │
│   │   Entités → JPA → SQL                                  │    │
│   └──────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Schéma de Base de Données

**12 Tables Interconnectées** :

| Table | But | Champs Clés |
|-------|-----|------------|
| users | Comptes utilisateurs | id, email, password, role_id |
| roles | Rôles utilisateurs | id, name |
| candidates | Profils candidats | id, user_id, skills, cv_path |
| supervisors | Profils superviseurs | id, user_id, department, capacity |
| projects | Idées de projets | id, supervisor_id, title, description |
| applications | Workflow des candidatures | id, candidate_id, project_id, status |
| quizzes | Définitions de quiz | id, title, duration, passing_score |
| quiz_questions | Questions de quiz | id, quiz_id, question, options, correct_answer |
| quiz_attempts | Résultats de quiz | id, candidate_id, quiz_id, score |
| notifications | Alertes | id, user_id, message, read |
| audit_logs | Suivi des activités | id, user_id, action, timestamp |
| ai_rankings | Scores IA | id, candidate_id, project_id, score |

### 6.3 Points d'API

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription candidat
- `POST /api/auth/refresh` - Rafraîchissement token

#### Utilisateurs
- `GET /api/users` - Liste tous les utilisateurs (Admin)
- `POST /api/users` - Créer utilisateur (Admin)
- `PUT /api/users/{id}` - Mettre à jour utilisateur
- `DELETE /api/users/{id}` - Supprimer utilisateur

#### Candidats
- `GET /api/candidates` - Liste candidats
- `POST /api/candidates` - Créer candidat
- `PUT /api/candidates/{id}` - Mettre à jour profil
- `POST /api/candidates/upload-cv` - Téléverser CV

#### Projets
- `GET /api/projects` - Liste projets
- `POST /api/projects` - Créer projet
- `PUT /api/projects/{id}` - Mettre à jour projet
- `DELETE /api/projects/{id}` - Supprimer projet

#### Candidatures
- `POST /api/applications` - Soumettre candidature
- `GET /api/applications` - Liste candidatures
- `PUT /api/applications/{id}/status` - Mettre à jour statut

#### Quiz
- `GET /api/quizzes` - Liste quiz
- `POST /api/quizzes/{id}/submit` - Soumettre quiz

#### IA
- `GET /api/ai/match/{candidateId}` - Obtenir appariements
- `GET /api/ai/rankings` - Obtenir classements

#### Tableau de Bord
- `GET /api/dashboard/stats` - Obtenir statistiques

### 6.4 Implémentation de Sécurité

| Fonctionnalité | Implémentation |
|----------------|----------------|
| Authentification | JWT avec tokens de rafraîchissement |
| Hachage de mot de passe | BCrypt (facteur de coût 10) |
| Autorisation | Contrôle d'accès basé sur les rôles (RBAC) |
| Limitation de débit | 10 requêtes/minute/IP |
| CORS | Origins configurables |
| Protection XSS | Assainissement des entrées |
| Injection SQL | Requêtes paramétrées |
| Journalisation d'audit | Toutes les actions journalisées |

### 6.5 Rôles Utilisateurs

| Rôle | Permissions |
|------|--------------|
| ADMIN | Accès complet au système, gestion utilisateurs, paramètres |
| MANAGER | Gestion projets, accès IA, rapports |
| REJETIONNISTE | Gestion candidatures, accès candidats |
| CANDIDATE | Postuler, passer quiz, voir statut |

---

## 7. MÉTHODOLOGIE ET APPROCHE

### 7.1 Méthodologie de Développement

**Approche Agile/Scrum** adaptée au contexte de stage :

| Principe | Application |
|---------|-------------|
| Développement itératif | Sprints de 2 semaines |
| Livraison incrémentale | Par fonctionnalités |
| Retour continu | Réunions hebdomadaires avec superviseur |
| Documentation d'abord | Conception avant code |
| Tests intégrés | Test-driven quand possible |

### 7.2 Structure du Sprint

```
┌─────────────────────────────────────────────────────────────────┐
│                   STRUCTURE DU SPRINT                         │
├──────────────────────────────────────────────────────────────┤
│ Jour 1-2    │  Planification et Exigences                   │
│ Jour 3-8    │  Développement                                │
│ Jour 9      │  Test Interne                               │
│ Jour 10     │  Revue et Démo                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.3 Cérémonies Clés

| Cérémonie | Fréquence | Durée |
|----------|-----------|-------|
| Planification de sprint | Bimensuel | 1 heure |
| Standup quotidien | Quotidien | 15 minutes |
| Revue de sprint | Bimensuel | 30 minutes |
| Rétrospective | Bimensuel | 15 minutes |
| Réunion superviseur | Hebdomadaire | 1 heure |

### 7.4 Outils et Collaboration

| But | Outil |
|-----|-------|
| Contrôle de version | Git et GitHub |
| Gestion de projet | Trello/Tableau |
| Documentation | Markdown/Confluence |
| Communication | Email/Slack |
| Revue de code | GitHub PRs |
| Documentation API | Swagger/OpenAPI |

---

## 8. CALENDRIER ET DIAGRAMME DE GANTT

### 8.1 Calendrier Détailé

```
┌────────────┬─────────────────────────────────────────────────────────────────────────────┐
│   SEMAINE   │  RÉSUMÉ DES TÂCHES                                                │
├────────────┼─────────────────────────────────────────────────────────────────────────────┤
│  Semaine 1  │  Analyse des Exigences                                           │
│  Semaine 2  │  Conception Fonctionnelle                                          │
│  Semaine 3  │  Conception Technique                                            │
│  Semaine 4  │  Configuration Backend et Auth                                   │
│  Semaine 5  │  Développement Modules Principaux                                 │
│  Semaine 6  │  Workflow et Quiz                                                 │
│  Semaine 7  │  Implémentation Moteur IA                                         │
│  Semaine 8  │  Notifications et Rapports                                      │
│  Semaine 9  │  Configuration Frontend et UI Auth                               │
│  Semaine 10  │  Tableau de Bord Admin                                           │
│  Semaine 11  │  Pages de Gestion                                                │
│  Semaine 12  │  Fonctionnalités Candidat                                       │
│  Semaine 13  │  Intégration                                                    │
│  Semaine 14  │  Tests Unitaires                                               │
│  Semaine 15  │  UAT et Correction des Bugs                                     │
│  Semaine 16  │  Documentation Technique                                        │
│  Semaine 17  │  Documentation Utilisateur                                      │
│  Semaine 18  │  Rapport Final et Soutenance                                     │
└────────────┴─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Diagramme de Gantt

```
TÂCHE                  │ JAN   │ FEV   │ MAR   │ AVR   │ MAI   │ JUN   
───────────────────────┼───────┼───────┼───────┼───────┼───────┼───────│
Phase 1: Analyse      │ ████  │       │       │       │       │       │
Phase 2: Backend       │  ████████ │       │       │       │       │
Phase 3: Frontend      │       │  ████████ │       │       │       │
Phase 4: Tests         │       │       │  ████  │       │       │       
Phase 5: Doc           │       │       │       │ ████████ │       │       
Soutenance             │       │       │       │       │       │  ██   │
```

### 8.3 Jalons

| Jalon | Date | Livrable |
|-------|------|----------|
| M1: Exigences Complètes | Semaine 3 | Rapport d'Analyse |
| M2: Backend Complet | Semaine 8 | API REST Prête |
| M3: Frontend Complet | Semaine 12 | UI Complète |
| M4: Tests Complets | Semaine 15 | Tous les Tests Réussis |
| M5: Déploiement Prêt | Semaine 17 | Documentation Complète |
| M6: Soutenance | Semaine 18 | Présentation Finale |

---

## 9. ANALYSE DES RISQUES

### 9.1 Matrice d'Évaluation des Risques

```
                    │ IMPACT
                    │  FAIBLE   MOYEN     ÉLEVÉ
────────────┼───────────────────────────────────────────────
FRÉQUENCE  │ FAIBLE  │    │     │      │
            │        │  1   │   2   │   3  │
            ├────────┼────────────────────────────────────────
            │ MOYEN  │    │     │      │
            │        │  2   │   4   │   6  │
            ├────────┼────────────────────────────────────────
            │ ÉLEVÉ │    │     │      │
            │        │  3   │   6   │   9  │
```

### 9.2 Risques Identifiés

| ID | Risque | Probabilité | Impact | Sévérité | Mitigation |
|----|------|-------------|--------|----------|------------|
| R1 | Augmentation de la portée | Moyen | Élevé | 6 | Exigences claires, contrôle des changements |
| R2 | Complexité technique | Élevé | Moyen | 6 | Planification appropriée, recherche |
| R3 | Retards de délai | Élevé | Élevé | 9 | Temps tampon, priorisation |
| R4 | Disponibilité API | Faible | Élevé | 3 | Fallback IA local |
| R5 | Perte de données | Faible | Élevé | 3 | Sauvegardes régulières |
| R6 | Problèmes de sécurité | Moyen | Élevé | 6 | Audits de sécurité |
| R7 | Problèmes d'intégration | Moyen | Moyen | 4 | Intégration précoce |
| R8 | Changements parties prenantes | Moyen | Moyen | 4 | Communication régulière |

### 9.3 Plans de Contingence

| Risque | Contingence |
|--------|-----------|
| Retards de délai | Réduire la portée, prioriser les fonctionnalités |
| Problèmes techniques | Chercher de l'aide, rechercher des alternatives |
| API non disponible | Utiliser l'algorithme local |
| Violation de sécurité | Plan de réponse immédiat |

---

## 10. PRÉREQUIS

### 10.1 Prérequis Techniques

| Compétence | Niveau Requis | Description |
|-----------|-------------|-------------|
| Programmation Java | Intermédiaire | Concepts POO, collections, streams |
| Spring Boot | Intermédiaire | REST APIs, JPA, Sécurité |
| MySQL | Intermédiaire | Conception de schéma, requêtes |
| HTML/CSS | Intermédiaire | Design réactif |
| JavaScript | Intermédiaire | ES6+, async/await |
| React.js | Intermédiaire | Composants, hooks, état |
| REST API | Intermédiaire | Modèles de conception |
| Git | Intermédiaire | Contrôle de version |
| UML | Basique | Diagrammes de classes, cas d'utilisation |

### 10.2 Prérequis de Connaissances

- Cycle de développement logiciel
- Modèles de conception orientée objet
- Normalisation de base de données
- Meilleures pratiques de sécurité web
- Méthodologies de test
- Bases de gestion de projet

### 10.3 Prérequis Personnels

| Prérequis | Description |
|-----------|-------------|
| Autonomie | Apprentissage autonome |
| Proactivité | Prendre des initiatives |
| Gestion du temps | Respecter les délais |
| Communication | Expression claire |
| Résolution de problèmes | Pensée analytique |
| Adaptabilité | Apprentissage de nouvelles technologies |

### 10.4 Prérequis d'Environnement

| Outil | Version | But |
|------|---------|-----|
| JDK | 17+ | Environnement Java |
| Node.js | 18+ | Runtime JavaScript |
| MySQL | 8.0+ | Base de données |
| Maven | 3.8+ | Build Java |
| IntelliJ IDEA | Dernière | IDE |
| VSCode | Dernière | IDE |
| Git | 2.30+ | Contrôle de version |

---

## 11. RESSOURCES REQUISES

### 11.1 Ressources Matérielles

| Ressource | Spécification | Quantité | Statut |
|----------|--------------|----------|--------|
| Ordinateur portable | Core i7, 16Go RAM, SSD 512Go | 1 | Fourni |
| Écran | 24" Full HD | 1 | Disponible |
| Souris | Sans fil | 1 | Disponible |
| Clavier | Externe | 1 | Disponible |

### 11.2 Ressources Logicielles

| Ressource | Licence | But |
|----------|---------|-----|
| Spring Boot 3.2 | Open Source | Framework Backend |
| React 18 | Open Source | Framework Frontend |
| MySQL 8.0 | Open Source | SGBD |
| Tailwind CSS 3.x | Open Source | Framework CSS |
| IntelliJ IDEA CE | Gratuit | IDE |
| GitHub | Gratuit | Hébergement du code |

### 11.3 Ressources Humaines

| Ressource | Rôle | Disponibilité |
|----------|------|--------------|
| Rahma Bouaziz | Superviseur Professionnel | Hebdomadaire |
| Équipe IT | Support Technique | Au besoin |
| Jury Académique | Évaluation | Fin de stage |

### 11.4 Ressources Documentaires

- Documentation Officielles Spring Boot
- Documentation React
- Manuel de Référence MySQL
- Guides de Sécurité JWT
- Ressources IA/ML

### 11.5 Ressources d'Infrastructure

| Ressource | But | Accès |
|----------|-----|-------|
| Dépôt GitHub | Stockage du code | Accès complet |
| Serveur de Développement | Tests | Local |
| Serveur de Base de Données | Développement | Local |
| Documentation API | Référence | En ligne |

---

## 12. DÉVELOPPEMENT DES COMPÉTENCES

### 12.1 Compétences Techniques

| ID | Compétence | Description | Niveau Cible |
|----|------------|-------------|-------------|
| TC1 | Développement Full-Stack | Développement d'applications de bout en bout | 4/5 |
| TC2 | Spring Boot | Maîtrise du framework Backend | 4/5 |
| TC3 | React.js | Développement Frontend | 4/5 |
| TC4 | Conception REST API | Architecture API | 4/5 |
| TC5 | Conception BDD | Conception et optimisation de schéma | 3/5 |
| TC6 | Bases IA/ML | Implémentation d'algorithme IA de base | 3/5 |
| TC7 | Sécurité | JWT, authentification, autorisation | 4/5 |
| TC8 | Tests | Tests unitaires et d'intégration | 3/5 |
| TC9 | Contrôle de Version | Workflow Git | 4/5 |
| TC10 | Documentation | Rédaction technique | 4/5 |

### 12.2 Compétences Transversales

| ID | Compétence | Description | Niveau Cible |
|----|------------|-------------|-------------|
| TC11 | Analyse | Analyse des exigences | 4/5 |
| TC12 | Résolution de Problèmes | Résolution de problèmes | 4/5 |
| TC13 | Communication | Communication professionnelle | 4/5 |
| TC14 | Gestion du Temps | Gestion des délais | 4/5 |
| TC15 | Autonomie | Travail indépendant | 4/5 |
| TC16 | Travail en Équipe | Compétences collaboratives | 3/5 |
| TC17 | Adaptabilité | Apprentissage de nouvelles compétences | 4/5 |
| TC18 | Proactivité | Prise d'initiatives | 4/5 |

### 12.3 Plan de Développement des Compétences

```
SEMAINE  │ ACCENT TECHNIQUE                │ ACCENT TRANSVERSAL
────────┼──────────────────────────────────┼───────────────────────────
Semaine 1│ Révision Java, Intro Spring   │ Analyse des exigences
Semaine 2│ Conception API REST         │ Définition de problème
Semaine 3│ Conception BDD               │ Communication
Semaine 4│ Sécurité JWT                │ Compétences de planification
Semaine 5│ Opérations CRUD             │ Gestion du temps
Semaine 6│ Logique métier             │ Orientation détail
Semaine 7│ Algorithme IA              │ Compétences de recherche
Semaine 8│ Documentation API         │ Documentation
Semaine 9│ Bases React               │ Sensibilité UI/UX
Semaine 10│ Conception composants      │ Pensée par composants
Semaine 11│ Gestion d'état           │ Compétences de débogage
Semaine 12│ Intégration              │ Pensée bout-en-bout
Semaine 13│ Tests d'intégration     │ Mentalité de test
Semaine 14│ Tests unitaires        │ Focus qualité
Semaine 15│ Correction bugs       │ Résolution de problèmes
Semaine 16│ Revue de code        │ Apprentissage entre pairs
Semaine 17│ Préparation présentat│ Expression orale
Semaine 18│ Soutenance            │ Communication professionnelle
```

### 12.4 Méthodes d'Évaluation

| Compétence | Méthode d'Évaluation |
|-----------|-------------------|
| Compétences Techniques | Revue de code, tests de fonctionnalité |
| Résolution de Problèmes | Qualité de résolution des problèmes |
| Communication | Notes de réunion, documentation |
| Gestion du Temps | Respect des délais |
| Autonomie | Niveau d'indépendance |
| Travail en Équipe | Retour de collaboration |

---

## 13. LIVRABLES

### 13.1 Livrables Principaux

| # | Livrable | Description | Format |
|---|---------|-------------|--------|
| D1 | Application SIPMS | Application web complète | Code Source |
| D2 | Documentation Technique | Architecture système et docs API | Markdown/PDF |
| D3 | Guide Utilisateur | Documentation utilisateur final | PDF |
| D4 | Rapport de Stage | Rapport détaillé du projet | PDF |

### 13.2 Livrables Secondaires

| # | Livrable | Description | Format |
|---|---------|-------------|--------|
| D5 | Document d'Exigences | Spécifications fonctionnelles | Word/PDF |
| D6 | Schéma Base de Données | ERD et schéma | Image/SQL |
| D7 | Documentation API | Swagger/OpenAPI | HTML |
| D8 | Rapports de Tests | Résultats des tests | PDF |
| D9 | Diapositives de Présentation | Présentation de soutenance | PowerPoint |

### 13.3 Standards de Qualité des Livrables

| Livrable | Standard de Qualité |
|---------|-------------------|
| Code | Propre, commenté, testé |
| Documentation | Complet, clair, professionnel |
| Tests | Couverture > 80% |
| UI | Réactif, accessible |

### 13.4 Contrôle de Version

Tous les livrables stockés dans :
- **Dépôt GitHub** : Stockage principal du code
- **Google Drive** : Stockage/backup
- **Local** : Copies de travail

---

## 14. CRITÈRES D'ÉVALUATION

### 14.1 Composantes d'Évaluation

| Composante | Pondération |
|-----------|-----------|
| Fonctionnalité de l'Application | 30% |
| Qualité Technique | 20% |
| Documentation | 20% |
| Présentation | 15% |
| Innovation | 10% |
| Comportement Professionnel | 5% |

### 14.2 Échelle de Notation

```
┌─────────────────────────────────────────────────────────┐
│                   ÉCHELLE DE NOTATION                        │
├───────────────┬──────────────────────────────────────────┤
│   Note       │   Description                             │
├───────────────┼──────────────────────────────────────────┤
│   A (90-100)│   Excellent - Dépasse les attentes      │
│   B (80-89) │   Très Bien - Répond aux attentes      │
│   C (70-79) │   Bien - Répond mostly aux attentes  │
│   D (60-69) │   Satisfaisant - Répond au minimum    │
│   F (<60)   │   Insatisfaisant - En dessous des attentes│
└───────────────┴──────────────────────────────────────────┘
```

### 14.3 Critères d'Évaluation Détaillés

| Critère | Indicateurs | Pondération |
|-----------|------------|-----------|
| Fonctionnalité | Toutes les fonctionnalités marchent, répond aux exigences | 30% |
| Qualité du Code | Propre, documenté, testé | 20% |
| Documentation | Complet, clair | 20% |
| Présentation | Clair, professionnel | 15% |
| Innovation | Solutions créatives | 10% |
| Professionnalisme | Communication, délais | 5% |

### 14.4 Critères de Succès

| Métrique | Cible |
|---------|-------|
| Fonctionnalités Implémentées | 100% |
| Couverture de Tests | >80% |
| Documentation | 100% |
| Livraison dans les Temps | 100% |
| Satisfaction Utilisateur | >85% |

---

## 15. ANNEXES

### Annexe A : Glossaire

| Terme | Définition |
|-------|----------|
| **API** | Interface de Programmation d'Application |
| **BCrypt** | Algorithme de hachage de mot de passe |
| **CRUD** | Créer, Lire, Mettre à jour, Supprimer |
| **CSS** | Feuilles de Style en Cascade |
| **DTO** | Objet de Transfert de Données |
| **ERD** | Diagramme Entité-Relation |
| **HTML** | Langage de Balisage HyperTexte |
| **HTTP** | Protocole de Transfert HyperTexte |
| **JPA** | API de Persistance Java |
| **JSON** | Notation d'Objet JavaScript |
| **JWT** | Jeton Web JSON |
| **MySQL** | Système de Gestion de Base de Données Relationnel |
| **POO** | Programmation Orientée Objet |
| **RBAC** | Contrôle d'Accès Basé sur les Rôles |
| **REST** | Transfert d'État Représentatif |
| **SQL** | Langage de Requête Structuré |
| **TF-IDF** | Term Frequency-Inverse Document Frequency |
| **UAT** | Test d'Acceptation Utilisateur |
| **UML** | Langage de Modélisation Unifié |

### Annexe B : Acronymes

| Acronyme | Forme Complète |
|---------|----------|
| **API** | Interface de Programmation d'Application |
| **CDN** | Réseau de Distribution de Contenu |
| **CI/CD** | Intégration/Déploiement Continus |
| **CMS** | Système de Gestion de Contenu |
| **CRM** | Gestion de la Relation Client |
| **DNS** | Système de Noms de Domaine |
| **ERP** | Planification des Ressources d'Entreprise |
| **HTML** | Langage de Balisage HyperTexte |
| **IoT** | Internet des Objets |
| **IT** | Technologies de l'Information |
| **JS** | JavaScript |
| **JSON** | Notation d'Objet JavaScript |
| **MVP** | Produit Minimum Viable |
| **ORM** | Mapping Objet-Relationnel |
| **PDF** | Format de Document Portable |
| **QA** | Assurance Qualité |
| **SaaS** | Logiciel en Tant que Service |
| **SEO** | Optimisation pour les Moteurs de Recherche |
| **SQL** | Langage de Requête Structuré |
| **SSH** | Shell Sécurisé |
| **SSL** | Couche de Sockets Sécurisée |
| **UI/UX** | Interface Utilisateur / Expérience Utilisateur |
| **URL** | Localisateur de Ressources Uniforme |
| **VCS** | Système de Contrôle de Version |

### Annexe C : Références

1. Documentation Spring Boot - https://spring.io/projects/spring-boot
2. Documentation React - https://react.dev
3. Manuel de Référence MySQL - https://dev.mysql.com/doc/
4. JWT.io - https://jwt.io/
5. Tailwind CSS - https://tailwindcss.com/
6. Swagger - https://swagger.io/

### Annexe D : Informations de Contact

| Rôle | Nom | Email |
|------|------|-------|
| Stagiaire | Ayadi Youssef | ayadi.youssef@student.iit.tn |
| Superviseur | Rahma Bouaziz | rahma.bouaziz@clinisys.tn |
| Académique | IIT Sfax | contact@iit.tn |

---

<p align="center"><strong>FIN DU DOCUMENT</strong></p>