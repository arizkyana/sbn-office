"use client";

import { useRef } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Loader2Icon,
  Redo2Icon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVER_EXTENSIONS } from "@/lib/cover";
import { cn } from "@/lib/utils";

type ToolbarButtonProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
  active,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && "bg-muted text-foreground")}
    >
      <Icon className={cn(Icon === Loader2Icon && "animate-spin")} />
    </Button>
  );
}

type EditorToolbarProps = {
  editor: Editor;
  /** Diisi bila editor menerima gambar; menerima file dari tombol "Gambar". */
  onImageSelect?: (files: File[]) => void;
  isUploadingImage?: boolean;
};

export function EditorToolbar({
  editor,
  onImageSelect,
  isUploadingImage,
}: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan", previous ?? "https://");
    if (url === null) return;

    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "") {
      chain.unsetLink().run();
      return;
    }
    chain.setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
      <ToolbarButton
        label="Judul 1"
        icon={Heading1Icon}
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        label="Judul 2"
        icon={Heading2Icon}
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="Judul 3"
        icon={Heading3Icon}
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="Tebal"
        icon={BoldIcon}
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Miring"
        icon={ItalicIcon}
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Daftar berpoin"
        icon={ListIcon}
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Daftar bernomor"
        icon={ListOrderedIcon}
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Tautan"
        icon={LinkIcon}
        active={state.link}
        onClick={setLink}
      />
      {onImageSelect && (
        <>
          <ToolbarButton
            label={isUploadingImage ? "Mengunggah gambar" : "Gambar"}
            icon={isUploadingImage ? Loader2Icon : ImageIcon}
            disabled={isUploadingImage}
            onClick={() => imageInputRef.current?.click()}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept={Object.keys(COVER_EXTENSIONS).join(",")}
            multiple
            hidden
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              // Reset agar file yang sama bisa dipilih lagi.
              event.target.value = "";
              if (files.length > 0) onImageSelect(files);
            }}
          />
        </>
      )}
      <ToolbarButton
        label="Urungkan"
        icon={Undo2Icon}
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        label="Ulangi"
        icon={Redo2Icon}
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
