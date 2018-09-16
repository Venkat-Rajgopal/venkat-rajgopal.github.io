---
layout: single
author_profile: true
title: "Dealing with an unbalanced dataset"
excerpt: "Sampling techniques to overcome the problem of an unbalanced dataset during classification"
date: 2018-09-15
tags: [r]
comments: true
---


## What are Unbalanced data ?
Unbalanced data as the name suggests, refers to the situations where we have unequal instances of classes/target variables. While implementing a classification algorithm, i frequently come accross this problem. Some examples of such an unbalanced class can be quite often seen in a cancer data set where one has twice the number of benign cases as compared to malignant class. Or when building an object detector for a vechicle, we quite commonly come across more no of non-cars images as compared to cars in our data set. 


Let's look at a such a dataset, [UCI Breast cancer Dataset](http://archive.ics.uci.edu/ml/datasets/Breast+Cancer+Wisconsin+%28Diagnostic%29) which we can use to for our study here. 

An example of such an unbalanced class can be seen here. 

```r
rm(list = ls())
library(caret)
# read data
df <- read.table("Data/breast-cancer-wisconsin.txt", header = FALSE,  sep = ",")

# update column names
colnames(df) <- c("sample_no", "clump_thickness", "cell_size", "cell_shape", 
                "marginal_adhesion","single_epithelial_cell_size", 
                "bare_nuclei", "bland_chromatin", "normal_nucleoli", 
                "mitosis", "classes")

# update the classes
df$classes <- ifelse(df$classes == "2", "benign", ifelse(df$classes == "4", "malignant", NA))

```


Looking at the class labels in the data set shows the imbalance in both the classes. 

```r
# A look at our class labels

> table(df$classes)
   benign malignant 
      458       241 
```


## Why this problem needs to be addressed ? 
Most classification algorithms are sensitive to the the predictors i.e the class labels. Consider the above case where benign cases are `458` which is almost double the number of malignant cases. The algorithm once trained will be more *biased* towards the benign cases and predict most of the test cases as benign and thus wont generalize well. 

Also important to consider that, in such a case, the algorithm will generate a high accuracy since the benign cases are more, which is of-course misleading.  

## What methods are available to overcome this. 
Traditionally one can always *up-sample* or *down-sample* the data. In practise this is not really advisible since it could lead to inappropriate cross-validation scores. 

