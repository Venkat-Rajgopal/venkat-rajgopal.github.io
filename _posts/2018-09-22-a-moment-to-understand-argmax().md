---
layout: single
author_profile: true
title: "A moment to understand `argmax()` function "
excerpt: "Yes we need to understand how predictions are computed. "
date: 2018-09-22
tags: [tensorflow]
comments: true
---

This is a short post on intuitively understanding what argmax() is doing.  The function argmax is simply returning the maximum values along an axis.


```python
a = np.arange(10)

a = array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

np.argmax(a)
9
```

So simply, given an array, the `argmax()` function returns the maximum. The parameter `axis=0/1` allows to return maximum along a row or a column.

## Why need this in computing predictions? 

```python
test_y[:5]
  0       1
1.000	0.000
0.000	1.000
1.000	0.000
1.000	0.000
1.000	0.000
0.000	1.000


Predictions[:5]

2.104	-2.306 # 0
0.025	-1.044 # 1
1.362	-1.862 # 2
0.117	-2.317 # 3
1.306	-2.373 # 4
-3.995	1.546  # 5


np.argmax(Predictions[:6],1)

> array([0, 0, 0, 0, 0, 1])

confusion_matrix(np.argmax(test_y,1), np.argmax(Predictions,1))

```