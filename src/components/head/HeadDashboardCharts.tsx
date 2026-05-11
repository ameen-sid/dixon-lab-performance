"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface ChartProps {
  requestData: any[];
  reportData: any[];
  capaSubmitterData: any[];
  trendData: any[]; // Kept for the line chart as it was in the first picture
}

export default function HeadDashboardCharts({
  requestData = [],
  reportData = [],
  capaSubmitterData = [],
  trendData = [],
}: ChartProps) {
  // Colors for requests
  const requestColors: Record<string, string> = {
    Total: "#6366f1",
    Approved: "#10b981",
    Pending: "#f59e0b",
    Rejected: "#ef4444",
  };

  // Colors for reports
  const reportColors = ["#10b981", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      {/* 1. Total Sample Test, Approved, Rejected, Pending */}
      <div className="dixon-card p-6 bg-white border-slate-200 shadow-xl flex flex-col min-h-[400px]">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">
          Sample Requests Overview
        </h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={requestData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Count" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ r: 6, strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Completed vs Failure Reports */}
      <div className="dixon-card p-6 bg-slate-900 border-none shadow-2xl flex flex-col min-h-[400px]">
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">
          Adjudication Queue
        </h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={reportColors[index % reportColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. CAPA Reports by Submitter */}
      <div className="dixon-card p-6 bg-white border-slate-200 shadow-xl flex flex-col min-h-[400px] lg:col-span-2">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6">
          CAPA Reports by Submitter
        </h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capaSubmitterData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" name="Reports Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
