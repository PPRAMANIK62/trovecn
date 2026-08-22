"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { GithubIcon } from "@/components/site/github-icon";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { GITHUB_URL } from "@/lib/site-config";

/**
 * The one centred composition on the site (docs/design-system.md "Look"
 * grants the homepage hero that exception; everything below it is
 * left-aligned).
 *
 * Copy states the gap rather than the catalogue. The earlier version —
 * "Crafted interface patterns, rebuilt as plain React you own" — described
 * a pattern library, which is interchangeable with every registry
 * what-to-build.md lists as competition and says nothing about why any of
 * this was built. What separates these components is that they keep
 * listening after you press, so that is what the headline claims.
 *
 * Three CTAs, in the order the argument runs. Primary lands on /docs, the
 * manifesto, per design-system.md "The site" — the previous button honoured
 * that href while reading "Browse components", so it promised a catalogue
 * and delivered an essay. Browsing is now its own, separate button.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion ? undefined : { staggerChildren: 0.07, delayChildren: 0.04 },
    },
  };

  const item: Variants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : spring.slow.enter,
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={container}
      className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-14 text-center sm:pt-28"
    >
      <motion.p variants={item} className="font-mono text-label uppercase text-muted-foreground">
        The gap between web and native
      </motion.p>
      <motion.h1 variants={item} className="mt-5 text-balance text-display text-foreground">
        Most components stop listening the moment you press.
      </motion.h1>
      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-balance text-lede leading-[1.7] text-muted-foreground"
      >
        These track your input the whole way, reverse from where they are, and can be grabbed
        mid-animation. Copy the source, own it.
      </motion.p>
      <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/docs" />} nativeButton={false} size="lg">
          Read the argument
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button
          render={<Link href="/docs/components" />}
          nativeButton={false}
          variant="elevated"
          size="lg"
        >
          Browse components
        </Button>
        <Button
          render={<Link href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          nativeButton={false}
          variant="ghost"
          size="lg"
        >
          <GithubIcon className="size-4" data-icon="inline-start" />
          GitHub
        </Button>
      </motion.div>
    </motion.section>
  );
}
