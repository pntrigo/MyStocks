import React from 'react';

const menuOptions = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Stocks', key: 'stocks' },
  { label: 'Portfolio', key: 'portfolio' },
];

export default function CommonSidebar({ activeTab, onTabChange }) {
  return (
    <div className="w-48 bg-gray-800 text-white flex flex-col p-4 h-full min-h-screen">
      <div className="text-2xl font-bold mb-8">Menu</div>
      {menuOptions.map(opt => (
        <button
          key={opt.key}
          className={`text-left py-2 px-4 rounded mb-2 ${activeTab === opt.key ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => onTabChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

