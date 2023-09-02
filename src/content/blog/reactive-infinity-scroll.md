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
- Other Pagination Strategies
- Conclusion

Ever tried to load a ton of data on a webpage and found it super slow or clunky? Yeah, we've all been there. One cool way to make things smoother is by using infinite scrolling. You know, like how your Twitter feed just keeps loading more tweets as you scroll down.

This thing will let you scroll both up-and-down and side-to-side, set how far you need to scroll before more content loads, and all that good stuff. Whether you're building a photo album, news feed, or online store, you got covered.

## Problem

There are a lot of ready to use libraries out there that offer this feature but it might be difficult to find something that works well for you case so we're going to build basic building block that answers common cases and you can build on top of it as you need.

## Solution

We are going to build minmal yet efficient function that does the aforementioned using RxJS and TypeScript with example on how to use it with Angular.

The writing presume that you have basic understanding in both RxJS, TypeScript and latest versions of Angular. We'll learn about the used RxJS operator and any unusual code along the way.

Let's start

## RxJS operators

RxJS operators are functions that allow you to manipulate and transform observable streams. These operators can be used to filter, combine, project, or perform other operations on observable sequence of events.

There are a lot of them, most used (by me 😆) are `tap`, `map`, `filter`, `switchMap` and `finalize`. You might already know how to use those but lucky you we're going to learn about other useful operators

Take a look at the following observable:

```ts
const source$ = from([1, 2, 3, 4, 5]);
source$.subscribe(event => console.log(event));
```

The result would be: 1 2 3 4 5. -Each in a new line-

Let's say we only want to log odd numbers

```ts
const source$ = from([1, 2, 3, 4, 5]);
source$.pipe(filter(event => event % 2)).subscribe(event => console.log(event));
```

Perhaps there's a chance the `source$` might emit null event so we use filter to ignore it from going through the pipe flow

```ts
const source$ = from([1, 2, 3, null, 5]);
source$
  .pipe(filter(event => event !== null))
  .subscribe(event => console.log(event));
```

To transform the sequance of events we can use `map`

```ts
source$
  .pipe(map(event => (event > 3 ? `Large number` : "Good enough")))
  .subscribe(event => console.log(event));
```

What if I want to only inspect an event without changing the source sequance

```ts
source$
  .pipe(
    tap(event => {
      logger.log("log an event in the console");
      // you can perform any operation as well, however return statment are ignore in tap function
    })
  )
  .subscribe(event => console.log(event));
```

You know that to catch the end of observable lifetime we need to keep an eye there, that what finalize do, it called upon observable completion (complete notification)

It is usually used to perform some cleanup operations, stop the loading animation or debug the memory (ensure that observable do complete and doesn't stuck in the memory).

```ts
const source$ = from([1, 2, 3, 4, 5]);
source$
  .pipe(
    finalize(() => {
      // log something
    })
  )
  .subscribe(event => console.log(event));
```

Sometime we need to call a backend server to fetch some data on ever emission, we've few methods to accomplish that.

`switchMap`: just like normal `map` but its function argument has to return an observable, we call it inner observable. When an event come through it'll create a subscription from the inner observable and hold that pending till the inner observable completes. If new event came through while the previous inner observable hasn't yet complted then `switchMap` will cancel that observable and subscribe to the new one.

```ts
const source$ = from([1, 2, 3, 4, 5]);

function fetchData(id: number) {
  return from(fetch(`https://jsonplaceholder.typicode.com/todos/{id}`));
}

source$
  .pipe(switchMap(event => fetchData(event)))
  .subscribe(event => console.log(event));
