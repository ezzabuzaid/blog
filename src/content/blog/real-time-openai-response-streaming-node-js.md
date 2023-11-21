---
title: Real-time OpenAI Response Streaming with Node.js
description: Do what ChatGPT does, continuously show the results as it becomes available, don't wait for the completion, rather show what the model have generated right away."
author: ezzabuzaid
heroImage: real-time-openai-response-streaming-node-js
pubDatetime: 2023-10-25T12:51:21.697Z
featured: true
draft: false
tags: []
---

You know how ChatGPT continuously show the results as it becomes available -generated-, It doesn't wait for the whole response to get together, rather it shows what the model is generating right away.

- Smooth user experience: User doesn't have to wait till the whole response is generated.

- Easier to read: When ChatGPT first released I liked that it respond as if you're talking to someone, which read different to other form of writing.

- Reduce memory usage: This is a benefit of streaming in general, you offload the data without having to buffer it in memory.

In this article, you're going to learn how you can stream OpenAI response just like how ChatGPT does it.

I'm assuming you've basic knowledge in Node.js, and you're familiar with JavaScript features like `async/await`, `for await` loop and async iterators.

## Table of Content

## Problem

There are few ways to stream data from the server:

- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Long Polling](https://javascript.info/long-polling)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)

You're going to use the **Fetch API**; simple and more suitable for this use case.

## Solution

I divided the solution into two parts, the server side and the client side.

### The Server Side

You're going to build a tiny Node.js server that uses OpenAI chat completion API.

Let's make simple Node.js server first. No routing framework, no fancy stuff.

```ts title="server.mjs"
import http from "http";

const server = http.createServer();
server.listen(3000);

server.on("request", async (req, res) => {
  switch (req.url) {
    case "/":
      res.write("Hello World");
      res.end();
      break;
    default:
      res.statusCode = 404;
      res.end();
  }
});
```

The `res.write` will send data to the client, it can be called many times only before the `res.end` is called as it will close the connection.

```ts
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const config = {
  model: "gpt-4",
  stream: true,
  messages: [
    {
      content: "Once upon a time",
      role: "user",
    },
  ],
};
const completion = await openai.chat.completions.create(config);
```

> The `stream` option is what you're looking for, it will stream the response body.

The `completion` object implements the `AsyncIterable` interface, which means you can use `for await` loop to iterate over the response body.

```ts
for await (const chunk of completion) {
  console.log(chunk);
}
```

Putting it all together.

```ts title="server.mjs"
import OpenAI from "openai";
import http from "http";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const server = http.createServer();
server.listen(3000);

server.on("request", async (req, res) => {
  switch (req.url) {
    case "/":
      const config = {
        model: "gpt-4",
        stream: true,
        messages: [
          {
            content: "Once upon a time",
            role: "user",
          },
        ],
      };
      const completion = await openai.chat.completions.create(config);

      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
      });

      for await (const chunk of completion) {
        const [choice] = chunk.choices;
        const { content } = choice.delta;
        res.write(content);
      }

      res.end();
      break;
    default:
      res.statusCode = 404;
      res.end();
  }
});
```

> In the context of streaming data, a chunk refers to a piece or fragment of data that is handled, processed, or transmitted individually as part of a larger stream of data.

### The Client Side

There are few ways to receive data coming from the server while using the Fetch API.

- Using for await loop over the body stream.
- Manually using `response.body!.getReader()`.
- Using 3rd party libraries like [RxJS](https://rxjs.dev/).

Of course, those are not the only ways.

#### Using Async Iterator

The approach I like the most, it is declarative and to the point.

> You might want to check browser compatibility iterating over `ReadableStream`.
> TypeScript also doesn't support `ReadableStream` as an iterable.

```ts
const inputEl = document.querySelector("input");
const resultEl = document.querySelector("p");

inputEl.addEventListener("input", async () => {
  const response = await fetch("http://localhost:3000");

  let total = "";
  const decoder = new TextDecoder();
  for await (const chunk of response.body!) {
    const decodedValue = decoder.decode(chunk);
    total += decodedValue;
    resultEl.textContent = total;
  }
});
```

#### Using While Loop

You'll most likely see this approach in the wild, it is a bit imperative and verbose but it is supported by most browsers.

```ts
const inputEl = document.querySelector("input");
const resultEl = document.querySelector("p");

inputEl.addEventListener("input", async () => {
  const response = await fetch("http://localhost:3000");

  // Using While Loop
  let total = "";
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;

    const decodedValue = decoder.decode(chunk);
    total += decodedValue;
    resultEl.textContent = total;
  }
});
```

#### Using RxJS

```ts
const inputEl = document.querySelector("input");
fromEvent(inputEl, "input")
  .pipe(
    switchMap(() => fetch("http://localhost:3000")),
    switchMap(response => response.body.pipeThrough(new TextDecoderStream())),
    scan((acc, chunk) => acc + chunk, "")
  )
  .subscribe(total => {
    resultEl.textContent = total;
  });
```

RxJS is a great library, but it is a bit overkill for this use case, unless you're already using it in your project.

## Decoding The Data

A word on the decoding part, you need to decode the data coming from the server, as it is encoded using [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) by default.

To decode the data, you need to use [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) API.

```ts
const decoder = new TextDecoder();
```

By default it uses `utf-8` encoding, which is what you need in most cases.

```ts
const decoder = new TextDecoder("utf-8");
```

The `decode` method accepts buffer (An ArrayBuffer, a TypedArray, or a DataView) and returns a string.

```ts
const decodedValue = decoder.decode(chunk);
```

Another options is using `TextDecoderStream` which is a transform stream that takes a stream of `Uint8Array` chunks as input and emits a stream of strings.

The previous implementation can be rewritten as follows.

```ts
let total = "";
const decoderTransformStream = new TextDecoderStream();
const reader = response.body.pipeThrough(decoderTransformStream).getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  total += value;
  resultEl.textContent = total;
}
```

## Canceling The Request

To cancel the request in progress, you need to use the `AbortController` API.

### The Client Side

- Cancel the request in progress if you allow the user to generate over the request in progress.

```ts
let controller = new AbortController();
let inProgress = false;
inputEl.addEventListener("input", async () => {
  if (inProgress) {
    controller.abort();
    controller = new AbortController();
  }

  inProgress = true;

  const response = await fetch("http://localhost:3000", {
    signal: controller.signal,
  });
  // ... rest of the code

  inProgress = false;
});
```

- Deliberately cancel the request in progress.

```ts
const stopGenerationButtonEl = document.querySelector("button");

stopGenerationButtonEl.addEventListener("click", () => {
  if (inProgress) {
    controller.abort();
  }
});
```

---

RxJS has a built-in support for canceling the request in progress using `switchMap` operator.

To deliberately cancel the request in progress, you can use `takeUntil` operator.

```ts
const stopGeneration$ = new Subject();
fromEvent(inputEl, "input").pipe(
  switchMap(() =>
    fetch("http://localhost:3000").pipe(
      takeUntil(fromEvent(stopGenerationButtonEl, "click"))
    )
  )
  // ... rest of the code
);
```

### The Server Side

You need to listent to the `close` event on the request object which will be emitted when the client closes the connection.

Aborting the request is one of the reasons a connection might close, of other reasons might be the client closed the tab or the browser crashed.

```ts
req.on("close", () => {
  completion.controller.abort();
});
```

The `close` listener is the place where you want to do clean up, besides aborting OpenAI request you might want to close any database connection or any other resource you're using.

## Handling Errors

Following [OpenAI API](https://platform.openai.com/docs/guides/error-codes/api-errors) error codes, you need to handle the most likely error you'll get, at least.

- Rate Limit Reached - Quota Exceeded (same error code)
- Model Is Overloaded (will be in form of a server error)
- Token Limit Reached

To commuincate the errors to the client, you're going to prefix the error with `ERROR` string to simplify handling the error on the client side.

> You cannot alter the response status code at this point, it will always be `200` even if the error is in form of a server error.

### Server Side

- Rate Limit Reached
- Model Is Overloaded

```ts
try {
  const completion = await openai.chat.completions.create(config);
} catch (error) {
  if (error instanceof RateLimitError) {
    res.end("ERROR:rate_limit_exceeded");
  } else if (error instanceof InternalServerError) {
    res.end("ERROR:internal_server_error");
  }
}
```

- Token Limit Reached

```ts
for await (const chunk of completion) {
  const [choice] = chunk.choices;
  const { content } = choice.delta;

  if (choice.finish_reason === "length") {
    res.write("ERROR:token_limit_reached");
  } else {
    res.write(content);
  }
}
```

### Client Side

```ts
while (true) {
  const { done, value: chunk } = await reader.read();
  if (done) break;

  const decodedValue = decoder.decode(chunk);

  switch (decodedValue) {
    case "ERROR:rate_limit_exceeded":
      resultEl.textContent = "Rate Limit Exceeded";
      break;
    case "ERROR:internal_server_error":
      resultEl.textContent = "Internal Server Error";
      break;
    case "ERROR:token_limit_reached":
      resultEl.textContent = "Token Limit Reached";
      break;
    default:
      total += decodedValue;
      resultEl.textContent = total;
  }

  total += decodedValue;
  resultEl.textContent = total;
}
```

## Backpressure & Buffering

What if the client is slow to consume the data coming from the server -OpenAI-, you don't want to buffer too much data in the server memory. _Things can get pretty bad when you have many concurrent requests._

In Node.js you can check if the client is ready to receive more data by checking the return value of `res.write` method.

`res.write` returns `false` if the buffer is full, that can be known synchronously; to know when the buffer is ready to receive more data, you need to listen to the `drain` event on the response object.

```ts
// ... rest of the code
const bufferFull = res.write(content) === false;
if (bufferFull) {
  await new Promise(resolve => res.once("drain", resolve));
}
```

That is actually less than a solution, merely a workaround. A better solution would be to store the data somewhere else, like in-memory database, and stream the data from there when the client is ready to receive more.

## More On Streams

Beside the solutions you read, stream is vast concept and have many components, mainly categoriesd into the following.

- **ReadableStream**: Represents a source of data, from which you can read. In the client-side, the server can be considered as a readable stream that you access using the Fetch API. In the server-side, the OpenAI API can be considered as a readable stream.

- **WriteableStream**: Opposite to ReadableStream, a WritableStream represents a destination for data, where you can write. In the server-client setup, it represent the response object where you are writing the data to be sent to the client.

- **TransformStream**: A TransformStream is a type of stream that sits between a ReadableStream and a WritableStream, transforming or processing the data as it passes through. This can be utilized for various purposes such as modifying, filtering, or formatting the data before it reaches the client. For instance, if there's a need to format the OpenAI's response before sending it to the client, a TransformStream could be employed.

When combined together, they form a pipeline, where the data flows from the source to the destination, passing through the transform stream. For instance, data from OpenAI's API (ReadableStream) could be passed through a TransformStream for formatting or filtering, and then written to the client (WritableStream).

## Conclusion

So I hope you have good idea how to mimic ChatGPT in your project, and how to stream data from the server to the client.

Streaming is fun but you've to keep an eye on the memory usage on both client and server, you don't want to buffer too much data in the memory, try not to hold any data, always stream quick and early.

In case you're using more complex form of Prompt Engineering, like [ReAct](https://www.promptingguide.ai/techniques/react) or [Generated Knowledge](https://learnprompting.org/docs/intermediate/generated_knowledge) that relys on the output of a previous LLM request, and have processing within like collecting user info, semantic search, you might then want use Server-Sent Events or WebSockets instead of Fetch API.

## Next Steps

1. Put that in practice if you haven't already.
2. Use some kind of in-memory database to store the data and stream it from there.
3. Try to stress load the server and see how it behaves.

## References

- [Node.js Stream](https://nodejs.org/api/stream.html)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [An Introduction to Streaming on the Web](https://vercel.com/blog/an-introduction-to-streaming-on-the-web)
- [https://web.dev/articles/eventsource-basics](https://web.dev/articles/eventsource-basics)
- [https://jakearchibald.com/2016/streams-ftw/#streams-the-fetch-api](2016 - the year of web streams) I have this bookmarked since 2016 😆
