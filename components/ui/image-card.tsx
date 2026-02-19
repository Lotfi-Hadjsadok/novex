"use client";

import * as React from "react";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export const IMAGE_CARD_DRAG_TYPE = "image-picker-item";

export interface ImageCardProps {
  index: number;
  preview: string | undefined;
  disabled?: boolean;
  onRemove: () => void;
  onMove: (from: number, to: number) => void;
}

export function ImageCard({
  index,
  preview,
  disabled,
  onRemove,
  onMove,
}: ImageCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: IMAGE_CARD_DRAG_TYPE,
    item: () => ({ type: IMAGE_CARD_DRAG_TYPE, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: () => !disabled,
  });

  const [{ isOver }, drop] = useDrop({
    accept: IMAGE_CARD_DRAG_TYPE,
    drop: (draggedItem: { index: number }) =>
      draggedItem.index !== index && onMove(draggedItem.index, index),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
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
        onClick={(event) => (event.stopPropagation(), onRemove())}
        disabled={disabled}
        aria-label={`Remove image ${index + 1}`}
      >
        <XIcon className="size-2.5" />
      </Button>
    </div>
  );
}
