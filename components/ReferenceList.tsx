import React, { useState } from "react";

import { Reference } from "@/utils/global";
import {
  copyToClipboard,
  formatReferenceForCopy,
} from "@/utils/others/quillutils";
type ReferenceListProps = {
  references: Reference[];
  addReference: (reference: Reference) => void;
  removeReference: (index: number) => void;
};

function ReferenceList({
  references,
  addReference,
  removeReference,
}: ReferenceListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newYear, setNewYear] = useState(2020);
  const [newPublisher, setNewPublisher] = useState("");
  const [newUrl, setNewUrl] = useState("");
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
          setNewYear(2020);
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
            onChange={(e) => setNewYear(parseInt(e.target.value))}
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
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          type="submit"
        >
          Add Reference
        </button>
      </form>

      {/* 引用列表显示区域 */}
      <ul>
        {references.map((reference, index) => (
          <li key={index} className="mb-3 p-2 border-b">
            {/* 显示序号 */}
            <span className="font-bold mr-2">[{index + 1}].</span>
            {reference.author}. {reference.title}.{" "}
            {/* 判断 journal 字段是否存在 */}
            {reference.journal && reference.journal.name ? (
              <span>
                {reference.journal.name},{reference.year},
                {reference.journal.volume ? ` ${reference.journal.volume}` : ""}
                {reference.journal.pages ? `: ${reference.journal.pages}` : ""}.
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
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 ml-2 rounded"
              onClick={() => copyToClipboard(formatReferenceForCopy(reference))}
            >
              复制
            </button>
            <button
              className="text-red-500 hover:text-red-700 ml-4"
              onClick={() => removeReference(index)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReferenceList;
