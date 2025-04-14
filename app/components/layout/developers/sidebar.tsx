"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-violet-500",
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    color: "text-pink-700",
  },
  {
    label: "Accounts",
    icon: Building2,
    href: "/accounts",
    color: "text-orange-700",
  },
  {
    label: "Expenses",
    icon: CreditCard,
    href: "/expenses",
    color: "text-emerald-500",
  },
  {
    label: "Income",
    icon: DollarSign,
    href: "/income",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Help",
    icon: HelpCircle,
    href: "/help",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-10">
          <div className="relative w-8 h-8 mr-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition",
                pathname === route.href
                  ? "text-primary bg-gray-100 dark:bg-gray-800"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Link
          href="/aplikasi/internal"
          replace={true}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-600 dark:text-gray-400"
        >
          <div className="flex items-center flex-1">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </div>
        </Link>
      </div>
    </div>
  );
}