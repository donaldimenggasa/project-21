import React, { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { 
  LayoutDashboard, Users, FileText, Calculator, MessageCircle, CheckSquare,
  Building2, Shield, Map, UserCheck, PieChart, Clock, Globe, GraduationCap,
  Mail, CalendarDays, BarChart, Plus, Search, MoreHorizontal, LineChart,
  ClipboardCheck, Presentation, HelpCircle, ListTodo, BarChart3
} from 'lucide-react';
import { path } from 'lodash/fp';

interface AppIconProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  progress?: number;
  onClick?: () => void;
  category?: string;
}

const AppIcon: React.FC<AppIconProps> = ({ 
  icon, 
  title, 
  description,
  badge,
  progress,
  onClick,
  category
}) => (
  <div 
    className="bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs">
          {icon}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    </div>

    <div className="mt-4 space-y-3">
      {progress !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {(badge || category) && (
        <div className="flex items-center gap-2">
          {category && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {category}
            </span>
          )}
          {badge && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

interface MenuItem {
  name?: {
    en_US?: string;
  };
  path?: string;
}

const AppGrid: React.FC<{ menu: MenuItem[] }> = ({ menu = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const apps = menu.map((item)=>{
    return {
      icon: <LayoutDashboard className="w-6 h-6 text-cyan-500" />,
      title: item.name?.en_US,
      description: "Real-time business metrics and KPI tracking",
      progress: 75,
      category: "Analytics",
      path: `/aplikasi/${item.id}`,
      badge: "New",
    }
  })


  console.log(menu);



  const filteredApps = apps.filter(app => 
    (app.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and access your business applications</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </button>
      </div>

      <div className="relative">
        <div className="sticky top-0 z-10 mb-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-xs">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm focus:outline-hidden focus:ring-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app, index) => (
            <AppIcon 
              key={index}
              {...app}
              onClick={() => app.path && navigate(app.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppGrid;