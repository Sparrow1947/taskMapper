
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Briefcase, 
  Award, 
  User, 
  CheckCircle2, 
  Clock, 
  Info,
  Edit3,
  Check,
  ListTodo
} from 'lucide-react';
import { Member, Task, Skill, Proficiency } from '../types';

interface MemberDetailProps {
  member: Member;
  onUpdate: (member: Member) => void;
  onBack: () => void;
  readOnly: boolean;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ member, onUpdate, onBack, readOnly }) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [tempSummary, setTempSummary] = useState(member.summary || '');

  // Form states
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    name: '', client: '', role: '', from: '', to: '', isOngoing: false, description: '', dayToDay: ''
  });
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id'>>({
    name: '', proficiency: Proficiency.BEGINNER, certifications: ''
  });

  const handleAddTask = () => {
    if (!newTask.name || !newTask.client) return;
    const task: Task = { ...newTask, id: crypto.randomUUID() };
    onUpdate({ ...member, tasks: [task, ...member.tasks] });
    setShowTaskForm(false);
    setNewTask({ name: '', client: '', role: '', from: '', to: '', isOngoing: false, description: '', dayToDay: '' });
  };

  const handleAddSkill = () => {
    if (!newSkill.name) return;
    const skill: Skill = { ...newSkill, id: crypto.randomUUID() };
    onUpdate({ ...member, skills: [skill, ...member.skills] });
    setShowSkillForm(false);
    setNewSkill({ name: '', proficiency: Proficiency.BEGINNER, certifications: '' });
  };

  const deleteTask = (id: string) => {
    onUpdate({ ...member, tasks: member.tasks.filter(t => t.id !== id) });
  };

  const deleteSkill = (id: string) => {
    onUpdate({ ...member, skills: member.skills.filter(s => s.id !== id) });
  };

  const saveSummary = () => {
    onUpdate({ ...member, summary: tempSummary });
    setIsEditingSummary(false);
  };

  const getProficiencyStyle = (p: Proficiency) => {
    switch(p) {
      case Proficiency.EXPERT: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case Proficiency.INTERMEDIATE: return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-bold text-3xl shrink-0 shadow-xl shadow-indigo-100">
          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{member.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{member.designation}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="font-bold text-xs uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded text-slate-600">{member.empId}</span>
              </div>
            </div>
            {!readOnly && !isEditingSummary && (
              <button 
                onClick={() => setIsEditingSummary(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all border border-slate-200 hover:border-indigo-100"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Summary
              </button>
            )}
          </div>

          <div className="relative">
            {isEditingSummary ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full p-4 bg-slate-50 border-2 border-indigo-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[100px]"
                  value={tempSummary}
                  onChange={e => setTempSummary(e.target.value)}
                  placeholder="Draft the professional summary..."
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsEditingSummary(false); setTempSummary(member.summary || ''); }} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  <button onClick={saveSummary} className="flex items-center gap-1 px-4 py-2 text-xs bg-indigo-600 text-white font-bold rounded-lg"><Check className="w-3 h-3" /> Save Changes</button>
                </div>
              </div>
            ) : member.summary ? (
              <div className="p-5 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl relative">
                 <p className="text-slate-700 leading-relaxed italic pr-8">"{member.summary}"</p>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-100 border-dashed rounded-2xl flex items-center gap-3 text-slate-400">
                <Info className="w-5 h-5 shrink-0" />
                <p className="text-sm">Profile summary pending updates.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-800">IT Proficiency</h3>
            </div>
            {!readOnly && (
              <button 
                onClick={() => setShowSkillForm(true)}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {showSkillForm && (
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in zoom-in-95 duration-200">
              <h4 className="font-bold text-slate-800 mb-4">Add Competency</h4>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Skill Name"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newSkill.name}
                  onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newSkill.proficiency}
                    onChange={e => setNewSkill({ ...newSkill, proficiency: e.target.value as Proficiency })}
                  >
                    {Object.values(Proficiency).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Certifications"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newSkill.certifications}
                    onChange={e => setNewSkill({ ...newSkill, certifications: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowSkillForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">Cancel</button>
                  <button onClick={handleAddSkill} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-bold">Add Skill</button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {member.skills.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
                No competencies listed.
              </div>
            ) : (
              member.skills.map(skill => (
                <div key={skill.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start hover:border-indigo-100 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800 text-lg">{skill.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getProficiencyStyle(skill.proficiency)}`}>
                        {skill.proficiency}
                      </span>
                    </div>
                    {skill.certifications && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {skill.certifications}
                      </div>
                    )}
                  </div>
                  {!readOnly && (
                    <button 
                      onClick={() => deleteSkill(skill.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-800">Assignments</h3>
            </div>
            {!readOnly && (
              <button 
                onClick={() => setShowTaskForm(true)}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {showTaskForm && (
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
               <h4 className="font-bold text-slate-800">New Entry</h4>
               <div className="grid grid-cols-2 gap-4">
                 <input 
                   placeholder="Project Name"
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={newTask.name}
                   onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                 />
                 <input 
                   placeholder="Client"
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={newTask.client}
                   onChange={e => setNewTask({ ...newTask, client: e.target.value })}
                 />
                 <input 
                   placeholder="Role"
                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={newTask.role}
                   onChange={e => setNewTask({ ...newTask, role: e.target.value })}
                 />
                 <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <label className="text-xs font-bold text-slate-500 cursor-pointer">Ongoing?</label>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      checked={newTask.isOngoing}
                      onChange={e => setNewTask({ ...newTask, isOngoing: e.target.checked })}
                    />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Start</label>
                   <input 
                     placeholder="MM/YY"
                     className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={newTask.from}
                     onChange={e => setNewTask({ ...newTask, from: e.target.value })}
                   />
                 </div>
                 {!newTask.isOngoing && (
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">End</label>
                     <input 
                       placeholder="MM/YY"
                       className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                       value={newTask.to}
                       onChange={e => setNewTask({ ...newTask, to: e.target.value })}
                     />
                   </div>
                 )}
               </div>
               <textarea 
                  placeholder="Granular Day-to-Day Responsibilities"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newTask.dayToDay}
                  onChange={e => setNewTask({ ...newTask, dayToDay: e.target.value })}
               />
               <textarea 
                  placeholder="General Project Description"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
               />
               <div className="flex justify-end gap-2">
                  <button onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                  <button onClick={handleAddTask} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all">Save Project</button>
                </div>
            </div>
          )}

          <div className="space-y-6">
            {member.tasks.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
                No assignments recorded.
              </div>
            ) : (
              member.tasks.map(task => (
                <div key={task.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-indigo-500">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800 leading-none mb-1">{task.name}</h4>
                        <p className="text-sm font-semibold text-indigo-600 mb-2">{task.client}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                           <div className="flex items-center gap-1">
                             <User className="w-3.5 h-3.5" />
                             {task.role}
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock className="w-3.5 h-3.5" />
                             {task.from} — {task.isOngoing ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Ongoing</span> : task.to}
                           </div>
                        </div>
                      </div>
                      {!readOnly && (
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-slate-200 group-hover:text-rose-500 group-hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {task.dayToDay && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ListTodo className="w-4 h-4 text-indigo-500" />
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day-to-Day Details</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 shadow-inner">
                          {task.dayToDay}
                        </p>
                      </div>
                    )}

                    {task.description && (
                      <div className="mt-4">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Background</h5>
                        <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                          {task.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
