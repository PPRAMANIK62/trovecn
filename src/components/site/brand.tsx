import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="text-caption font-semibold tracking-tight text-foreground">
      trove<span className="font-mono font-normal text-muted-foreground">/cn</span>
    </Link>
  );
}
