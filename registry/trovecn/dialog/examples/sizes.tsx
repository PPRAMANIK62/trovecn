"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DialogSizesExample() {
  return (
    <div className="flex gap-3">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Open small</DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Small dialog</DialogTitle>
            <DialogDescription>Sized for a confirmation or a short form.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Open large</DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Large dialog</DialogTitle>
            <DialogDescription>
              Sized for denser content — a settings panel or a multi-field form.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
