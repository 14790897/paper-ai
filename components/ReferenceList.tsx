import React, { useState } from "react";

import { Reference } from "@/utils/global";
import {
  copyToClipboard,
  formatReferenceForCopy,
  formatAllReferencesForCopy,
  delteIndexUpdateBracketNumbersInDeltaKeepSelection,
} from "@/utils/others/quillutils";
type ReferenceListProps = {
  references: Reference[];
  addReference: (reference: Reference) => void;
  removeReference: (index: number) => void;
  setReferences: any;
  editor: any;
};

function ReferenceList({
  references,
  addReference,
  removeReference,
  setReferences,
  editor,
}: ReferenceListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function moveReferenceUp(index: number) {
    setReferences((prevReferences) => {
      if (index === 0) return prevReferences; // 如果是第一个元素，不进行操作

      const newReferences = [...prevReferences];
      const temp = newReferences[index];
      newReferences[index] = newReferences[index - 1];
      newReferences[index - 1] = temp;
      console.log("moveReferenceUp", newReferences); // 调试输出

      return newReferences;
    });
  }

  function moveReferenceDown(index: number) {
    setReferences((prevReferences) => {
      if (index === prevReferences.length - 1) return prevReferences; // 如果是最后一个元素，不进行操作

      const newReferences = [...prevReferences];
      const temp = newReferences[index];
      newReferences[index] = newReferences[index + 1];
      newReferences[index + 1] = temp;
      console.log("moveReferenceDown", newReferences); // 调试输出

      return newReferences;
    });
  }

  function removeReferenceUpdateIndex(index: number) {
    removeReference(index);
    delteIndexUpdateBracketNumbersInDeltaKeepSelection(editor, index);
  }
  return (
    <div className="container mx-auto p-4">
      {/* 表单区域 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addReference({
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
        }}
        className="mb-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <input
            className="border p-2 rounded"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="Author"
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="Year"
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
            placeholder="Publisher"
          />
          <input
            className="border p-2 rounded"
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL"
          />
        </div>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
              type="submit"
            >
              Add Reference
            </button>

            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded "
              onClick={() =>
                copyToClipboard(formatAllReferencesForCopy(references))
              }
            >
              复制所有引用
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded "
              onClick={() => setReferences([])} // 设置引用列表为空数组
            >
              删除所有引用
            </button>
          </div>
        </div>
      </form>
      {/* 引用列表显示区域 */}
      <ul>
        {references.map(
          (reference, index) =>
            reference && (
              <li key={index} className="mb-3 p-2 border-b">
                {/* 显示序号 */}
                <span className="font-bold mr-2">[{index + 1}].</span>
                {reference.author}. {reference.title}.{" "}
                {/* 判断 journal 字段是否存在 */}
                {reference.journal && reference.journal.name ? (
                  <span>
                    {reference.journal.name}[J],{reference.year},
                    {reference.journal.volume
                      ? ` ${reference.journal.volume}`
                      : ""}
                    {reference.journal.pages
                      ? `: ${reference.journal.pages}`
                      : ""}
                    .
                  </span>
                ) : (
                  <span>
                    {reference.venue}, {reference.year}.
                  </span>
                )}
                {reference.url && (
                  <a
                    href={reference.url}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {" "}
                    ({reference.url})
                  </a>
                )}
                {/* <button
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
                </button> */}
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 ml-2 rounded"
                  onClick={() =>
                    copyToClipboard(formatReferenceForCopy(reference))
                  }
                >
                  复制
                </button>
                <button
                  className="text-red-500 hover:text-red-700 ml-4"
                  onClick={() => removeReferenceUpdateIndex(index)}
                >
                  X
                </button>
              </li>
            )
        )}
      </ul>
    </div>
  );
}

export default ReferenceList;