```

Worth noting that in this sample only the todo with id 5 will be logged because `switchMap` works by **switching** the priority to the recent event as explain above. `from([...])` will emit the events after each other immediately thereby `switchMap` will switch (subscribe) to the next event inner observable as soon as it arrives without regard to the previous event. The switch opertion essenitaly means unsubscribe from the previous inner observable and subscribe to the new one.

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

To summarise

1. `switchMap` will unsubscribe from the current inner observable (if hasn't been completed yet) in favour of the next even inner obserable.
2. `concatMap` will block the event flow so the inner observable at hand must complete before allowing other events to flow.
3. `mergeMap` doesn't care about the status of inner obseravble so it'll subscribe to the inner observable without worrying about the previous inner observable.
4. `exhaustMap` will ignore any event till the current inner observable complete.

Okay, that is a lot, isn't? I understand that if you're new to RxJS you might not be able to digest all these info, you're best bet is to practice and that's what we're trying to do here!

We've three other operators we need to touch on

### debounceTime

You're building login form and upon user typing its password you want to hit the backend server to ensure the password conform to certain criteria.

```ts
condt source$ = fromEvent(passwordInput, 'input').pipe(
  map((event) => passwordInput.value),
  switchMap((password) => checkPasswordValidaity(password))
)
source$.subscribe(event => console.log(event));
```

This example might work just fine with one key caveat; on every key stroke we'll be sending a request to the backend server, thanks to `switchMap` it'll cancel previous requests so there might not be as much harm, still we've an operator that can improve this operation, `debounceTime` let you ignore any events till the `dueTime` argument is pass

```ts
condt source$ = fromEvent(passwordInput, 'input').pipe(
  debounceTime(2000)
  map((event) => passwordInput.value),
  switchMap((password) => checkPasswordValidaity(password))
)
source$.subscribe(event => console.log(event));
```

Adding `debounceTime` essentialy implies to create 2 seconds time span between each key stroke, so a user entered "hello" then before 2 seconds passed entered "world" only one request will be sent. In other words, each event has to have 2 seconds distance from the last event.

### startWith

An observable might not have value immeditily and you need to have an event readily available for the new `source$` subscribers.

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
const timezoneInputValue$ = timezoneInputController.asObservable();
timezoneInput.addEventListener("input", () =>
  subject.next(timezoneInputController.value)
);

const source$ = timezoneInputValue$.pipe(
  map(event => event.target.value),
  startWith(defaultTimezone)
);
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

You already know the _Scroll Bar_, it's at the right end of the page 🥸, no really, when you the user scroll in any direction the Browser Object Model (BOM) emits few events, like `scroll`, `scrollend`, and `wheel`.

We're going to learn enough that we can takle the problem at hand.

Let's start with `scroll` and `scrollend`:

### Scroll and ScrollEnd Events

The `scroll` event fires while an element is being scrolled and `scrollend` fires when scrolling has completed.

```ts
element.addEventListener("scroll", () => {
  console.log(`I'm being scrolled`);
});

