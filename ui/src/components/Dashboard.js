import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/index.css';
import StockList from './StockList';
import CommonSidebar from './CommonSidebar';
import config from '../config/config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetch(`${config.apiUrl}/portfolio`)
      .then(res => res.json())
      .then(data => setPortfolio(data));
  }, []);

  const chartData = {
    labels: portfolio.map(entry => entry.symbol),
    datasets: [
      {
        label: 'Value',
        data: portfolio.map(entry => entry.quantity * entry.price),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Portfolio Value by Stock' },
    },
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar */}
      <CommonSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold mb-8 text-blue-900">Portfolio Dashboard</h1>
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 p-6 rounded-xl shadow text-blue-900">
                <div className="text-lg font-semibold">Total Stocks</div>
                <div className="text-3xl font-bold">{portfolio.length}</div>
              </div>
              <div className="bg-blue-100 p-6 rounded-xl shadow text-blue-900">
                <div className="text-lg font-semibold">Total Value</div>
                <div className="text-3xl font-bold">${portfolio.reduce((sum, entry) => sum + entry.quantity * entry.price, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'stocks' && (
          <div className="max-w-4xl mx-auto">
            <StockList />
          </div>
        )}
        {activeTab === 'portfolio' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">Portfolio</h2>
            <p className="text-blue-700">Portfolio details coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
