import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn('page-frame', className)}>{children}</main>;
}
