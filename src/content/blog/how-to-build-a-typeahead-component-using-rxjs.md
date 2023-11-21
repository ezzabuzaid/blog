---
author: ezzabuzaid
pubDatetime: 2023-09-19T17:00:00.00Z
title: "How To Build a Typeahead Component Using RxJS"
featured: true
heroImage: how-to-build-a-typeahead-component-using-rxjs
tags:
  - rxjs
  - angular
  - receipe
description: "Learn how to build a typeahead component using RxJS. Improve the user experience and performance of your application."
---

You know when you start typing in a search box and it starts suggesting things to you? That's called typeahead. It's a great way to help users find what they're looking for. In this article, you'll learn how to build a typeahead component using RxJS.

## Table of Content

## Problem

From end-user perspective, the problem is that they want to search for something and they want to see the results as they type. From developer perspective, the problem is that you need to optimize the search logic to not pressure the server with too many requests.

## Solution

To balance the user experience and the performance, you need to make sure that you don't make too many requests. That can be done using RxJS to debounce the user input and only make a request when the user stops typing for a certain amount of time.

Here is how it'll be used in the end:

```ts
const search$ = fromEvent(searchInputEl, "input").pipe(
  map(event => event.target.value),
  typeahead({
    minLength: 3,
    debounceTime: 250,
    loadFn: searchTerm => {
      const searchQuery = searchTerm ? `?title_like=^${searchTerm}` : "";
      return fetch(`https://jsonplaceholder.typicode.com/posts${searchTerm}`);
    },
  }),
  // convert the response to json
  switchMap(response => response.json())
);
```

## Getting Started

Before you start, you need to install RxJS.

```bash
npm install rxjs
```

_Note: I'm using TypeScript primarily for clarity in showing what options are available through types. You're free to omit them, but if you do want to use types, I'd suggest opting for a framework that has built-in TypeScript support._

## Typeahead Operator

You'll write a custom operator that will take an object with the following properties:§

### Options Interface

```ts
interface ITypeaheadOperatorOptions<Out> {
  /**
   * The minimum length of the allowed search term.
   */
  minLength: number;
  /**
   * The amount of time between key presses before making a request.
   */
  debounceTime: number;
  /**
   * Whether to allow empty string to be treated as a valid search term.
   * Useful for when you want to show defaul results when the user clears the search box
   *
   * @default true
   */
  allowEmptyString?: boolean;

