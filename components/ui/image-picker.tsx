"use client";

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";
import { ImageCard } from "@/components/ui/image-card";

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
    const previewMap = new Map<number, string>();
    value.forEach((file, fileIndex) => previewMap.set(fileIndex, URL.createObjectURL(file)));
    setPreviews((previousPreviews) => {
      previousPreviews.forEach((url) => URL.revokeObjectURL(url));
      return previewMap;
    });
    return () => previewMap.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const addFiles = (files: File[]) => {
    const remainingSlots = maxImages ? maxImages - value.length : Infinity;
    onChange?.([...value, ...files.slice(0, remainingSlots)]);
  };

  const removeFileAt = (fileIndex: number) =>
    onChange?.(value.filter((_, filterIndex) => filterIndex !== fileIndex));

  const moveFile = (from: number, to: number) => {
    const reordered = [...value];
    reordered.splice(to, 0, reordered.splice(from, 1)[0]);
    onChange?.(reordered);
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDropActive(false);
    if (disabled) return;
    const droppedFiles = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (droppedFiles.length) addFiles(droppedFiles);
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
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files || []);
            if (selectedFiles.length) addFiles(selectedFiles);
            event.target.value = "";
          }}
        />

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {value.map((file, fileIndex) => (
            <ImageCard
              key={`${file.name}-${fileIndex}`}
              index={fileIndex}
              preview={previews.get(fileIndex)}
              disabled={disabled}
              onRemove={() => removeFileAt(fileIndex)}
              onMove={moveFile}
            />
          ))}
          {canAdd && (
            <div
              onDragOver={(event) => (event.preventDefault(), setDropActive(true))}
              onDragLeave={(event) => (event.preventDefault(), setDropActive(false))}
              onDrop={handleFileDrop}
              className={cn(
                "relative aspect-square rounded-md border-2 border-dashed transition-colors",
                dropActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-primary/50",
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
                  {dropActive ? (
                    <Upload className="size-3.5 text-primary" />
                  ) : (
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{dropActive ? "Drop" : "Add"}</p>
              </Button>
            </div>
          )}
        </div>

        {value.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {maxImages
              ? `${value.length}/${maxImages} images`
              : `${value.length} image${value.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </DndProvider>
  );
}
