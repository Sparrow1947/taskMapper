
import React, { useState } from 'react';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Member } from '../types';

interface MemberFormProps {
  onSubmit: (member: Omit<Member, 'id' | 'tasks' | 'skills'>) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    designation: '',
    department: 'IT'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.empId) return;
    onSubmit(formData);
  };

  const departments = [
    'IT',
    'Audit',
    'OPS',
    'FRONT OFFICE'
  ];

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">New Resource Registration</h2>
            <p className="text-indigo-100 opacity-80 text-sm">Fill in the primary identification details for the new team member.</p>
          </div>
          <UserPlus className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-indigo-500/30 -rotate-12" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Employee ID</label>
              <input 
                required
                type="text" 
                placeholder="e.g. EMP-2024-001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.empId}
                onChange={e => setFormData({ ...formData, empId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Designation</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Senior Analyst"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Department</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all appearance-none"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-medium uppercase tracking-tight">Data will be stored locally and synced to GitHub if configured.</span>
            </div>
            <button 
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Initialize Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
