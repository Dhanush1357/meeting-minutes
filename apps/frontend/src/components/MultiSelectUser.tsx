"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
  users= [], 
  selectedUsers = [],  
  onSelect, 
  placeholder = "Select users..." 
}: MultiSelectUsersProps) {
  console.log("users===", users)
  const [open, setOpen] = React.useState(false);

  const handleSelect = (userId: string) => {
    if (!selectedUsers) return; // Safety check
    
    if (selectedUsers.includes(userId)) {
      onSelect(selectedUsers.filter((id) => id !== userId));
    } else {
      onSelect([...selectedUsers, userId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex gap-2 flex-wrap justify-start">
          {selectedUsers && selectedUsers.length > 0 ? (
              selectedUsers.map((userId) => {
                const user = users?.find((u) => u.id.toString() === userId);
                return user ? (
                  <div
                    key={userId}
                    className="px-2 py-1 rounded-xl border bg-slate-200 text-xs font-medium"
                  >
                    {user.first_name}{" "}({user.email})
                  </div>
                ) : null;
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id.toString()}
                  onSelect={() => {
                    handleSelect(user.id.toString());
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUsers.includes(user.id.toString())
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {user.first_name}{" "}({user.email})
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}