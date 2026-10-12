import type React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return <div>{children}</div>;
}