  /**
   * The function that will be called to load the results.
   */
  loadFn: (searchTerm: string) => ObservableInput<Out>;
}
```

### Typeahead Operator

```ts
export function typeahead<Out>(
  options: ITypeaheadOperatorOptions<Out>
): OperatorFunction<string, Out> {
  return source => {
    return source.pipe(
      ...operators
      // The implementation goes here
    );
  };
}
```

The `typeahead` custom operator accepts options/config object and returns an operator function that takes an observable of "search term" and returns an observable of "result".

The result is represented by the generic type `Out` which is the type of the result returned by the `loadFn` function.

## Scenario 1: Typical Typeahead

_Note: Valid search term is a search term that have been still for a certain amount of time (debounceTime) and satisfies the minimum length (e.g. at least 3 char)._

- The user types valid search term and the request is sent.
- The user types a new valid search term before the current request is finished, the current request is canceled and a new one is sent with the new search term.
- The user types a valid search term then before the debounce time is up, the user reverts back to the previous search term, no request is sent.

```ts
return source.pipe(
  debounceTime(options.debounceTime),
  filter(value => typeof value === "string"),
  filter(value => {
    if (value === "") {
      return options.allowEmptyString ?? true;
    }
    return value.length >= options.minLength;
  }),
  distinctUntilChanged(),
  switchMap(searchTerm => options.loadFn(searchTerm))
);
```

`debounceTime`: Think of it as sliding window. It will wait for a certain amount of time before emitting the last value. If a new value comes in before the time is up, it will reset the timer and the window will start over. This is useful for preventing requests with every keystroke.

`filter`: The first filter will only pass values that are of type string, it might sound reddundant but it's necessary because the `debounceTime` operator might emit `null` when the source observable completes. The second filter will only pass values that are longer than the minimum length or empty string (if allowed).

_Note: You'll need empty string to be treated as a valid search term if you want to show default results when the user clears the search box or when the user opens the page/dropdown for the first time._

`distinctUntilChanged`: It will only emit a value if it's different from the previous one (default behavior). This is useful for preventing requests with same search term (duplicate request). For example, if the user types "rxjs", results are fetched. If the user types "rxjs" again, no need to fetch the results again.

`switchMap`: **Cancels** the previous observable and subscribe to the new one. If a user types new search term before the current request is finished, it will cancel the current request and start a new one.

For example, if the user types "Typeahead" and then types "Operator" before the request for "Typeahead" is finished, it will cancel the request for "Typeahead" and send a new one for "Typeahead Operator". Only in the case that the request for "Typeahead" took longer than the debounce time.

## Scenario 2: Cache Results

Most of the use cases I've personally seen might benefit from caching the results, especially if the results are not going to change frequently.

You can do that by caching the in-flight observables using the `shareReplay` operator.

```ts
const cache: Record<string, Observable<Out>> = {};
return source.pipe(
  // ... same operators
  switchMap(searchTerm => {
    // Initialize Observable in cache if it doesn't exist
    if (!cache[searchTerm]) {
      cache[searchTerm] = options.loadFn(searchTerm).pipe(
        shareReplay({
          bufferSize: 1,
          refCount: false,
          windowTime: 5000,
        })
      );
    }

    // Return the cached observable
    return cache[searchTerm];
  })
);
```

`shareReplay`: It will return the source observable (the request associated with the search term) if it exists in the cache, otherwise it will initialize it and cache it for future use.

`bufferSize`: presuming you're doing HTTP calls, then it'll be one response.

`windowTime`: essentially means that the cached observable will be removed from the cache after 5 seconds.

There are two other optimizations techniques that I can think of:

1. return the cached observable immediately after the user types the search term if it exists in the cache without having to go through the debounce time. I have deliberately decided not to do that so the user can have consistent experience. In my case the debounce time is 1.5s.

2. Inspired by [stale-while-revalidate](https://web.dev/stale-while-revalidate/) strategy, you can return the cached observable immediately and then send a new request to update the cache. That can be done using [`concat`](https://www.learnrxjs.io/learn-rxjs/operators/combination/concat) operator.

## Scenario 3: The Edge Case

In most cases you'll be fine with the previous implementation, but there is an edge case that you might need to handle.

- The user types a valid search term (Angular) and the request is sent.
- The user types an invalid search term (Ng) before the current request is finished "(Angular) request". Since the search term is invalid, `switchMap` didn't get the chance to receive it, hence it didn't cancel the current request.
- The user typed back (Angular) but the default behaviour of `distinctUntilChanged` won't allow it to pass through.

```ts
let shouldAllowSameValue = false; // -> 1
return source.pipe(
  distinctUntilChanged((prev, current) => {
    if (shouldAllowSameValue /** -> 3 */) {
      shouldAllowSameValue = false;
      return false;
    }
    return prev === current; // -> 4
  }),
  switchMap(searchTerm =>
    // -> 5
    from(options.loadFn(searchTerm)).pipe(
      takeUntil(
        source.pipe(
          tap(() => {
            shouldAllowSameValue = true; // -> 2
          })
        )
      )
    )
  )
);
```

Let's break it down (follow the numbers in the code comments):

1. `shouldAllowSameValue` is a flag that will be used to allow the same value to pass through the `distinctUntilChanged` operator. It's set to `false` by default.
2. `shouldAllowSameValue` is set to `true` when the user types an invalid search term before the current request is finished.
3. If `shouldAllowSameValue` is `true`, it means that the user typed an invalid search term before the last request is finished. In that case, we want to allow the same value to pass through the `distinctUntilChanged` operator.
4. This is the default behavior of `distinctUntilChanged`, it will only emit a value if it's different from the previous one.

5. Converts the `loadFn` function to an observable, subscribes to it, and cancels it when the source observable emits a new value while the request is still in progress.

`distinctUntilChanged`: It will only emit a value if it's different from the previous one (default behavior). This is useful for preventing requests with same search term (duplicate request). For example, if the user types "hello", results are fetched. If the user types "hello" again, we don't want to fetch the results again.

`switchMap`: **Cancels** the previous observable and subscribe to the new one. If a user types new search term before the current request is finished, it will cancel the current request and start a new one.

Complete code

```ts
export function typeahead<Out>(
  options: ITypeaheadOperatorOptions<Out>
): OperatorFunction<string, Out> {
  let shouldAllowSameValue = false;
  return source => {
    return source.pipe(
      debounceTime(options.debounceTime),
      filter(value => typeof value === "string"),
      filter(value => {
        if (value === "") {
          return options.allowEmptyString ?? true;
        }
        return value.length >= options.minLength;
      }),
      distinctUntilChanged((prev, current) => {
        if (shouldAllowSameValue) {
          shouldAllowSameValue = false;
          return false;
        }
        return prev === current;
      }),
      switchMap(searchTerm =>
        from(options.loadFn(searchTerm)).pipe(
          takeUntil(
            source.pipe(
              tap(() => {
                shouldAllowSameValue = true;
              })
            )
          )
        )
      )
    );
  };
}
```

## Example

### Framework Agnostic Example

```ts
import { fromEvent } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from "rxjs/operators";

