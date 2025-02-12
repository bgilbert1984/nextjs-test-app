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


const SlateEditor = () => {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback((props: RenderElementProps) => {
    const style = { textAlign: props.element.align }; // Use align
    switch (props.element.type) {
      case "code":
        return <pre {...props.attributes} style={style}>{props.children}</pre>;
      case "block-quote":
        return <blockquote {...props.attributes} style={style}>{props.children}</blockquote>;
      case "heading-one":
        return <h1 {...props.attributes} style={style}>{props.children}</h1>;
      case "heading-two":
        return <h2 {...props.attributes} style={style}>{props.children}</h2>;
      case "list-item":
        return <li {...props.attributes} style={style}>{props.children}</li>;
      case "numbered-list":
        return <ol {...props.attributes} style={style}>{props.children}</ol>;
      default:
        return <p {...props.attributes} style={style}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    if (props.leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (props.leaf.italic) {
      children = <em>{children}</em>;
    }
    if (props.leaf.underline) {
      children = <u>{children}</u>;
    }
    if (props.leaf.code) {
      children = <code>{children}</code>
    }
    return <span {...props.attributes}>{children}</span>;
  }, []);

  const toggleMark = useCallback((editor: Editor, format: 'bold' | 'italic' | 'underline' | 'code') => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }, []);

  const toggleBlock = useCallback((editor: Editor, format: string) => {
    const isActive = isBlockActive(
      editor,
      format,
      TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type' // Pass blockType
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type) &&
        !TEXT_ALIGN_TYPES.includes(format),
      split: true,
    });

    let newProperties: Partial<SlateElement>;

    if (TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      } as Partial<SlateElement>;
    }
    else {
      newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
      } as Partial<SlateElement>;
    }

    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  }, []);

  const isBlockActive = useCallback((editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n[blockType as keyof CustomElement] === format,
      })
    );

    return !!match
  }, []);

  const isMarkActive = useCallback((editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format as keyof typeof marks] === true : false
  }, []);

  const Toolbar = () => {
    return (
      <div className="flex space-x-2 mb-2">
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="left" icon="format_align_left" />
        <BlockButton format="center" icon="format_align_center" />
        <BlockButton format="right" icon="format_align_right" />
        <BlockButton format="justify" icon="format_align_justify" />
      </div>
    )
  }

  const BlockButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
      <button
        className={`bg-gray-200 px-3 py-1 rounded-md ${
          isBlockActive(
            editor,
            format,
            TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
          )
          ? "bg-gray-400"
          : ""
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
      >
        {icon}
      </button>
    );
  };

  const MarkButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
      <button
        className={`bg-gray-200 px-3 py-1 rounded-md ${
          isMarkActive(editor, format) ? "bg-gray-400" : ""
        }`}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
      >
        {icon} {/* Display the icon text (for now) */}
      </button>
    );
  };

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(newValue) => {
        setValue(newValue as CustomElement[]);
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(newValue);
          localStorage.setItem("content", content);
        }
      }}
    >
      <Toolbar />
      <Editable
        className="p-2"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
    </Slate>
  );
};

export default SlateEditor;