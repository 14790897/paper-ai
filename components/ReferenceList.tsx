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

  const buttonBaseClass =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const neutralButtonClass =
    `${buttonBaseClass} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400`;
  const dangerButtonClass =
    `${buttonBaseClass} border border-red-700 bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg focus-visible:ring-red-500`;
  const miniButtonClass =
    "inline-flex items-center justify-center rounded-md px-2 py-1 ml-2 border border-slate-300 bg-white text-slate-700 text-xs font-medium shadow-sm transition-colors duration-200 hover:bg-slate-50 hover:border-slate-400";
  const formInputClass =
    "border border-slate-300 bg-white p-2 rounded-md text-sm text-slate-700 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400";
  const selectClass =
    "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400";

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
                    className={miniButtonClass}
                    onClick={() => moveReferenceUp(index)}
                  >
                    ↑
                  </button>
                  <button
                    className={miniButtonClass}
                    onClick={() => moveReferenceDown(index)}
                  >
                    ↓
                  </button>
                  <button
                    className={miniButtonClass}
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
            className={formInputClass}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t("Title")}
          />
          <input
            className={formInputClass}
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder={t("Author")}
          />
          <input
            className={formInputClass}
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder={t("Year")}
          />
          <input
            className={formInputClass}
            type="text"
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
            placeholder={t("Publisher")}
          />
          <input
            className={formInputClass}
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={t("Url")}
          />
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 items-end">
            <button
              className={`${neutralButtonClass} w-full`}
              type="submit"
              form="referenceForm"
            >
              {t("添加自定义引用")}
            </button>

            <button
              className={`${neutralButtonClass} w-full`}
              type="button"
              onClick={() =>
                copyToClipboard(getAllFullReferences(references, citationStyle))
              }
            >
              {t("复制所有引用")}
            </button>
            <button
              className={`${dangerButtonClass} w-full`}
              type="button"
              // onClick={() => setReferences([])} // 设置引用列表为空数组
              onClick={() => handleClearReferences()}
            >
              {t("删除所有引用")}
            </button>
            {/* 下拉框用于更改引用风格 */}
            <div>
              <label
                htmlFor="citation-style"
                className="block text-sm font-medium text-gray-700"
              >
                {t("选择引用格式")}
              </label>
              <select
                id="citation-style"
                className={selectClass}
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
