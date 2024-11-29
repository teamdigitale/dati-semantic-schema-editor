import { PropsWithChildren } from 'react';

export function HeadingBlock({ children }: PropsWithChildren) {
  return <div className="d-flex align-items-center justify-content-between">{children}</div>;
}

export function HeadingBlockLeft({ children }: PropsWithChildren) {
  return <div className="d-flex align-items-center gap-2 text-primary">{children}</div>;
}

export function HeadingBlockRight({ children }: PropsWithChildren) {
  return <div className="d-flex align-items-center gap-2">{children}</div>;
}
