import { cn } from "@/lib/utils";

type StickyFormFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function StickyFormFooter({ children, className }: StickyFormFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:mx-0 md:mt-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
        "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
