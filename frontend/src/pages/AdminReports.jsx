import React, { useState } from 'react';
import { RiDownloadCloudLine, RiBarChartBoxLine } from 'react-icons/ri';

const AdminReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownloadCSV = () => {
    // Generate API url
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    let downloadUrl = `${baseUrl}/admin/reports`;
    
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    
    if (params.length > 0) {
      downloadUrl += `?${params.join('&')}`;
    }

    // Create temp link anchor
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `sales-report-${startDate || 'all'}-to-${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        <RiBarChartBoxLine className="text-primary-500 w-6 h-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Reports</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors duration-200 space-y-6">
        <div>
          <h3 className="font-bold text-gray-950 dark:text-white text-base">Export Sales Statement</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
            Download order ledger logs (including tax breakdowns, coupon codes, and shipping fees) formatted as a CSV spreadsheet.
          </p>
        </div>

        {/* Date Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownloadCSV}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover-scale flex justify-center items-center gap-2"
        >
          <RiDownloadCloudLine className="w-5 h-5" /> Download CSV Ledger
        </button>
      </div>

    </div>
  );
};

export default AdminReports;
