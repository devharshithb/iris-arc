"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { signOut } from "next-auth/react";

type AccountMenuProps = {
   expanded: boolean;
   session: any;
};

export default function AccountMenu({ expanded, session }: AccountMenuProps) {
   const user = session?.user;

   return (
      <div
         className={`border-t border-[var(--border-weak)] ${expanded ? "pt-1" : "pt-3 mb-2 flex justify-center"
            }`}
      >
         <DropdownMenu.Root>
            {/* Expanded Sidebar */}
            {expanded ? (
               <DropdownMenu.Trigger asChild>
                  <button className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition rounded-md">
                     <div className="flex items-center gap-2 truncate">
                        {user?.image ? (
                           <img
                              src={user.image}
                              alt="profile"
                              className="w-7 h-7 rounded-full"
                              referrerPolicy="no-referrer"
                           />
                        ) : (
                           <div className="w-7 h-7 rounded-full bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] grid place-items-center text-xs font-medium text-[var(--text-primary)]/80">
                              {user?.name?.[0]?.toUpperCase() ?? "?"}
                           </div>
                        )}

                        <div className="flex flex-col leading-tight text-left">
                           <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {user?.name ?? "Guest"}
                           </span>
                           <span className="text-[11.5px] opacity-70 truncate text-[var(--text-primary)]">
                              {user?.email ?? ""}
                           </span>
                        </div>
                     </div>

                     <ChevronDown className="h-4 w-4 opacity-60 text-[var(--text-primary)]" />
                  </button>
               </DropdownMenu.Trigger>
            ) : (
               /* Collapsed Sidebar */
               <DropdownMenu.Trigger asChild>
                  <button
                     title="Account"
                     className="rounded-full bg-transparent hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] p-1.5 transition"
                  >
                     {user?.image ? (
                        <img
                           src={user.image}
                           alt="Profile"
                           className="w-7 h-7 rounded-full"
                           referrerPolicy="no-referrer"
                        />
                     ) : user?.name ? (
                        <div className="w-7 h-7 rounded-full bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] grid place-items-center text-xs font-medium text-[var(--text-primary)]/80">
                           {user.name[0].toUpperCase()}
                        </div>
                     ) : (
                        <UserCircle className="h-6 w-6 opacity-80 text-[var(--text-primary)]" />
                     )}
                  </button>
               </DropdownMenu.Trigger>
            )}

            {/* Dropdown Content */}
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
                     <Settings className="h-4 w-4 opacity-80 text-[var(--text-primary)]" /> Settings
                  </DropdownMenu.Item>

                  <a
                     href="mailto:code.harshithb@gmail.com"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                     ✉️ Contact Developer
                  </a>

                  <a
                     href="https://github.com/"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                     💻 View on GitHub
                  </a>

                  <DropdownMenu.Separator className="my-1 border-t border-[var(--border-weak)]" />

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
