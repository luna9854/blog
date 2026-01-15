"use client";

import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { Editor } from "@toast-ui/react-editor";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

interface TuiEditorProps {
  initialValue?: string;
  height?: string;
  placeholder?: string;
  className?: string;
}

export interface EditorRef {
  getInstance: () => {
    getMarkdown: () => string;
  };
  insertText: (text: string) => void;
}

export const TuiEditor = forwardRef<EditorRef, TuiEditorProps>(
  function TuiEditor(
    { className, height = "600px", initialValue = "", placeholder },
    ref
  ) {
    const editorRef = useRef<Editor>(null);

    useImperativeHandle(ref, () => ({
      getInstance: () => ({
        getMarkdown: () => editorRef.current?.getInstance().getMarkdown() ?? "",
      }),
      insertText: (text: string) => {
        const editor = editorRef.current?.getInstance();
        if (editor) {
          editor.insertText(text);
        }
      },
    }));

    return (
      <div className={cn("tui-editor-dark-theme", className)}>
        <Editor
          ref={editorRef}
          initialValue={initialValue}
          placeholder={placeholder}
          previewStyle="vertical"
          height={height}
          initialEditType="markdown"
          useCommandShortcut={true}
          theme="dark"
          toolbarItems={[
            ["heading", "bold", "italic", "strike"],
            ["hr", "quote"],
            ["ul", "ol", "task"],
            ["table", "link"],
            ["code", "codeblock"],
          ]}
        />
      </div>
    );
  }
);
