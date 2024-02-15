import React, { useState } from "react";

import { Reference } from "@/utils/global";
import {
  copyToClipboard,
  getFullReference,
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
} from "@/app/store/slices/authSlice";
//supabase
import { submitPaper } from "@/utils/supabase/supabaseutils";
import { createClient } from "@/utils/supabase/client";
//i18n
import { useTranslation } from "@/app/i18n/client";
type ReferenceListProps = {
  editor: any;
  lng: string;
};

function ReferenceList({ editor, lng }: ReferenceListProps) {
  //i18n
  const { t } = useTranslation(lng);
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
                  {getFullReference(reference)}
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
                    onClick={() => copyToClipboard(getFullReference(reference))}
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
              onClick={() => copyToClipboard(getAllFullReferences(references))}
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
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReferenceList;
