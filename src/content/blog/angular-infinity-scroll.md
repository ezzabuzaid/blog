---
author: ezzabuzaid
pubDatetime: 2023-09-07T17:23:56.283Z
title: Angular Infinity Scroll
featured: true
draft: true
tags:
  - rxjs
  - angular
description: "Angular Infinity Scroll"
---

## Bonus Section - Angular Implementation

- Create a Directive to abstract the infinity scroll function

```ts
import { Directive, ElementRef, Input, OnDestroy, inject } from "@angular/core";

export interface InfinityScrollDirectiveOptions<T>
  extends Omit<InfinityScrollOptions<T>, "element"> {
  // Omit "element" to use direcive's host element
  /**
   * User defined Observable that tells if all data had been loaded.
   */
  noMoreData$: Observable<any>;
}

@Directive({
  selector: "[infinityScroll]",
  exportAs: "infinityScroll", // export the directive instance to the host template
  standalone: true,
})
export class InfinityScrollDirective<T> implements OnDestroy {
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  #destroy = new Subject<void>();
  #dataBuffer = new BehaviorSubject<T[]>([]);
  data$: Observable<T[]> = this.#dataBuffer.asObservable();

  @Input({ required: true, alias: "infinityScroll" })
  set options(value: InfinityScrollDirectiveOptions<T[]>) {
    this.#destroy.next(); // ensures that previous infinityScroll subscription is unsubscribed so you don't duplicate operations
    infinityScroll({
      ...value,
      element: this.#elementRef.nativeElement,
    })
      .pipe(
        takeUntil(this.options.noMoreData$),
        // stop if there isn't more data
        takeUntil(this.#destroy)
        // stop if the "options" input changed or the directive has been destroyed
      )
      .subscribe(data => {
        // Append the data into #dataBuffer source
        this.#dataBuffer.next([...this.#dataBuffer.value, ...data]);
      });
  }

  ngOnDestroy(): void {
    // Indicate infinity scrolling have to stop
    this.#destroy.next();
  }
}
```

- Use it in a component template

```html
<mat-progress-bar
  *ngIf="infinityScrollOptions.loading | async" // show loading bar
  mode="query"
></mat-progress-bar>

<div
  [infinityScroll]="infinityScrollOptions"
  #infinityScroll="infinityScroll"  // alias to infinity scroll directive instance
>
  <mat-list role="list">
    <mat-list-item
      // loop over the data source
      *ngFor="let item of infinityScroll.data$ | async"
      >{{ item.title }}</mat-list-item
    >
  </mat-list>
</div>
```

- Configure Infinity Scroll

````ts
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { MatListModule } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { BehaviorSubject, delay, filter, pairwise, tap } from "rxjs";
import {
  InfinityScrollDirective,
  InfinityScrollDirectiveOptions,
  InfinityScrollResult,
} from "./infinity-scroll.directive";

interface Todo {
  title: string;
}

const PAGE_SIZE = 10;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [
    MatListModule,
    CommonModule,
    InfinityScrollDirective,
    MatProgressBarModule,
  ],
})
export class AppComponent {
  #http = inject(HttpClient);
  #lastBatchLength = new BehaviorSubject<number>(PAGE_SIZE /** Page Size */);
  noMoreData$ = this.#lastBatchLength.asObservable().pipe(
    pairwise(),
    tap(([prev, curr]) => console.log(prev, curr)),
    filter(([prev, curr]) => prev !== curr)
    // if the last batch length is the not same
    // as the current batch length, then there is no more data
    // assuming page length is constant
  );
  infinityScrollOptions: InfinityScrollDirectiveOptions<Todo[]> = {
    initialPageIndex: 1,
    threshold: 50,
    loading: new BehaviorSubject(false),
    noMoreData$: this.noMoreData$,
    loadFn: (result: InfinityScrollResult) => {
      return this.#http
        .get<Todo[]>(`https://jsonplaceholder.typicode.com/todos`, {
          params: {
            _start: result.pageIndex,
            _limit: PAGE_SIZE,
          },
        })
        .pipe(
          tap(todos => {
            this.#lastBatchLength.next(todos.length);
          })
        );
    },
  };
}
```
````
