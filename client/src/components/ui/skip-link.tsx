import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip directly to main content
 */
export function SkipLink({ targetId, children, className }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Default skip links for the application
 */
export function DefaultSkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink targetId="main-content">
        Pular para o conteúdo principal
      </SkipLink>
      <SkipLink targetId="main-navigation">
        Pular para a navegação
      </SkipLink>
    </div>
  );
}
