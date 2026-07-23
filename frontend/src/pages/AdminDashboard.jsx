import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { RiMoneyDollarCircleLine, RiShoppingBag3Line, RiUserLine, RiTruckLine, RiAlertLine } from 'react-icons/ri';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await API.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 mt-4 animate-pulse">Aggregating database analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
        ⚠️ {error || 'Failed to load dashboard parameters.'}
      </div>
    );
  }

  const { kpis, recentOrders, lowStockProducts, topProducts, monthlySales } = stats;

  // Chart dataset parameters
  const chartData = {
    labels: monthlySales.map((item) => item.month),
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue (Rs.)',
        data: monthlySales.map((item) => item.revenue),
        borderColor: '#2e7d32', // Green brand color
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            <RiMoneyDollarCircleLine className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 block">
              Rs. {kpis.totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            <RiShoppingBag3Line className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 block">
              {kpis.totalOrders}
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            <RiUserLine className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Customers</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 block">
              {kpis.totalCustomers}
            </span>
          </div>
        </div>

        {/* Riders */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            <RiTruckLine className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">Riders Online</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 block">
              {kpis.totalPartners}
            </span>
          </div>
        </div>
      </div>

      {/* ================= CHARTS AND SALES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sales Line Chart (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200">
          <h3 className="text-base font-bold text-gray-950 dark:text-white mb-4">Monthly Revenue Trends</h3>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Selling Products List (Right 1 column) */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-4">
          <h3 className="text-base font-bold text-gray-950 dark:text-white">Top 5 Products</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topProducts.map((p, idx) => (
              <div key={p._id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-gray-400 mr-2">#{idx + 1}</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{p.name}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Sold Qty: {p.totalQtySold}</span>
                </div>
                <span className="font-bold text-primary-500">Rs. {p.revenueGenerated}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RECENT AND STOCK WARNS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Orders (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 overflow-x-auto">
          <h3 className="text-base font-bold text-gray-950 dark:text-white mb-4">Recent Client Orders</h3>
          
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-bold uppercase">
                <th className="py-2.5">Order ID</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <td className="py-3 font-semibold font-mono text-xs">{ord.orderId}</td>
                  <td>{ord.userId ? ord.userId.name : 'N/A'}</td>
                  <td className="font-bold text-primary-500">Rs. {ord.totalAmount}</td>
                  <td>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-gray-50">
                      {ord.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts (Right 1 column) */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-4">
          <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-1.5 text-red-500">
            <RiAlertLine /> Stock Warning ({lowStockProducts.length})
          </h3>
          
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-gray-400">All items are fully stocked.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div key={p._id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 block">{p.name}</span>
                    <span className="text-[10px] text-gray-400">Unit: {p.unit}</span>
                  </div>
                  <span className="font-extrabold text-red-500 bg-red-50 px-2 py-1 rounded">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
