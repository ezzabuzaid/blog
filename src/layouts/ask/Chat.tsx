import type { Message } from "ai/react";
import ls from "localstorage-slim";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Transition } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import { Icons } from "./Icons";
import QuickActions from "./QuickActions";

type GenerationStatus =
  | "pending"
  | "generating"
  | "generated"
  | "error"
  | "idle";

interface ChatProps {
  post: string;
  sessionId?: string;
}
export default function Chat(props: ChatProps) {
  const [isShowing, setIsShowing] = useState(
    ls.get(`${props.post}_open_chat`) ?? true
  );

  const [sessionId, setSessionId] = useState<string | undefined>(
    props.sessionId
  );

  const [aborter, setAborter] = useState<AbortController | undefined>();
  const [question, setQuestion] = useState<string>("");
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([
    ...((ls.get(props.post) as Message[]) ?? ([] as Message[])),
  ]);
  const [lastId, setLastId] = useState<string>(crypto.randomUUID());

  useEffect(() => {
    if (!props.sessionId) {
      FingerprintJS.load()
        .then(fp => fp.get())
        .then(result => result.visitorId)
        .then(setSessionId);
    }
  }, []);

  useEffect(() => {
    ls.set(`${props.post}_open_chat`, isShowing);
  }, [isShowing]);

  useEffect(() => {
    // scroll to bottom
    const chat = document.querySelector(".chat-content");
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [messages]);

  const askQuestion = useCallback(
    async (aborter: AbortController) => {
      setLastId(crypto.randomUUID());
      setIsShowing(true);
      setGenerationStatus("pending");

      try {
        const { body } = await fetch("http://localhost:3100/qa/openai", {
          method: "POST",
          signal: aborter.signal,
          body: JSON.stringify({
            post: props.post,
            sessionId: sessionId,
            question: question,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const reader = body!.getReader();

        setGenerationStatus("generating");

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(value);

          // if (
          //   text ===
          //   `Sorry, I couldn't find any relevant content to answer your question.`
          // ) {
          //   break;
          // }

          setMessages(prevMessages => {
            let lastMessage = prevMessages.at(-1);
            if (lastMessage && lastMessage.id === lastId) {
              return [
                ...prevMessages.slice(0, -1),
                {
                  id: lastId,
                  role: "assistant",
                  content: lastMessage.content + text,
                },
              ];
            }
            return [
              ...prevMessages,
              {
                id: crypto.randomUUID(),
                role: "user",
                content: question,
              },
              {
                id: lastId,
                role: "assistant",
                content: text,
              },
            ];
          });
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Aborted");
        } else {
          setGenerationStatus("error");
        }
      }
      setQuestion("");
      setGenerationStatus("generated");
    },
    [aborter, question]
  );

  const stopGeneration = () => {
    if (aborter) aborter.abort();
    const controller = new AbortController();
    setAborter(controller);
    setGenerationStatus("generated");
    return controller;
  };

  useEffect(() => {
    if (generationStatus === "generated") {
      ls.set(props.post, messages, {
        ttl: 60 * 60,
      });
    }
  }, [generationStatus]);

  return (
    <div className="fixed right-0 z-10 mt-4 flex w-full justify-center sm:mr-4 sm:max-w-md sm:justify-end">
      <div
        style={{
          boxShadow: "0px 9px 10px rgba(255, 149, 5, 0.1)",
        }}
        className="prose flex max-h-[700px] w-11/12 flex-col justify-between rounded-lg border border-[#e5e7eb] bg-[#f8f8f8] p-2 prose-code:overflow-auto prose-code:whitespace-pre-wrap sm:w-full sm:max-w-md"
      >
        {/* Heading */}
        <div className="flex items-start justify-between px-2">
          <h2 className="mb-4 mt-0 text-lg font-semibold tracking-tight">
            Blog Assistant
            <span className="block text-sm text-[#6b7280]">
              Powered by Writer.sh
            </span>
          </h2>

          <div className="flex items-start space-x-2">
            {!!messages.length &&
              (isShowing ? (
                <button
                  aria-label="Minimize"
                  className="not-prose flex rounded-full border p-1.5"
                  onClick={() => setIsShowing(false)}
                >
                  <Icons.MinimizeIcon />
                </button>
              ) : (
                <button
                  aria-label="Maximize"
                  className="not-prose flex rounded-full border p-1.5"
                  onClick={() => setIsShowing(true)}
                >
                  <Icons.MaximizeIcon />
                </button>
              ))}
            <button
              aria-label="User Settings"
              className="not-prose flex rounded-full border p-1.5"
              onClick={() => setIsShowing(false)}
            >
              <Icons.UserSettingsIcon />
            </button>
            <QuickActions
              {...props}
              onExplain={input => {
                setQuestion(input);
                const controller = stopGeneration();
                askQuestion(controller);
              }}
            />
          </div>
        </div>
        <Transition
          className={"chat-content mb-1 overflow-y-auto px-2 scrollbar-thin"}
          show={isShowing}
          appear={true}
          enter="transition-[max-height] duration-250"
          enterFrom="max-h-0"
          enterTo="max-h-[700px]"
          leave="transition-[max-height] duration-75"
          leaveFrom="max-h-[700px]"
          leaveTo="max-h-0"
        >
          {messages.map(message => {
            if (message.role === "user") {
              return <UserMessage key={message.id} message={message.content} />;
            } else {
              return (
                <AssistantMessage key={message.id} message={message.content} />
              );
            }
          })}
        </Transition>
        {/* Input Box */}
        <div className="sticky bottom-0 flex items-center rounded bg-[#ececec] py-2 pl-2.5 pr-2">
          <form
            className="flex w-full items-center justify-center space-x-1"
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <input
              className="flex w-full border-0 bg-transparent text-sm font-medium text-[#030712] placeholder-[#6b7280] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ask me about this blog..."
              type="search"
              name="message"
              value={question}
              disabled={
                generationStatus === "pending" ||
                generationStatus === "generating"
              }
              onChange={e => setQuestion(e.target.value)}
            />

            {generationStatus === "generated" || generationStatus === "idle" ? (
              <button
                type="button"
                onClick={event => {
                  const controller = stopGeneration();
                  askQuestion(controller);
                }}
                className="inline-block transform cursor-pointer select-none rounded-2xl border border-[#422800] bg-[#fbeee0] px-2 text-center font-medium shadow-[#422800_2px_2px_0_0] transition-transform hover:bg-white active:translate-x-0.5 active:translate-y-0.5"
              >
                Ask
              </button>
            ) : generationStatus === "generating" ? (
              <button
                type="button"
                className="inline-block transform cursor-pointer select-none rounded-2xl border border-[#422800] bg-[#fbeee0] px-2 text-center font-medium shadow-[#422800_2px_2px_0_0] transition-transform hover:bg-white active:translate-x-0.5 active:translate-y-0.5"
                onClick={stopGeneration}
              >
                Stop
              </button>
            ) : (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="mr-2 h-8 w-8 animate-spin fill-black text-gray-200 dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: string }) {
  return (
    <div className="flex-1 text-sm text-gray-600">
      <Markdown rehypePlugins={[rehypeHighlight]}>{message}</Markdown>
    </div>
  );
}

function UserMessage({ message }: { message: string }) {
  return (
    <div className="sticky top-0 z-10 block bg-[#f8f8f8] py-4 text-sm font-bold text-[#204300]">
      {message}
    </div>
  );
}
