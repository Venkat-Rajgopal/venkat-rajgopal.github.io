---
title: "Essential SQL"
excerpt: "Curating some common and essential SQL queries."
date: 2018-10-13
categories:
  - blog
tags: 
 - [SQL]
comments: true
---

In this post i am collating some basic SQL queries. The post is intented to keep really easy to understand without having to go through any practice. Some queries i have referenced to R or Python for quick comparison.  

This post covers the following, 


- [Selecting Columns](#1-Selecting-Columns)
- [Filtering rows](#2-Filtering-rows)
- [Aggregate](#3-Aggregate-functions)
- [Sorting and Grouping](#4-Sorting-and-Grouping)


We use a two dummy databases, **FILMS** and **PEOPLE** ,  just to make the syntaxing easy to understand. 

****
The sample **PEOPLE** data set looks like this: 


id | name | birthdate | deathdate
------- | ------- | ------- | -------
1 | 50 Cent | 1975-07-06 | null
2 | A. Michael Baldwin | 1963-04-04 | null
3 | A. Raven Cruz | null | null
4 | A.J. DeLucia | null | null
5 | A.J. Langer | 1974-05-22 | null
6 | Aaliyah | 1979-01-16 | 2001-08-25
7 | Aaron Ashmore | 1979-10-07 | null


**FILMS** database. 

id | title | release_year | country | duration | language | certification | gross | budget
---|-------|--------------|---------|----------|----------|---------------|-------|-------
1 | Intolerance: Love's Struggle Throughout the Ages | 1916 | USA | 123 | null | Not Rated | null | 385907
2 | Over the Hill to the Poorhouse | 1920 | USA | 110 | null | null | 3000000 | 100000




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
`WHERE` can be messy at times for multiple filtering. Hence the `IN` operator. The IN operator allows to specify multiple values in a WHERE clause, making it easier and quicker to specify multiple `OR` conditions! 

The following query gets the title and release year of all films released in 1990 or 2000 that were longer than two hours. 

```sql
SELECT release_year, title
FROM films
WHERE release_year IN (1990, 2000)
AND duration > 120;
```

### `NULL` and `IS NULL` operator
NULL represents a missing or unknown value. Check for NULL values is done using the expression `IS NULL`. 

Filtering out missing values is simply `IS NOT NULL`. 

> For eg: Title of all films which doesnt have a budget associated with it.

```sql
SELECT title
FROM films
WHERE budget IS NULL;
```

### `LIKE` and `NOT LIKE` operator
`LIKE` facilitates searching for patterns rather than a specific text string. 

The LIKE operator can be used in a WHERE clause to search for a pattern in a column. To accomplish this, we use something called a wildcard as a placeholder for some other values. 

The two wildcards can be used with LIKE: 
`%` and `_` . 

> `%` matches to zero or many characters in text. This query matches queries like Datascience, Datacomp etc.

```sql
SELECT name
FROM companies
WHERE name LIKE 'Data%';
```
Names that do not start with 'Data' we can write, `WHERE name NOT LIKE 'Data%';`.
****

## 3. Aggregate functions
This third section deals with some calculations on data in a database.

As expected these are `AVG`, `MAX`, `SUM` functions. 

> SUM function to get the total amount grossed by all films made in the year 2000 or later:

```sql
SELECT SUM(gross)
FROM films
WHERE release_year >= 2000;
```
> Amount grossed by the best performing film between 2000 and 2012, inclusive. 

```sql
SELECT MAX(gross)
FROM films
WHERE release_year BETWEEN 2000 and 2012;
```

### Alising
Aliasing simply means you assign a temporary name to something. To alias, you use the `AS` keyword. 

> Getting the average duration in hours for all films, aliased as avg_duration_hours.

```sql
SELECT AVG(duration) / 60.0 AS avg_duration_hours
FROM films;
```
***

## 4. Sorting and Grouping

### 'ORDER BY'
ORDER BY keyword is used to sort results in ascending or descending order according to the values of one or more columns. `ORDER BY` sort by default by ascending order. 

```sql
SELECT title
FROM films
ORDER BY release_year DESC;
```

### Sorting single columns
To order results in descending order, simply put the keyword `DESC` after your ORDER BY. 

`ORDER BY` can also be used to sort on multiple columns. It will sort by the first column specified, then sort by the next, then the next, and so on. 


> The birth date and name of people in the people table, in order of when they were born and alphabetically by name.

```sql
SELECT birthdate, name
FROM people
ORDER BY birthdate, name
```

### `GROUP BY`
This applows you to aggregate results by one or more columns. 

Commonly, `GROUP BY` is used with aggregate functions like COUNT() or MAX(). Note that `GROUP BY` always goes after the FROM clause. 

> Getting the release year and count of films realesed from each year. 

```sql
SELECT release_year, count(*)
FROM films
GROUP BY release_year
ORDER BY count DESC;
```

> Getting the release year, country, and highest budget spent making a film for each year, for each country. Sort results by release year and country.

```sql
SELECT release_year, country, MAX(budget)
FROM films
GROUP BY release_year, country
ORDER BY release_year, country;
```

Also, aggregate functions can't be used in `WHERE` clauses. The below is **invalid**. 

```sql
SELECT release_year
FROM films
GROUP BY release_year
WHERE COUNT(title) > 10;
```

For this we use `HAVING` clause. 

```sql
SELECT release_year
FROM films
GROUP BY release_year
HAVING COUNT(title) > 10;
```

> Query that returns the average budget and average gross earnings for films in each year after 1990, if the average budget is greater than $60 million. 

```sql
SELECT release_year, AVG(budget) AS avg_budget, AVG(gross) AS avg_gross
FROM films
WHERE release_year > 1990
GROUP BY release_year
HAVING AVG(budget) > 60000000
ORDER BY avg_gross DESC
```

> Get the country, average budget, and average gross take of countries that have made more than 10 films. Order the result by country name, and limit the number of results displayed to 5. 

```sql
SELECT country, AVG(budget) AS avg_budget, AVG(GROSS) AS avg_gross
FROM films
GROUP BY country 
HAVING count(title) > 10 
ORDER BY country
LIMIT 5;
```
---
That is it for now. More intermediate and advanced stuff on joins, pivots to be looked upon later. 

***
## Resources and Further exercises
[Data Camp - Intro to SQL for Data Science](https://www.datacamp.com/courses/intro-to-sql-for-data-science)

[Data World](https://docs.data.world/documentation/sql/concepts/basic/intro.html) also has a bunch of intermediate and advanced terms on SQL. 



