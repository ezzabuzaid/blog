---
author: ezzabuzaid
pubDatetime: 2023-09-10T00:00:00.00Z
title: Backpressure, All you need to know
featured: true
draft: true
tags:
  - rxjs
  - angular
description: "Learn how to implement infinite scrolling using RxJS. Improve user experience, optimize resource usage, and fetch data incrementally!"
---

<!--
	Who are the potential audiance?
		1. Angular Developer
		2. Rx developers (applies on mobile developers as well!)
		3. Node.JS developers
		4. Developer deals with data streaming
	What they have to know
		1. Ability to understand Rx code
		2. Better if they had the problem in the first place
	Imagine what they’d be searching for?
	 	1. How to deal with backpressure?
		2. What is backpressure?
		3. How to debug RxJS memory leak?
		4. How to debug RxJS?
		4. How to debug memory leak?
		5. How to mitigate memory leak?
		6. RxJS is lagging?
		7. How to handle add incoming data using RxJS?
		8. How to buffer data
	What are their needs and concerns?
		1. They want to avoid memory leak
		2. They want to understand what causes backpressure
		3. Elevate their techincal experties
		4. Handle data streaming more efficiently
	What topics grab their interest?
		1. Using Rx effectivily to handle back pressure
 -->

I'll explain backpressure, sympotms and handling strategies when it is actually occures.

Problem

1. producer sends data at rate more than the consumer can handle
2. consumer is inefficient
3. limited resources
4. Cascading Backpressure

Solution

1. Priorities operation
2. Throw away new event.

Takeaways
By the end of this writing, user should be able to identify backpressure (in browser, backend, or mobile), put a strategy to handle it and use proper methods.

## Introduction

Simply put, it's the pressure of too much incoming data that our system can't handle at once. It's like trying to drink water from a fire hose.
