import React, { useState, useEffect } from "react";
import { useLocalStorage } from "react-use";

import { Reference } from "@/utils/global";
import {
  copyToClipboard,
  getFullReference,
  renderCitation,
  getAllFullReferences,
  delteIndexUpdateBracketNumbersInDeltaKeepSelection,
} from "@/utils/others/quillutils";
//删除文献按钮
import ParagraphDeleteButton from "@/components/ParagraphDeleteInterface";

//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  addReferenceRedux,
  removeReferenceRedux,
  clearReferencesRedux,
  swapReferencesRedux,
  setReferencesRedux,
} from "@/app/store/slices/authSlice";
import { setCitationStyle } from "@/app/store/slices/stateSlice";
//supabase
import { submitPaper } from "@/utils/supabase/supabaseutils";
import { createClient } from "@/utils/supabase/client";
//i18n
import { useTranslation } from "@/app/i18n/client";
type ReferenceListProps = {
  editor: any;
  lng: string;
};
//引用转换
import Cite from "citation-js";

const citationStyles = [
  { name: "中文", template: "custom-chinese" }, // 假设你有一个自定义的“中文”格式
  { name: "APA", template: "apa" },
  { name: "MLA", template: "mla" },
  { name: "Chicago", template: "chicago" },
  { name: "Harvard", template: "harvard" },
  { name: "Vancouver", template: "vancouver" },
  { name: "IEEE", template: "ieee" },
];
function ReferenceList({ editor, lng }: ReferenceListProps) {
  //i18n
  const { t } = useTranslation(lng);
  //自定义文献
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newUrl, setNewUrl] = useState("");
  //redux
  const dispatch = useAppDispatch();
  const references = useAppSelector((state) => state.auth.referencesRedux);
  const paperNumberRedux = useAppSelector(
    (state) => state.state.paperNumberRedux
  );
  const isVip = useAppSelector((state) => state.state.isVip);
  const citationStyle = useAppSelector((state) => state.state.citationStyle);
  //supabase
  const supabase = createClient();

  function moveReferenceUp(index: number) {
    console.log("index", index);

    if (index <= 0 || index >= references.length) {
      console.log("index", index);
      return; // Index out of bounds or first element
    }
    dispatch(swapReferencesRedux({ indexA: index, indexB: index - 1 }));
  }

  function moveReferenceDown(index: number) {
    console.log("index", index);
    if (index < 0 || index >= references.length - 1) {
      console.log("index", index);
      return; // Index out of bounds or last element
    }

    dispatch(swapReferencesRedux({ indexA: index, indexB: index + 1 }));
  }

  function removeReferenceUpdateIndex(index: number, rmPg = false) {
    handleRemoveReference(index);
    delteIndexUpdateBracketNumbersInDeltaKeepSelection(editor, index, rmPg);
  }

  const handleAddReference = (newReference: Reference) => {
    dispatch(addReferenceRedux(newReference));
  };

  const handleRemoveReference = (index: number) => {
    dispatch(removeReferenceRedux(index));
  };

  const handleClearReferences = () => {
    dispatch(clearReferencesRedux());
  };
  // 状态标志，用于跟踪组件是否首次渲染
  const [isFirstRender, setIsFirstRender] = useState(true);
  React.useEffect(() => {
    // 当组件首次渲染后，设置 isFirstRender 为 false
    setIsFirstRender(false);
  }, []); // 这个 useEffect 依赖数组为空，所以只会在组件首次渲染后运行
  //监听references，如果发生变化，就提交到服务器
  React.useEffect(() => {
    if (!isFirstRender && isVip) {
      submitPaper(supabase, undefined, references, paperNumberRedux);
    }
  }, [references]);

  async function generateCitation(doi, style) {
    try {
      const citation = await Cite.async(doi);
      const output = citation.format("bibliography", {
        format: "text",
        template: style,
        lang: "en-US",
      });
      return output;
    } catch (error) {
      console.error("Error generating citation:", error);
      return ""; // Return an empty string in case of error
    }
  }

  useEffect(() => {
    const fetchCitations = async () => {
      const updatedReferences = await Promise.all(
        references.map(async (ref) => {
          // 检查是否已经有当前风格的引用
          if (!ref[citationStyle]) {
            // 如果没有，则生成新的引用
            const citationText = await generateCitation(ref.doi, citationStyle);
            return { ...ref, [citationStyle]: citationText }; // 添加新的引用到对象
          }
          return ref; // 如果已有引用，则不做改变
        })
      );
      dispatch(setReferencesRedux(updatedReferences));
    };

    fetchCitations();
  }, [citationStyle]);

  const handleStyleChange = (event) => {
    dispatch(setCitationStyle(event.target.value));
  };

  return (
    <div className=" mx-auto p-4">
      {/* 引用列表显示区域 */}
      <ul>
        {references &&
          references.map(
            (reference, index) =>
              reference && (
                <li key={index} className="mb-3 p-2 border-b">
                  {/* 显示序号 */}
                  <span className="font-bold mr-2">[{index + 1}].</span>
                  {/* {getFullReference(reference)} */}
                  {/* 根据当前风格渲染引用 */}
                  {renderCitation(reference, citationStyle)}
                  {reference.url && (
                    <a
                      href={reference.url}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`[${(index + 1).toString()}]`}
                    >
                      {" "}
                      ({reference.url})
                    </a>
                  )}
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 ml-2 rounded"
                    onClick={() => moveReferenceUp(index)}
                  >
                    ↑
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 ml-2 rounded"
                    onClick={() => moveReferenceDown(index)}
                  >
                    ↓
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 ml-2 rounded"
                    onClick={() =>
                      copyToClipboard(renderCitation(reference, citationStyle))
                    }
                  >
                    {t("复制")}
                  </button>
                  <ParagraphDeleteButton
                    index={index}
                    isRemovePaper={true}
                    removeReferenceUpdateIndex={removeReferenceUpdateIndex}
                  ></ParagraphDeleteButton>
                </li>
              )
          )}
      </ul>
      {/* 表单区域 */}
      <form
        id="referenceForm"
        onSubmit={async (e) => {
          e.preventDefault();
          handleAddReference({
            title: newTitle,
            author: newAuthor,
            year: newYear,
            venue: newPublisher,
            url: newUrl,
          });
          // 清空表单
          setNewTitle("");
          setNewAuthor("");
          setNewYear("");
          setNewPublisher("");
          setNewUrl("");
          // submitPaper(supabase, undefined, references, paperNumberRedux);
        }}
        className="mb-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <input
            className="border p-2 rounded"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t("Title")}
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder={t("Author")}
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder={t("Year")}
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
            placeholder={t("Publisher")}
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={t("Url")}
          />
        </div>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded "
              type="submit"
              form="referenceForm"
            >
              {t("添加自定义引用")}
            </button>

            <button
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded "
              type="button"
              onClick={() =>
                copyToClipboard(getAllFullReferences(references, citationStyle))
              }
            >
              {t("复制所有引用")}
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded "
              type="button"
              // onClick={() => setReferences([])} // 设置引用列表为空数组
              onClick={() => handleClearReferences()}
            >
              {t("删除所有引用")}
            </button>
            {/* 下拉框用于更改引用风格 */}
            <div className="mt-4">
              <label
                htmlFor="citation-style"
                className="block text-sm font-medium text-gray-700"
              >
                选择引用格式:
              </label>
              <select
                id="citation-style"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={citationStyle}
                onChange={handleStyleChange}
              >
                <option value="apa">APA</option>
                <option value="mla">MLA</option>
                <option value="chicago">Chicago</option>
                <option value="harvard">Harvard</option>
                <option value="vancouver">Vancouver</option>
                <option value="ieee">IEEE</option>
                <option value="custom-chinese">中文</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReferenceList;
