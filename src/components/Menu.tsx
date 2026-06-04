"use client";

import Image from "next/image";
import Link from "next/link";
import { menuItems } from "../data/menuItems";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import { useTransition } from "react";

const Menu = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata.role as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = (href: string) => {
    if (href === ROUTE_CONFIG.HOME) {
      const homePaths = [ROUTE_CONFIG.HOME];
      return (
        homePaths.includes(pathname) ||
        pathname === `${ROUTE_CONFIG.HOME}${role}`
      );
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="mt-4 text-sm space-y-1">
      {menuItems.map((item) => (
        <Accordion
          key={item.title}
          type="single"
          collapsible
          className="border-none"
          defaultValue={item.title}
        >
          <AccordionItem value={item.title} className="border-none px-1">
            <AccordionTrigger className="hidden lg:flex py-2 px-2 text-muted-foreground font-medium text-xs hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="pb-0 pt-1">
              <div className="flex flex-col space-y-1">
                {item.items.map((i) => {
                  if (i.visible.includes(role)) {
                    return (
                      <Button
                        key={i.label}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "justify-center lg:justify-start h-10 px-2 py-5 font-normal",
                          isActive(i.href)
                            ? "bg-accent text-accent-foreground text-secondColor"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                        disabled={isPending}
                        onClick={() => {
                          if (pathname !== i.href) {
                            startTransition(() => {
                              router.push(i.href);
                            });
                          }
                        }}
                      >
                        <Image
                          src={i.icon}
                          alt={i.label}
                          width={20}
                          height={20}
                          className="mr-0 lg:mr-2"
                        />
                        <span className="hidden lg:inline-block">
                          {i.label}
                        </span>
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default Menu;
