---
title: "Relational Databases"
excerpt: "Quering a relational database."
date: 2019-07-08
categories:
  - blog
tags: 
 - [RDBMS]
comments: true
---

# Introduction
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

****
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

The main purpose of Primary keys is to uniquely identifying records from a table. These keys are *time-invariant*, i.e they should hold not only for the current data but also for any future data entries in the table. Specifying Primary key upon table creation takes the form (the latter), 

```sql
CREATE TABLE products (
    product_no integer UNIQUE NOT NULL,
    name text,
    price numeric 
);

CREATE TABLE products (
    product_no integer PRIMARY KEY,
    name text,
    price numeric 
);
```
So specifying a primary keys to existing table is the same as adding unique constraints as above. 

```sql
ALTER TABLE table_name
ADD CONSTRAINT some_name PRIMARY KEY (column_name)
```

### Adding Key constraints to tables.
Lets specify primary key constraints for organization columns, form the organization table and rename it to id. 
```sql
ALTER TABLE organizations
RENAME COLUMN organization TO id;
```
and make `id` as the Primary Key. 

```sql
ALTER TABLE organizations
ADD CONSTRAINT organization_pk PRIMARY KEY (id);
```
### Surrogate Keys
Adding a new column with type 'serial'.  The special data type serial, turns the column into an auto-incrementing number. This means that, whenever you add a new professor to the table, it will automatically get an `id`. 

```sql
ALTER TABLE professors 
ADD COLUMN id serial;
```
`CONCAT` existing columns and then add a surrogate key. The sequence of selecting dictict rows, adding a column, concatinating 

```sql
-- Count the number of distinct rows with columns make, model
SELECT COUNT(DISTINCT(make, model)) 
FROM cars;

-- Add the id column
ALTER TABLE cars
ADD COLUMN id varchar(128);

-- Update id with make + model
UPDATE cars
SET id = CONCAT(make, model);   
```

### Foreign Keys. 
Adding a foreign key on `university_id` column in professors table. It references the `id` column in `universities`. Foreign key is names as `professors_fkey`. 

```sql
-- Rename the university_shortname column
ALTER TABLE professors
RENAME COLUMN university_shortname TO university_id;

-- Add a foreign key on professors referencing universities
alter table professors 
ADD constraint professors_fkey FOREIGN KEY (university_id) REFERENCES universities (id);
```
Here's an example of joining tables with foreign keys. 

```sql
-- Select all professors working for universities in the city of Zurich
SELECT professors.lastname, universities.id, universities.university_city
FROM professors
JOIN universities
ON professors.university_id = universities.id
WHERE universities.university_city = 'Zurich';
```

## 4. Complex Relationships 
Implementing an N:M relationship from scratch can be defined as below. The table is installed at first,

```sql
CREATE TABLE affiliations (
    professor_id integer REFERENCES professors (id),
    organization_id varchar(256) REFERENCES organization (id),
    function varchar(256)
);

```
Note here, the professor id is created as integer. Whereas the organization_id is a character which confirms to the primary key of the organization table. Notice that no primary key is defined here as the Professor can have multiple roles organization. 

#### Adding a foreign key to afflications table
```sql
-- Add a professor_id column
ALTER TABLE affiliations
ADD COLUMN professor_id integer REFERENCES professors (id);

-- Rename the organization column to organization_id
ALTER TABLE affiliations
RENAME organization TO organization_id;

-- Add a foreign key on organization_id so that it references id column in organizations
ALTER TABLE affiliations
ADD CONSTRAINT affiliations_organization_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id);
````


```sql
-- Set professor_id to professors.id where firstname, lastname correspond to rows in professors
UPDATE affiliations
SET professor_id = professors.id
FROM professors
WHERE affiliations.firstname = professors.firstname AND affiliations.lastname = professors.lastname;
````

#### Dropping columns
The firstname and lastname columns of affiliations were used to establish a link to the professors table in the last exercise – so the appropriate professor IDs could be copied over. This only worked because there is exactly one corresponding professor for each row in affiliations. In other words: {firstname, lastname} is a candidate key of professors – a unique combination of columns.

It isn't one in affiliations though, because, professors can have more than one affiliation.

Because professors are referenced by professor_id now, the firstname and lastname columns are no longer needed, so it's time to drop them. After all, one of the goals of a database is to reduce redundancy where possible.

```sql
-- Drop the firstname column
ALTER TABLE affiliations
DROP COLUMN firstname;

-- Drop the lastname column
ALTER TABLE affiliations
DROP COLUMN lastname;
```

```sql
-- Identify the correct constraint name
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';

-- Drop the right foreign key constraint
ALTER TABLE affiliations
DROP CONSTRAINT affiliations_organization_id_fkey;

-- Add a new foreign key constraint from affiliations to organizations which cascades deletion
ALTER TABLE affiliations
ADD CONSTRAINT affiliations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;
```


#### Counting affiliations
```sql
-- Count the total number of affiliations per university
SELECT COUNT(*), professors.university_id 
FROM affiliations
JOIN professors
ON affiliations.professor_id = professors.id
GROUP BY professors.university_id
order by count DESC;
```


