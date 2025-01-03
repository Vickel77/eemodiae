"use client";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseDocument } from "htmlparser2";

export default function removeHtmlTags(html: any) {
  // const parser = new DOMParser();
  // const doc = parser.parseFromString(html, "text/html");
  const _doc: any = parseDocument(html);
  const doc = _doc.children[0].children[0].data;
  return doc;
  // Recursively collect text content while adding spaces where appropriate
  // function getTextWithSpaces(node: ChildNode) {
  //   let text = "";

  //   node.childNodes.forEach((child) => {
  //     if (child.nodeType === Node.TEXT_NODE) {
  //       text += child?.textContent?.trim() + " "; // Add space after each text node
  //     } else if (child.nodeType === Node.ELEMENT_NODE) {
  //       text += getTextWithSpaces(child); // Recursively get text for child elements
  //     }
  //   });

  //   return text;
  // }

  // const plainText = getTextWithSpaces(doc.body).trim(); // Trim trailing spaces
  // return plainText;
}

const contentRendererOptions = {
  preserveWhitespace: true,
};

export const smallDescription = (content: any) => {
  return (
    removeHtmlTags(documentToHtmlString(content, contentRendererOptions))
      ?.split(" ")
      .slice(0, 20)
      .join(" ") + "..."
  );
};
