import { db } from "~/server/db";
import { eq, sql } from "drizzle-orm";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet, useNavigate, useParams } from "@remix-run/react";
import { ChevronDown, Search, Filter, Download, Upload, MoreHorizontal, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

function buildMenuTree(menuList: any[], parentId: number | null = null): any[] {
  return menuList
    .filter((menu) => menu.parent_id === parentId)
    .map((menu) => {
      if (menu.action) {
        const __menu = menu.action.split(',');
        menu.action_name = __menu[0];
        menu.action_target = parseInt(__menu[1]);
      }
      return {
        id: menu.id,
        sequence: menu.sequence,
        name: menu.name.en_US,
        parentId: menu.parent_id,
        action_name: menu.action_name,
        action_target: menu.action_target,
        children: buildMenuTree(menuList, menu.id),
      }
    });
}



export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id_menu_root } = params;
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  try {
    const result = await db.query.menus.findFirst({
      where: (menus) => id_menu_root ? eq(menus.id, parseInt(id_menu_root ?? "0")) : undefined,
    });
    const childrenMenu = await db.execute(
      sql`
          WITH RECURSIVE menu_tree AS (
            SELECT id, name, parent_id, sequence, action
            FROM ir_ui_menu
            WHERE parent_id = ${parseInt(id_menu_root ?? "0")}
            UNION ALL
            SELECT m.id, m.name, m.parent_id, m.sequence, m.action
            FROM ir_ui_menu m
            INNER JOIN menu_tree mt ON m.parent_id = mt.id
          )
          SELECT * FROM menu_tree ORDER BY sequence;
        `);

    const children = buildMenuTree(childrenMenu.rows, parseInt(id_menu_root ?? "0"));

    return new Response(
      JSON.stringify({
        name: result?.name,
        id: result?.id,
        menu: children
      }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "request invalid.",
        },
      }),
      { status: 400, headers: headers_res }
    );
  }
};



const MenuButton: React.FC<{
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ name, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm rounded-md transition-colors
      ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
    `}
  >
    {name.replace(/_/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')}
  </button>
);

interface MenuItem {
  id: number;
  sequence: number;
  name: string;
  parentId: number;
  action_name: string;
  action_target: number;
  children: MenuItem[];
}

interface MenuData {
  name: {
    "en_US": string;
  };
  id: number;
  menu: MenuItem[];
}

const SubMenu: React.FC<{
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}> = ({ items, onSelect }) => {
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
              {item.name.replace(/_/g, ' ').split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ')}
              {item.children.length > 0 && (
                <ChevronRight className="w-4 h-4" />
              )}
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





export default () => {
  const data = useLoaderData<MenuData>();
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [showSubMenu, setShowSubMenu] = useState<number | null>(null);
  const navigate = useNavigate();
  const { id_menu_root } = useParams();

  const handleMenuSelect = useCallback((item: MenuItem) => {
    setActiveMenu(item);
    setShowSubMenu(null);
    if (item.action_name === 'ir.actions.act_window') {
      navigate(`/aplikasi/${id_menu_root}/${item.action_target}`);
    }
  }, [navigate, id_menu_root]);


  return (<div className="min-h-screen bg-linear-to-br from-[#f1f1ff] to-[#e8e8ff]">
    <header className="bg-gray-900 sticky top-0 z-50 border-b border-gray-800 h-12 text-white text-sm">
      <div className=" h-full mx-6 items-center flex justify-between text-center">
        <button className="flex items-center space-x-2" onClick={() => navigate('/aplikasi')}>
          <ChevronLeft className="w-4 h-4" />
          <span className=" font-bold text-sm">DEO AIRPORT - SOQ</span>
        </button>

        <div>
        {data?.name?.en_US}
        </div>

        <div>sdas</div>
      </div>
    </header>

    <div className=" bg-white h-10 px-6 flex items-center">
      <nav className="flex items-center space-x-1">
        {data.menu.map((item) => {
          //console.log(item)
          return (
            <div key={item.id} className="relative">
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
              {showSubMenu === item.id && item.children.length > 0 && (
                <SubMenu items={item.children} onSelect={handleMenuSelect} />
              )}
            </div>
          )
        })}
      </nav>
    </div>
    <main className="">
      <Outlet />
    </main>
  </div>)
}