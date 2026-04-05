# Méthodologie

Mesurer le bien-être d'un pays à l'autre est une tâche complexe qui implique de multiples facteurs socio-économiques tels que la santé, les revenus ou l'éducation, etc... Les indices traditionnels s'appuient souvent sur des systèmes de pondération définis par des experts. Une autre approche consiste à recourir à l'apprentissage automatique pour mettre en évidence les structures latentes présentes dans les données.

Ont été implémentés :

- Un pipeline d'apprentissage automatique pour l'extraction de patterns et le regroupement par clusters.
- Le calcul d'un indice composite normalisé basé sur l'agrégation et le classement par domaines (score global).

---

> [!NOTE]
> Face à des données variées et complexes. J'ai opté pour une **simplification raisonnée** des données en effectuant divers traitements pour rendre leur lecture possible et proposer une **visualisation lisible et interprétable**, qui permette d’identifier rapidement les tendances clés et les différences entre pays.

## 1. Intégration des données

Plusieurs datasets ont été combinées :

- Indicateurs de bien-être
- Produit Intérieur Brut (PIB)
- Population
- Dette publique
- Fiscalité
- Dépenses publiques

Les données ont été fusionnées via les clés : pays (Cde_Pays) et année (Année).

## 2. Nettoyage et préparation des données

Les principales étapes incluent :

- Conversion des formats numériques (virgules, espaces)
- Gestion des valeurs manquantes (certains pays sont absents de certains jeux de données)
- Filtrage des unités pertinentes (ex : dette en % du PIB)
- Création de variables dérivées (ex : ratio femmes/population)

À cette étape, ont notamment été respectés certains principes en termes de :

### 2.1 Filtrage et cohérence des unités

Certaines variables similaires coexistent avec plusieurs unités.

Exemples :

- Éviter les mélanges d’unités (euros vs %)

Une stratégie d'agrégation des données a donc été implémentée :

**Enjeu :**

- Réduire la redondance
- Faciliter la fusion des datasets

## Défi 1 : Regrouper les pays (clusters)

**Objectif :** identifier des profils de pays similaires.

### 3.1 Pipeline de prétraitement

Un pipeline structuré a été mis en place :

- Imputation médiane pour les variables numériques
- Standardisation *(StandardScaler)*
- Encodage des variables catégorielles *(OneHotEncoder)*

### 3.2 Réduction de dimension

Une Analyse en Composantes Principales (ACP) est utilisée.

### 3.3 Clustering et visualisation des groupes

Un algorithme K-Means permet ensuite de regrouper les pays et de les visualiser :

- Nombre de clusters retenus : 5

### Exemples de résultats

L'objectif est d'aboutir à une concaténation des variables déterminantes. Voici un extrait pour le premier groupe :

```csv
country,year,cluster,explanation
GRC,2002,0,debt_pct (+1.82) | GF01 (+1.82) | GF02 (+1.60) | GF08 (-1.57) | age_65_plus (+1.47)
ITA,2002,0,debt_pct (+1.82) | GF01 (+1.82) | GF02 (+1.60) | GF08 (-1.57) | age_65_plus (+1.47)
```

Interprétation:

| Feature | score | interprétation |
|-----------|-------|----------------|
| debt_pct  | +1.82 | Les pays de ce groupe ont une dette publique (en % du PIB) bien supérieure à la moyenne |
| GF01      | +1.82 | Dépenses très élevées dans cette catégorie (services publics généraux) |
| GF02      | +1.60 | Dépenses élevées en matière de défense |
| GF08      | -1.57 | Dépenses nettement inférieures dans cette catégorie (loisirs, culture, religion) |
| age_65_plus      | +1.47 | Population vieillissante|

*En résumé :* dépenses importantes dans les fonctions essentielles de l’État (GF01, GF02), avec une forte pression structurelle (population vieillissante) et un poids élevé de la dette. Les réductions ou faibles allocations aux secteurs non essentiels (GF08) permettent de supposer qu'il s'agit de pays **vulnérables** économiquement.

## Défi 2 : Calcul d'un indicateur composite (bonheur agrégé)

### 4.2 Normalisation des indicateurs

Les indicateurs ont des échelles différentes, la normalisation a été effectuée en utilisant *MinMax*. Des méthodes plus performantes existent, mais il fallait accélérer la partie coding du front-end :)

#### 2.2.1 IMPORTANT : correction de la polarité des variables négatives

Certains indicateurs sont négativement corrélés au bien-être :

- Chômage
- Criminalité
- Pollution

Il a donc fallu les inverser.

## 2.3 Agrégation par domaine

Les indicateurs sont regroupés par méta-domaines.

Exemple : pour GF01 (dépenses du service public), on regroupe tous les sous-domaines de GF01.

## 2.4 Construction de l’indice global

On s'est ici contenté d'une approche **basique** :

- Indice de bonheur agrégé = moyenne(domaines)

Un indice subjectif est également calculé.

## 2.5 Classement

Classement annuel des pays :

- Rang global (indice de bonheur)
- Rang subjectif (indice de bonheur perçu)

Ce sont ces indices et rangs qui seront récupérés par le back-end de l'application.

**Note :** L'appli web (front) est codée en JS (D3.js) et HTML/CSS. Source d'inspiration: [Ben Scott](https://www.nature.com/nature-index/news/data-visualization-these-are-the-happiest-countries-world-happiness-report-twenty-nineteen).
