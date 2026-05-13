"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Activity, ShieldCheck, FlaskConical, CheckCircle, Calendar, Filter, ChevronDown, Clock, Monitor } from 'lucide-react';
import Image from 'next/image';

// Mock Data organized by Month and Week
const monthlyData = {
  'March': {
    performance: [
      { name: 'Week 1', plan: 380, actual: 350 },
      { name: 'Week 2', plan: 400, actual: 410 },
      { name: 'Week 3', plan: 420, actual: 390 },
      { name: 'Week 4', plan: 450, actual: 440 },
    ],
    reliability: [
      { name: 'Week 1', plan: 94, actual: 91 },
      { name: 'Week 2', plan: 95, actual: 96 },
      { name: 'Week 3', plan: 96, actual: 94 },
      { name: 'Week 4', plan: 97, actual: 98 },
    ],
    nabl: [
      { name: 'Week 1', plan: 25, actual: 20 },
      { name: 'Week 2', plan: 28, actual: 26 },
      { name: 'Week 3', plan: 30, actual: 28 },
      { name: 'Week 4', plan: 32, actual: 35 },
    ],
    lab: [
      { name: 'Week 1', plan: 100, actual: 85 },
      { name: 'Week 2', plan: 110, actual: 105 },
      { name: 'Week 3', plan: 105, actual: 98 },
      { name: 'Week 4', plan: 120, actual: 115 },
    ],
    availability: [
      { name: 'Week 1', occupied: 120, available: 48 },
      { name: 'Week 2', occupied: 130, available: 38 },
      { name: 'Week 3', occupied: 115, available: 53 },
      { name: 'Week 4', occupied: 140, available: 28 },
    ],
    utilization: [
      { name: 'Week 1', allocated: 168, runtime: 145 },
      { name: 'Week 2', allocated: 168, runtime: 158 },
      { name: 'Week 3', allocated: 168, runtime: 150 },
      { name: 'Week 4', allocated: 168, runtime: 162 },
    ],
  },
  'April': {
    performance: [
      { name: 'Week 1', plan: 450, actual: 430 },
      { name: 'Week 2', plan: 480, actual: 490 },
      { name: 'Week 3', plan: 510, actual: 500 },
      { name: 'Week 4', plan: 540, actual: 560 },
    ],
    reliability: [
      { name: 'Week 1', plan: 96, actual: 94 },
      { name: 'Week 2', plan: 97, actual: 98 },
      { name: 'Week 3', plan: 98, actual: 97 },
      { name: 'Week 4', plan: 99, actual: 99.2 },
    ],
    nabl: [
      { name: 'Week 1', plan: 32, actual: 30 },
      { name: 'Week 2', plan: 34, actual: 35 },
      { name: 'Week 3', plan: 36, actual: 34 },
      { name: 'Week 4', plan: 38, actual: 40 },
    ],
    lab: [
      { name: 'Week 1', plan: 110, actual: 95 },
      { name: 'Week 2', plan: 120, actual: 118 },
      { name: 'Week 3', plan: 115, actual: 110 },
      { name: 'Week 4', plan: 130, actual: 125 },
    ],
    availability: [
      { name: 'Week 1', occupied: 125, available: 43 },
      { name: 'Week 2', occupied: 135, available: 33 },
      { name: 'Week 3', occupied: 128, available: 40 },
      { name: 'Week 4', occupied: 145, available: 23 },
    ],
    utilization: [
      { name: 'Week 1', allocated: 168, runtime: 152 },
      { name: 'Week 2', allocated: 168, runtime: 160 },
      { name: 'Week 3', allocated: 168, runtime: 158 },
      { name: 'Week 4', allocated: 168, runtime: 165 },
    ],
  },
  'May': {
    performance: [
      { name: 'Week 1', plan: 550, actual: 530 },
      { name: 'Week 2', plan: 580, actual: 590 },
      { name: 'Week 3', plan: 610, actual: 600 },
      { name: 'Week 4', plan: 640, actual: 670 },
    ],
    reliability: [
      { name: 'Week 1', plan: 98, actual: 97 },
      { name: 'Week 2', plan: 98.5, actual: 99 },
      { name: 'Week 3', plan: 99, actual: 98.8 },
      { name: 'Week 4', plan: 99.5, actual: 99.9 },
    ],
    nabl: [
      { name: 'Week 1', plan: 40, actual: 38 },
      { name: 'Week 2', plan: 42, actual: 45 },
      { name: 'Week 3', plan: 44, actual: 42 },
      { name: 'Week 4', plan: 46, actual: 48 },
    ],
    lab: [
      { name: 'Week 1', plan: 120, actual: 105 },
      { name: 'Week 2', plan: 130, actual: 135 },
      { name: 'Week 3', plan: 125, actual: 120 },
      { name: 'Week 4', plan: 140, actual: 145 },
    ],
    availability: [
      { name: 'Week 1', occupied: 130, available: 38 },
      { name: 'Week 2', occupied: 145, available: 23 },
      { name: 'Week 3', occupied: 132, available: 36 },
      { name: 'Week 4', occupied: 155, available: 13 },
    ],
    utilization: [
      { name: 'Week 1', allocated: 168, runtime: 160 },
      { name: 'Week 2', allocated: 168, runtime: 165 },
      { name: 'Week 3', allocated: 168, runtime: 162 },
      { name: 'Week 4', allocated: 168, runtime: 168 },
    ],
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-slate-900 mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <p className="text-slate-500 text-sm font-medium">
              <span className="text-slate-700">{entry.name}:</span> {entry.value}{entry.unit || ''}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomDropdown = ({ options, selected, onSelect, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[160px]" ref={dropdownRef}>
      <button 
        className="flex items-center w-full bg-white border border-slate-200 p-2.5 px-4 rounded-xl gap-3 transition-all duration-200 hover:border-primary hover:shadow-md text-slate-900 font-semibold text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon size={18} className="text-primary" />
        <span className="flex-1 text-left">{selected}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideDown">
          {options.map((option: string) => (
            <div 
              key={option} 
              className={`p-3 px-4 text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-slate-50 hover:text-primary ${selected === option ? 'bg-primary-light text-primary font-bold' : 'text-slate-500'}`}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white border border-slate-200 rounded-[1.25rem] p-7 shadow-card transition-all duration-400 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-primary">
    <div className="text-lg font-bold mb-8 text-slate-900 flex items-center gap-3">
      <Icon size={22} strokeWidth={2.5} className="text-primary" />
      {title}
    </div>
    <div className="w-full h-[320px]">
      {children}
    </div>
  </div>
);

export default function CeoDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedWeek, setSelectedWeek] = useState('All Weeks');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const months = ['March', 'April', 'May'];
  const weeks = ['All Weeks', 'Week 1', 'Week 2', 'Week 3', 'Week 4'];

  if (!isMounted) return null;

  const currentData = (monthlyData as any)[selectedMonth] || monthlyData['May'];
  
  // Filter data by week if applicable
  const getFilteredData = (dataKey: string) => {
    const data = currentData[dataKey];
    if (selectedWeek === 'All Weeks') return data;
    return data.filter((item: any) => item.name === selectedWeek);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md flex items-center justify-center min-w-[220px] h-24">
            <Image 
              src="/logo.png" 
              alt="Dixon Logo" 
              width={180} 
              height={60} 
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
          <CustomDropdown 
            options={months} 
            selected={selectedMonth} 
            onSelect={setSelectedMonth} 
            icon={Calendar} 
          />
          
          <CustomDropdown 
            options={weeks} 
            selected={selectedWeek} 
            onSelect={setSelectedWeek} 
            icon={Filter} 
          />
        </div>
      </header>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Overall Lab Efficiency", value: "94.2%", change: "+2.5%", color: "blue" },
          { label: "Tests Completed", value: "1,284", change: "+12%", color: "indigo" },
          { label: "Success Rate", value: "98.1%", change: "+0.4%", color: "emerald" },
          { label: "Resource Utilization", value: "87.5%", change: "-1.2%", color: "violet" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.change.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Performance Tests */}
        <DashboardCard title="Performance Tests" icon={Activity}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getFilteredData('performance')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="plan" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Planned" barSize={30} />
              <Bar dataKey="actual" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Actual" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 2. Reliability Tests */}
        <DashboardCard title="Reliability Tests" icon={ShieldCheck}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFilteredData('reliability')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Line type="monotone" dataKey="plan" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Planned (%)" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Actual (%)" />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 3. NABL Progress */}
        <DashboardCard title="NABL Progress" icon={CheckCircle}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getFilteredData('nabl')}>
              <defs>
                <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Area type="monotone" dataKey="plan" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorPlan)" name="Target" />
              <Area type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 4. Lab Performance */}
        <DashboardCard title="Lab Performance" icon={FlaskConical}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getFilteredData('lab')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="plan" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Allocated" barSize={30} />
              <Bar dataKey="actual" fill="#ec4899" radius={[6, 6, 0, 0]} name="Completed" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 5. Platform Availability */}
        <DashboardCard title="Platform Availability" icon={Monitor}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getFilteredData('availability')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="occupied" stackId="a" fill="#3b82f6" name="Occupied Time" barSize={40} radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" stackId="a" fill="#cbd5e1" name="Available Time" barSize={40} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* 6. Machine Utilization */}
        <DashboardCard title="Machine Utilization" icon={Clock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getFilteredData('utilization')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="allocated" fill="#cbd5e1" name="Allocated Time" barSize={30} radius={[4, 4, 0, 0]} />
              <Bar dataKey="runtime" fill="#6366f1" name="Actual Runtime" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>
    </div>
  );
}
