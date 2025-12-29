'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register the chart parts we need
ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  sold: number;
  total: number;
  guestSales: number;
  userSales: number;
}

export default function AnalyticsChart({ sold, total, guestSales, userSales }: Props) {
  const remaining = total - sold;

  // Data for the "Sold vs Remaining" Chart
  const salesData = {
    labels: ['Sold', 'Remaining'],
    datasets: [
      {
        data: [sold, remaining],
        backgroundColor: ['#2563EB', '#E5E7EB'], // Blue, Gray
        hoverBackgroundColor: ['#1D4ED8', '#D1D5DB'],
        borderWidth: 0,
      },
    ],
  };

  // Data for the "Guest vs User" Chart
  const audienceData = {
    labels: ['Registered Users', 'Guests'],
    datasets: [
      {
        data: [userSales, guestSales],
        backgroundColor: ['#10B981', '#F59E0B'], // Green, Orange
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      {/* Chart 1: Progress */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Sales Progress</h3>
        <div className="w-48 h-48">
          <Doughnut data={salesData} />
        </div>
        <p className="mt-4 text-2xl font-bold text-gray-800">
          {Math.round((sold / total) * 100)}% <span className="text-sm font-normal text-gray-500">Sold</span>
        </p>
      </div>

      {/* Chart 2: Audience */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Audience Type</h3>
        {sold > 0 ? (
          <div className="w-48 h-48">
             <Doughnut data={audienceData} />
          </div>
        ) : (
           <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">No sales yet</div>
        )}
      </div>
    </div>
  );
}