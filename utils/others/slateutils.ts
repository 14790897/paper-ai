import { Node } from "slate";

const extractText = (nodes: Node[]): string => {
  return nodes
    .map((node: any) => {
      // 如果节点是文本节点
      if ("text" in node) {
        return node.text;
      }

      // 如果节点是元素且包含子节点
      if (Array.isArray(node.children)) {
        return extractText(node.children);
      }

      return "";
    })
    .join("");
};

export { extractText };
