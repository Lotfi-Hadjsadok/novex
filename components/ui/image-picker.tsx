"use client";

import * as React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, XIcon, Upload } from "lucide-react";

const TYPE = "image-picker-item";

function ImageCard({
  index,
  preview,
  disabled,
  onRemove,
  onMove,
}: {
  index: number;
  preview: string | undefined;
  disabled?: boolean;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: TYPE,
    item: () => ({ type: TYPE, index }),
    collect: (m) => ({ isDragging: m.isDragging() }),
    canDrag: () => !disabled,
  });
  const [{ isOver }, drop] = useDrop({
    accept: TYPE,
    drop: (item: { index: number }) => item.index !== index && onMove(item.index, index),
    collect: (m) => ({ isOver: m.isOver() }),
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-md border border-border bg-muted transition-colors",
        isDragging && "opacity-50",
        isOver && "border-2 border-primary ring-2 ring-primary/20"
      )}
    >
      {preview && (
        <img src={preview} alt="" className="h-full w-full object-cover pointer-events-none" />
      )}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute right-0.5 top-0.5 size-5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => (e.stopPropagation(), onRemove())}
        disabled={disabled}
        aria-label={`Remove image ${index + 1}`}
      >
        <XIcon className="size-2.5" />
      </Button>
    </div>
  );
}

export interface ImagePickerProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  maxImages?: number;
}

export function ImagePicker({
  value = [],
  onChange,
  accept = "image/*",
  className,
  disabled,
  maxImages,
}: ImagePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<Map<number, string>>(new Map());
  const [dropActive, setDropActive] = React.useState(false);

  React.useEffect(() => {
    const map = new Map<number, string>();
    value.forEach((file, i) => map.set(i, URL.createObjectURL(file)));
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return map;
    });
    return () => map.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const addFiles = (files: File[]) => {
    const rest = maxImages ? maxImages - value.length : Infinity;
    onChange?.([...value, ...files.slice(0, rest)]);
  };

  const remove = (i: number) => onChange?.(value.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange?.(next);
  };

  const onFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  };

  const canAdd = !maxImages || value.length < maxImages;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("space-y-3", className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          aria-label="Select images"
          disabled={disabled || !canAdd}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) addFiles(files);
            e.target.value = "";
          }}
        />

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {value.map((file, i) => (
            <ImageCard
              key={`${file.name}-${i}`}
              index={i}
              preview={previews.get(i)}
              disabled={disabled}
              onRemove={() => remove(i)}
              onMove={move}
            />
          ))}
          {canAdd && (
            <div
              onDragOver={(e) => (e.preventDefault(), setDropActive(true))}
              onDragLeave={(e) => (e.preventDefault(), setDropActive(false))}
              onDrop={onFileDrop}
              className={cn(
                "relative aspect-square rounded-md border-2 border-dashed transition-colors",
                dropActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Button
                type="button"
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center gap-1 p-1"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                <div className="rounded-full bg-primary/10 p-1.5">
                  {dropActive ? <Upload className="size-3.5 text-primary" /> : <ImageIcon className="size-3.5 text-muted-foreground" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{dropActive ? "Drop" : "Add"}</p>
              </Button>
            </div>
          )}
        </div>

        {value.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {maxImages ? `${value.length}/${maxImages} images` : `${value.length} image${value.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </DndProvider>
  );
}
