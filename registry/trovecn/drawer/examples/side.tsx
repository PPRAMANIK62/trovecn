"use client";

import { useRef, useState, type ComponentProps, type ComponentType } from "react";
import {
  ChevronRightIcon,
  CopyIcon,
  CreditCardIcon,
  LinkIcon,
  LockIcon,
  PencilIcon,
  SparklesIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useProximityHover } from "@/hooks/use-proximity-hover";
import { ProximityHoverPill } from "@/components/ui/proximity-hover-pill";
import { ProximityRow } from "./proximity-row";
import { DrawerNavContent } from "./nav-content";

/**
 * A "what's new" banner — richer than a single status line (an icon chip,
 * heading, and description) but still shallow, since top drawers are the
 * one side that shouldn't try to fill the viewport height.
 */
function TopDemo() {
  return (
    <div className="flex items-start gap-3 p-6">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        <SparklesIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-control font-medium text-foreground">New: Drawer primitive</p>
        <p className="mt-0.5 text-caption text-muted-foreground">
          Edge-anchored panels with real drag-to-dismiss, ported from vaul.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DrawerClose render={<Button size="sm" variant="ghost" />}>Dismiss</DrawerClose>
        <Button size="sm" variant="outline">
          View
        </Button>
      </div>
    </div>
  );
}

/** A labeled row pairing a description with a Switch — settings toggles
 * aren't navigation targets, so these sit outside the proximity-hover
 * container the Account rows below share. */
function SettingsToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-caption text-foreground">{label}</p>
        <p className="text-meta text-muted-foreground">{description}</p>
      </div>
      <Switch size="sm" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const accountRows: { icon: ComponentType<{ className?: string }>; label: string }[] = [
  { icon: LockIcon, label: "Privacy" },
  { icon: CreditCardIcon, label: "Billing" },
];

/**
 * A real settings panel — toggle preferences up top (Switch, not
 * navigation), an Account section of chevron rows sharing one
 * proximity-hover pill below, and a sign-out footer, the same three-part
 * shape as most product settings drawers (Linear, Vercel, Notion).
 */
function RightDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } =
    useProximityHover(containerRef);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Settings</DrawerTitle>
      </DrawerHeader>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5 px-8 pt-6">
          <p className="px-3 pb-1.5 text-label text-muted-foreground uppercase">Preferences</p>
          <SettingsToggleRow
            label="Notifications"
            description="Email me about activity"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
          <SettingsToggleRow
            label="Dark mode"
            description="Match system appearance"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
        <nav className="text-minor">
          <div
            ref={containerRef}
            className="relative flex flex-col gap-0.5 px-8 py-6"
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
          >
            <ProximityHoverPill
              activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
              sessionKey={sessionRef.current}
            />
            <p className="px-3 pb-1.5 text-label text-muted-foreground uppercase">Account</p>
            {accountRows.map(({ icon: Icon, label }, index) => (
              <ProximityRow
                key={label}
                index={index}
                registerItem={registerItem}
                className="group flex items-center gap-3 rounded-lg px-3 py-1.5 text-left text-caption text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="flex-1">{label}</span>
                <ChevronRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </ProximityRow>
            ))}
          </div>
        </nav>
      </div>
      <div className="shrink-0 border-t border-border p-4">
        <Button variant="destructive" className="w-full">
          Sign out
        </Button>
      </div>
    </>
  );
}

/**
 * Icon-row action drawer — a vertical list reads as too sparse across a
 * bottom drawer's full viewport width, so this mirrors the iOS/Android
 * share-sheet layout instead: a link preview up top (what's being shared),
 * then actions arranged in a row with proximity hover resolved along the
 * x-axis. This is also the one side with a real draggable handle — drag it
 * down, or flick it, to dismiss.
 */
function BottomDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeIndex, itemRects, sessionRef, handlers, registerItem } = useProximityHover(
    containerRef,
    { axis: "x" },
  );

  const actions = [
    { icon: Share2Icon, label: "Share" },
    { icon: CopyIcon, label: "Duplicate" },
    { icon: PencilIcon, label: "Rename" },
    { icon: Trash2Icon, label: "Delete", destructive: true },
  ];

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <LinkIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-medium text-foreground">trove/cn — Drawer</p>
          <p className="truncate text-meta text-muted-foreground">
            trovecn.dev/docs/components/drawer
          </p>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative flex items-start justify-around gap-2 p-6"
        onMouseMove={handlers.onMouseMove}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
      >
        <ProximityHoverPill
          activeRect={activeIndex !== null ? itemRects[activeIndex] : null}
          sessionKey={sessionRef.current}
        />
        {actions.map(({ icon: Icon, label, destructive }, index) => (
          <ProximityRow
            key={label}
            index={index}
            registerItem={registerItem}
            className="flex flex-col items-center gap-2 rounded-lg px-3 py-2"
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-full bg-muted",
                destructive ? "text-destructive" : "text-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span
              className={cn(
                "text-caption",
                destructive ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </ProximityRow>
        ))}
      </div>
    </>
  );
}

const sides = [
  { side: "top", content: TopDemo },
  { side: "right", content: RightDemo },
  { side: "bottom", content: BottomDemo },
  { side: "left", content: DrawerNavContent },
] as const satisfies {
  side: ComponentProps<typeof DrawerContent>["side"];
  content: () => React.JSX.Element;
}[];

export default function DrawerSideExample() {
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map(({ side, content: Content }) => (
        <Drawer key={side}>
          <DrawerTrigger render={<Button variant="outline" className="capitalize" />}>
            {side}
          </DrawerTrigger>
          <DrawerContent side={side}>
            <Content />
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
