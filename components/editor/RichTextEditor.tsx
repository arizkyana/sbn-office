"use client";

import { useEffect, useState } from "react";
import FileHandler from "@tiptap/extension-file-handler";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { COVER_EXTENSIONS } from "@/lib/cover";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";
import {
  handleImageUpload,
  removeForeignImages,
  type ImageUploader,
} from "./image-upload";

type RichTextEditorProps = {
  /** Konten dalam bentuk HTML. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  /**
   * Server Action upload gambar, contoh `uploadEditorImage`. Bila diisi, gambar
   * bisa disisipkan lewat tombol "Gambar", paste, dan drag-drop.
   */
  imageUpload?: ImageUploader;
  id?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

// Gaya konten ditulis di sini karena office tidak memasang @tailwindcss/typography.
const contentClassName = cn(
  "[&_.ProseMirror]:min-h-48 [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none",
  "[&_p]:my-2 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top [&_th]:border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:align-top [&_th]:font-semibold [&_td_p]:my-0 [&_th_p]:my-0 [&_.selectedCell]:bg-primary/10 [&_.tableWrapper]:overflow-x-auto",
  "[&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-ring",
);

/**
 * Editor teks berformat (Tiptap) yang dipakai bersama oleh campaign, blog,
 * dan pengaturan. Hasilnya HTML; sanitasi dilakukan di server saat disimpan.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  imageUpload,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-invalid": ariaInvalid,
  className,
}: RichTextEditorProps) {
  // Extension dan callback-nya dibuat sekali saat editor dibuat. imageUpload
  // diharapkan tetap (Server Action yang di-import, contoh uploadEditorImage).
  const [hasImages] = useState(Boolean(imageUpload));
  const [uploadingCount, setUploadingCount] = useState(0);

  // File diunggah satu per satu; yang pertama disisipkan di posisi drop.
  const insertImages = async (
    editor: Editor,
    files: File[],
    position?: number,
  ) => {
    if (!imageUpload) return;

    setUploadingCount((count) => count + files.length);
    for (const [index, file] of files.entries()) {
      const error = await handleImageUpload({
        editor,
        file,
        upload: imageUpload,
        position: index === 0 ? position : undefined,
      });
      setUploadingCount((count) => count - 1);
      if (error) toast.error(error);
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Fitur dibatasi agar HTML yang dihasilkan sama dengan allowlist sanitizer.
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      // Lebar kolom otomatis (tanpa resize) agar HTML bersih dan responsif.
      TableKit.configure({ table: { resizable: false } }),
      ...(hasImages
        ? [
            Image.configure({
              allowBase64: false,
              HTMLAttributes: { loading: "lazy" },
            }),
            // Paste dan drag-drop file gambar → handleImageUpload.
            FileHandler.configure({
              allowedMimeTypes: Object.keys(COVER_EXTENSIONS),
              consumePasteEvent: true,
              onPaste: (editor, files) => insertImages(editor, files),
              onDrop: (editor, files, position) =>
                insertImages(editor, files, position),
            }),
          ]
        : []),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Atribut aksesibilitas dipasang ke elemen contenteditable, bukan pembungkusnya.
  // setOptions mengganti seluruh editorProps, jadi transformPastedHTML ikut di sini.
  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          ...(id && { id }),
          ...(ariaLabelledBy && { "aria-labelledby": ariaLabelledBy }),
          "aria-invalid": String(!!ariaInvalid),
        },
        ...(hasImages && { transformPastedHTML: removeForeignImages }),
      },
    });
  }, [editor, id, ariaLabelledBy, ariaInvalid, hasImages]);

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
        "rounded-lg border border-input bg-card shadow-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20 dark:bg-input/30",
        className,
      )}
    >
      {editor ? (
        <EditorToolbar
          editor={editor}
          onImageSelect={
            hasImages ? (files) => insertImages(editor, files) : undefined
          }
          isUploadingImage={uploadingCount > 0}
        />
      ) : (
        <div className="h-9 border-b" />
      )}
      <EditorContent editor={editor} className={contentClassName} />
    </div>
  );
}
