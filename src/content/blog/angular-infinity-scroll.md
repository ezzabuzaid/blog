---
author: ezzabuzaid
pubDatetime: 2023-09-03T00:00:00Z
title: Implementing Infinity Scroll In Angular
featured: false
tags:
  - rxjs
  - angular
  - receipe
description: "Learn All the ways to implement Infinity Scroll in Angular, and see the pros and cons of each approach."
---

We already covered all about how to build [Reactive Infinite Scroll](/posts/reactive-infinity-scroll) in vanilla JavaScript, now let's see how to implement it in Angular.

## Table Of Content

## Directive Or Pipe?

Angular provides two ways to work with DOM elements, Directives and Pipes.

1. Pipes are used to transform data in the template, think of them as formatting tools that refine how your data is displayed. They're not concerned with the structure of the web page itself; their primary job is to make sure your data looks the way you want it to when it hits the screen.

2. Directives are used to directly interact with and manipulate the DOM. These can either tweak the characteristics of individual elements (Attribute Directives) or even change the very layout of the DOM by adding or removing elements (Structural Directives).

You're going to implement Infinity Scroll as Directive and Pipe, and see the pros and cons of each approach.

## Directive

- Modify the `InfinityScrollOptions` interface to omit the `element` property because you're going to use the directive's host element.
- Add `noMoreData$` property to the `InfinityScrollOptions` interface, this is a user defined Observable that tells if all data had been loaded.

```ts
/**
 * Infinity Scroll Options excluding the element
 */
export interface InfinityScrollDirectiveOptions<T>
  extends Omit<InfinityScrollOptions<T>, "element"> {
  /**
   * User defined Observable that
   * tells if all data had been loaded.
   */
  noMoreData$: Observable<any>;
}
```

The good thing about directives is that you can inject the host element without having to explicitly pass it to the directive.

You need to store the data in a buffer, so that you can accumulate it when the user scrolls, and emit it as a single array and to use it you need to expose the directive instance to the host template.

```ts
@Directive({
  selector: "[infinityScroll]",
  // export the directive instance to the host template
  exportAs: "infinityScroll",
  standalone: true,
})
export class InfinityScrollDirective<T> {
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /**
   * The data buffer that will be used to accumulate data
   * and emit it as a single array.
   */
  #dataBuffer = new BehaviorSubject<T[]>([]);
  /**
   * The data buffer exposed as an Observable
   */
  data$ = this.#dataBuffer.asObservable();
}
```

Let's use `@Input` to pass the `InfinityScrollOptions` to the directive (you can use InjectionToken if you prefer).

```ts
// ... InfinityScrollDirective
export class InfinityScrollDirective<T> {
  #destroy = new Subject<void>();

  @Input({ required: true, alias: "infinityScroll" })
  set options(options: InfinityScrollDirectiveOptions<T[]>) {
    // ensures that previous infinityScroll subscription is unsubscribed
    this.#destroy.next();

    // reset the data buffer
    this.#dataBuffer.next([]);

    infinityScroll({
      ...options,
      element: this.#elementRef.nativeElement,
    })
      .pipe(
        scan((acc, data) => [...acc, ...data], [] as T[]),
        takeUntil(options.noMoreData$),
        takeUntil(this.#destroy)
      )
      .subscribe(data => {
        this.#dataBuffer.next(data);
      });
  }
}
```

The directive is designed to allow `options` to be changed at runtime, so it's important to unsubscribe from the previous infinity scroll subscription before creating a new one.

- `scan` operator is used to accumulate the data, and emit it as a single array.
- `takeUntil`, first one, operator is used to stop the infinity scroll when `noMoreData$` emits. Second one, is used to stop the infinity scroll when the directive is destroyed.

```ts
  ngOnDestroy(): void {
    // Indicate infinity scrolling have to stop
    this.#destroy.next();

    // No more data will be pushed to the data buffer
    this.#dataBuffer.complete();
  }
```

The `ngOnDestroy` lifecycle hook is used to unsubscribe from the infinity scroll subscription and complete the data buffer.

