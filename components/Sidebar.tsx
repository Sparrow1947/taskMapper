
import React from 'react';
import { LayoutDashboard, Users, UserPlus, Github, ShieldCheck } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'members', label: 'Directory', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            TM
          </div>
          <div>
            <h2 className="text-white font-bold leading-tight">TaskMapper</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Internal Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Github className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Auto-Sync Active</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            All changes are automatically persisted to the master GitHub repository.
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
            SYS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Internal System</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Read/Write Ready</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
