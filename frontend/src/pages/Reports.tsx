import React, { useEffect, useMemo, useState } from 'react';
import { productsApi, Product } from '../api/products';
import { transactionsApi, Transaction } from '../api/transactions';
import SideNavigation from '../components/SideNavigation';
import { useNavigate } from 'react-router-dom';

type CheckFrequency = 'MONTHLY' | 'QUARTERLY';

const peso = (n: number) => `₱${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
const niceInt = (n: number) => Intl.NumberFormat().format(Math.round(Number.isFinite(n) ? n : 0));

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function diffDays(a: Date, b: Date) {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

async function fetchAllActiveProducts() {
  const pageSize = 100;
  const maxPages = 50; // safety cap
  const all: Product[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const resp = await productsApi.getProducts({ page, limit: pageSize, isActive: true });
    if (!resp.success) throw new Error(resp.message || 'Failed to load products');
    all.push(...(resp.data || []));
    if (!resp.pagination?.hasNext) break;
  }

  return all;
}

async function fetchTransactionsInRange(start: Date, end: Date, limitCap = 5000) {
  const pageSize = 100; // backend caps at 100
  const all: Transaction[] = [];

  for (let offset = 0; offset < limitCap; offset += pageSize) {
    const resp = await transactionsApi.getTransactions({
      limit: pageSize,
      offset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });
    if (!resp.success) throw new Error(resp.message || 'Failed to load transactions');
    const rows = resp.data || [];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }

  return all;
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  const navigate = useNavigate();

  // “Next check” tracker is stored locally for now.
  const [checkFrequency, setCheckFrequency] = useState<CheckFrequency>(() => {
    const v = localStorage.getItem('inventoryCheck.frequency');
    return v === 'QUARTERLY' ? 'QUARTERLY' : 'MONTHLY';
  });
  const [lastCheckDate, setLastCheckDate] = useState<string>(() => localStorage.getItem('inventoryCheck.lastDate') || '');

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const [prods, todays, low] = await Promise.all([
          fetchAllActiveProducts(),
          fetchTransactionsInRange(todayStart, todayEnd, 1000),
          transactionsApi.getLowStockProducts()
        ]);

        if (!cancelled) {
          setProducts(prods);
          setTodayTransactions(todays);
          setLowStock(low.success ? (low.data || []) : []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load admin dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [now]);

  useEffect(() => {
    localStorage.setItem('inventoryCheck.frequency', checkFrequency);
  }, [checkFrequency]);

  useEffect(() => {
    if (lastCheckDate) localStorage.setItem('inventoryCheck.lastDate', lastCheckDate);
    else localStorage.removeItem('inventoryCheck.lastDate');
  }, [lastCheckDate]);

  const totals = useMemo(() => {
    const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.wholesaleCost) || 0) * (Number(p.currentStock) || 0), 0);
    const totalPotentialRevenue = products.reduce((acc, p) => acc + (Number(p.retailPrice) || 0) * (Number(p.currentStock) || 0), 0);
    const lowStockCount = products.filter((p) => (Number(p.currentStock) || 0) <= (Number(p.reorderThreshold) || 0)).length;
    return { totalInventoryValue, totalPotentialRevenue, lowStockCount, totalProducts: products.length };
  }, [products]);


  const checkTracker = useMemo(() => {
    if (!lastCheckDate) return null;
    const last = new Date(lastCheckDate);
    if (Number.isNaN(last.getTime())) return null;

    const next = checkFrequency === 'MONTHLY' ? addMonths(last, 1) : addMonths(last, 3);
    const daysUntil = diffDays(new Date(), next);
    return { last, next, daysUntil };
  }, [checkFrequency, lastCheckDate]);


  return (
    <SideNavigation configType="with-recent">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-xl">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Overview</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Welcome back. Here is your inventory status for today.</p>
            </div>
            <button className="bg-primary text-on-primary font-headline-sm text-headline-sm px-4 py-2 rounded-lg hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-sm">add</span>
              New Product
            </button>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container px-lg py-md rounded-lg border border-error font-body-md mb-lg">
              {error}
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Inventory Value</span>
                <span className="material-symbols-outlined text-primary bg-primary-fixed-dim/20 p-2 rounded-full">inventory_2</span>
              </div>
              <p className="font-headline-lg text-headline-lg text-on-surface">{loading ? '—' : peso(totals.totalInventoryValue)}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">{loading ? '' : `${niceInt(totals.totalProducts)} active products`}</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Potential Revenue</span>
                <span className="material-symbols-outlined text-tertiary bg-tertiary-container/20 p-2 rounded-full">payments</span>
              </div>
              <p className="font-headline-lg text-headline-lg text-on-surface">{loading ? '—' : peso(totals.totalPotentialRevenue)}</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Based on current stock × retail price</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Low Stock Alerts</span>
                <span className="material-symbols-outlined text-error bg-error-container/50 p-2 rounded-full">warning</span>
              </div>
              <p className="font-headline-lg text-headline-lg text-on-surface">{loading ? '—' : niceInt(totals.lowStockCount)}</p>
              <p className="font-body-md text-body-md text-error mt-2">At or below reorder threshold</p>
            </div>
          </div>

          {/* Today's Transactions and Inventory Check Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md text-on-surface">Today's Transactions</h3>
                {/*<button className="text-primary font-headline-sm text-headline-sm hover:underline">View All</button> */}
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="font-body-md text-body-md text-on-surface-variant">Loading…</div>
                ) : todayTransactions.length === 0 ? (
                  <div className="font-body-md text-body-md text-on-surface-variant">No transactions yet today.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-2 px-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Product</th>
                        <th className="py-2 px-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Time</th>
                        <th className="py-2 px-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Action</th>
                        <th className="py-2 px-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-md text-on-surface">
                      {todayTransactions.slice(0, 25).map((t) => (
                        <tr key={t.id} className="border-b border-outline-variant/50">
                          <td className="py-2 px-3">
                            <div className="text-sm font-medium text-on-surface">{t.product?.name}</div>
                            <div className="text-xs text-on-surface-variant">{t.product?.sku}</div>
                          </td>
                          <td className="py-2 px-3 text-on-surface-variant">{formatDateTime(t.createdAt)}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                              t.type === 'INBOUND' 
                                ? 'bg-primary-fixed-dim/20 text-primary' 
                                : 'bg-error-container/50 text-error'
                            }`}>
                              {t.type === 'INBOUND' ? 'Restock' : 'Sale'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-on-surface">
                            {t.type === 'INBOUND' ? '+' : '-'}{niceInt(Math.abs(Number(t.quantity) || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Critical Alerts */}
              <div className="bg-error-container/10 border border-error/20 rounded-xl p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">notification_important</span>
                  Priority Actions
                </h3>
                <ul className="flex flex-col gap-3">
                  {loading ? (
                    <div className="text-sm text-on-surface-variant">Loading…</div>
                  ) : lowStock.length === 0 ? (
                    <div className="text-sm text-on-surface-variant">No priority actions needed.</div>
                  ) : (
                    lowStock.slice(0, 3).map((p: any) => (
                      <li key={p.id} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant">science</span>
                          </div>
                          <div>
                            <p className="font-headline-sm text-headline-sm text-on-surface">{p.name}</p>
                            <p className="font-body-md text-body-md text-error">{niceInt(p.currentStock)} units remaining</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/transactions')} className="text-primary font-headline-sm text-headline-sm hover:underline">Reorder</button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Next Inventory Check Tracker */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Next Inventory Check</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body-lg text-body-lg text-on-surface">
                      {checkFrequency === 'MONTHLY' ? 'Monthly Full Audit' : 'Quarterly Full Audit'}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-primary">
                      {checkTracker ? `${checkTracker.daysUntil} Days` : '—'}
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: checkTracker ? `${Math.min(100, Math.max(0, 100 - (checkTracker.daysUntil / 30) * 100))}%` : '0%' }}
                    ></div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {checkTracker ? `Due on ${checkTracker.next.toLocaleDateString()}` : 'Set a last check date'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Frequency</label>
                      <select
                        value={checkFrequency}
                        onChange={(e) => setCheckFrequency(e.target.value as CheckFrequency)}
                        className="block w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Last check</label>
                      <input
                        type="date"
                        value={lastCheckDate}
                        onChange={(e) => setLastCheckDate(e.target.value)}
                        className="block w-full px-3 py-2 border border-outline-variant rounded-md bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default Reports;
