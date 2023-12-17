import clsx from "clsx";
import Account from "components/Account";
import { useUI } from "providers/ui";
import { useRouter } from "next/router";
import React from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
  noPadding?: boolean;
  widthClass?: string;
  noAnimation?: boolean;
  noAccount?: boolean;
  extraMenuHeight?: number;
};

export default function Sidebar({
  children,
  className,
  noPadding,
  widthClass,
  noAnimation,
  noAccount,
  extraMenuHeight,
}: Props) {
  const { sidebarOpen, closeSidebar } = useUI();
  const { pathname } = useRouter();

  React.useEffect(() => {
    closeSidebar();
  }, [pathname]);

  return (
    <aside
      className={clsx(
        `h-[calc(100%_-_60px_-_${extraMenuHeight || 0}px)]`,
        "flex flex-shrink-0 flex-col md:h-full md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none z-10 overflow-y-auto dark-scrollbar",
        noPadding ? "" : "p-6",
        !sidebarOpen && "-ml-[600px]",
        widthClass || "w-80",
        noAnimation ? "" : "transition-all",
        className
      )}
    >
      {children}
      {!noAccount && (
        <Account className={clsx(children && "mt-auto pt-4", "lg:hidden", noPadding ? "m-6" : "")} inSidebar />
      )}
    </aside>
  );
}
