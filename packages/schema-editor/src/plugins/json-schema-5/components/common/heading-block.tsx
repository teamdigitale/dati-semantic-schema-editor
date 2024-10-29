export function HeadingBlock({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <div className="d-flex align-items-center justify-content-between">{children}</div>;
}

export function HeadingBlockLeft({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <div className="d-flex align-items-center gap-2 text-primary">{children}</div>;
}

export function HeadingBlockRight({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <div className="d-flex align-items-center gap-2">{children}</div>;
}
