import { Reference } from "@/utils/global";

function getTextBeforeCursor(quill, length = 500) {
  const cursorPosition = quill.getSelection().index;
  const start = Math.max(0, cursorPosition - length); // 确保开始位置不是负数
  return quill.getText(start, cursorPosition - start);
}

function getNumberBeforeCursor(quill, length = 3000) {
  const cursorPosition = quill.getSelection().index;
  const start = Math.max(0, cursorPosition - length); // 确保开始位置不是负数
  const textBeforeCursor = quill.getText(start, cursorPosition - start);

  // 使用正则表达式匹配格式为[数字]的文本
  const regex = /\[(\d+)\]/g;
  let match;
  let lastMatch;

  // 使用循环找到最后一个匹配项
  while ((match = regex.exec(textBeforeCursor)) !== null) {
    lastMatch = match;
  }

  // 如果找到了匹配项，返回匹配到的数字（转换为数字类型）
  if (lastMatch) {
    return parseInt(lastMatch[1], 10);
  }

  // 如果没有找到匹配项，返回 0
  return 0;
}

function updateBracketNumbersInDelta(delta) {
  let currentNumber = 1;

  const updatedOps = delta.ops.map((op) => {
    if (typeof op.insert === "string") {
      return {
        ...op,
        insert: op.insert.replace(/\[\d+\]/g, () => `[${currentNumber++}]`),
      };
    }
    return op;
  });

  return { ops: updatedOps };
}

function deleteReferenceNumberOrParagraph(
  delta,
  indexToRemove: number,
  quill,
  deleteParagraph: boolean
) {
  const indexStr = `[${indexToRemove + 1}]`;
  const updatedOps = delta.ops.flatMap((op, i) => {
    if (typeof op.insert === "string") {
      const indexPos = op.insert.indexOf(indexStr);
      if (indexPos !== -1) {
        if (deleteParagraph) {
          // // 检查是否包含要删除的索引并找到段落的起止位置
          // let startPos = op.insert.lastIndexOf("\n", indexPos) + 1;
          // let endPos = op.insert.indexOf("\n", indexPos);
          // console.log("startPos", startPos);
          // console.log("endPos", endPos);
          // // 如果没有找到首部的换行符，说明是文档的第一个段落或索引紧跟在段落开头
          // if (startPos === 0 && indexPos > 0) {
          //   // 直接从文档开始删除到段落末尾
          //   startPos = 0; // 从文档开头开始
          // }
          // // 如果没有找到末尾的换行符，说明索引在文档或段落的末尾
          // endPos = endPos === -1 ? op.insert.length : endPos;
          // // 删除整个段落
          // console.log("startPos2", startPos);
          // console.log("endPos2", endPos);
          // const before = op.insert.slice(0, startPos);
          // const after = op.insert.slice(endPos);
          // op.insert = before + after;
          // // 如果处理后的insert为空字符串，我们返回一个空数组来避免创建空操作
          // console.log("删除整个段落");
          // return op.insert ? [op] : [];
          // 找到索引所在的op，开始向前和向后搜索段落的边界
          let startPos = findPrevParagraphEnd(delta.ops, i);
          let endPos = findNextParagraphStart(delta.ops, i);

          // 删除段落：需要根据startPos和endPos来决定删除或修改哪些op
          // 这可能包括从一个op中删除文本，或者完全删除一个或多个op
          deleteParagraphOps(delta.ops, startPos, endPos);
        } else {
          // 删除单个索引的逻辑
          const before = op.insert.slice(0, indexPos);
          const after = op.insert.slice(indexPos + indexStr.length);
          op.insert = before + after;
          console.log("删除索引");
        }
      }
    }
    // 对于不需要修改的op，直接返回
    return [op];
  });

  return { ops: updatedOps };
}

function findPrevParagraphEnd(ops, currentIndex) {
  // 从当前索引向前搜索换行符
  for (let i = currentIndex - 1; i >= 0; i--) {
    const op = ops[i];
    if (typeof op.insert === "string") {
      const newlineIndex = op.insert.lastIndexOf("\n");
      // 如果在当前op中找到了换行符，返回这个位置和op的索引
      if (newlineIndex !== -1) {
        return { opIndex: i, charIndex: newlineIndex + 1 };
      }
    }
  }
  // 如果没有找到换行符，返回文档开头的位置
  return { opIndex: -1, charIndex: 0 };
}
function findNextParagraphStart(ops, currentIndex) {
  // 从当前索引向后搜索换行符
  for (let i = currentIndex; i < ops.length; i++) {
    const op = ops[i];
    if (typeof op.insert === "string") {
      const newlineIndex = op.insert.indexOf("\n");
      // 如果在当前op中找到了换行符，返回这个位置和op的索引
      if (newlineIndex !== -1) {
        return { opIndex: i, charIndex: newlineIndex + 1 };
      }
    }
  }
  // 如果没有找到换行符，返回文档末尾的位置
  return {
    opIndex: ops.length - 1,
    charIndex: ops[ops.length - 1].insert.length,
  };
}
function deleteParagraphOps(ops, startPos, endPos) {
  // 如果段落在同一个op内
  if (startPos.opIndex === endPos.opIndex && startPos.opIndex !== -1) {
    const op = ops[startPos.opIndex];
    const before = op.insert.substring(0, startPos.charIndex);
    const after = op.insert.substring(endPos.charIndex);
    op.insert = before + after;
    if (op.insert === "") {
      // 如果op为空，则移除此op
      ops.splice(startPos.opIndex, 1);
    }
  } else {
    // 处理跨越多个op的段落删除
    // 1. 修改或删除起始op
    if (startPos.opIndex !== -1) {
      const startOp = ops[startPos.opIndex];
      startOp.insert = startOp.insert.substring(0, startPos.charIndex);
      if (startOp.insert === "") {
        // 如果起始op为空，删除之
        ops.splice(startPos.opIndex, 1);
        // 调整结束位置索引，因为数组长度减少了
        endPos.opIndex--;
      }
    }

    // 2. 删除起始位置和结束位置之间的所有op
    const deleteCount = endPos.opIndex - startPos.opIndex - 1;
    if (deleteCount > 0) {
      ops.splice(startPos.opIndex + 1, deleteCount);
    }

    // 3. 修改或删除结束op
    if (endPos.opIndex !== -1 && endPos.opIndex < ops.length) {
      const endOp = ops[endPos.opIndex];
      endOp.insert = endOp.insert.substring(endPos.charIndex);
      if (endOp.insert === "" && deleteCount >= 0) {
        // 如果结束op为空，删除之
        ops.splice(endPos.opIndex, 1);
      }
    }
  }
}

