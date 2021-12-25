---
title: "A moment to understand `argmax()` function"
excerpt: "A short post about understand how final predictions are computed"
mathjax: true
date: 2018-09-22
categories:
  - blog
tags: 
  - [python, argmax]
comments: true
---

I was kind of briefly stuck into this function when checking the accuracy of the model predictions. At first it does not really make sense but it is quite straight forward to get this. This is a short post on understanding what `argmax()` is doing and why we need it.   

## Some examples
Given an array the function is simply returning the maximum values along an axis. Let's see some examples. 

*Note: `argmax()` returns the position of the maximum value and not the max value. The function `max()` returns the maximum value.*

```python
a = np.matrix([[1,2,3,5],[4,50,6,7],[45,8,9,10]])
a
```

```python
matrix([[ 1,  2,  3,  5],
        [ 4, 50,  6,  7],
        [45,  8,  9, 10]])

```

Finding the max across the rows and columns. 

```python
np.argmax(a) # highest index from the whole matrix
5
```

```python
np.argmax(a[0,]) # index of the maximum in the first row
3
```

```python
np.argmax(a[:,1]) # index of the maximum in the second column
1
```


The parameter `axis=0/1` allows to return maximum along a row or a column. Let's see here. 
```python
colmax = np.argmax(a, axis = 0) # max across the column
colmax

matrix([[2, 1, 2, 2]], dtype=int64)
```

```python
rowmax = np.argmax(a, axis = 1) # max across the rows
rowmax

matrix([[3],
        [1],
        [0]], dtype=int64)
```



## How is `argmax()` helping in computing final predicted labels? 

Recall that the Softmax classifier provides “probabilities” for each class. 

For example, given an image the classifier gives us scores the classes “cat” and “dog” . The softmax classifier can compute the probabilities of the these class labels as say [0.9, 0.1], which allows us to interpret its confidence in each class. The argmax() is here useful to figure out the maximum of each predicted vector and output the index of the class. 

Here is an example. I am using some dummy variables to illustrate this. Say i have some test labels which looks like this.  
```python
test_y[:5]

  0       1
1.000	0.000 # 0
0.000	1.000 # 1
1.000	0.000 # 2
1.000	0.000 # 3
1.000	0.000 # 4
0.000	1.000 # 5

```
A score of 1 in the first example indicates that the label is of Class 0, Second label as Class 1 and so on. So that `argmax()` of the first example should give us the label Class 0 and so on. 

Similarly for the predicted class as below. 

```python
# predictions from the network
Predictions[:5]

 0 	      1
2.104	-2.306 # 0
0.025	-1.044 # 1
1.362	-1.862 # 2
0.117	-2.317 # 3
1.306	-2.373 # 4
-3.995	1.546  # 5
```


The first 5 examples are predicted as Class 0 and the last one as Class 1. 
```python
np.argmax(Predictions[:6],1)

> array([0, 0, 0, 0, 0, 1])

```


This now gives an easily interpretable results from *probabilities* to the *class labels.*

A confusion matrix between the true and the predicted classes can now be easily drawn.  
```python
confusion_matrix(np.argmax(test_y,1), np.argmax(Predictions,1))
```