```html
<!-- alias to infinity scroll directive instance -->
<div
  [infinityScroll]="infinityScrollOptions"
  #infinityScroll="infinityScroll"
  style="max-width: 15rem;max-height: 10rem; overflow: auto"
>
  <ul>
    <!-- loop over the data source -->
    <li *ngFor="let item of infinityScroll.data$ | async">{{ item.title }}</li>
  </ul>
</div>

<p *ngIf="infinityScrollOptions.loading | async">Loading..</p>
```

Nothing complex here, loop over the data source and show a loading indicator. The important part is `max-height` and `overflow` styles, they're used to make the container scrollable, otherwise there will be no scroll event to listen to.

Configure Infinity Scroll

```ts
interface Todo {
  title: string;
}

const PAGE_SIZE = 10;

@Component({
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [CommonModule, InfinityScrollDirective],
})
export class AppComponent {
  #lastBatchLength = new BehaviorSubject<number>(
    PAGE_SIZE /** Default to Page Size */
  );
  /**
   * An observable that signals if all data had been loaded
   *
   * It detects whether all data is loaded or not by comparing
   * the last batch length with the current batch length.
   *
   * I'm assuming that the page length is constant, therefore,
   * if the last batch length is the not same as the current batch length,
   * then we approach the end
   */
  noMoreData$ = this.#lastBatchLength.asObservable().pipe(
    pairwise(),
    filter(([prev, curr]) => prev !== curr)
  );
}
```

Before configuring the infinity scroll, you need to know when to stop it, it might not be required in your case, but in case you need it, infinty scroll should stop when all data had been loaded otherwise you'd end up making same call over and over again.

```ts
// ... AppComponent
export class AppComponent {
  // ... other code
  #http = inject(HttpClient);
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

The infinity scroll options are pretty much the same as the ones used in the vanilla implementation, the only difference is that you're using `HttpClient` to fetch the data.

- Pros
  - Element reference is available through DI.
- Cons
  - You have to manage the subscription manually.
  - You have to unsubscribe from the previous infinity scroll subscription before creating a new one.
  - You have to empty the data buffer before creating a new infinity scroll subscription.

### Demo

{% embed https://codesandbox.io/p/sandbox/angular-infinityscroll-directive-l48xv6?embed=1 %}

## Pipe

```ts
@Pipe({
  name: "infinityScroll",
  standalone: true,
})
export class InfinityScrollPipe<T> implements PipeTransform {
  transform(
    options: InfinityScrollDirectiveOptions<T[]>,
    element: HTMLElement
  ): Observable<T[]> {
    return infinityScroll({
      ...options,
      element,
    }).pipe(
      scan((acc, data) => [...acc, ...data], [] as T[]),
      takeUntil(options.noMoreData$)
    );
  }
}
```

- The operators used in the pipe are the same as the ones used in the directive.
- The difference is with how we are receiving the `element` reference, in the directive we are injecting it, but in the pipe we are receiving it as an argument.
- Due to pipes nature, you don't need to maintain a seperated data buffer, thereby `async` will manage the subscription for you.

- Use it in a component template

```html
<div
  #infinityScrollPipeEl
  style="max-width: 15rem;max-height: 10rem; overflow: auto"
>
  <ul>
    <li
      class="border"
      *ngFor="
        let item of infinityScrollOptions
          | infinityScroll : infinityScrollPipeEl
          | async
      "
    >
      {{ item.title }}
    </li>
  </ul>
</div>
```

- Pros
  - You don't have to manage the subscription manually.
  - You don't have to empty the data buffer before creating a new infinity scroll subscription (async will discard the previous data).
- Cons
  - You have to explicitly pass the element reference to the pipe.

### Demo

{% embed https://codesandbox.io/p/sandbox/angular-infinityscroll-pipe-4td93z?embed=1 %}

## Signals

I wasn't able to round my head around how to implement it using signals due to the need to pass element reference, if you have any idea please let me know in the comments.

## Conclusion

You've discovered how to implement Infinity Scroll in Angular using Directive and Pipe, and saw the pros and cons of each approach. Choose the one that suits your needs.
Personally I'd go with the pipe approach, because it's more declarative.
