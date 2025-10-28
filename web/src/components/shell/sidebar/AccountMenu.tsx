"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as HoverCard from "@radix-ui/react-hover-card";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

type AccountMenuProps = {
   expanded: boolean;
   session: any;
};

export default function AccountMenu({ expanded, session }: AccountMenuProps) {
   const user = session?.user;
   const fallbackLetter = (
      user?.name?.[0] ?? user?.email?.[0] ?? "?"
   ).toUpperCase();

   return (
      <div
         className={`${expanded ? "pt-1" : "pt-2"
            } flex justify-center border-t border-[var(--border-weak)]`}
      >
         <DropdownMenu.Root>
            {expanded ? (
               /* ✅ Expanded sidebar */
               <DropdownMenu.Trigger asChild>
                  <button className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition rounded-md">
                     <div className="flex items-center gap-2 truncate">
                        {user?.image ? (
                           <img
                              src={user.image}
                              alt="profile"
                              className="w-7 h-7 rounded-full flex-none object-cover"
                              referrerPolicy="no-referrer"
                           />
                        ) : (
                           <div className="w-7 h-7 rounded-full grid place-items-center bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] text-xs font-semibold text-[var(--text-primary)]/80">
                              {fallbackLetter}
                           </div>
                        )}
                        <div className="flex flex-col leading-tight text-left min-w-0">
                           <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {user?.name ?? "Guest"}
                           </span>
                           <span className="text-[11.5px] opacity-70 truncate text-[var(--text-primary)]">
                              {user?.email ?? ""}
                           </span>
                        </div>
                     </div>
                  </button>
               </DropdownMenu.Trigger>
            ) : (
               /* ✅ Collapsed sidebar — avatar + hovercard */
               <HoverCard.Root openDelay={150} closeDelay={120}>
                  <HoverCard.Trigger asChild>
                     <button
                        title="Account"
                        className="flex items-center justify-center w-[44px] h-[44px] rounded-full shrink-0
                   bg-transparent hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] transition"
                     >
                        {user?.image ? (
                           <img
                              src={user.image}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                           />
                        ) : (
                           <div
                              className="w-8 h-8 rounded-full grid place-items-center
                     bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)]
                     text-sm font-semibold text-[var(--text-primary)]/80"
                           >
                              {fallbackLetter}
                           </div>
                        )}
                     </button>
                  </HoverCard.Trigger>

                  <HoverCard.Portal>
                     <HoverCard.Content
                        side="right"
                        align="start"
                        sideOffset={10}
                        className="z-[9999] rounded-lg border border-[var(--border-weak)]
                   bg-[var(--surface-sidebar-open)] text-[var(--text-primary)]
                   shadow-xl backdrop-blur-md p-3 w-56 animate-in fade-in slide-in-from-left-1"
                     >
                        <div className="flex items-center gap-3">
                           {user?.image ? (
                              <img
                                 src={user.image}
                                 alt="Profile"
                                 className="w-10 h-10 rounded-full object-cover"
                                 referrerPolicy="no-referrer"
                              />
                           ) : (
                              <div
                                 className="w-10 h-10 rounded-full grid place-items-center
                      bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)]
                      text-sm font-semibold text-[var(--text-primary)]/80"
                              >
                                 {fallbackLetter}
                              </div>
                           )}
                           <div className="flex flex-col leading-tight">
                              <span className="font-semibold text-[var(--text-primary)] truncate">
                                 {user?.name ?? "Guest"}
                              </span>
                              <span className="text-xs opacity-70 truncate text-[var(--text-primary)]">
                                 {user?.email ?? ""}
                              </span>
                           </div>
                        </div>
                        <HoverCard.Arrow className="fill-[var(--surface-sidebar-open)]" />
                     </HoverCard.Content>
                  </HoverCard.Portal>
               </HoverCard.Root>
            )}

            {/* ✅ Dropdown (shared) */}
            <DropdownMenu.Portal>
               <DropdownMenu.Content
                  align="end"
                  side={expanded ? "bottom" : "top"}
                  sideOffset={expanded ? 6 : 8}
                  className="z-[9999] w-56 rounded-lg border border-[var(--border-weak)]
                 bg-[var(--surface-sidebar-open)] text-[var(--text-primary)]
                 shadow-xl backdrop-blur-md p-1 text-sm"
               >
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer">
                     <Settings className="h-4 w-4 opacity-80 text-[var(--text-primary)]" />
                     Settings
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                     onClick={() => signOut({ callbackUrl: "/login" })}
                     className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer"
                  >
                     <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenu.Item>
               </DropdownMenu.Content>
            </DropdownMenu.Portal>
         </DropdownMenu.Root>
      </div>
   );
}
