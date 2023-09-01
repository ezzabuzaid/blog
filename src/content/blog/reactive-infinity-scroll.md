---
author: ezzabuzaid
pubDatetime: 2023-09-01T17:23:56.283Z
title: Reactive Infinity Scroll
featured: true
draft: true
tags:
  - infinity-scroll
  - angular-infinity-scroll
  - infinity-scroll-in-angular
  - infinity-scroll-rxjs
description: "Create an infinity scrolling using TypeScript and RxJS"
---

## Table of content
- Problem
- Solution
- RxJS operators
- Scroll API
- The Code
- UI/UX Consideration
- Conclusion

Ever tried to load a ton of data on a webpage and found it super slow or clunky? Yeah, we've all been there. One cool way to make things smoother is by using infinite scrolling. You know, like how your Twitter feed just keeps loading more tweets as you scroll down.

This thing will let you scroll both up-and-down and side-to-side, set how far you need to scroll before more content loads, and all that good stuff. Whether you're building a photo album, news feed, or online store, you got covered.

## Problem
There are a lot of ready to use libraries out there that offer this feature but it might be difficult to find something that works well for you case so we're going to build basic building block that answers common case and you can build on top of it as you need.

## Solution
We are going to build minmal yet efficient function that does the aforementioned using RxJS and TypeScript with example on how to use it with Angular.

The writing presume that you have basic understanding in both RxJS, TypeScript and latest versions of Angular. We'll learn about the used RxJS operator and any unusual code along the way.

## RxJS operators 
RxJS operators are functions that allow you to manipulate and transform observable streams. These operators can be used to filter, combine, project, or perform other operations on observable sequence of events.

There are a lot of them, most used (by me 😆) are `tap`, `map`, `filter`, `switchMap` and `finalize`. You might already know how to use those but lucky you we're going to learn about other useful operators

Take a look at the following observable:
```ts
const source$ = from([1,2,3,4,5]);
source$.subscribe(event => console.log(event));
```
The result would be: 1 2 3 4 5. -Each in a new line-

Let's say we only want to log odd numbers
```ts
const source$ = from([1,2,3,4,5]);
source$
  .pipe(filter(event => event % 2))
  .subscribe(event => console.log(event));
```

Perhaps there's a chance the `source$` might emit null event so we use filter to ignore it from going through the pipe flow
```ts
const source$ = from([1,2,3,null,5]);
source$
  .pipe(filter(event => event !== null))
  .subscribe(event => console.log(event));
```

To transform the sequance of events we can use `map`
```ts
source$
  .pipe(map(event => event > 3 ? `Large number`: 'Good enough'))
  .subscribe(event => console.log(event));
```

What if I want to only inspect an event without changing the source sequance
```ts
source$
  .pipe(tap(event => {
    logger.log('log an event in the console')
    // you can perform any operation as well, however return statment are ignore in tap function 
  }))
  .subscribe(event => console.log(event));
```

You know that to catch the end of observable lifetime we need to keep an eye there, that what finalize do, it called upon observable completion (complete notification)

It is usually used to perform some cleanup operations, stop the loading animation or debug the memory (ensure that observable do complete and doesn't stuck in the memory).

```ts
const source$ = from([1,2,3,4,5]);
source$
  .pipe(finalize(() => {
    // log something
  }))
  .subscribe(event => console.log(event));
```

Sometime we need to call a backend server to fetch some data on ever emission, we've few methods to accomplish that.

`switchMap`: just like normal `map` but its function argument has to return an observable, we call it inner observable

```ts
const source$ = from([1,2,3,4,5]);

function fetchData(id: number) {
  return from(fetch(`https://jsonplaceholder.typicode.com/todos/{id}`))
}

source$
  .pipe(switchMap(event => fetchData(event)))
  .subscribe(event => console.log(event));
