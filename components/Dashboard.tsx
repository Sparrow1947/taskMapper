
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Briefcase, Award, TrendingUp, Download } from 'lucide-react';
import { Member } from '../types';

interface DashboardProps {
  members: Member[];
  onExport: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ members, onExport }) => {
  const skillFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      m.skills.forEach(s => {
        const name = s.name.toUpperCase().trim();
        counts[name] = (counts[name] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [members]);

  const stats = [
    { label: 'Headcount', value: members.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Projects', value: members.reduce((acc, m) => acc + m.tasks.length, 0), icon: Briefcase, color: 'bg-indigo-500' },
    { label: 'Core Skills', value: new Set(members.flatMap(m => m.skills.map(s => s.name.toUpperCase().trim()))).size, icon: Award, color: 'bg-emerald-500' },
    { label: 'Skill Density', value: members.length ? (members.reduce((acc, m) => acc + m.skills.length, 0) / members.length).toFixed(1) : 0, icon: TrendingUp, color: 'bg-amber-500' },
  ];

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Repository Empty</h2>
        <p className="text-slate-500 max-w-md">
          Synchronize with GitHub or add new resources to view team analytics.
        </p>
      </div>
    );
  }

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`${stat.color} p-4 rounded-xl text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Primary Skill Distribution</h3>
              <p className="text-sm text-slate-500">Dominant technical competencies across departments</p>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillFrequency} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {skillFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Department Matrix</h3>
          <div className="space-y-6 flex-1">
            {['IT', 'Audit', 'OPS', 'FRONT OFFICE'].map((dept) => {
              const count = members.filter(m => m.department === dept).length;
              const percentage = members.length ? (count / members.length) * 100 : 0;
              return (
                <div key={dept}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">{dept}</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <button 
              onClick={onExport}
              className="w-full py-3 flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Full Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
