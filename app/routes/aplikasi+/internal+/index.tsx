
import { Link } from '@remix-run/react'
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronDown,
  Plus,
  Grid,
  List,
  Filter,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";




// Define types for our data
type AvatarType = {
  initials: string;
  color: string;
};

type UserNeedType = {
  id: string;
  category: {
    name: string;
    icon: string;
    bgColor: string;
    iconColor: string;
  };
  title: string;
  description: string;
  status: {
    label: string;
    bgColor: string;
    textColor: string;
    variant?: string;
  };
  comments: number;
  stars: number;
  avatars: AvatarType[];
  links: number;
  alert?: boolean;
  borderColor?: string;
  appRoute?: string;
};

type RequirementType = {
  id: string;
  category: {
    name: string;
    icon: string;
    bgColor: string;
    iconColor: string;
  };
  title: string;
  description: string;
  status: {
    label: string;
    bgColor: string;
    textColor: string;
  };
  comments?: number;
  stars?: number;
  avatars?: AvatarType[];
  links: number;
  nonEditable?: boolean;
};

type DesignOutputType = {
  category: {
    name: string;
    icon: string;
    bgColor: string;
    iconColor: string;
  };
  title: string;
  description: string;
  status: {
    label: string;
    bgColor: string;
    textColor: string;
  };
};

type FilterOptionType = {
  id: string;
  label: string;
  count: number;
};

// Sample data for User Needs
const userNeeds: UserNeedType[] = [
  {
    id: "UN-1",
    category: {
      name: "Aplikasi AMC",
      icon: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />',
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "#10b981",
    },
    title: "Aplikasi Management Financial",
    description:
      "Sistem manajemen keuangan untuk pengelolaan anggaran dan pelaporan keuangan.",
    status: {
      label: "ACTIVE",
      bgColor: "bg-green-100 dark:bg-green-800",
      textColor: "text-green-800 dark:text-green-200",
      variant: "outline",
    },
    comments: 5,
    stars: 4,
    avatars: [
      { initials: "JD", color: "bg-orange-500" },
      { initials: "KL", color: "bg-blue-500" },
      { initials: "MN", color: "bg-green-500" },
    ],
    links: 3,
    appRoute: "/aplikasi/internal/amc",
  },
  {
    id: "UN-2",
    category: {
      name: "Document",
      icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />',
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "#3b82f6",
    },
    title: "Aplikasi Management Document",
    description:
      "Sistem pengelolaan dokumen untuk penyimpanan, pencarian, dan berbagi dokumen.",
    status: {
      label: "REVISED",
      bgColor: "bg-gray-600",
      textColor: "text-white",
    },
    comments: 3,
    stars: 5,
    avatars: [
      { initials: "JD", color: "bg-orange-500" },
      { initials: "RS", color: "bg-purple-500" },
      { initials: "AK", color: "bg-pink-500" },
      { initials: "+2", color: "bg-gray-500" },
    ],
    links: 4,
    appRoute: "/document",
  },
  {
    id: "UN-3",
    category: {
      name: "Inventory",
      icon: '<path d="M2 7.5h20" /><path d="M14 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" /><path d="M20 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" /><path d="M2 17.5h20" /><path d="M10 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />',
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      iconColor: "#f59e0b",
    },
    title: "Aplikasi Management Peralatan",
    description: "Sistem inventaris untuk pelacakan dan pengelolaan peralatan dan aset perusahaan.",
    status: {
      label: "PENDING",
      bgColor: "bg-purple-600",
      textColor: "text-white",
    },
    avatars: [
      { initials: "JD", color: "bg-orange-500" },
      { initials: "TW", color: "bg-cyan-500" },
    ],
    links: 3,
    alert: true,
    borderColor: "border-amber-500",
    appRoute: "/inventory",
    comments: 0,
    stars: 0
  },
];