element.addEventListener("scrollend", () => {
  console.log(`User stopped scrolling`);
});
```

Keep in mind that this only works if the element—the one that has the event listener (handler)—is scrollable, not its parent or any ancestor or descendant elements.

### Wheel Event

The `wheel` event fires while an element or any of its children is being scrolled using the mouse/trackpad **wheel** which means if you try to scroll down/up using the keyboard it won't be triggerd.

### Dimensions and Properties

We will focus mainly on the scroll event for our current tasks. Nevertheless, I've sketched out these additional events and properties for your comprehensive understanding. Let's delve into key dimensional properties you may need:

`element.clientWidth`: The inner width of the element, excluding borders and scrollbar.
`element.scrollWidth`: The width of the content, including content not visible on the screen. If the element is not horizontal scrollable then it'd be same as `clientWidth`.
`element.clientHeight`: The inner height of the element, excluding borders and scrollbar.
`element.scrollHeight`: The height of the content, including content not visible on the screen. If the element is not vertically scrollable then it'd be same as `clientHeight`.
`element.scrollTop`: The number of pixels that the content of an element is scrolled vertically.

_Note: When I say "the content," I mean the entirety of what's contained within the HTML element._

![image](https://github.com/ezzabuzaid/blog/assets/29958503/1da4228e-64e8-4e4d-8b89-d831274c001b)

Let's take the following example, calculate the remaining pixels from the user curren scroll position to the end of the scrollable element.

```ts
function calculateDistanceFromBottom(element: HTMLElement) {
  const scrollPosition = element.scrollTop;
  const clientHeight = element.clientHeight;
  const totalHeight = element.scrollHeight;
  return totalHeight - (scrollPosition + clientHeight);
}
```

Take a look at the below image.

# Include image here

Presuming the `totalHeight` is `500px`, `clientHeight` `300px` and the `scrollPosition` is `100px`, deducting the sum of `scrollPosition` and `clientHeight` from `totalHeight` would result in `100px` which is the remaining distance to reach the bottom of the element.

Similar formula when calculating the remaining distance to the end horizontaly

```ts
function calculateRemainingDistanceOnXAxis(element: HTMLElement): number {
  const scrollPosition = Math.abs(element.scrollLeft);
  const clientWidth = element.clientWidth;
  const totalWidth = element.scrollWidth;
  return totalWidth - (scrollPosition + clientWidth);
}
```

Presuming the `totalWidth` is `750px`, `clientWidth` `500px` and the `scrollPosition` is `150px`, deducting the sum of `scrollPosition` and `clientWidth` from `totalWidth` would result in `100px` which is the remaining distance to reach the end of the XAxis.
You might have noticied the `Math.abs` being used and that due to RTL direction where the user have to go in the reverse direction which would make the `scrollPosition` value to be negative so using `Math.abs` to unifiy it in both directions.

# Include image here

Given the data we've about the element dimension we can also create a function to check if the element is scrollable or not

```ts
type InfinityScrollDirection = "horizontal" | "vertical";

function isScrollable(
  element: HTMLElement,
  direction: InfinityScrollDirection = "vertical"
) {
  if (direction === "horizontal") {
    return element.scrollWidth > element.clientWidth;
  } else {
    return element.scrollHeight > element.clientHeight;
  }
}
```

Simply put, if the element scroll diemention is same as its client dimension then it ain't scrollabe.

## The Code

I know you've been looking around to find this section, finally we'll put all learning into action, let's start by creating a function named `infinityScroll` that accepts `options` argument

```ts
export interface InfinityScrollDirectiveOptions {
  /**
   * The element that is scrollable.
   */
  element: HTMLElement;
  /**
   * A BehaviorSubject that emits true when loading and false when not loading.
   */
  loading: BehaviorSubject<boolean>;
  /**
   * Indicates how far from the end of the scrollable element the user must be before the loadFn is called.
   */
  threshold: number;
  /**
   * The initial page index to start loading from.
   */
  initialPageIndex: number;
  /**
   * The direction of the scrollable element.
   */
  scrollDirection?: InfinityScrollDirection;
  /**
   * The function that is called when the user scrolls to the end of the scrollable element with respect to the threshold.
   */
  loadFn: (result: InfinityScrollResult) => Observable<any>;
}

function infinityScroll(options: InfinityScrollOptions) {
  // Logic
}
```

As promised before, our infinity scroll function is customizable to certain extent. Now we're going to listen to the element -the one that have list of item that is supposed to infinity scrolled-

```ts
function infinityScroll(options: InfinityScrollOptions) {
  return fromEvent(options.element, "scroll").pipe(
    filter(() => !options.loading.value), // ignore scroll event if already loading
    debounceTime(100), // debounce scroll event to prevent lagginess on heavy scroll pages
    filter(() => isScrollable(options.element, options.scrollDirection)),
    tap(() => {
      if (
        calculateRemainingDistance(options.element, options.scrollDirection) <=
        options.threshold
      ) {
        loadMore.next();
      }
    }),
    takeUntil(destroy)
  );
}
```

# Todos:

Add embed -codepen- to all code examples.
