---
layout: single
author_profile: true
title: "Essential SQL"
excerpt: "Curating some common and essential SQL queries."
date: 2018-10-13
tags: [SQL]
comments: true
---

In this post i am collating some basic SQL queries. The post is intented to keep really easy to understand without having to go through any practice. Some queries i have referenced to R or Python for quick comparison. I hope to update this as and when i come across new things. 

We use a dummy data just to make the syntaxing easy to understand. 

****
## Selecting Columns

Every query will have at least these two parts: `SELECT` and `FROM`.

- The SELECT statement is where you put the columns for which you would like to show the data. 
- The FROM statement is where you put the tables from which you would like to pull data.

 A query is a request for data from a database table (or combination of tables). For example querying all from the `people` is given as,

```sql
SELECT *
FROM people;
```
### Selecting multiple columns
Also multiple choosing of values in allowed for example, selecting two columns, `name` and `birthdate`, from the `people` table:

```sql
SELECT name, birthdate
FROM people;
```

 *Note:*  that it is common practice to capitalize commands (SELECT, FROM), and keep everything else in your query lowercase. This makes queries easier to read. However queries are not case sensitive. For example this query,

```sql
SELECT ID
FROM ORDERS;
```
is the same as 

```sql
select id
from orders;
```

### Limiting selection
In case you want to look just a few rows of a data, we use the `LIMIT` which gets written at the end of the query. *Note:* This works similar to R and Python's `head()` function. Here's an example. 

```sql
SELECT *
FROM people
LIMIT 10;
```

### Selecting Unique 
Often results will include many duplicate values. To select all the unique values from a column, use the `DISTINCT` keyword. This works similar to R's `unique()` and numpys `np.unique()`.

```sql
SELECT DISTINCT language
FROM films;
```

### Counting
The COUNT statement returns the number of rows in one or more columns.
```sql 
SELECT COUNT(*)
FROM people;
```
It's also common to combine COUNT with DISTINCT to count the number of distinct values in a column. Counting the number of distinct birth dates contained in the people table:

```sql
SELECT COUNT(DISTINCT birthdate)
FROM people;
```

****
## Filtering rows
The `WHERE` keyword allows filtering based on both text and numeric values in a table. The common different comparison operators are similar to that of R or Python.  The following code returns all films with the title 'Metropolis':

```sql
SELECT title
FROM films
WHERE title = 'Metropolis';
```
 *Note:* `!=` is the not equal operator as per the SQL standard. 

