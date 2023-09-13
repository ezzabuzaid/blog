---
author: ezzabuzaid
pubDatetime: 2023-09-10T17:23:56.283Z
title: "Build a Typeahead Component Using RxJS"
featured: false
draft: false
tags:
  - rxjs
  - angular
  - receipe
description: "Learn how to build a typeahead component using RxJS. Improve the user experience and performance of your application."
---

You know when you start typing in a search box and it starts suggesting things to you? That's called typeahead. It's a great way to help users find what they're looking for. In this article, we'll learn how to build a typeahead component using RxJS.

## Problem

From end-user perspective, the problem is that they want to search for something and they want to see the results as they type. From developer perspective, the problem is that we need to make an HTTP request every time the user types something in the search box. This can be a lot of requests if the user is typing fast.

## Solution

To balance the user experience and the performance, we need to make sure that we don't make too many requests. We can do this by using RxJS to debounce the user input and only make a request when the user stops typing for a certain amount of time.

## Harvey, The Slow Typer

Before jumping into the code, let me tell you a story about Harvey.

Harvey types slowly and is searching for the book "Harry Potter and the Philosopher's Stone." When he opens the search screen, he sees a list of books, but the one he wants isn't there.

He begins typing "Harry," and the app sends a new request for every letter he types. Finally, the results appear, but they only show matches for the complete word "Harry." Not finding what he wants, Harvey adds the word "Potter" to his search. Without pausing, he also adds the word "Stone."

The app shows the results for "Harry Potter" and then for "Harry Potter Stone." Harvey is frustrated; the book he wants is not there. He starts removing each letter one by one until only "Harry" remains. He pauses for a moment, then slowly removes the rest of the letters.

Lastly, he types "Harry Potter and the Philosopher's Stone," and the results appear. Harvey is happy; he has found the book he was looking for.

## The Code

From Harvey store, you can observe the following scenarios:

1. There was list of book initialy loaded, which might mean the server supports empty string as a valid search term.
   - Possiple case is user clears the search box.
   - Adding an option to allow empty string as a valid search term is a good idea.
2. Typing "Harry" should only send one request for "Harry" and not for "H", "Ha", "Har", "Harr", "Harry".

   - You need to give the user chance to type the whole word before sending a request.
   - The user should type a search term respecting the minimum length.
   - `debounceTime` should do the job.

3. Going back to the last resolved search term result should not send a request.

   - For example, if the user types "Harry", results are fetched. If user added "Potter" quickly and then removed it, we don't want to fetch the results for "Harry" again unless the `debounceTime` is up.
   - `distinctUntilChanged` should do the job.

4. Typing "Harry" and while the request is still in progress, adding "Potter" should cancel the previous request "Harry request" and send a new one for "Harry Potter".

   - of course this will happen only if the query passed.
   - `switchMap` should do the job.

- An edge case where the user types a search term and then types another search term less than the minimum length before the request is finished.
  - I know this is confusing, but think of it as the user types "Harry" and then types "Ha" before the request for "Harry" is finished, you need to cancel the request for "Harry". You should **not** send a new one for "Ha" if it doesn't satisfy the minimum length.
  - You might think that `switchMap` will do the job, but the search term in that case might not pass the debouncing time, if did, it might not pass the minmum length, in that case `switchMap` won't know about it in the first place to cancel the current request.

```ts
interface ITypeaheadOperatorOptions {
  /**
   * The minimum length of the search term.
   */
  minLength: number;
  /**
   * The amount of time between key presses before making a request.
   */
  debounceTime: number;
  /**
   * Whether to allow empty string to be treated as a valid search term.
   * Useful for when you want to show defaul results when the user clears the search box (as it was in the first place).
   *
   * @default true
   */
  allowEmptyString?: boolean;

  /**
   * The function that will be called to load the results.
   */
  loadFn: (searchTerm: string) => ObservableInput<Out>;
}

export function typeahead<Out>(
  options: ITypeaheadOperatorOptions<Out>
): OperatorFunction<string, Out> {
  return source => {
    let shouldAllowSameValue = false;
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

`debounceTime`: Think of it as sliding window. It will wait for a certain amount of time before emitting the last value. If a new value comes in before the time is up, it will reset the timer and the window will start over. This is useful for preventing requests with every keystroke.

`filter`: The first filter will only pass values that are of type string, it might sound reddundant but it's necessary because the `debounceTime` operator might emit `null` when the source observable completes. The second filter will only pass values that are longer than the minimum length or empty string (if allowed).

`distinctUntilChanged`: It will only emit a value if it's different from the previous one. This is useful for preventing requests with same search term (duplicate request). For example, if the user types "hello", results are fetched. If the user types "hello" again, we don't want to fetch the results again.

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

`switchMap`: **Cancels** the previous observable and subscribe to the new one. If a user types new search term before the current request is finished, it will cancel the current request and start a new one.

You can make the `switchMap` part of the operator itself, but I prefer to keep it separate to better read the pipeline.

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