// Sample data for System Requirements
const systemRequirements: RequirementType[] = [
  {
    id: "SR-0",
    category: {
      name: "Element cannot be edited",
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />',
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "#3b82f6",
    },
    title: "",
    description: "",
    status: {
      label: "",
      bgColor: "",
      textColor: "",
    },
    links: 0,
    nonEditable: true,
  },
  {
    id: "SR-1",
    category: {
      name: "Battery",
      icon: '<path d="M6 7h12v10H6z" /><path d="M22 10h2v4h-2z" /><path d="M18 15h-2" /><path d="M18 11h-2" /><path d="M18 7h-2" /><path d="M6 15H4" /><path d="M6 11H4" /><path d="M6 7H4" />',
      bgColor: "bg-gray-100 dark:bg-slate-800",
      iconColor: "currentColor",
    },
    title: "System shall conform to IEC 60601-1",
    description: "Ultricies mi quis hendrerit dolor magna eget.",
    status: {
      label: "IN REVIEW",
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    comments: 2,
    stars: 5,
    avatars: [{ initials: "JD", color: "bg-orange-500" }],
    links: 3,
  },
  {
    id: "SR-2",
    category: {
      name: "Labeling",
      icon: '<path d="M17 6.1H3" /><path d="M21 12.1H3" /><path d="M15.1 18H3" />',
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "#9333ea",
    },
    title: "System shall conform to UN 38.3",
    description:
      "Tortor condimentum lacinia quis vel eros donec. Eget felis eget nunc lobortis mattis aliquam.",
    status: {
      label: "APPROVED",
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
    avatars: [{ initials: "JD", color: "bg-orange-500" }],
    links: 3,
  },
  {
    id: "SR-3",
    category: {
      name: "Element cannot be edited",
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />',
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "#3b82f6",
    },
    title: "",
    description: "",
    status: {
      label: "",
      bgColor: "",
      textColor: "",
    },
    links: 0,
    nonEditable: true,
  },
];

// Sample data for Subsystem Requirements
const subsystemRequirements: RequirementType[] = [
  {
    id: "DO-1",
    category: {
      name: "Labeling",
      icon: '<path d="M17 6.1H3" /><path d="M21 12.1H3" /><path d="M15.1 18H3" />',
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "#9333ea",
    },
    title: "System shall be a Type BF part per IEC 6061",
    description: "Tortor condimentum lacinia quis vel eros donec.",
    status: {
      label: "APPROVED",
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
    avatars: [{ initials: "JD", color: "bg-orange-500" }],
    links: 3,
  },
  {
    id: "DO-2",
    category: {
      name: "Element cannot be edited",
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />',
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "#3b82f6",
    },
    title: "",
    description: "",
    status: {
      label: "",
      bgColor: "",
      textColor: "",
    },
    links: 0,
    nonEditable: true,
  },
  {
    id: "DN-1",
    category: {
      name: "Battery",
      icon: '<path d="M6 7h12v10H6z" /><path d="M22 10h2v4h-2z" /><path d="M18 15h-2" /><path d="M18 11h-2" /><path d="M18 7h-2" /><path d="M6 15H4" /><path d="M6 11H4" /><path d="M6 7H4" />',
      bgColor: "bg-gray-100 dark:bg-slate-800",
      iconColor: "currentColor",
    },
    title: "System shall use an IEC 62133 Certified Battery",
    description:
      "Lectus quam id leo in vitae turpis. Velit sed ullamcorper morbi tincidunt ornare massa eget.",
    status: {
      label: "IN REVIEW",
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
    comments: 2,
    stars: 5,
    avatars: [{ initials: "JD", color: "bg-orange-500" }],
    links: 3,
  },
];

// Sample data for Design Outputs
const designOutputs: DesignOutputType[] = [
  {
    category: {
      name: "Labeling",
      icon: '<path d="M17 6.1H3" /><path d="M21 12.1H3" /><path d="M15.1 18H3" />',
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "#9333ea",
    },
    title: "US Standard",
    description: "System shall conform to all standards for sale in USA",
    status: {
      label: "PENDING",
      bgColor: "bg-purple-600",
      textColor: "text-white",
    },
  },
  {
    category: {
      name: "Electrode",
      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2" />',
      bgColor: "bg-gray-100 dark:bg-slate-800",
      iconColor: "currentColor",
    },
    title: "User Functional Use",
    description:
      "System shall have at least 1 hour of functional use when received by user (note: anticiapted shelf-life is 1 year)",
    status: {
      label: "APPROVED",
      bgColor: "bg-green-600",
      textColor: "text-white",
    },
  },
  {
    category: {
      name: "Safety",
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />',
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "#3b82f6",
    },
    title: "IEC Compliance",
    description: "System shall conform to IEC 60601-1 standards",
    status: {
      label: "IN REVIEW",
      bgColor: "bg-blue-600",
      textColor: "text-white",
    },
  },
];

// Sample data for filters
const statusFilters: FilterOptionType[] = [
  { id: "draft", label: "Draft", count: 6 },
  { id: "pending", label: "Pending", count: 17 },
  { id: "inreview", label: "In Review", count: 9 },
  { id: "approved", label: "Approved", count: 8 },
];

const componentFilters: FilterOptionType[] = [
  { id: "tens", label: "Reimagined TENS Device", count: 40 },
  { id: "battery", label: "Battery", count: 16 },
  { id: "alkaline", label: "Alkaline", count: 10 },
  { id: "coincell", label: "Coin Cell", count: 6 },
  { id: "labeling", label: "Labeling", count: 9 },
  { id: "electrode", label: "Electrode", count: 15 },
];

const AppHomePage = () => {
  const user = null;
  //const router = useRouter();

  const handleLogout = () => {
    //logout();
    //navigate("/auth/login");
  };

  // Component to render category icon
  const CategoryIcon = ({
    icon,
    bgColor,
    iconColor,
  }: {
    icon: string;
    bgColor: string;
    iconColor: string;
  }) => (
    <div
      className={`flex items-center justify-center w-5 h-5 ${bgColor} rounded mr-2`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    </div>
  );

  // Component to render comment count
  const CommentCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="text-xs ml-1">{count}</span>
    </div>
  );

  // Component to render star count
  const StarCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="text-xs ml-1">{count}</span>
    </div>
  );

  // Component to render alert count
  const AlertCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
      <span className="text-xs ml-1">{count}</span>
    </div>
  );

  // Component to render avatar list
  const AvatarList = ({ avatars }: { avatars: AvatarType[] }) => (
    <div className="flex -space-x-2 overflow-hidden">
      {avatars.map((avatar, index) => (
        <div
          key={index}
          className={`w-6 h-6 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs ring-2 ring-white dark:ring-slate-900`}
        >
          {avatar.initials}
        </div>
      ))}
    </div>
  );

  // Component to render links count
  const LinksCount = ({ count }: { count: number }) => (
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      <span className="text-xs ml-1">{count} Links</span>
    </div>
  );

  // Component to render a user need card
  const UserNeedCard = ({ need }: { need: UserNeedType }) => (
    <div
      className={`bg-white dark:bg-slate-900 ${
        need.borderColor
          ? `border-2 ${need.borderColor}`
          : "border border-gray-200 dark:border-slate-800"
      } rounded-md mb-4 overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-center mb-2">
          <CategoryIcon
            icon={need.category.icon}
            bgColor={need.category.bgColor}
            iconColor={need.category.iconColor}
          />
          <span className="text-sm font-medium">{need.category.name}</span>
          <span className="ml-auto text-xs text-gray-500">{need.id}</span>
          {need.alert && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <h3 className="text-sm font-medium mb-2">{need.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{need.description}</p>
        <div className="flex items-center justify-between">
          <Badge
            //variant={need.status.variant}
            className={`text-xs ${need.status.bgColor} ${need.status.textColor}`}
          >
            {need.status.label}
          </Badge>
          <div className="flex items-center gap-2">
            {need.comments && <CommentCount count={need.comments} />}
            {need.stars && <StarCount count={need.stars} />}
            
            {need.avatars && <AvatarList avatars={need.avatars} />}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <div>
          {need.links > 0 && (
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-xs ml-1">{need.links} Links</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link to="/aplikasi/builder/amc" className=" h-7 px-2 text-xs bg-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Link>
          <Link
            to={need?.appRoute}
            className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 flex flex-row items-center text-white rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            Go to App
          </Link>
        </div>
      </div>
    </div>
  );

  // Component to render a requirement card
  const RequirementCard = ({
    requirement,
  }: {
    requirement: RequirementType;
  }) => {
    if (requirement.nonEditable) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md mb-4 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <CategoryIcon
                icon={requirement.category.icon}
                bgColor={requirement.category.bgColor}
                iconColor={requirement.category.iconColor}
              />
              <span className="text-sm font-medium">
                {requirement.category.name}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md mb-4 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <CategoryIcon
              icon={requirement.category.icon}
              bgColor={requirement.category.bgColor}
              iconColor={requirement.category.iconColor}
            />
            <span className="text-sm font-medium">
              {requirement.category.name}
            </span>
            <span className="ml-auto text-xs text-gray-500">
              {requirement.id}
            </span>
          </div>
          <h3 className="text-sm font-medium mb-2">{requirement.title}</h3>
          <p className="text-xs text-gray-500 mb-2">
            {requirement.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge
              className={`text-xs ${requirement.status.bgColor} ${requirement.status.textColor}`}
            >
              {requirement.status.label}
            </Badge>
            <div className="flex items-center gap-2">
              {requirement.comments && (
                <CommentCount count={requirement.comments} />
              )}
              {requirement.stars && <StarCount count={requirement.stars} />}
             
              {requirement.avatars && requirement.avatars.length === 1 ? (
                <div
                  className={`w-6 h-6 rounded-full ${requirement.avatars[0].color} flex items-center justify-center text-white text-xs`}
                >
                  {requirement.avatars[0].initials}
                </div>
              ) : (
                requirement.avatars && (
                  <AvatarList avatars={requirement.avatars} />
                )
              )}
            </div>
          </div>
        </div>
        {requirement.links > 0 && <LinksCount count={requirement.links} />}
      </div>
    );
  };






  // Component to render a design output card
  const DesignOutputCard = ({ output }: { output: DesignOutputType }) => (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-4">
      <div className="flex items-center mb-2">
        <CategoryIcon
          icon={output.category.icon}
          bgColor={output.category.bgColor}
          iconColor={output.category.iconColor}
        />
        <span className="text-sm font-medium">{output.category.name}</span>
      </div>
      <h3 className="text-sm font-medium mb-2">{output.title}</h3>
      <p className="text-xs text-gray-500 mb-2">{output.description}</p>
      <Badge
        className={`text-xs ${output.status.bgColor} ${output.status.textColor}`}
      >
        {output.status.label}
      </Badge>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Main Content - Added top padding for fixed header and adjusted for fixed sidebar */}
      <div className="flex flex-col md:flex-row pr-0 md:pr-[25%]">
        {/* Left Column - Adjusted width */}
        <div className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Teknik & Operasi</h2>
              <Badge variant="outline" className="ml-2">
                {userNeeds.length}
              </Badge>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* User Need Cards */}
          {userNeeds.map((need, index) => (
            <UserNeedCard key={index} need={need} />
          ))}
        </div>

        {/* Middle Column - Adjusted width */}
        <div className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tata Usaha</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {systemRequirements.length}
              </Badge>
            </div>

            {/* System Requirement Cards */}
            {systemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SUBSYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {subsystemRequirements.length}
              </Badge>
            </div>

            {/* Subsystem Requirement Cards */}
            {subsystemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>
        </div>

        <div className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pelayanan & Jasa Bandar Udara</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {systemRequirements.length}
              </Badge>
            </div>

            {/* System Requirement Cards */}
            {systemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SUBSYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {subsystemRequirements.length}
              </Badge>
            </div>

            {/* Subsystem Requirement Cards */}
            {subsystemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>
        </div>

        <div className="w-full md:w-3/12 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kemanan Penerbangan</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {systemRequirements.length}
              </Badge>
            </div>

            {/* System Requirement Cards */}
            {systemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                SUBSYSTEM REQUIREMENTS
              </div>
              <Badge variant="outline" className="ml-2">
                {subsystemRequirements.length}
              </Badge>
            </div>

            {/* Subsystem Requirement Cards */}
            {subsystemRequirements.map((req, index) => (
              <RequirementCard key={index} requirement={req} />
            ))}
          </div>
        </div>






        {/* Right Column - Fixed sidebar with own scroll */}
        <div className="hidden md:block w-1/4 fixed top-16 right-0 bottom-0 border-l border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Design Output</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium mb-4">Filters</h3>

              <div className="mb-4">
                <Input
                  placeholder="Search by title..."
                  className="mb-4"
                 // prefix={<Search className="h-4 w-4 text-gray-400" />}
                />

                <h4 className="text-xs font-medium mb-2">Tags</h4>
                <Input placeholder="Search for tags..." className="mb-4" />

                <h4 className="text-xs font-medium mb-2">Owner</h4>
                <Input placeholder="Search for owner..." className="mb-4" />

                <h4 className="text-xs font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  {statusFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={filter.id}
                          className="mr-2"
                        />
                        <label htmlFor={filter.id} className="text-sm">
                          {filter.label}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500">
                        {filter.count}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <h4 className="text-xs font-medium mb-2">Components</h4>
                <div className="space-y-2">
                  {componentFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={filter.id}
                          className="mr-2"
                        />
                        <label htmlFor={filter.id} className="text-sm">
                          {filter.label}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500">
                        {filter.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Output Cards */}
            <div className="space-y-4">
              {designOutputs.map((output, index) => (
                <DesignOutputCard key={index} output={output} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Design Output Button (only visible on mobile) */}
      <div className="md:hidden fixed bottom-20 left-6">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <Filter className="h-6 w-6" />
        </Button>
      </div>

     
      {/**<div className="fixed bottom-6 right-6">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div> */}
    </div>
  );
};

export default AppHomePage;
