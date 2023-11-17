import Card from "@components/Card";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import slugify from "../utils/slugify";
import type { BlogContentType } from "../utils/getPosts";
interface Props {
  searchList: BlogContentType[];
}

interface SearchResult {
  item: BlogContentType;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["title", "description"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5,
      }),
    [searchList]
  );

  useEffect(() => {
    // if URL has search query,
    // insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if
    // input value is more than one character
    let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(null, "", newRelativePathQuery);
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [inputVal]);

  return (
    <>
      <form onSubmit={() => setInputVal(inputRef.current?.value || "")}>
        <label className="flex items-center space-x-3 rounded border border-skin-fill border-opacity-40 p-3 focus-within:shadow  focus:border-skin-accent ">
          <svg
            className="h-4 w-4 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <input
            className="block w-full  bg-skin-fill placeholder:italic placeholder:text-opacity-75 focus:outline-none"
            placeholder="Search for anything..."
            type="text"
            name="search"
            value={inputVal}
            onChange={handleChange}
            autoComplete="off"
            autoFocus
            ref={inputRef}
          />
        </label>
      </form>

      {inputVal.length > 1 && (
        <div className="mt-8">
          Found {searchResults?.length}
          {searchResults?.length && searchResults?.length === 1
            ? " result"
            : " results"}{" "}
          for '{inputVal}'
        </div>
      )}

      <ul>
        {searchResults &&
          searchResults.map(({ item, refIndex }) => (
            <Card
              href={`/posts/${slugify(item)}`}
              frontmatter={item.data}
              key={`${refIndex}-${item.id}`}
            />
          ))}
      </ul>
    </>
  );
}
