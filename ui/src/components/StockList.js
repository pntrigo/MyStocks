import React, { useEffect, useState, Fragment } from 'react';
import '../styles/index.css';
import { Menu, Transition } from '@headlessui/react';
import { HomeIcon, ChartBarIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { TrashIcon, PencilSquareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { getStocks, getPortfolio, addToPortfolio, editPortfolioEntry, deletePortfolioEntry } from '../api/api';
import BackendUnavailable from './BackendUnavailable';

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addForm, setAddForm] = useState({ symbol: '', quantity: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ symbol: '', quantity: '', price: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  useEffect(() => {
    Promise.all([getStocks(), getPortfolio()])
      .then(([stocksData, portfolioData]) => {
        setStocks(stocksData);
        setPortfolio(portfolioData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const added = await addToPortfolio({
        symbol: addForm.symbol,
        quantity: Number(addForm.quantity),
        price: Number(addForm.price)
      });
      setPortfolio([...portfolio, added]);
      setAddForm({ symbol: '', quantity: '', price: '' });
    } catch {
      setError('Failed to add to portfolio');
    }
    setActionLoading(false);
  };

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setEditForm({ symbol: entry.symbol, quantity: entry.quantity, price: entry.price });
  };

  const handleEditSave = async (id) => {
    setActionLoading(true);
    try {
      const updated = await editPortfolioEntry({ id, symbol: editForm.symbol, quantity: Number(editForm.quantity) });
      setPortfolio(portfolio.map(p => p.id === id ? { ...p, ...updated } : p));
      setEditId(null);
    } catch {
      setError('Failed to edit entry');
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await deletePortfolioEntry(id);
      setPortfolio(portfolio.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete entry');
    }
    setActionLoading(false);
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/portfolio/export');
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setImportMessage('Failed to export portfolio.');
    }
  };
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/portfolio/import', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Import failed');
      setImportMessage('Portfolio imported successfully!');
      // Refresh portfolio
      const portfolioData = await getPortfolio();
      setPortfolio(portfolioData);
    } catch {
      setImportMessage('Failed to import portfolio.');
    }
  };

  // Download portfolio template Excel file
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/portfolio/template');
      if (!response.ok) throw new Error('Failed to download template');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  if (loading) return <div className="p-4 text-blue-700">Loading stocks & portfolio...</div>;
  if (error) return <BackendUnavailable />;

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8">
      {/* Add to Portfolio Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Add to Portfolio</h2>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={handleAdd}>
          <div>
            <label className="block text-blue-900 font-semibold mb-1">Stock</label>
            <select
              className="border rounded px-3 py-2 min-w-[120px] bg-blue-50 focus:ring-2 focus:ring-blue-300"
              value={addForm.symbol}
              onChange={e => setAddForm(f => ({ ...f, symbol: e.target.value }))}
              required
            >
              <option value="">Select</option>
              {stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>{stock.symbol} - {stock.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-blue-900 font-semibold mb-1">Quantity</label>
            <input
              type="number"
              className="border rounded px-3 py-2 bg-blue-50 focus:ring-2 focus:ring-blue-300"
              value={addForm.quantity}
              min="1"
              onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-blue-900 font-semibold mb-1">Price</label>
            <input
              type="number"
              className="border rounded px-3 py-2 bg-blue-50 focus:ring-2 focus:ring-blue-300"
              value={addForm.price}
              min="0"
              step="0.01"
              onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md"
            disabled={actionLoading}
          >
            Add
          </button>
        </form>
      </div>

      {/* Excel Import/Export */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 shadow"
          onClick={handleExport}
        >
          Export to Excel
        </button>
        <label className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 shadow cursor-pointer">
          Import from Excel
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleImport}
          />
        </label>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleDownloadTemplate}
          type="button"
        >
          Download Template
        </button>
      </div>
      {importMessage && <div className="mb-4 text-center text-blue-700 font-semibold">{importMessage}</div>}

      {/* Portfolio Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-3xl font-extrabold mb-6 text-blue-900">My Portfolio</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse rounded-xl overflow-hidden text-sm">
            <thead className="bg-blue-50 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">% Change Today</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">PE Ratio</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-blue-900 font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((entry, idx) => (
                <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-blue-100'}>
                  <td className="px-6 py-3 font-mono text-blue-800 font-bold text-base flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                    {entry.symbol}
                  </td>
                  <td className="px-6 py-3 font-semibold text-blue-900">{editId === entry.id ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20 bg-blue-50 focus:ring-2 focus:ring-blue-300"
                      value={editForm.quantity}
                      min="1"
                      onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                    />
                  ) : (
                    entry.quantity
                  )}</td>
                  <td className="px-6 py-3 font-semibold text-blue-900">{editId === entry.id ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24 bg-blue-50 focus:ring-2 focus:ring-blue-300"
                      value={editForm.price}
                      min="0"
                      step="0.01"
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      disabled
                    />
                  ) : (
                    <span className="">${(typeof entry.price === 'number' && !isNaN(entry.price)) ? entry.price.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : (parseFloat(entry.price) ? parseFloat(entry.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00')}</span>
                  )}</td>
                  <td className={`px-6 py-3 font-semibold ${entry.percentChangeToday > 0 ? 'text-green-600' : entry.percentChangeToday < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    {typeof entry.percentChangeToday === 'number' && !isNaN(entry.percentChangeToday)
                      ? `${entry.percentChangeToday.toFixed(2)}%`
                      : '—'}
                  </td>
                  <td className="px-6 py-3 font-semibold text-blue-900">
                    {typeof entry.peRatio === 'number' && !isNaN(entry.peRatio)
                      ? entry.peRatio.toFixed(2)
                      : '—'}
                  </td>
                  <td className="px-6 py-3 font-bold text-blue-700">
                    {(() => {
                      const qty = parseFloat(entry.quantity);
                      const price = typeof entry.price === 'number' ? entry.price : parseFloat(entry.price);
                      const total = (!isNaN(qty) && !isNaN(price)) ? qty * price : 0;
                      return <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
                    })()}
                  </td>
                  <td className="px-6 py-3 space-x-2">
                    {editId === entry.id ? (
                      <>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 shadow"
                          onClick={() => handleEditSave(entry.id)}
                          disabled={actionLoading}
                        >
                          <CheckIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 shadow"
                          onClick={() => setEditId(null)}
                          disabled={actionLoading}
                        >
                          <XMarkIcon className="h-4 w-4 inline" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 shadow"
                          onClick={() => handleEdit(entry)}
                          disabled={actionLoading}
                        >
                          <PencilSquareIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow"
                          onClick={() => handleDelete(entry.id)}
                          disabled={actionLoading}
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockList;
