"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";

type RichTextEditorProps = {
  /** Konten dalam bentuk HTML. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  id?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

// Gaya konten ditulis di sini karena office tidak memasang @tailwindcss/typography.
const contentClassName = cn(
  "[&_.ProseMirror]:min-h-48 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none",
  "[&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
);

/**
 * Editor teks berformat (Tiptap) yang dipakai bersama oleh campaign, blog,
 * dan pengaturan. Hasilnya HTML; sanitasi dilakukan di server saat disimpan.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-invalid": ariaInvalid,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Fitur dibatasi agar HTML yang dihasilkan sama dengan allowlist sanitizer.
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Atribut aksesibilitas dipasang ke elemen contenteditable, bukan pembungkusnya.
  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          ...(id && { id }),
          ...(ariaLabelledBy && { "aria-labelledby": ariaLabelledBy }),
          "aria-invalid": String(!!ariaInvalid),
        },
      },
    });
  }, [editor, id, ariaLabelledBy, ariaInvalid]);

  // Sinkronkan bila nilai diubah dari luar editor (misalnya form di-reset).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div
      data-invalid={ariaInvalid}
      className={cn(
        "rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 dark:bg-input/30",
        className,
      )}
    >
      {editor ? (
        <EditorToolbar editor={editor} />
      ) : (
        <div className="h-9 border-b" />
      )}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
