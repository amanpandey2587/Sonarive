import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends PropsWithChildren{
    className?:string;
}
export function PageContainer({ children, className }: PageContainerProps) {
    return (
      <main
        className={cn(
          "container mx-auto flex-grow px-4 py-8 md:py-12 bg-gradient-to-br from-teal-900 via-indigo-900 to-blue-950 min-h-screen",
          className
        )}
      >
        {children}
      </main>
    );
  }
  