const searchInputEl = document.getElementById("search-input");
const resultsContainerEl = document.getElementById("results-container");

const search$ = fromEvent(searchInputEl, "input").pipe(
  map(event => searchInputEl.value),
  typeahead({
    minLength: 3,
    debounceTime: 1000,
    loadFn: searchTerm => {
      const searchQuery = searchTerm ? `?title_like=^${searchTerm}` : "";
      return fetch(`https://jsonplaceholder.typicode.com/posts${searchTerm}`);
    },
  }),
  // convert the response to json
  switchMap(response => response.json())
);

search$.subscribe(results => {
  resultsContainerEl.innerHTML = results
    .map(result => `<li>${result.title}</li>`)
    .join("");
});
```

```html
<input type="text" id="search-input" />
<ul id="results-container"></ul>
```

Keep in mind that it's the practice to use `switchMap` and not other flattening operators like `mergeMap` or `concatMap` in this scenario.

_Note: I have deliberately left out the error handling for the sake of simplicity, you might want to implement retry logic or show an error message to the user._

{% embed https://codepen.io/ezzabuzaid/embed/preview/LYMWJKa %}

### Angular Example

```ts
import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from "rxjs/operators";

@Component({
  selector: "app-search-bar",
  template: `
    <input type="text" [formControl]="searchControl" />
    <ul>
      <li *ngFor="let result of results$ | async">{{ result.title }}</li>
    </ul>
  `,
})
export class SearchBarComponent {
  searchControl = new FormControl();
  results$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.results$ = this.searchControl.valueChanges.pipe(
      typeahead({
        minLength: 3,
        debounceTime: 300,
        loadFn: searchTerm => {
          const searchQuery = searchTerm ? `?title_like=^${searchTerm}` : "";
          return this.#http.get<any[]>(
            `https://jsonplaceholder.typicode.com/posts${searchQuery}`
          );
        },
      })
    );
  }
}
```

## Backpressure

Simply put, it's the pressure of too much incoming data that our system can't handle at once. Think of conveyer belt in a factory, if the belt is moving too fast, the workers won't be able to keep up with the incoming products.

In a typeahead scenario, If we let every keystroke from every user hit our server for query processing, we're going to overwhelm it faster than a JavaScript framework becomes outdated. In technical terms, this rapid influx of data can create a bottleneck, leading to increased latency and resource consumption.

This is less of a concern to the frontend developer, as their main focus is usually on user experience rather than backend scalability. However, it's essential to understand that the choices made on the frontend, like how often to trigger server requests, can have a direct impact on backend performance.

## Conclusion

In this article, we learned how to build a typeahead component using RxJS. We also learned about backpressure and how it can affect our application's performance. I hope you found this article helpful and that it will help you build better applications in the future.

You can take this further and apply [Infinite Scroll](https://writer.sh/posts/reactive-infinity-scroll) along with typeahead to have a unique user experience.
