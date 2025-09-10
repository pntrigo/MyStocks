import config from '../config/config';

const baseUrl = config.apiUrl;

export async function getStocks() {
  if (!baseUrl) throw new Error('API URL is not set.');
  const res = await fetch(`${baseUrl}/getStocks`);
  if (!res.ok) throw new Error('Failed to fetch stocks');
  return res.json();
}

export async function getPortfolio() {
  if (!baseUrl) throw new Error('API URL is not set.');
  const res = await fetch(`${baseUrl}/portfolio`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function addToPortfolio({ symbol, quantity, price }) {
  if (!baseUrl) throw new Error('API URL is not set.');
  const res = await fetch(`${baseUrl}/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, quantity, price })
  });
  if (!res.ok) throw new Error('Failed to add to portfolio');
  return res.json();
}

export async function editPortfolioEntry({ id, symbol, quantity }) {
  if (!baseUrl) throw new Error('API URL is not set.');
  const res = await fetch(`${baseUrl}/portfolio/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, symbol, quantity })
  });
  if (!res.ok) throw new Error('Failed to edit portfolio entry');
  return res.json();
}

export async function deletePortfolioEntry(id) {
  if (!baseUrl) throw new Error('API URL is not set.');
  const res = await fetch(`${baseUrl}/portfolio/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error('Failed to delete portfolio entry');
  return res.json();
}

