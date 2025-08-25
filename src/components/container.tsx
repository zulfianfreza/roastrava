"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, memo, PropsWithChildren } from "react";

type TContainerProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {};

function Container({ children, className, ...props }: TContainerProps) {
  return (
    <div
      className={cn("container mx-auto px-4 lg:px-[2rem]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default memo(Container);
