"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Element as SlateElement,
  Descendant,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
  useSlate
} from "slate-react";
import { withHistory, HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

// --- Copied from Example ---
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
// --- End Copied ---

// Define custom element and text types
type CustomElement = {
  type:
    | "paragraph"
    | "code"
    | "block-quote"
    | "heading-one"
    | "heading-two"
    | "list-item"
    | "numbered-list";
    align?: 'left' | 'center' | 'right' | 'justify'; // Added align
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

// Extend the default editor type
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: CustomElement[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

// Placeholder for SlateEditor component
const SlateEditor = () => {
  return <div>SlateEditor Component</div>;
};
export default SlateEditor;