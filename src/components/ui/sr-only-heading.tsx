import type { ReactNode } from "react";

interface IProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
}

export function SrOnlyHeading({ as: Tag = "h1", children }: IProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
