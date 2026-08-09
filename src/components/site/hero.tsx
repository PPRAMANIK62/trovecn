"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { GithubIcon } from "@/components/site/github-icon";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/PPRAMANIK62/trovecn";

// Matches the site's established motion curve (docs/design-system.md) —
// deliberate and weighted rather than the springy default most UI kits ship.
const EASE = [0.16, 1, 0.3, 1] as const;

interface HeroProps {
  componentCount: number;
}

export function Hero({ componentCount }: HeroProps) {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion ? undefined : { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: EASE },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={container}
      className="flex w-full flex-col px-6 py-16"
    >
      <div className="flex max-w-2xl flex-col items-start text-left sm:mx-16 md:mx-32 lg:mx-56">
        <motion.p variants={item} className="font-mono text-2xs text-muted-foreground">
          <span className="text-link">{componentCount}</span> components, growing...
        </motion.p>
        <motion.h1 variants={item} className="mt-6 text-balance text-display text-foreground">
          The small details that make interfaces feel premium.
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-6 text-body leading-[1.7] text-muted-foreground sm:text-lede"
        >
          The best interfaces share a quiet attention to craft — timing, spacing, restraint.
        </motion.p>
        <motion.p
          variants={item}
          className="mt-4 text-body leading-[1.7] text-muted-foreground sm:text-lede"
        >
          trove/cn studies that craft in products like Apple, Linear, and Vercel, then ships it as
          plain React source you own.
        </motion.p>
        <motion.div variants={item} className="mt-10 flex items-center gap-3">
          <Button render={<Link href="/docs" />} nativeButton={false} size="lg">
            Browse components
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
            nativeButton={false}
            variant="elevated"
            size="lg"
          >
            <GithubIcon className="size-4" data-icon="inline-start" />
            GitHub
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
