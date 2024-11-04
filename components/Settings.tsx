"use client";

// Settings.tsx
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  setApiKey,
  setUpsreamUrl,
  setSystemPrompt,
} from "@/app/store/slices/authSlice";
import {
  setIsJumpToReference,
  setIsEvaluateTopicMatch,
} from "@/app/store/slices/stateSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useLocalStorage } from "react-use";
import { useTranslation } from "@/app/i18n/client";
import { useEffect } from "react";
//公告
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const Settings = ({ lng }: { lng: string }) => {
  //i18n
  const { t } = useTranslation(lng);
  const CONFIG_OPTIONS = [
    // {
    //   name: t("configurations.蒙恬大将军"),
    //   apiKey: "sk-jokVJ90l5Swxr5dt2f3b0988C8A442A69f97Ee4eAf7aDcF4",
    //   upstreamUrl: "https://freeapi.iil.im",
    // },
    // {
    //   name: t("configurations.coze"),
    //   apiKey: "MTIwMjE2ODMyODA1NTk1MTM2MA",
    //   upstreamUrl: "https://coze.paperai.life",
    // },
    // {
    //   name: t("configurations.deepseek-chat"),
    //   apiKey: "sk-ffe19ebe9fa44d00884330ff1c18cf82",
    //   upstreamUrl: "https://api.deepseek.com",
    // },
    // {
    //   name: t("configurations.caifree"),
    //   apiKey: "sk-MaEuOo9qIeWKK3PRCdCb9b3d47E64e36Ad6022724b780592",
    //   upstreamUrl: "https://one.caifree.com",
    // },
    // {
    //   name: t("configurations.官网反代"),
    //   apiKey: "3b73ec02-3255-4b27-a202-42ab9a6e85ba",
    //   upstreamUrl: "https://plus.liuweiqing.top",
    // },
    // {
    //   name: t("configurations.vv佬"),
    //   apiKey: "nk-23118",
    //   upstreamUrl: "https://cocopilot-pool.aivvm.com",
    // },
    // {
    //   name: t("configurations.linuxdo"),
    //   apiKey: "nk-2311676378",
    //   upstreamUrl: "https://chat.flss.world/api/openai",
    // },
    {
      name: t("configurations.oneapi"),
      apiKey: "sk-GHuPUV6ERD8wVmmr36FeB8D809D34d93Bb857c009f6aF9Fe",
      upstreamUrl: "https://one.paperai.life",
    },
    {
      name: t("configurations.custom"),
      apiKey: "",
      upstreamUrl: "",
    },
  ];
  //https://freeapi.iil.im  sk-GdUOBeCCCpeB16G877C8C62b849c4653A561550bEb79Fe7e
  //redux
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((state) => state.auth.apiKey);
  const upstreamUrl = useAppSelector((state) => state.auth.upsreamUrl);
  const systemPrompt = useAppSelector((state) => state.auth.systemPrompt);
  const isJumpToReference = useAppSelector(
    (state) => state.state.isJumpToReference
  );
  const isEvaluateTopicMatch = useAppSelector(
    (state) => state.state.isEvaluateTopicMatch
  );
  //state
  const [userConfigNumber, setUserConfigNumber] = useLocalStorage(
    "userConfigNumber",
    "2"
  );
  const toggleSwitch = (currentState: any, setState: any) => {
    setState(!currentState);
  };

  // useEffect(() => {
  //   toast("这是一个公告消息!", {
  //     position: "top-center",
  //     autoClose: 5000, // 持续时间
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // }, []);
  return (
    <div className="max-w-md rounded overflow-hidden shadow-lg bg-blue-gray-100 z-1000  mx-auto ">
      <h1 className="font-bold text-3xl">settings</h1>
      <br />
      <div className="flex justify-end mt-4 mr-4">
        <Link href="/" aria-label="Settings">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="2x"
            className="icon-hover"
          />
        </Link>
      </div>
      {/* 配置选择器 */}
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor="config-selector"
      >
        {t("配置选择器")}
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
          autoComplete="off"
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
            {t("Upstream URL:")}
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
            {t("System Prompt(Paper2AI):")}
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
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isJumpToReference}
          onChange={() =>
            toggleSwitch(isJumpToReference, (value: any) =>
              dispatch(setIsJumpToReference(value))
            )
          }
        />
        <div className="w-10 h-4 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-colors ease-in-out duration-200"></div>
        <span
          className={`absolute block bg-white w-3 h-3 rounded-full transition ease-in-out duration-200 transform ${
            isJumpToReference ? "translate-x-6" : "translate-x-1"
          } -translate-y-1/2 top-1/2`}
        ></span>
        {t("鼠标点击段落中的上标跳转到文献引用？")}
      </label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isEvaluateTopicMatch}
          onChange={() =>
            toggleSwitch(isEvaluateTopicMatch, (value: any) =>
              dispatch(setIsEvaluateTopicMatch(value))
            )
          }
        />
        <div className="w-10 h-4 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 transition-colors ease-in-out duration-200"></div>
        <span
          className={`absolute block bg-white w-3 h-3 rounded-full transition ease-in-out duration-200 transform ${
            isJumpToReference ? "translate-x-6" : "translate-x-1"
          } -translate-y-1/2 top-1/2`}
        ></span>
        {t("是否检查文献与主题相关性(如果不相关则不会传给AI引用)")}
      </label>
      {/* <ToastContainer /> */}
    </div>
  );
};

export default Settings;
