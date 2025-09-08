import { SearchIcon, X } from "lucide-react";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import type { GAME_STATS } from "../types/stats";
import { useNavigate } from "react-router-dom";

interface PostData {
  content: string;
}
export const SearchInput = forwardRef((_, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  //const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PostData>({
    content: "",
  });
  const navigate = useNavigate();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      content: e.target.value,
    }));
    console.log("Form data:", formData);
  };
  useImperativeHandle(ref, () => ({
    setQueryAndSearch: (query: string) => {
      setFormData({ content: query });
      setTimeout(() => sendPostRequest(query), 0); // ensure state updates before post
    },
  }));

  const sendPostRequest = async (queryOverride?: string) => {
    setLoading(true);
    //setError(null);
    const queryToSend = queryOverride ?? formData.content;
    console.log("Sending POST request with data:", formData);
    try {
      const response = await fetch(
        "/api/query", // Adjust the URL to your API endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: queryToSend }),
        }
      );
      if (response.status === 429) {
        navigate("/rateLimit");
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      {
        const data = await response.json();
        console.log("Input Response data:", data.data.interpretation);

        console.log("Input Response toolResults:", data.data.toolResults);

        const parsedData: GAME_STATS[] = JSON.parse(
          data.data.toolResults[0].result.content[0].text
        );
        navigate("/results", {
          state: {
            data: parsedData,
            interpretation: data.data.interpretation,
            resType: data.data.toolResults[0].toolName,
            rawRes: data.data,
          },
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      //setError(errorMessage);
      console.error("Error sending POST request:", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleClear = () => {
    setFormData({ content: "" });
  };
  return (
    <>
      <form
        className="flex w-full max-w-[600px]"
        onSubmit={(e) => {
          e.preventDefault();
          sendPostRequest();
        }}
      >
        <div className="relative w-full">
          <input
            id="search-input"
            type="text"
            placeholder="Search"
            className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500 bg-white"
            value={formData.content}
            onChange={handleInputChange}
            disabled={loading}
          />
          {formData.content && !loading && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-l-full">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium"></span>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disable:cursor-not-allowed"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>
    </>
  );
});
