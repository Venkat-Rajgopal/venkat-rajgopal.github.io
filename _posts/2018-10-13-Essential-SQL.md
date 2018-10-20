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
## 1. Selecting Columns

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
## 2. Filtering rows
The `WHERE` keyword allows filtering based on both text and numeric values in a table. The common different comparison operators are similar to that of R or Python.  The following code returns all films with the title 'Metropolis':

```sql
SELECT title
FROM films
WHERE title = 'Metropolis';
```
 *Note:* `!=` is the not equal operator as per the SQL standard. 
`WHERE` clause can also be used to filter text results, such as names or countries.

### Using `WHERE AND`
This involves selecting based on multiple conditions. `WHERE` can be easily combined with `AND`. 

```sql
SELECT title
FROM films
WHERE release_year > 1994
AND release_year < 2000;
```
### Using `WHERE OR`
`OR` allows to select rows based on multiple conditions where some but not all of the conditions need to be met. 

_Note_: Column name for every `OR` needs to be specified. 

```sql
SELECT title
FROM films
WHERE release_year = 1994
OR release_year = 2000;
```
Combining `AND` `OR`, make sure to enclose the individual clauses in parenthesis:

```sql
SELECT title
FROM films
WHERE (release_year = 1994 OR release_year = 1995)
AND (certification = 'PG' OR certification = 'R');
```

### `BETWEEN`
Checking for ranges is common in SQL. `BETWEEN` keyword provides a useful shorthand for filtering values within a specified range.

```sql
SELECT title
FROM films
WHERE release_year
BETWEEN 1994 AND 2000;
```

Here's a full working example of using multiple queries.

> Using `BETWEEN` with `AND` on the films data to get the title and release year of all Spanish or French language films released between 1990 and 2000 (inclusive) with budgets over $100 million. This can be expressed as:

```sql
SELECT title, release_year
FROM films
WHERE release_year
BETWEEN 1990 and 2000
AND budget > 100000000
AND (language = 'Spanish' or language = 'French')
```

### `WHERE IN` operator
`WHERE` can be messy at times for multiple filtering. 