```

Worth noting that in this sample only the todo with id 5 will be logged because `switchMap` works by **switching** the priority to the recent event. `from([...])` will emit the events after each other immediately thereby `switchMap` will switch (subscribe) to the next event inner observable as soon as it arrives without regard to the previous event. The switch opertion essenitaly means unsubscribe from previous the inner observable.

`concatMap`: Use it in case you don't want the next event to go through the pipeline unless the inner observable completes. It is particually useful if you're making database write operations or animating/moving an element

```ts
source$
  .pipe(concatMap(event => fetchData(event)))
  .subscribe(event => console.log(event));
```
This sample will log all todos in order. Essitnally what happens is `concatMap` blocks the next event till the inner observable at hand completes.

`mergeMap`: Use it if you don't want to cancel previous inner observable or you don't want to block the flow till the current inner observable completes. `mergeMap` will subscribe to the event inner observable without regard to its completion, so if an event came thorugh and the previous inner observable hasn't been completed yet that's fine, `mergeMap` will subscribe to them in parallel.

```ts
source$
  .pipe(mergeMap(event => fetchData(event)))
  .subscribe(event => console.log(event));
```
This sample will log all todos but in uncertain order, for instance the second request might resolve before the first one and `mergeMap` doesn't reall care about the order, if that is important then use `concatMap`.

And the final one and the most important in this writing is `exhaustMap`: it is like `switchMap` but with one key difference; it ignores the recent events in favour to the current inner observable completeion in contrary to `switchMap` which cancles the previous inner observable in favour to new inner observable.

```ts
source$
  .pipe(exhaustMap(event => fetchData(event)))
  .subscribe(event => console.log(event));
```
This sample will only log the first todo as the first todo request hasn't been completed yet other events came throught therefore they've been ignore.

Okay, that is a lot, isn't? I understand that if you're new to RxJS you might not be able to digest all these info, you're best bet is to practice and that's what we're trying to do here!

We've more two operators we need to touch on

`startWith`: An observable might not have value immeditily and you need to have an event readily available for the new `source$` subscribers.

```ts
const defaultTimezone = '+1'
condt source$ = fromEvent(timezoneInput, 'input').pipe(
  map((event) => timezoneInput.value),
  startWith(defaultTimezone)
)
source$.subscribe(event => console.log(event));
```
This sample will immeditly log `+1` even if `timezoneInput` value never entered

`fromEvent`: We could rewrite the previous example to be as follows

```ts
const timezoneInputController = new Subject<string>();
const timezoneInputValue$ = timezoneInputController.asObservable()
timezoneInput.addEventListener('input', () => subject.next(timezoneInputController.value));

const source$ = timezoneInputValue$.pipe(
  map((event) => event.target.value),
  startWith(defaultTimezone)
)
source$.subscribe(event => console.log(event));
```
Thanks to RxJS we can use `fromEvent` that will encabsulate that boilerplate, all we need to do is to say which event to listen to from what element. of course `fromEvent` returns an observable 🙂.

`takeUntil`: I admit that might be difficult to digest, it was for me. Let's take the same previous example, let's say that in the template we have form and that input and submit button. When the user click on the submit button we no longer want to listen to the `timezoneInput` element `input` event, yes, `takeUntil` as it sounds, it let the subscribers take the events until the provided observable emits at least once.

```ts
const formSubmission$ = fromEvent(formEl, 'submit') 

const defaultTimezone = '+1'
condt source$ = fromEvent(timezoneInput, 'input').pipe(
  map((event) => timezoneInput.value),
  startWith(defaultTimezone)
)
// normally, this subscriber will keep logging the event even if the users clicked on the submit button 
source$.subscribe(event => console.log(event));

// Now, once the submit button are clicked the subscriber subscription will be canceled
source$
  .pipe(takeUntil(formSubmission))
  .subscribe(event => console.log(event));
```

Wow, I really did it, and you too 😎

Time to talk about some of the Scroll API(s)

## Scroll API
