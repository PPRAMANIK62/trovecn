"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { GithubIcon } from "@/components/site/github-icon";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/springs";
import { GITHUB_URL } from "@/lib/site-config";

export function Hero() {
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
      transition: reduceMotion ? { duration: 0 } : spring.slow.enter,
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={container}
      className="flex min-h-[48svh] w-full flex-col items-center justify-center px-6 py-10 text-center"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <motion.h1 variants={item} className="text-balance text-display text-foreground">
          The small details that make interfaces feel premium.
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-body leading-[1.7] text-muted-foreground sm:text-lede"
        >
          Interface patterns from Apple, Linear, and Vercel — studied for their craft, rebuilt as
          plain React you own.
        </motion.p>
        <motion.div variants={item} className="mt-10 flex items-center justify-center gap-3">
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
