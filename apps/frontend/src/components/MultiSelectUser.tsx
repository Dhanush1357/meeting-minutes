"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrentUserType } from "@/app/users/types";

interface MultiSelectUsersProps {
  users: CurrentUserType[];
  selectedUsers: string[];
  onSelect: (selectedIds: string[]) => void;
  placeholder?: string;
}

export function MultiSelectUsers({
  users = [],
  selectedUsers = [],
  onSelect,
  placeholder = "Select users...",
}: MultiSelectUsersProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelect = (userId: string) => {
    if (!selectedUsers) return; // Safety check

    if (selectedUsers.includes(userId)) {
      onSelect(selectedUsers.filter((id) => id !== userId));
    } else {
      onSelect([...selectedUsers, userId]);
    }
  };

  const handleRemoveUser = (
    e: React.MouseEvent<HTMLButtonElement>,
    userId: string
  ) => {
    e.stopPropagation(); // Prevent triggering the popover
    onSelect(selectedUsers.filter((id) => id !== userId));
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 h-auto py-2"
          >
            <div className="flex gap-1.5 flex-wrap justify-start max-w-full overflow-hidden">
              {selectedUsers && selectedUsers.length > 0 ? (
                selectedUsers.map((userId) => {
                  const user = users?.find((u) => u.id.toString() === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="px-2 py-1 mb-1 rounded-md border bg-slate-100 text-xs font-medium flex items-center gap-1 transition-colors hover:bg-slate-200 group"
                    >
                      <span className="truncate max-w-32">
                        {user.first_name} ({user.email})
                      </span>
                      <button
                        onClick={(e) => handleRemoveUser(e, userId)}
                        className="opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity"
                        aria-label={`Remove ${user.first_name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null;
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-52" align="start">
          <Command className="h-full">
            <CommandInput
              placeholder="Search users..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandList className="max-h-40 overflow-y-auto overscroll-contain">
                {users?.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id.toString()}
                    onSelect={() => {
                      handleSelect(user.id.toString());
                    }}
                    className="flex items-center cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="mr-2 flex-none">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedUsers.includes(user.id.toString())
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </div>
                     <div className="truncate">
                      <span className="font-medium">{user.first_name}</span>{" "}
                      <span className="text-muted-foreground text-sm">({user.email})</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}