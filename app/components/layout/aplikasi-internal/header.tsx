
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import { useFetcher } from "@remix-run/react";
import { ChevronDown, Grid, Plus, User, Settings, LogOut, Mail, ChevronLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



export function Header() {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [currentEmployee, setCurrentEmployee] = useState<any>({
    name: '',
    position: '',
    department: '',
    hireDate: '',
    salary: 0,
    status: 'active'
  });



  const handleLogout = async () => {
    try {
      fetcher.submit({_token: "logout"},
        {
          method: "POST",
          encType: "application/json",
          action: "/auth/logout/internal",
        }
      );
    } catch (error) {
    }
  };


  
  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-500/10 h-12 text-sm">
        <div className=" h-full px-10 items-center flex justify-between text-center">
          <button
            className="flex items-center space-x-2"
          >
            <span className=" font-bold text-lg">DEO AIRPORT - SOQ</span>
          </button>
          <div className="font-bold text-sm">
            
          </div>

          <div className=" px-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user.png" alt="User" />
                    <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold cursor-pointer">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Inbox
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>



      {/**<header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-2 md:px-4 py-3 fixed top-0 left-0 right-0 z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="font-bold text-lg md:text-sm text-gray-500 flex items-center truncate max-w-[160px] md:max-w-full">
          DEO AIRPORT
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <Grid className="h-4 w-4 mr-1" /> Grid
        </Button>
        <Button variant="ghost" size="sm" className="hidden md:flex">
          Traceability
        </Button>
        <Button variant="outline" size="sm" className="hidden md:flex">
          Show <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-3 w-3 md:mr-1" />{" "}
          <span className="hidden md:inline">Create Design Review</span>
        </Button>
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-more-horizontal"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </Button>

       

      
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.png" alt="User" />
                  <AvatarFallback className="bg-orange-500 text-white text-xs font-semibold cursor-pointer">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Inbox
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>
  </header> */}
    </>
  );
}