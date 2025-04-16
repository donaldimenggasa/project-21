
import { Outlet, useNavigate, useLocation } from "@remix-run/react";
import { ChevronLeft, ChevronRight, LayoutGrid, ChartColumnStacked, Plane, ChartNoAxesCombined, ChartPie, Tag, ChevronDown } from "lucide-react";
import React, { useState, useCallback, Fragment } from "react";
import clsx from "clsx";

interface MenuItem {
  icon: React.ReactNode;
  name: string;
  pathname: string;
  children: MenuItem[];
}



const SubMenu: React.FC<{ items: MenuItem[]; onSelect: (item: MenuItem) => void; }> = ({ items, onSelect }) => {
  if (items.length === 0) return null;
  return (
    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1">
        {items.map((item, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => onSelect(item)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              {item.name}
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



const MenuButton: React.FC<{
  icon: React.ReactNode;
  name: string;
  children?: MenuItem[];
  isActive?: boolean; onClick?: () => void;
}> = ({ icon, name, children, isActive, onClick }) => {
  return (
      <button
        onClick={children?.length === 0 ? onClick : undefined}
        className={clsx('flex h-full px-4 text-xs items-center justify-center transition-colors cursor-pointer border-r border-gray-300', isActive ? "bg-gray-200 text-gray-900 font-semibold text-purple-700" : "text-gray-700 hover:bg-gray-50")}>
        <span className=" flex flex-row space-x-4">
          {icon} 
          {name} 
          {children && children.length > 0 && (<ChevronDown className=" h-4 w-4 ml-2"/>)}
        </span>
      </button>
  )
};







/**
 *  MAIN COMPONENT 
 * 
 */


export default () => {
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menu: MenuItem[] = [
    {
      icon: <ChartColumnStacked className="w-4 h-4 mr-4 text-red-800" />,
      name: "DASHBOARD AMC",
      pathname: "/aplikasi/amc/dashboard",
      children: [
       
      ],
    },
    {
      icon: <ChartNoAxesCombined className="w-4 h-4 mr-4 text-red-800" />,
      name: "DATA AMC",
      pathname: "/aplikasi/amc/data-amc",
      children: [],
    },
    {
      icon: <Plane className="w-4 h-4 mr-4 text-red-800" />,
      name: "DATA OPERATOR",
      pathname: "/aplikasi/amc/data-operator",
      children: [],
    },
    {
      icon: <ChartPie className="w-4 h-4 mr-4 text-red-800" />,
      name: "DATA AIRPORT",
      pathname: "/aplikasi/amc/data-airport",
      children: [],
    },
    {
      icon: <Tag className="w-4 h-4 mr-4 text-red-800" />,
      name: "TYPE PESAWAT",
      pathname: "/aplikasi/amc/type-pesawat",
      children: [],
    },
    {
      icon: <LayoutGrid className="w-4 h-4 mr-4 text-blue-600" />,
      name: "PERKING STAND",
      pathname: "/aplikasi/amc/parking-stand",
      children: [],
    },
  ];



  const handleMenuSelect = useCallback((item: MenuItem) => {
    setActiveMenu(item);
    setShowSubMenu(null);
    navigate(`${item.pathname}`);
  }, [navigate]);





  return (
    <div className="min-h-screen bg-linear-to-br from-[#f1f1ff] to-[#e8e8ff]">
      <header className="bg-gray-900 sticky top-0 z-50 border-b border-gray-800 h-12 text-white text-sm">
        <div className=" h-full mx-6 items-center flex justify-between text-center">
          <button
            className="flex items-center space-x-2"
            onClick={() => navigate("/aplikasi")}
          >
            <ChevronLeft className="w-4 h-4 " />
            <span className=" font-bold text-sm text-red-600">DEO AIRPORT - SOQ</span>
          </button>
          <span className="font-bold text-sm">APRON MOVEMENT CONTROL</span>
          <span className="font-bold text-sm">UNIT AMC</span>
        </div>
      </header>

      <div className=" bg-white h-10 px-6 flex items-center">
        <nav className="w-full h-full flex justify-between items-center">
          <div className="flex items-center flex-row h-full">
            {menu.map((item, index) => {
              return (
                <Fragment key={index}>
                  <MenuButton
                    icon={item.icon}
                    name={item.name}
                    isActive={pathname === item.pathname}
                    children={item.children}
                    onClick={() => {
                      if (item.children.length > 0) {
                        setShowSubMenu(showSubMenu === item.pathname ? null : item.pathname);
                      } else {
                        handleMenuSelect(item);
                      }
                    }}
                  />
                </Fragment>
              );
            })}
          </div>

          <div>
            <button className=" bg-blue-700 text-xs rounded-sm px-2 py-1 text-white">
              CREATE
            </button>
          </div>
        </nav>
      </div>
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};
