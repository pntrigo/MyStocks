import React, { useEffect, useState, Fragment } from 'react';
import '../styles/index.css';
import { Menu, Transition } from '@headlessui/react';
import { HomeIcon, ChartBarIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { TrashIcon, PencilSquareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { getStocks, getPortfolio, addToPortfolio, editPortfolioEntry, deletePortfolioEntry } from '../api/api';

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addForm, setAddForm] = useState({ symbol: '', quantity: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ symbol: '', quantity: '', price: '' });
  const [actionLoading, setActionLoading] = useState(false);

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

  if (loading) return <div className="p-4 text-blue-700">Loading stocks & portfolio...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-10">
      {/* Add to Portfolio Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Add to Portfolio</h2>
        <form className="flex flex-wrap gap-4 items-end" onSubmit={handleAdd}>
          <div>
            <label className="block text-blue-900 font-semibold mb-1">Stock</label>
            <select
              className="border rounded px-3 py-2 min-w-[120px]"
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
              className="border rounded px-3 py-2"
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
              className="border rounded px-3 py-2"
              value={addForm.price}
              min="0"
              step="0.01"
              onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
            disabled={actionLoading}
          >
            Add
          </button>
        </form>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-extrabold mb-6 text-blue-900">My Portfolio</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse rounded-xl overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="border-b px-6 py-3 text-left text-blue-900 font-semibold">Symbol</th>
                <th className="border-b px-6 py-3 text-left text-blue-900 font-semibold">Quantity</th>
                <th className="border-b px-6 py-3 text-left text-blue-900 font-semibold">Price</th>
                <th className="border-b px-6 py-3 text-left text-blue-900 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((entry, idx) => (
                <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'}>
                  <td className="border-b px-6 py-3 font-mono text-blue-800">{entry.symbol}</td>
                  <td className="border-b px-6 py-3">
                    {editId === entry.id ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={editForm.quantity}
                        min="1"
                        onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                      />
                    ) : (
                      entry.quantity
                    )}
                  </td>
                  <td className="border-b px-6 py-3">
                    {editId === entry.id ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-24"
                        value={editForm.price}
                        min="0"
                        step="0.01"
                        onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                        disabled
                      />
                    ) : (
                      `$${(typeof entry.price === 'number' && !isNaN(entry.price)) ? entry.price : (parseFloat(entry.price) ? parseFloat(entry.price) : 0)}`
                    )}
                  </td>
                  <td className="border-b px-6 py-3 space-x-2">
                    {editId === entry.id ? (
                      <>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          onClick={() => handleEditSave(entry.id)}
                          disabled={actionLoading}
                        >
                          <CheckIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                          onClick={() => setEditId(null)}
                          disabled={actionLoading}
                        >
                          <XMarkIcon className="h-4 w-4 inline" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                          onClick={() => handleEdit(entry)}
                          disabled={actionLoading}
                        >
                          <PencilSquareIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
