"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const PageHeader = ({ title }: { title: string }) => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <div className="mb-6">
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        {paths.map((path, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            <Link
              href={`/${paths.slice(0, index + 1).join("/")}`}
              className={cn(
                "capitalize",
                index === paths.length - 1 && "text-foreground font-medium"
              )}
            >
              {path}
            </Link>
          </div>
        ))}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    </div>
  );
};