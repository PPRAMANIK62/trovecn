import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="text-caption font-semibold tracking-tight text-foreground">
      Trovecn<span className="text-link">[.]</span>
      <span className="text-muted-foreground">dev</span>
    </Link>
  );
}
