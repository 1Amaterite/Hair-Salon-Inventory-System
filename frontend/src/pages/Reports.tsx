import React, { useEffect, useMemo, useState } from 'react';
import SideNavigation from '../components/SideNavigation';
import { transactionsApi, Transaction } from '../api/transactions';

type Granularity = 'day' | 'week' | 'month' | 'year';

type SeriesPoint = {
  label: string;
  inbound: number;
  outbound: number; // OUTBOUND + USAGE (absolute)
  net: number; // inbound - outbound
};

const pad2 = (n: number) => String(n).padStart(2, '0');

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatMonthLabel(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun, 1 Mon ... 6 Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  x.setDate(x.getDate() + diff);
  return x;
}

function formatWeekLabel(d: Date) {
  const monday = startOfWeekMonday(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${formatISODate(monday)}..${formatISODate(sunday)}`;
}

function formatYearLabel(d: Date) {
  return String(d.getFullYear());
}

function getBucketKey(d: Date, granularity: Granularity) {
  if (granularity === 'day') return formatISODate(d);
  if (granularity === 'week') return formatISODate(startOfWeekMonday(d));
  if (granularity === 'month') return formatMonthLabel(d);
  return formatYearLabel(d);
}

function getBucketLabel(d: Date, granularity: Granularity) {
  if (granularity === 'day') return formatISODate(d);
  if (granularity === 'week') return formatWeekLabel(d);
  if (granularity === 'month') return formatMonthLabel(d);
  return formatYearLabel(d);
}

function buildEmptyBuckets(endDate: Date, granularity: Granularity) {
  const buckets: { key: string; label: string }[] = [];
  const end = startOfDay(endDate);
  const cursor = new Date(end);

  if (granularity === 'day') {
    cursor.setDate(end.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + i);
      buckets.push({ key: getBucketKey(d, 'day'), label: getBucketLabel(d, 'day') });
    }
    return buckets;
  }

  if (granularity === 'week') {
    const endWeek = startOfWeekMonday(end);
    const startWeek = new Date(endWeek);
    startWeek.setDate(endWeek.getDate() - 11 * 7);
    for (let i = 0; i < 12; i++) {
      const d = new Date(startWeek);
      d.setDate(startWeek.getDate() + i * 7);
      buckets.push({ key: getBucketKey(d, 'week'), label: getBucketLabel(d, 'week') });
    }
    return buckets;
  }

  if (granularity === 'month') {
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    const startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      buckets.push({ key: getBucketKey(d, 'month'), label: getBucketLabel(d, 'month') });
    }
    return buckets;
  }

  // year
  const endYear = new Date(end.getFullYear(), 0, 1);
  const startYear = new Date(endYear.getFullYear() - 4, 0, 1);
  for (let i = 0; i < 5; i++) {
    const d = new Date(startYear.getFullYear() + i, 0, 1);
    buckets.push({ key: getBucketKey(d, 'year'), label: getBucketLabel(d, 'year') });
  }
  return buckets;
}

function getRangeStart(endDate: Date, granularity: Granularity) {
  const end = startOfDay(endDate);
  const start = new Date(end);

  if (granularity === 'day') {
    start.setDate(end.getDate() - 29);
    return start;
  }
  if (granularity === 'week') {
    const endWeek = startOfWeekMonday(end);
    endWeek.setDate(endWeek.getDate() + 6);
    const startWeek = startOfWeekMonday(end);
    startWeek.setDate(startWeek.getDate() - 11 * 7);
    return startWeek;
  }
  if (granularity === 'month') {
    return new Date(end.getFullYear(), end.getMonth() - 11, 1);
  }
  return new Date(end.getFullYear() - 4, 0, 1);
}

function sumSeries(points: SeriesPoint[]) {
  return points.reduce(
    (acc, p) => {
      acc.inbound += p.inbound;
      acc.outbound += p.outbound;
      acc.net += p.net;
      return acc;
    },
    { inbound: 0, outbound: 0, net: 0 }
  );
}

function niceInt(n: number) {
  return Intl.NumberFormat().format(Math.round(n));
}

const Sparkline: React.FC<{
  values: number[];
  strokeClassName?: string;
  fillClassName?: string;
  height?: number;
}> = ({ values, strokeClassName = 'stroke-indigo-600', fillClassName = 'fill-indigo-100', height = 64 }) => {
  const width = 320;
  const padding = 6;

  const { d, areaD } = useMemo(() => {
    if (!values.length) return { d: '', areaD: '' };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const xStep = (width - padding * 2) / Math.max(1, values.length - 1);
    const pts = values.map((v, i) => {
      const x = padding + i * xStep;
      const y = padding + (height - padding * 2) * (1 - (v - min) / span);
      return { x, y };
    });

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${line} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`;
    return { d: line, areaD: area };
  }, [values, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <path d={areaD} className={fillClassName} opacity="0.6" />
      <path d={d} className={`${strokeClassName} fill-none`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Reports: React.FC = () => {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const start = getRangeStart(now, granularity);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        // Backend caps `limit` at 100; paginate via `offset`.
        const pageSize = 100;
        const maxRows = 5000; // safety cap for UI
        const all: Transaction[] = [];

        for (let offset = 0; offset < maxRows; offset += pageSize) {
          const resp = await transactionsApi.getTransactions({
            limit: pageSize,
            offset,
            startDate: start.toISOString(),
            endDate: end.toISOString()
          });

          if (!resp.success) {
            throw new Error(resp.message || 'Failed to load transactions');
          }

          const rows = resp.data || [];
          all.push(...rows);
          if (rows.length < pageSize) break;
        }

        if (!cancelled) setTransactions(all);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load reports data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [granularity, now]);

  const series = useMemo(() => {
    const buckets = buildEmptyBuckets(now, granularity);
    const map = new Map<string, SeriesPoint>();
    for (const b of buckets) {
      map.set(b.key, { label: b.label, inbound: 0, outbound: 0, net: 0 });
    }

    for (const t of transactions) {
      const createdAt = new Date(t.createdAt);
      const key = getBucketKey(createdAt, granularity);
      const existing = map.get(key);
      if (!existing) continue;

      if (t.type === 'INBOUND') {
        const qty = Math.abs(Number(t.quantity) || 0);
        existing.inbound += qty;
        existing.net += qty;
      } else if (t.type === 'OUTBOUND' || t.type === 'USAGE') {
        const qty = Math.abs(Number(t.quantity) || 0);
        existing.outbound += qty;
        existing.net -= qty;
      } else {
        // ADJUSTMENT: treat positive as inbound and negative as outbound for a "movement" view
        const qty = Number(t.quantity) || 0;
        if (qty >= 0) {
          existing.inbound += qty;
          existing.net += qty;
        } else {
          existing.outbound += Math.abs(qty);
          existing.net += qty; // qty is negative
        }
      }
    }

    return buckets.map((b) => map.get(b.key)!).map((p) => ({
      ...p,
      inbound: Number(p.inbound.toFixed(2)),
      outbound: Number(p.outbound.toFixed(2)),
      net: Number(p.net.toFixed(2))
    }));
  }, [transactions, granularity, now]);

  const totals = useMemo(() => sumSeries(series), [series]);

  const netValues = useMemo(() => series.map((p) => p.net), [series]);
  const inboundValues = useMemo(() => series.map((p) => p.inbound), [series]);
  const outboundValues = useMemo(() => series.map((p) => p.outbound), [series]);

  return (
    <SideNavigation title="Reports" configType="with-recent">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Financial & Analytics</h3>
              <p className="text-sm text-gray-500">
                Simple “stock market” movement view based on transaction history.
              </p>
            </div>

            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-2 text-sm rounded-md border ${
                    granularity === g
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-lg p-5">
              <div className="text-sm text-gray-500">Inbound units</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{niceInt(totals.inbound)}</div>
              <div className="mt-3">{!loading && <Sparkline values={inboundValues} strokeClassName="stroke-emerald-600" fillClassName="fill-emerald-100" />}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <div className="text-sm text-gray-500">Outbound + usage units</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{niceInt(totals.outbound)}</div>
              <div className="mt-3">{!loading && <Sparkline values={outboundValues} strokeClassName="stroke-rose-600" fillClassName="fill-rose-100" />}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <div className="text-sm text-gray-500">Net units</div>
              <div className={`mt-1 text-2xl font-semibold ${totals.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {totals.net >= 0 ? '+' : ''}{niceInt(totals.net)}
              </div>
              <div className="mt-3">{!loading && <Sparkline values={netValues} strokeClassName="stroke-indigo-600" fillClassName="fill-indigo-100" />}</div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Movement by {granularity}</div>
                <div className="text-xs text-gray-500">
                  Showing {series.length} buckets
                </div>
              </div>
            </div>

            <div className="p-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bucket</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Inbound</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outbound</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    series.map((p) => (
                      <tr key={p.label} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.label}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{niceInt(p.inbound)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{niceInt(p.outbound)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${p.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {p.net >= 0 ? '+' : ''}{niceInt(p.net)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SideNavigation>
  );
};

export default Reports;

