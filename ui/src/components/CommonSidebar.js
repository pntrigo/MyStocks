import React from 'react';
import { HomeIcon, ChartBarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const menuOptions = [
  { label: 'Dashboard', key: 'dashboard', icon: <HomeIcon className="h-5 w-5 mr-2" /> },
  { label: 'Stocks', key: 'stocks', icon: <ChartBarIcon className="h-5 w-5 mr-2" /> },
  { label: 'Portfolio', key: 'portfolio', icon: <BriefcaseIcon className="h-5 w-5 mr-2" /> },
];

export default function CommonSidebar({ activeTab, onTabChange }) {
  return (
    <div className="w-56 bg-gradient-to-b from-blue-900 to-blue-700 text-white flex flex-col p-6 h-full min-h-screen shadow-lg">
      <div className="flex items-center mb-10">
        <span className="text-3xl font-extrabold tracking-tight">MyStocks</span>
      </div>
      <nav className="flex-1">
        {menuOptions.map(opt => (
          <button
            key={opt.key}
            className={`flex items-center w-full text-left py-3 px-4 rounded-lg mb-2 transition-colors duration-150 font-medium text-lg ${activeTab === opt.key ? 'bg-blue-600 shadow' : 'hover:bg-blue-800 hover:shadow'}`}
            onClick={() => onTabChange(opt.key)}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto text-xs text-blue-200 opacity-70">&copy; {new Date().getFullYear()} MyStocks</div>
    </div>
  );
}
