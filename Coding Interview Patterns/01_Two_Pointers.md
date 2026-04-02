# 01. Two Pointers

1. [Introduction to Two Pointers](#introduction-to-two-pointers)
2. [Pair Sum Sorted](#pair-sum---sorted)
3. [Triplet Sum](#triplet-sum)
4. [Is Palindrome Valid](#is-palindrome-valid)
5. [Largest Container](#largest-container)
6. [Shift Zeros To The End](#shift-zeros-to-the-end)
7. [Next Lexicographical Sequence](#next-lexicographical-sequence)

---

# Introduction to Two Pointers
## Intuition
As the name implies, a two-pointer pattern refers to an algorithm that utilizes two pointers. But what is a pointer? It's a variable that represents an index or position within a data structure, like an array or linked list. Many algorithms just use a single pointer to attain or keep track of a single element:

![alt text](image.png)

Introducing a second pointer opens a new world of possibilities. Most importantly, we can now make **comparisons.** With pointers at two different positions, we can compare the elements at those positions and make decisions based on the comparison:

![alt text](image-1.png)

In many cases, such comparisons are made using two nested for-loops, which takes $O(n^2)$ time, where n denotes the length of the data structure. In the code snippet below, i and j are two pointers used to compare every two elements of an array:

### Python
```python
for i in range(n):
    for j in range(i + 1, n):
        compare(nums[i], nums[j])
```
### Javascript
``` javascript
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    compare(nums[i], nums[j])
  }
}
```
### Java
``` java
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        compare(nums[i], nums[j])
    }
}
```
### C++
``` cpp
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        compare(nums[i], nums[j])
    }
}
```

Often, this approach does not take advantage of **predictable dynamics** that might exist in a data structure. An example of a data structure with predictable dynamics is a sorted array: when we move a pointer in a sorted array, we can predict whether the value being moved to is greater or smaller. For example, moving a pointer to the right in an ascending array guarantees we're moving to a value greater than or equal to the current one:

![alt text](image-2.png)

As you can see, data structures with predictable dynamics let us move pointers in a logical way. Taking advantage of this predictability can lead to improved time and space complexity, which we will illustrate with real interview problems in this chapter.

## Two-pointer Strategies
Two-pointer algorithms usually take only O(n) time by eliminating the need for nested for-loops. There are three main strategies for using two pointers.
### Inward traversal
This approach has pointers starting at opposite ends of the data structure and moving inward toward each other:

![alt text](image-3.png)

The pointers move toward the center, adjusting their positions based on comparisons, until a certain condition is met, or they meet/cross each other. This is ideal for problems where we need to compare elements from different ends of a data structure.

### Unidirectional traversal
In this approach, both pointers start at the same end of the data structure (usually the beginning) and move in the same direction:

![alt text](image-4.png)

These pointers generally serve two different but supplementary purposes. A common application of this is when we want one pointer to find information (usually the right pointer) and another to keep track of information (usually the left pointer).

### Staged traversal
In this approach, we traverse with one pointer, and when it lands on an element that meets a certain condition, we traverse with the second pointer:

![alt text](image-5.png)

Similar to unidirectional traversal, both pointers serve different purposes. Here, the first pointer is used to search for something, and once found, a second pointer finds additional information concerning the value at the first pointer.

We discuss all of these techniques in detail throughout the problems in this chapter.

## When To Use Two Pointers?

A two-pointer algorithm usually requires a linear data structure, such as an array or linked list. Otherwise, an indication that a problem can be solved using the two-pointer algorithm, is when the input follows a predictable dynamic, such as a **sorted array.**

Predictable dynamics can take many forms. Take, for instance, a palindromic string. Its symmetrical pattern allows us to logically move two pointers toward the center. As you work through the problems in this chapter, you'll learn to recognize these predictable dynamics more easily.

Another potential indicator that a problem can be solved using two pointers is if the problem asks for a **pair of values** or a result that can be generated from two values.

## Real-world Example

**Garbage collection algorithms:** In memory compaction – which is a key part of garbage collection – the goal is to free up contiguous memory space by eliminating gaps left by deallocated (aka dead) objects. A two-pointer technique helps achieve this efficiently: a 'scan' pointer traverses the heap to identify live objects, while a 'free' pointer keeps track of the next available space to where live objects should be relocated. As the 'scan' pointer moves, it skips over dead objects and shifts live objects to the position indicated by the 'free' pointer, compacting the memory by grouping all live objects together and freeing up continuous blocks of memory.

## Chapter Outline

![alt text](image-6.png)

The two-pointer pattern is very versatile and, consequently, quite broad. As such, we want to cover more specialized variants of this algorithm in separate chapters, such as Fast and Slow Pointers and Sliding Windows.


# Pair Sum - Sorted
Given an array of integers sorted in ascending order and a target value, return the indexes of any pair of numbers in the array that sum to the target. The order of the indexes in the result doesn't matter. If no pair is found, return an empty array.

### Example 1:
``` 
Input: nums = [-5, -2, 3, 4, 6], target = 7
Output: [2, 3]
```


### Example 2:
``` 
Input: nums = [1, 1, 1], target = 2
Output: [0, 1]
```

Explanation: other valid outputs could be `[1, 0]`, `[0, 2]`, `[2, 0]`, `[1, 2]` or `[2, 1]`.

## Intuition

The brute force solution to this problem involves checking all possible pairs. This is done using two nested loops: an outer loop that traverses the array for the first element of the pair, and an inner loop that traverses the rest of the array to find the second element. Below is the code snippet for this approach:

### Python
```python
from typing import List
  
def pair_sum_sorted_brute_force(nums: List[int], target: int) -> List[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```
### Javascript
``` javascript
export function pair_sum_sorted_brute_force(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j]
      }
    }
  }
  return []
}
```
### Java
``` java
import java.util.ArrayList;

public class Main {
    public ArrayList<Integer> pair_sum_sorted_brute_force(ArrayList<Integer> nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums.get(i) + nums.get(j) == target) {
                    ArrayList<Integer> result = new ArrayList<>();
                    result.add(i);
                    result.add(j);
                    return result;
                }
            }
        }
        return new ArrayList<>();
    }
}
```

This approach has a time complexity of $O(n^2)$,where n denotes the length of the array. This approach does not take into account that the input array is sorted. Could we use this fact to come up with a more efficient solution?

A **two-pointer approach** is worth considering here because a sorted array allows us to move the pointers in a logical way. Let's see how this works in the example below:

![alt text](image-7.png)

A good place to start is by looking at the smallest and largest values: the first and last elements, respectively. The sum of these two values is 1.

![alt text](image-8.png)

Since 1 is less than the target, we need to **move one of our pointers** to find a new pair with a larger sum.

- Left pointer: The left pointer will always point to a value less than or equal to the value at the right pointer because the array is sorted. Incrementing it would result in a sum greater than or equal to the current sum of 1.

- Right pointer: Decrementing the right pointer would result in a sum that’s less than or equal to 1.

Therefore, we should increment the left pointer to find a larger sum:

![alt text](image-9.png)

Again, the sum of the values at those two pointers (4) is too small. So, let's increment the left pointer:

![alt text](image-10.png)

Now, the sum (9) is too large. So, we should decrement the right pointer to find a pair of values with a smaller sum:

![alt text](image-11.png)

Finally, we found two numbers that yield a sum equal to the target. Let’s return their indexes:

![alt text](image-12.png)

Above, we’ve demonstrated a two-pointer algorithm using inward traversal. Let’s summarize this logic. For any pair of values at left and right:

- If their sum is less than the target, increment left, aiming to increase the sum towards the target value.

- If their sum is greater than the target, decrement right, aiming to decrease the sum towards the target value.

- If their sum is equal to the target value, return [left, right].

We can stop moving the left and right pointers when they meet, as this indicates no pair summing to the target was found.

# Implementation

### Python
```python
from typing import List
       
def pair_sum_sorted(nums: List[int], target: int) -> List[int]:
    left, right = 0, len(nums) - 1
    while left < right:
        sum = nums[left] + nums[right]
        # If the sum is smaller, increment the left pointer, aiming to increase the
        # sum towards the target value.
        if sum < target:
            left += 1
        # If the sum is larger, decrement the right pointer, aiming to decrease the
        # sum towards the target value.
        elif sum > target:
            right -= 1
        # If the target pair is found, return its indexes.
        else:
            return [left, right]
    return []
```
### Javascript
``` javascript
export function pair_sum_sorted(nums, target) {
  let left = 0
  let right = nums.length - 1
  while (left < right) {
    const sum = nums[left] + nums[right]
    // If the sum is smaller, increment the left pointer, aiming to increase the
    // sum towards the target value.
    if (sum < target) {
      left += 1
    }
    // If the sum is larger, decrement the right pointer, aiming to decrease the
    // sum towards the target value.
    else if (sum > target) {
      right -= 1
    }
    // If the target pair is found, return its indexes.
    else {
      return [left, right]
    }
  }
  return []
}
```
### Java
``` java
import java.util.ArrayList;

public class Main {
    public ArrayList<Integer> pair_sum_sorted(ArrayList<Integer> nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int sum = nums.get(left) + nums.get(right);
            // If the sum is smaller, increment the left pointer, aiming to increase the
            // sum towards the target value.
            if (sum < target) {
                left++;
            }
            // If the sum is larger, decrement the right pointer, aiming to decrease the
            // sum towards the target value.
            else if (sum > target) {
                right--;
            }
            // If the target pair is found, return its indexes.
            else {
                ArrayList<Integer> result = new ArrayList<>();
                result.add(left);
                result.add(right);
                return result;
            }
        }
        return new ArrayList<>();
    }
}
```

# Complexity Analysis

**Time complexity:** The time complexity of pair_sum_sorted is O(n) because we perform approximately n iterations using the two-pointer technique in the worst case.

**Space complexity:** We only allocated a constant number of variables, so the space complexity is O(1).

# Test Cases

In addition to the examples already discussed, here are some other test cases you can use. These extra test cases cover different contexts to ensure the code works well across a range of inputs. Testing is important because it helps identify mistakes in your code, ensures the solution works for uncommon inputs, and brings attention to cases you might have overlooked.

| Input                             | Expected Output     | Description                                                                 |
|-----------------------------------|---------------------|-----------------------------------------------------------------------------|
| nums = [] target = 0              | []                  | Tests an empty array.                                                       |
| nums = [1] target = 1             | []                  | Tests an array with just one element.                                       |
| nums = [2, 3] target = 5          | [0, 1]              | Tests a two-element array that contains a pair that sums to the target.     |
| nums = [2, 4] target = 5          | []                  | Tests a two-element array that doesn’t contain a valid pair.                |
| nums = [2, 2, 3] target = 5       | [0, 2] or [1, 2]    | Tests an array with duplicate values.                                       |
| nums = [-1, 2, 3] target = 2      | [0, 2]              | Tests handling of negative numbers in the pair.                             |
| nums = [-3, -2, -1] target = -5   | [0, 1]              | Tests when both numbers in the pair are negative.                           |


# Interview Tip
**Tip:** Consider all information provided.
When interviewers pose a problem, they sometimes provide only the minimum amount of information required for you to start solving it. Consequently, it’s crucial to thoroughly evaluate all that information to determine which details are essential for solving the problem efficiently. In this problem, the key to arriving at the optimal solution is recognizing that the input is sorted.


