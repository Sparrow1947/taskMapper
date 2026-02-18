
import React from 'react';
import { MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
import { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const MemberList: React.FC<MemberListProps> = ({ members, onSelect, onDelete, isAdmin }) => {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <MoreHorizontal className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Records Found</h3>
        <p className="text-slate-500 max-w-sm">
          No resources are currently registered in the database.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {members.map((member) => {
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const topSkills = member.skills.slice(0, 3);
        
        return (
          <div 
            key={member.id}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                  {initials}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                <p className="text-sm font-medium text-slate-500">{member.designation}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter">
                    ID: {member.empId}
                  </span>
                  <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-tighter">
                    {member.department}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topSkills.length > 0 ? (
                      topSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] rounded-md font-medium">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                    )}
                    {member.skills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[11px] rounded-md font-medium">
                        +{member.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Projects</p>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-slate-700">{member.tasks.length}</span>
                     <span className="text-xs text-slate-500">Assignment(s) logged</span>
                   </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onSelect(member.id)}
              className="w-full py-4 mt-auto border-t border-slate-50 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
            >
              Full Profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MemberList;
