---
author: ezzabuzaid
pubDatetime: 2023-09-10T17:23:56.283Z
title: "Build a Typeahead Component Using RxJS"
featured: true
tags:
  - rxjs
  - angular
  - receipe
description: "Learn how to build a typeahead component using RxJS. Improve the user experience and performance of your application."
---

You know when you start typing in a search box and it starts suggesting things to you? That's called typeahead. It's a great way to help users find what they're looking for. In this article, we'll learn how to build a typeahead component using RxJS.

## Table of Content

## Problem

From end-user perspective, the problem is that they want to search for something and they want to see the results as they type. From developer perspective, the problem is that we need to make an HTTP request every time the user types something in the search box. This can be a lot of requests if the user is typing fast.

## Solution

To balance the user experience and the performance, we need to make sure that we don't make too many requests. We can do this by using RxJS to debounce the user input and only make a request when the user stops typing for a certain amount of time.

## Harvey, The Slow Typer

Before jumping into the code, let me tell you a story about Harvey.

Harvey types slowly and is searching for the book "Harry Potter and the Philosopher's Stone." When he opens the search screen, he sees a list of books, but the one he wants isn't there.

He begins typing "Harry" and he's not finding what he wants. Frustrated, Harvey adds the word "Potter", stop for a moment then adds the word "Stone." The results still don't show the book he's looking for. Harvey starts removing each letter one by one until only "Harry" remains. He pauses for a moment and then removes the rest of the letters.

## Prepare Requirements

From Harvey store, you can observe the following scenarios:

There was list of book initialy loaded, which might mean the server supports empty string as a valid search term.

- Another case, user clears the search box.
- You can add an option to allow empty string as a valid search term.

Typing "Harry" should only send one request for "Harry" and not for "H", "Ha", "Har", "Harr", "Harry", same goes for removing letters.

- You need to give the user chance to type the whole word before sending a request.
- The user should type a search term respecting the minimum length.
- `debounceTime` operator waits for a certain amount of time before flowing the last value.

Going back to the last resolved search term result should not send a request.

- For example, if the user types "Harry", results are fetched. If user added "Potter" quickly and then removed it, we don't want to fetch the results for "Harry" again.
- `distinctUntilChanged` operator prevents duplicate search terms from being flown.

Typing "Harry" and while the request is still in progress, adding "Potter" should cancel the previous request "Harry request" and send a new one for "Harry Potter".

- of course this will happen only if the query passed
- `switchMap` operator cancels the previous observable and subscribe to the new one (cancels the current request and send a new one).

An edge case where the user types a search term and then types another search term less than the minimum length before the request is finished.

- I know this is confusing, but think of it as the user types "Harry" and then types "Ha" before the request for "Harry" is finished. You need to cancel the request for "Harry". You should **not** send a new one for "Ha" if it doesn't satisfy the minimum length.
- You might think that `switchMap` is adequate, but the search term in that case might not pass the debouncing time, if did, it might not pass the minmum length, in that case `switchMap` won't know about it in the first place to cancel the current request.
- [Jump to the code section](#edge-case) to see how to handle this case.

## The Code

### Getting Started

Before you start, you need to install RxJS.

```bash
npm install rxjs
```

_Note: I'm using TypeScript primarily for clarity in showing what options are available through types. You're free to omit them, but if you do want to use types, I'd suggest opting for a framework that has built-in TypeScript support._

You'll write a custom operator that will take an object with the following properties:

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

```ts
return source.pipe(
  debounceTime(options.debounceTime),
  filter(value => typeof value === "string"),
  filter(value => {
    if (value === "") {
      return options.allowEmptyString ?? true;
    }
    return value.length >= options.minLength;
  })
);
```

`debounceTime`: Think of it as sliding window. It will wait for a certain amount of time before emitting the last value. If a new value comes in before the time is up, it will reset the timer and the window will start over. This is useful for preventing requests with every keystroke.

`filter`: The first filter will only pass values that are of type string, it might sound reddundant but it's necessary because the `debounceTime` operator might emit `null` when the source observable completes. The second filter will only pass values that are longer than the minimum length or empty string (if allowed).

#### Edge Case

That is the core of the operator. Let's talk about two possiple scenarios first:

_Note: Valid search term is a search term that have been still for a certain amount of time (`debounceTime`) and satisfies the minimum length._

1. Happy secnario:
   - The user types valid search term and the request is sent.
   - The user types a new valid search term before the current request is finished, the current request is canceled and a new one is sent with the new search term.
   - The user types a valid search term then before the debounce time is up, the user reverts back to the previous search term, no request is sent.
2. Worst case scenario:
   - The user types a valid search term and the request is sent.
   - The user types an invalid search term before the current request is finished, the current request is canceled.
   - The user types a new valid search term, same as the previous one, request is sent.

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

#### Happy Scenario

In case you're only interseted in the happy scenario, you can use the following implementation:

```ts
export function typeahead<Out>(
  options: ITypeaheadOperatorOptions<Out>
): OperatorFunction<string, Out> {
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
      distinctUntilChanged(),
      switchMap(searchTerm => options.loadFn(searchTerm))
    );
  };
}
```

#### Worst Case Scenario

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
      return fetch(
        `https://jsonplaceholder.typicode.com/posts?title=${searchTerm}`
      );
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

Simply put, it's the pressure of too much incoming data that our system can't handle at once. It's like trying to empty a swimming pool with a straw. You can't do it all at once, so you have to take it slow and steady.

In a typeahead scenario, If we let every keystroke from every user hit our server for query processing, we're going to overwhelm it faster than a JavaScript framework becomes outdated. In technical terms, this rapid influx of data can create a bottleneck, leading to increased latency and resource consumption.

This is less of a concern to the frontend developer, as their main focus is usually on user experience rather than backend scalability. However, it's essential to understand that the choices made on the frontend, like how often to trigger server requests, can have a direct impact on backend performance.

## Conclusion

In this article, we learned how to build a typeahead component using RxJS. We also learned about backpressure and how it can affect our application's performance. I hope you found this article helpful and that it will help you build better applications in the future.
