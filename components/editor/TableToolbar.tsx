"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  BetweenHorizontalEndIcon,
  BetweenVerticalEndIcon,
  Columns3Icon,
  PanelTopIcon,
  Rows3Icon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TableActionProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

function TableAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  destructive,
}: TableActionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={cn(destructive && "text-destructive hover:text-destructive")}
    >
      <Icon data-icon="inline-start" />
      {label}
    </Button>
  );
}

/**
 * Baris kontrol tabel di bawah toolbar, hanya tampil saat kursor berada di
 * dalam tabel. Setiap aksi bekerja pada sel tempat kursor berada.
 */
export function TableToolbar({ editor }: { editor: Editor }) {
  const can = useEditorState({
    editor,
    selector: ({ editor }) => ({
      addRow: editor.can().addRowAfter(),
      addColumn: editor.can().addColumnAfter(),
      deleteRow: editor.can().deleteRow(),
      deleteColumn: editor.can().deleteColumn(),
      toggleHeaderRow: editor.can().toggleHeaderRow(),
    }),
  });

  return (
    <div
      role="toolbar"
      aria-label="Pengaturan tabel"
      className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1"
    >
      <TableAction
        label="Baris"
        icon={BetweenHorizontalEndIcon}
        disabled={!can.addRow}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      />
      <TableAction
        label="Kolom"
        icon={BetweenVerticalEndIcon}
        disabled={!can.addColumn}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      />
      <TableAction
        label="Baris judul"
        icon={PanelTopIcon}
        disabled={!can.toggleHeaderRow}
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      />
      <TableAction
        label="Hapus baris"
        icon={Rows3Icon}
        disabled={!can.deleteRow}
        onClick={() => editor.chain().focus().deleteRow().run()}
      />
      <TableAction
        label="Hapus kolom"
        icon={Columns3Icon}
        disabled={!can.deleteColumn}
        onClick={() => editor.chain().focus().deleteColumn().run()}
      />
      <TableAction
        label="Hapus tabel"
        icon={Trash2Icon}
        destructive
        onClick={() => editor.chain().focus().deleteTable().run()}
      />
    </div>
  );
}
