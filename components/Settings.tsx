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
import { useLocalStorage } from "react-use";

// 在 Settings.tsx 或一个单独的配置文件中
const CONFIG_OPTIONS = [
  {
    name: "cocopilot-gpt4（apiKey在前面手动加上ghu,因为GitHub不允许上传完整的密钥）",
    apiKey: "_pXVxLPBzcvCjSvG0Mv4K7G9ffw3xsM2ZKolZ",
    upstreamUrl: "https://proxy.cocopilot.org",
  },
  {
    name: "deepseek-chat(需要手动修改模型为这个)",
    apiKey: "sk-ffe19ebe9fa44d00884330ff1c18cf82",
    upstreamUrl: "https://api.deepseek.com",
  },
  {
    name: "caifree(推荐)",
    apiKey: "sk-aiHrrRLYUUelHstX69E9484509254dBf92061d6744FfFaD1",
    upstreamUrl: "https://one.caifree.com",
  },
  {
    name: "自定义",
    apiKey: "",
    upstreamUrl: "",
  },
];

const Settings = () => {
  //redux
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const upstreamUrl = useAppSelector((state) => state.auth.upsreamUrl);
  const systemPrompt = useAppSelector((state) => state.auth.systemPrompt);
  //state
  const [userConfigNumber, setUserConfigNumber] = useLocalStorage(
    "userConfigNumber",
    "2"
  );
  return (
    <div className="max-w-md rounded overflow-hidden shadow-lg bg-blue-gray-100 z-1000  mx-auto ">
      <h1 className="font-bold text-3xl">settings</h1>
      <br />
      <div className="flex justify-end mt-4 mr-4">
        <Link href="/" aria-label="Settings">
          <FontAwesomeIcon icon={faArrowLeft} size="2x" />
        </Link>
      </div>
      {/* 配置选择器 */}
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="config-selector"
      >
        配置选择器
      </label>
      <select
        id="config-selector"
        className="mb-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
        onChange={(event) => {
          const selectedConfig = CONFIG_OPTIONS[Number(event.target.value)];
          dispatch(setApiKey(selectedConfig.apiKey));
          dispatch(setUpsreamUrl(selectedConfig.upstreamUrl));
          setUserConfigNumber(event.target.value);
          console.log("userConfigNumber", userConfigNumber);
        }}
        value={userConfigNumber}
      >
        {CONFIG_OPTIONS.map((option, index) => (
          <option key={index} value={index}>
            {option.name}
          </option>
        ))}
      </select>
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
          type="password"
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
            onChange={(event) => dispatch(setSystemPrompt(event.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={8}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
