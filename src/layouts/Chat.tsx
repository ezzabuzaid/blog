import type { Message } from "ai/react";
import ls from "localstorage-slim";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Transition } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";

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

const Icons = {
  MaximizeIcon: () => (
    <svg
      className="h-3.5 w-3.5 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 1h4m0 0v4m0-4-5 5.243M5 15H1m0 0v-4m0 4 5.243-5"
      />
    </svg>
  ),
  MinimizeIcon: () => (
    <svg
      className="h-3.5 w-3.5 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 2"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 1h16"
      />
    </svg>
  ),
  UserSettingsIcon: () => (
    <svg
      className="h-3.5 w-3.5 text-gray-800 dark:text-white"
      aria-hidden="true"
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 8C5.80777 8 5.13108 7.79473 4.55551 7.41015C3.97993 7.02556 3.53133 6.47893 3.26642 5.83939C3.00152 5.19985 2.9322 4.49612 3.06725 3.81719C3.2023 3.13825 3.53564 2.51461 4.02513 2.02513C4.51461 1.53564 5.13825 1.2023 5.81719 1.06725C6.49612 0.932205 7.19985 1.00152 7.83939 1.26642C8.47893 1.53133 9.02556 1.97993 9.41015 2.55551C9.79473 3.13108 10 3.80777 10 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 17H1V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 11H18.38C18.2672 10.5081 18.0714 10.0391 17.801 9.613L18.601 8.818C18.6947 8.72424 18.7474 8.59708 18.7474 8.4645C18.7474 8.33192 18.6947 8.20476 18.601 8.111L17.894 7.404C17.8002 7.31026 17.6731 7.25761 17.5405 7.25761C17.4079 7.25761 17.2808 7.31026 17.187 7.404L16.392 8.204C15.9647 7.93136 15.4939 7.73384 15 7.62V6.5C15 6.36739 14.9473 6.24021 14.8536 6.14645C14.7598 6.05268 14.6326 6 14.5 6H13.5C13.3674 6 13.2402 6.05268 13.1464 6.14645C13.0527 6.24021 13 6.36739 13 6.5V7.62C12.5081 7.73283 12.0391 7.92863 11.613 8.199L10.818 7.404C10.7242 7.31026 10.5971 7.25761 10.4645 7.25761C10.3319 7.25761 10.2048 7.31026 10.111 7.404L9.404 8.111C9.31026 8.20476 9.25761 8.33192 9.25761 8.4645C9.25761 8.59708 9.31026 8.72424 9.404 8.818L10.204 9.618C9.9324 10.0422 9.73492 10.5096 9.62 11H8.5C8.36739 11 8.24021 11.0527 8.14645 11.1464C8.05268 11.2402 8 11.3674 8 11.5V12.5C8 12.6326 8.05268 12.7598 8.14645 12.8536C8.24021 12.9473 8.36739 13 8.5 13H9.62C9.73283 13.4919 9.92863 13.9609 10.199 14.387L9.404 15.182C9.31026 15.2758 9.25761 15.4029 9.25761 15.5355C9.25761 15.6681 9.31026 15.7952 9.404 15.889L10.111 16.596C10.2048 16.6897 10.3319 16.7424 10.4645 16.7424C10.5971 16.7424 10.7242 16.6897 10.818 16.596L11.618 15.796C12.0422 16.0676 12.5096 16.2651 13 16.38V17.5C13 17.6326 13.0527 17.7598 13.1464 17.8536C13.2402 17.9473 13.3674 18 13.5 18H14.5C14.6326 18 14.7598 17.9473 14.8536 17.8536C14.9473 17.7598 15 17.6326 15 17.5V16.38C15.4919 16.2672 15.9609 16.0714 16.387 15.801L17.182 16.601C17.2758 16.6947 17.4029 16.7474 17.5355 16.7474C17.6681 16.7474 17.7952 16.6947 17.889 16.601L18.596 15.894C18.6897 15.8002 18.7424 15.6731 18.7424 15.5405C18.7424 15.4079 18.6897 15.2808 18.596 15.187L17.796 14.392C18.0686 13.9647 18.2662 13.4939 18.38 13H19.5C19.6326 13 19.7598 12.9473 19.8536 12.8536C19.9473 12.7598 20 12.6326 20 12.5V11.5C20 11.3674 19.9473 11.2402 19.8536 11.1464C19.7598 11.0527 19.6326 11 19.5 11ZM14 14.5C13.5055 14.5 13.0222 14.3534 12.6111 14.0787C12.2 13.804 11.8795 13.4135 11.6903 12.9567C11.5011 12.4999 11.4516 11.9972 11.548 11.5123C11.6445 11.0273 11.8826 10.5819 12.2322 10.2322C12.5819 9.8826 13.0273 9.6445 13.5123 9.54804C13.9972 9.45157 14.4999 9.50108 14.9567 9.6903C15.4135 9.87952 15.804 10.2 16.0787 10.6111C16.3534 11.0222 16.5 11.5055 16.5 12C16.5 12.663 16.2366 13.2989 15.7678 13.7678C15.2989 14.2366 14.663 14.5 14 14.5Z"
        fill="currentColor"
      />
    </svg>
  ),
};