// function deleteUpdateBracketNumbers(delta, indexToRemove:number, quill) {
//   let currentNumber = 1;

//   const updatedOps = delta.ops.map((op, i) => {
//     if (typeof op.insert === "string") {
//       // 如果文本包含要删除的索引，删除它
//       if (op.insert.includes(`[${indexToRemove + 1}]`)) {
//         const start = delta.index + i;
//         const end = start + op.insert.length;
//         quill.deleteText(start, end);
//         return op;
//       }

//       // 否则，更新括号中的数字
//       return {
//         ...op,
//         insert: op.insert.replace(/\[\d+\]/g, () => `[${currentNumber++}]`),
//       };
//     }
//     return op;
//   });

//   return { ops: updatedOps };
// }

function updateBracketNumbersInDeltaKeepSelection(quill) {
  const selection = quill.getSelection();
  const delta = quill.getContents();
  const updatedDelta = updateBracketNumbersInDelta(delta);
  quill.setContents(updatedDelta);
  if (selection) {
    quill.setSelection(selection.index, selection.length);
  }
}

export function delteIndexUpdateBracketNumbersInDeltaKeepSelection(
  quill,
  index: number,
  rmPg: boolean
) {
  const selection = quill.getSelection();
  const delta = quill.getContents();
  let updatedDelta = deleteReferenceNumberOrParagraph(
    delta,
    index,
    quill,
    rmPg
  );
  updatedDelta = updateBracketNumbersInDelta(updatedDelta);
  quill.setContents(updatedDelta);
  if (selection) {
    quill.setSelection(selection.index, selection.length);
  }
}

function convertToSuperscript(quill) {
  const text = quill.getText();
  const regex = /\[\d+\]/g; // 正则表达式匹配 "[数字]" 格式
  let match;

  while ((match = regex.exec(text)) !== null) {
    const startIndex = match.index;
    const length = match[0].length;

    // 应用上标格式
    quill.formatText(startIndex, length, { script: "super" });
    // 重置格式（如果需要）
    if (startIndex + length < text.length) {
      quill.formatText(startIndex + length, 1, "script", false);
    }
  }
}

function getRandomOffset(max: number) {
  return Math.floor(Math.random() * max);
}

function removeSpecialCharacters(str: string): string {
  // 正则表达式匹配除了字母、空格和中文之外的所有字符
  const regex = /[^\u4e00-\u9fa5a-zA-Z ]/g;
  return str.replace(regex, "");
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => console.log("文献引用复制到剪贴板"),
    (err) => console.error("复制到剪贴板失败:", err)
  );
}

function formatReferenceForCopy(reference: Reference): string {
  let referenceStr = `${reference.author}. ${reference.title}. `;
  if (reference.journal && reference.journal.name) {
    referenceStr += `${reference.journal.name}[J], ${reference.year}, `;
    if (reference.journal.volume) referenceStr += `${reference.journal.volume}`;
    if (reference.journal.pages) referenceStr += `: ${reference.journal.pages}`;
    referenceStr += ".";
  } else {
    referenceStr += `${reference.venue}, ${reference.year}.`;
  }
  return referenceStr;
}
function formatAllReferencesForCopy(references: Reference[]): string {
  return references
    .map(
      (reference, index) =>
        `[${index + 1}] ${formatReferenceForCopy(reference)}`
    )
    .join("\n");
}

export function formatTextInEditor(editor) {
  convertToSuperscript(editor);
  updateBracketNumbersInDeltaKeepSelection(editor);
}

export {
  getTextBeforeCursor,
  updateBracketNumbersInDelta,
  updateBracketNumbersInDeltaKeepSelection,
  convertToSuperscript,
  getRandomOffset,
  removeSpecialCharacters,
  copyToClipboard,
  formatReferenceForCopy,
  formatAllReferencesForCopy,
  getNumberBeforeCursor,
};
