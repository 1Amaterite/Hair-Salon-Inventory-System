import React, { useEffect, useMemo, useState } from 'react';
import { productsApi, Product } from '../api/products';
import { transactionsApi, Transaction } from '../api/transactions';
import SideNavigation from '../components/SideNavigation';
import { AlertTriangle, CalendarClock, DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, Truck } from 'lucide-react';

type CheckFrequency = 'MONTHLY' | 'QUARTERLY';

type SalesRow = {
  productId: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  currentStock: number;
  reorderThreshold: number;
  leadTimeDays: number;
};

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
  const [last30dTransactions, setLast30dTransactions] = useState<Transaction[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

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
        const start30 = startOfDay(new Date());
        start30.setDate(start30.getDate() - 29);

        const [prods, todays, last30, low] = await Promise.all([
          fetchAllActiveProducts(),
          fetchTransactionsInRange(todayStart, todayEnd, 1000),
          fetchTransactionsInRange(start30, todayEnd, 5000),
          transactionsApi.getLowStockProducts()
        ]);

        if (!cancelled) {
          setProducts(prods);
          setTodayTransactions(todays);
          setLast30dTransactions(last30);
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

  const deliveries = useMemo(() => {
    // Treat INBOUND transactions as “deliveries received” for now.
    const inbound = todayTransactions.filter((t) => t.type === 'INBOUND');
    const receivedUnits = inbound.reduce((acc, t) => acc + Math.abs(Number(t.quantity) || 0), 0);
    return { receivedCount: inbound.length, receivedUnits };
  }, [todayTransactions]);

  const salesTable = useMemo(() => {
    // OUTBOUND transactions are labeled as sales in `Transactions.tsx`.
    const byProduct = new Map<string, { units: number; revenue: number }>();
    for (const t of last30dTransactions) {
      if (t.type !== 'OUTBOUND') continue;
      const units = Math.abs(Number(t.quantity) || 0);
      const existing = byProduct.get(t.productId) || { units: 0, revenue: 0 };
      const product = products.find((p) => p.id === t.productId);
      const price = Number(product?.retailPrice) || 0;
      existing.units += units;
      existing.revenue += units * price;
      byProduct.set(t.productId, existing);
    }

    const rows: SalesRow[] = [];
    for (const p of products) {
      const s = byProduct.get(p.id) || { units: 0, revenue: 0 };
      rows.push({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        unitsSold: s.units,
        revenue: s.revenue,
        currentStock: Number(p.currentStock) || 0,
        reorderThreshold: Number(p.reorderThreshold) || 0,
        leadTimeDays: Number(p.leadTimeDays) || 0
      });
    }

    rows.sort((a, b) => b.unitsSold - a.unitsSold);
    const best = rows.find((r) => r.unitsSold > 0) || null;
    const worst = [...rows].reverse().find((r) => r.unitsSold > 0) || null;
    return { rows, best, worst };
  }, [last30dTransactions, products]);

  const recommendations = useMemo(() => {
    const daysWindow = 30;
    const avgDailyByProduct = new Map<string, number>();

    for (const r of salesTable.rows) {
      avgDailyByProduct.set(r.productId, r.unitsSold / daysWindow);
    }

    const recs = salesTable.rows
      .map((r) => {
        const avgDaily = avgDailyByProduct.get(r.productId) || 0;
        const daysOfStock = avgDaily > 0 ? r.currentStock / avgDaily : Infinity;
        const low = r.currentStock <= r.reorderThreshold;
        const willRunOutBeforeLeadTime = Number.isFinite(daysOfStock) && daysOfStock < Math.max(1, r.leadTimeDays || 1);

        let decision: 'BUY' | 'HOLD' = 'HOLD';
        let reason = 'Stock level looks healthy.';

        if (low) {
          decision = 'BUY';
          reason = 'Low stock (at or below reorder threshold).';
        } else if (willRunOutBeforeLeadTime) {
          decision = 'BUY';
          reason = `Projected to run out in ~${Math.max(0, Math.floor(daysOfStock))} days (lead time ${r.leadTimeDays}d).`;
        }

        return { ...r, avgDaily, daysOfStock, decision, reason };
      })
      .sort((a, b) => {
        if (a.decision !== b.decision) return a.decision === 'BUY' ? -1 : 1;
        // prioritize lowest days of stock
        return (a.daysOfStock || Infinity) - (b.daysOfStock || Infinity);
      })
      .slice(0, 8);

    return recs;
  }, [salesTable.rows]);

  const checkTracker = useMemo(() => {
    if (!lastCheckDate) return null;
    const last = new Date(lastCheckDate);
    if (Number.isNaN(last.getTime())) return null;

    const next = checkFrequency === 'MONTHLY' ? addMonths(last, 1) : addMonths(last, 3);
    const daysUntil = diffDays(new Date(), next);
    return { last, next, daysUntil };
  }, [checkFrequency, lastCheckDate]);

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'INBOUND':
        return 'text-green-700 bg-green-100';
      case 'OUTBOUND':
        return 'text-red-700 bg-red-100';
      case 'USAGE':
        return 'text-blue-700 bg-blue-100';
      case 'ADJUSTMENT':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <SideNavigation title="Admin Dashboard" configType="with-recent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Total inventory value (cost)</div>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '—' : peso(totals.totalInventoryValue)}</div>
              <div className="mt-1 text-xs text-gray-500">{loading ? '' : `${niceInt(totals.totalProducts)} active products`}</div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Total potential revenue</div>
                <ShoppingCart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '—' : peso(totals.totalPotentialRevenue)}</div>
              <div className="mt-1 text-xs text-gray-500">Based on current stock × retail price</div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Low stock alerts</div>
                <AlertTriangle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '—' : niceInt(totals.lowStockCount)}</div>
              <div className="mt-1 text-xs text-gray-500">At or below reorder threshold</div>
            </div>

            <div className="bg-white shadow rounded-lg p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Deliveries received today</div>
                <Truck className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{loading ? '—' : niceInt(deliveries.receivedUnits)}</div>
              <div className="mt-1 text-xs text-gray-500">{loading ? '' : `${niceInt(deliveries.receivedCount)} inbound transactions`}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Today's transactions</div>
                    <div className="text-xs text-gray-500">Latest activity (today only)</div>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-x-auto">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : todayTransactions.length === 0 ? (
                  <div className="text-sm text-gray-500">No transactions yet today.</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todayTransactions.slice(0, 25).map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDateTime(t.createdAt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{t.product?.name}</div>
                            <div className="text-xs text-gray-500">{t.product?.sku}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(t.type)}`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {t.type === 'INBOUND' ? '+' : '-'}{niceInt(Math.abs(Number(t.quantity) || 0))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{t.user?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{t.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Inventory check tracker</div>
                  <div className="text-xs text-gray-500">Monthly/Quarterly reminder</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Frequency</label>
                    <select
                      value={checkFrequency}
                      onChange={(e) => setCheckFrequency(e.target.value as CheckFrequency)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Last check date</label>
                    <input
                      type="date"
                      value={lastCheckDate}
                      onChange={(e) => setLastCheckDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                {!checkTracker ? (
                  <div className="text-sm text-gray-500">
                    Set a "last check date" to see when the next inventory check is due.
                  </div>
                ) : (
                  <div className={`p-4 rounded-md border ${
                    checkTracker.daysUntil < 0
                      ? 'bg-red-50 border-red-200'
                      : checkTracker.daysUntil <= 7
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="text-sm font-medium text-gray-900">Next check</div>
                    <div className="text-sm text-gray-700">{checkTracker.next.toLocaleDateString()}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {checkTracker.daysUntil < 0
                        ? `${Math.abs(checkTracker.daysUntil)} days overdue`
                        : `${checkTracker.daysUntil} days remaining`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Low stock alert</div>
                  <div className="text-xs text-gray-500">Products needing attention</div>
                </div>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : lowStock.length === 0 ? (
                  <div className="text-sm text-gray-500">No low stock products right now.</div>
                ) : (
                  <ul className="space-y-3">
                    {lowStock.slice(0, 6).map((p: any) => (
                      <li key={p.id} className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-700">{niceInt(p.currentStock)}</div>
                          <div className="text-xs text-gray-500">threshold {niceInt(p.reorderThreshold)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Best / worst sellers (30d)</div>
                  <div className="text-xs text-gray-500">Based on outbound units</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : (
                  <>
                    <div className="p-4 rounded-md bg-indigo-50 border border-indigo-100">
                      <div className="text-xs text-indigo-700 font-medium">Best selling</div>
                      {salesTable.best ? (
                        <div className="mt-1">
                          <div className="text-sm font-semibold text-gray-900">{salesTable.best.name}</div>
                          <div className="text-xs text-gray-600">{salesTable.best.sku}</div>
                          <div className="mt-2 text-sm text-gray-800">
                            {niceInt(salesTable.best.unitsSold)} units • {peso(salesTable.best.revenue)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-600">No sales in the last 30 days.</div>
                      )}
                    </div>

                    <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
                      <div className="text-xs text-gray-700 font-medium">Worst selling</div>
                      {salesTable.worst ? (
                        <div className="mt-1">
                          <div className="text-sm font-semibold text-gray-900">{salesTable.worst.name}</div>
                          <div className="text-xs text-gray-600">{salesTable.worst.sku}</div>
                          <div className="mt-2 text-sm text-gray-800">
                            {niceInt(salesTable.worst.unitsSold)} units • {peso(salesTable.worst.revenue)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-600">No sales in the last 30 days.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Buy / hold recommendations</div>
                  <div className="text-xs text-gray-500">Threshold + sales velocity (30d)</div>
                </div>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : recommendations.length === 0 ? (
                  <div className="text-sm text-gray-500">No recommendations to show.</div>
                ) : (
                  <ul className="space-y-3">
                    {recommendations.map((r) => (
                      <li key={r.productId} className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.sku}</div>
                          <div className="mt-1 text-xs text-gray-600">{r.reason}</div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            r.decision === 'BUY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {r.decision}
                          </span>
                          <div className="mt-1 text-xs text-gray-500">stock {niceInt(r.currentStock)}</div>
                          <div className="text-xs text-gray-500">{r.avgDaily > 0 ? `~${r.avgDaily.toFixed(2)}/day` : 'no velocity'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default Reports;
