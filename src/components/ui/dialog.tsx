"use client";

import type { ComponentProps } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { Button } from "@/components/ui/button";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Rendered through Base UI's `render` function-prop rather than a plain
 * `className` so the backdrop can read `state.transitionStatus` — Base UI
 * keeps the element mounted through a "ending" status and only removes it
 * once it detects the animation on it has finished, so handing that status
 * to framer-motion (instead of a CSS transition) is enough to get a correct
 * exit with no manual mount-tracking, unlike Accordion's Panel (which
 * doesn't defer removal the same way).
 */
function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      render={(backdropProps, state) => {
        const exiting = state.transitionStatus === "ending";
        return (
          <motion.div
            {...(backdropProps as Record<string, unknown>)}
            className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={exiting ? spring.slow.exit : spring.slow.enter}
          />
        );
      }}
      {...props}
    />
  );
}

/**
 * Centered, fully-rounded surface — unlike Sheet (which sits flush against a
 * viewport edge), a dialog is a detached floating plane, so it gets the
 * `--popover` step and `shadow-panel` on every side rather than Sheet's
 * edge-attached treatment.
 */
function DialogContent({
  className,
  children,
  size = "sm",
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  size?: "sm" | "lg";
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        render={(popupProps, state) => {
          const exiting = state.transitionStatus === "ending";
          return (
            <motion.div
              {...(popupProps as Record<string, unknown>)}
              {...(props as Record<string, unknown>)}
              className={cn(
                "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] flex-col rounded-xl bg-popover p-6 text-popover-foreground shadow-panel outline-none",
                size === "sm" && "max-w-sm",
                size === "lg" && "max-w-lg",
                className,
              )}
              initial={{ opacity: 0, scale: 0.97, x: "-50%", y: "-50%" }}
              animate={{
                opacity: exiting ? 0 : 1,
                scale: exiting ? 0.97 : 1,
                x: "-50%",
                y: "-50%",
              }}
              transition={exiting ? spring.slow.exit : spring.slow.enter}
            >
              {children}
              {showCloseButton && (
                <DialogPrimitive.Close
                  data-slot="dialog-close"
                  render={
                    <Button
                      variant="ghost"
                      // Ghost's default hover:bg-muted is calibrated against
                      // --background; on --popover it's nearly invisible in
                      // dark mode (0.3 vs muted's 0.295 lightness — a ~0.005
                      // step). A foreground-tinted overlay contrasts against
                      // any surface instead of matching one particular token.
                      className="absolute top-3 right-3 hover:bg-foreground/10 dark:hover:bg-foreground/10"
                      size="icon-sm"
                    />
                  }
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          );
        }}
      />
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-control font-medium text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
