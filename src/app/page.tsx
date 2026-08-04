import { AppFrame, Panel } from "@/components/site/app-frame";
import { Hero } from "@/components/site/hero";
import { Brand } from "@/components/site/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { registry } from "@/lib/components-registry";

export default function Home() {
  return (
    <AppFrame>
      <Panel className="flex w-full flex-col">
        <nav className="flex h-14 shrink-0 items-center justify-between rounded-t-3xl border-b border-border px-6">
          <Brand />
          <ThemeToggle />
        </nav>
        <main className="flex flex-1 items-center">
          <Hero componentCount={registry.length} />
        </main>
      </Panel>
    </AppFrame>
  );
}
