import { type LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  useNavigate,
  useParams,
} from "@remix-run/react";
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

interface MenuItem {
  id: number;
  sequence: number;
  name: string;
  parentId: number;
  action_name: string;
  action_target: number;
  pathname: string; // Added pathname property
  children: MenuItem[];
}

interface MenuData {
  name: {
    en_US: string;
  };
  id: number;
  menu: MenuItem[];
}

const MenuButton: React.FC<{
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ name, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm rounded-md transition-colors
      ${
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-700 hover:bg-gray-50"
      }
    `}
  >
    {name
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")}
  </button>
);



const SubMenu: React.FC<{items: MenuItem[]; onSelect: (item: MenuItem) => void;}> = ({ items, onSelect }) => {
    
    if (items.length === 0) return null;
    return (
    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
        <div className="py-1">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              {item.name
                .replace(/_/g, " ")
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
              {item.children.length > 0 && <ChevronRight className="w-4 h-4" />}
            </button>
            {item.children.length > 0 && (
              <div className="absolute left-full top-0 hidden group-hover:block">
                <SubMenu items={item.children} onSelect={onSelect} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};






/**
 *  MAIN COMPONENT 
 * 
 */


export default () => {
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [showSubMenu, setShowSubMenu] = useState<number | null>(null);
  const navigate = useNavigate();

  const menu = [
    {
        name: "DASHBOARD AMC",
        pathname : "/aplikasi/amc",
        children: []
    },
    {
      name: "DATA AMC",
      pathname : "/aplikasi/amc/data-amc",
      children: [],
    },
    {
      name: "DATA OPERATOR",
      pathname : "/aplikasi/amc/data-operator",
      children: [],
    },
    {
      name: "DATA AIRPORT",
      pathname : "/aplikasi/amc/data-airport",
      children: [],
    },
  ];



  const handleMenuSelect = useCallback(
    (item: MenuItem) => {
      setActiveMenu(item);
      setShowSubMenu(null);
      navigate(`${item.pathname}`);
    },
    [navigate]
  );


  return (
    <div className="min-h-screen bg-linear-to-br from-[#f1f1ff] to-[#e8e8ff]">
      <header className="bg-gray-900 sticky top-0 z-50 border-b border-gray-800 h-12 text-white text-sm">
        <div className=" h-full mx-6 items-center flex justify-between text-center">
          <button
            className="flex items-center space-x-2"
            onClick={() => navigate("/aplikasi")}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className=" font-bold text-sm">DEO AIRPORT - SOQ</span>
          </button>
          <div>AMC</div>
          <div>sdas</div>
        </div>
      </header>

      <div className=" bg-white h-10 px-6 flex items-center">
        <nav className="flex items-center space-x-1">
          {/*menu.map((item, index) => {
            //console.log(item)
            return (
              <div key={index} className="relative">
                <MenuButton
                  name={item.name}
                  isActive={activeMenu?.id === item.id}
                  onClick={() => {
                    if (item.children.length > 0) {
                      setShowSubMenu(showSubMenu === item.id ? null : item.id);
                    } else {
                      handleMenuSelect(item);
                    }
                  }}
                />
                {showSubMenu === item.pathname && item.children.length > 0 && (
                  <SubMenu items={item.children} onSelect={handleMenuSelect} />
                )}
              </div>
            );
          })*/}
        </nav>
      </div>
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};
