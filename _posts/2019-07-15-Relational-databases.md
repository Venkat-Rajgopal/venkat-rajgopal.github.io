---
layout: single
author_profile: true
title: "Relational Databases"
excerpt: "Quering a relational database."
date: 2019-07-08
tags: [RDBMS]
comments: true
---

## Introduction
This section focuses on using Relational databases, like creating Tables, Truncating values and eplore unique features of a Database. This post we cover the following part of querying through a relational database. 

- [Type Casting](#Type-Casting)
- [Not null constraints](#Not-null-and-unique-constraints)
- [Keys and Superkeys](#keys-and-superkeys)

## Type Casting

```sql
-- Calculate the net amount as amount + fee
SELECT transaction_date, amount + CAST(fee AS integer) AS net_amount 
FROM transactions;
````

# 
### Data types

```sql
-- Select the university_shortname column
SELECT DISTINCT professors.university_shortname
FROM professors;
```

```sql
-- Specify the correct fixed-length character type
ALTER TABLE professors
ALTER COLUMN university_shortname
TYPE char(3);
```

Truncating values 
```sql
-- Convert the values in firstname to a max. of 16 characters
ALTER TABLE professors 
ALTER COLUMN firstname 
TYPE varchar(16)
USING SUBSTRING(firstname FROM 1 FOR 16)
```
### Not-null and unique constraints
The not-null constraint disallows null values from a column. Disallowing NULL values in `firstname` we use, 

```sql
ALTER TABLE professors 
ALTER COLUMN firstname SET NOT NULL;
```
Adding a unique constraint to an *existing* table, in this case 'universities' table is done as, 

```sql
ALTER TABLE universities
ADD CONSTRAINT university_shortname_unq UNIQUE(university_shortname);
```
Unique table is assigned as `university_shortname_unq`. 


## Keys and Superkeys
Distinct record of all possible combinations 

```sql
SELECT COUNT(DISTINCT(firstname, lastname, university_shortname)) 
FROM professors;
```



