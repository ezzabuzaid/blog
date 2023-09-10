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

## The Code

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
}

const typeahead = (options: ITypeaheadOperatorOptions) =>
  pipe<string>(
    debounceTime(options.debounceTime),
    filter(value => typeof value === "string"),
    filter(value => {
      if (value === "") {
        return options.allowEmptyString ?? true;
      }
      return value.length >= options.minLength;
    }),
    distinctUntilChanged()
  );
```

`debounceTime`: Think of it as sliding window. It will wait for a certain amount of time before emitting the last value. If a new value comes in before the time is up, it will reset the timer and wait again.

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
  }),
  switchMap(searchTerm =>
    fetch(`https://jsonplaceholder.typicode.com/posts?title=${searchTerm}`)
  ),
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

{% codepen <https://codepen.io/ezzabuzaid/embed/preview/LYMWJKa?default-tab=js%2Cresult> %}

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
  templateUrl: "./search-bar.component.html",
})
export class SearchBarComponent {
  searchControl = new FormControl();
  results$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.results$ = this.searchControl.valueChanges.pipe(
      typeahead({
        minLength: 3,
        debounceTime: 300,
      }),
      switchMap(searchTerm =>
        this.http.get<any[]>(
          `https://jsonplaceholder.typicode.com/posts?title=${searchTerm}`
        )
      )
    );
  }
}
```

```html
<input type="text" [formControl]="searchControl" />
<ul>
  <li *ngFor="let result of results$ | async">{{ result.title }}</li>
</ul>
```

## Backpressure

Simply put, it's the pressure of too much incoming data that our system can't handle at once. It's like trying to empty a swimming pool with a straw. You can't do it all at once, so you have to take it slow and steady.

In a typeahead scenario, If we let every keystroke from every user hit our server for query processing, we're going to overwhelm it faster than a JavaScript framework becomes outdated. In technical terms, this rapid influx of data can create a bottleneck, leading to increased latency and resource consumption.

This is less of a concern to the frontend developer, as their main focus is usually on user experience rather than backend scalability. However, it's essential to understand that the choices made on the frontend, like how often to trigger server requests, can have a direct impact on backend performance.

## Conclusion

In this article, we learned how to build a typeahead component using RxJS. We also learned about backpressure and how it can affect our application's performance. I hope you found this article helpful and that it will help you build better applications in the future.
