import React, { useState } from "react";

import { Reference } from "@/utils/global";

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
    <div>
      {/* 这里可以添加输入界面和添加按钮 */}
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
          setNewTitle("");
          setNewAuthor("");
        }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Author"
        />
        <input
          type="text"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          placeholder="Year"
        />
        <input
          type="text"
          value={newPublisher}
          onChange={(e) => setNewPublisher(e.target.value)}
          placeholder="Publisher"
        />
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL"
        />

        <button type="submit">Add Reference</button>
      </form>
      {/* 这里可以添加显示界面 */}
      <ul>
        {references.map((reference, index) => (
          <li key={index}>
            {/* 如果存在url，则输出(url) */}
            {reference.author}. {reference.title}. {reference.year}. {reference.venue}. {reference.url && <>({reference.url})</>}
            <button onClick={() => removeReference(index)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReferenceList;
