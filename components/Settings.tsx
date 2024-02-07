"use client";

// Settings.tsx
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  setApiKey,
  setUpsreamUrl,
  setSystemPrompt,
} from "@/app/store/slices/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Settings = () => {
  //redux
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const upstreamUrl = useAppSelector((state) => state.auth.upsreamUrl);
  const systemPrompt = useAppSelector((state) => state.auth.systemPrompt);

  return (
    <div className="max-w-md rounded overflow-hidden shadow-lg bg-blue-gray-100 z-1000  mx-auto ">
      <h1 className="font-bold text-3xl">settings</h1>
      <br />
      <div className="flex justify-end mt-4 mr-4">
        <Link href="/" aria-label="Settings">
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </Link>
      </div>
      {/* api key */}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="api-key"
        >
          API Key:
        </label>
        <input
          id="api-key"
          type="text"
          value={apiKey}
          onChange={(event) => dispatch(setApiKey(event.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {/* upstream-url */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="upstream-url"
          >
            Upstream URL:
          </label>
          <input
            id="upstream-url"
            type="text"
            value={upstreamUrl}
            onChange={(event) => dispatch(setUpsreamUrl(event.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {/* systemPrompt */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="system-prompt"
          >
            System Prompt(Paper2AI):
          </label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={8}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
