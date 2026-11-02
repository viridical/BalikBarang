'use client';

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserHeader () {
    const { data: session } = useSession ();
    const userName = session?.user?.name || 'Inspector';
    const userImage = session?.user?.image || 'https://github.com/shadcn.png';
    const initials = userName.substring(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium text-gray-900">{userName}</div>
        <div className="text-xs text-gray-500">Lead Quality Assurance Inspector</div>
      </div>
      <Avatar>
        <AvatarImage src={userImage} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </div>
    );
}