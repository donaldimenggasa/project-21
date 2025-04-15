
import { Outlet, useNavigate } from "@remix-run/react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import React, { useState, useCallback, Fragment } from "react";
import clsx from "clsx";

interface MenuItem {
  icon: React.ReactNode;
  name: string;
  pathname: string;
  children: MenuItem[];
}



const SubMenu: React.FC<{items: MenuItem[]; onSelect: (item: MenuItem) => void;}> = ({ items, onSelect }) => { 
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



const MenuButton: React.FC<{icon : React.ReactNode; name: string; isActive?: boolean; onClick?: () => void;}> = ({icon, name, isActive, onClick }) => {
  return (
    <div className=" flex flex-row items-center space-x-2">
     {icon}
      <button
      onClick={onClick}
      className={clsx('px-4 py-2 text-sm rounded-md transition-colors',
        isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50")}>
          {name}
    </button>
    </div>
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
  const menu: MenuItem[] = [
    {
      icon: <Star className="w-4 h-4" />,
      name: "POSKO NATARU-ANGLEB",
      pathname: "/aplikasi/posko/posko nataru-angleb",
      children: [],
    },
    {
      icon: <Star className="w-4 h-4" />,
      name: "DASHBOARD",
      pathname: "/aplikasi/posko/dashboard",
      children: [],
    },
    {
      icon: <Star className="w-4 h-4" />,
      name: "DATA NATARU-ANGLEB",
      pathname: "/aplikasi/posko/data nataru-angleb",
      children: [],
    },
    {
      icon: <Star className="w-4 h-4" />,
      name: "AIRLINES",
      pathname: "/aplikasi/posko/airlines",
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
    <div className="min-h-screen bg-gradient-to-br from-[#f1f1ff] to-[#e8e8ff]">
      <header className="bg-gray-900 sticky top-0 z-50 border-b border-gray-800 h-12 text-white text-sm">
        <div className=" h-full mx-6 items-center flex justify-between text-center">
          <button
            className="flex items-center space-x-2"
            onClick={() => navigate("/aplikasi")}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className=" font-bold text-sm">DEO AIRPORT - SOQ</span>
          </button>
          <div>POSKO</div>
          <div>sdas</div>
        </div>
      </header>

      <div className=" bg-white h-10 px-6 flex items-center">
        <nav className="flex items-center space-x-1">
          {menu.map((item, index) => {
            //console.log(item)
            return (
              <div key={index} className="relative">
                <MenuButton
                  icon={item.icon}
                  name={item.name}
                  isActive={activeMenu?.pathname === item.pathname}
                  onClick={() => {
                    if (item.children.length > 0) {
                      setShowSubMenu(showSubMenu === item.pathname ? null : item.pathname);
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
          })}
        </nav>
      </div>
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};
