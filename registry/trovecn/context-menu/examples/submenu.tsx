"use client";

import { DownloadIcon, LinkIcon, MailIcon, ShareIcon, StarIcon } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function ContextMenuSubmenuExample() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-border text-caption text-muted-foreground">
        Right-click this area
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <StarIcon />
          Add to favorites
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareIcon />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>
              <LinkIcon />
              Copy link
            </ContextMenuItem>
            <ContextMenuItem>
              <MailIcon />
              Email
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <DownloadIcon />
          Download
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
