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
import './index.css';
import StockList from './components/StockList';
import CommonSidebar from './CommonSidebar';
import config from './config';

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <CommonSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Portfolio Dashboard</h1>
            <div className="bg-white p-6 rounded shadow">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
        {activeTab === 'stocks' && (
          <StockList />
        )}
        {activeTab === 'portfolio' && (
          <div>
            <h2 className="text-2xl font-bold">Portfolio</h2>
            <p>Portfolio details coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
