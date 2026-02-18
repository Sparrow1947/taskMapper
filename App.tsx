
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  UserPlus, 
  Download, 
  Search,
  Cloud,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Member, View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import MemberDetail from './components/MemberDetail';

// ==========================================================
// CONFIGURATION - provide a GitHub PAT via Vite env var
// WARNING: embedding secrets in client bundles is unsafe for production.
// Prefer a server-side proxy for GitHub operations.
// ==========================================================
const GITHUB_TOKEN = "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";
const REPO_OWNER = "Sparrow1947";
const REPO_NAME = "em6userdetail";
const FILE_PATH = "data/employees.json";
const BRANCH = "main";
// ==========================================================

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Track if initial load happened to prevent auto-save on first mount
  const isInitialLoad = useRef(true);

  const fetchFromGithub = useCallback(async () => {
    if (!GITHUB_TOKEN) {
      console.warn("GitHub Token is not configured. Falling back to local mode.");
      setSyncStatus('idle');
      isInitialLoad.current = false;
      return;
    }

    setSyncStatus('syncing');
    setErrorMessage(null);

    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`
      };

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        // GitHub encodes content in base64. We decode it to a UTF-8 string.
        const content = decodeURIComponent(escape(atob(data.content)));
        const remoteMembers = JSON.parse(content);
        setMembers(remoteMembers);
        setSyncStatus('success');
        setLastSynced(new Date().toLocaleTimeString());
      } else if (response.status === 404) {
        // File doesn't exist yet, which is fine for a fresh setup.
        console.log("Database file not found on GitHub. Initializing empty collection.");
        setMembers([]);
        setSyncStatus('idle');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`GitHub API Error (${response.status}): ${errorData.message}`);
      }
    } catch (error) {
      console.error("GitHub Fetch Error:", error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Fetch failed');
    } finally {
      isInitialLoad.current = false;
    }
  }, []);

  const saveToGithub = useCallback(async (currentMembers: Member[]) => {
    if (isInitialLoad.current) return;

    setSyncStatus('syncing');
    setErrorMessage(null);

    // If no GitHub token configured, fall back to a local server that writes
    // employees.json and commits to the local git repository.
    if (!GITHUB_TOKEN) {
      try {
        const resp = await fetch('http://localhost:4000/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentMembers)
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Local save failed' }));
          throw new Error(err.error || 'Local save failed');
        }
        setSyncStatus('success');
        setLastSynced(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Local Save Error:', error);
        setSyncStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Save failed');
      }
      return;
    }

    try {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
      const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      };
      
      const getResponse = await fetch(url, { headers });

      let sha: string | undefined;
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }

      const content = btoa(unescape(encodeURIComponent(JSON.stringify(currentMembers, null, 2))));
      
      const maxAttempts = 3;
      let attempt = 0;
      let success = false;
      let lastError: any = null;

      while (attempt < maxAttempts && !success) {
        try {
          // fetch latest sha each attempt
          const latestResp = await fetch(url, { headers });
          let currentSha: string | undefined = undefined;
          if (latestResp.ok) {
            const latestData = await latestResp.json();
            currentSha = latestData.sha;
          }

          const body = {
            message: `Internal Update - ${new Date().toISOString()}`,
            content: content,
            sha: currentSha,
            branch: BRANCH
          };

          const putResp = await fetch(url, {
            method: 'PUT',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
          });

          if (putResp.ok) {
            success = true;
            break;
          }

          // If sha mismatch, retry after a short backoff
          if (putResp.status === 409) {
            attempt++;
            await new Promise(res => setTimeout(res, 300 * attempt));
            continue;
          }

          const errData = await putResp.json().catch(() => ({ message: 'Save failed' }));
          throw new Error(`Update Error (${putResp.status}): ${errData.message}`);
        } catch (err) {
          lastError = err;
          attempt++;
          if (attempt < maxAttempts) {
            await new Promise(res => setTimeout(res, 300 * attempt));
          }
        }
      }

      if (!success) {
        throw lastError || new Error('Failed to save after retries');
      }

      setSyncStatus('success');
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("GitHub Save Error:", error);
      setSyncStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Save failed');
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    fetchFromGithub();
  }, [fetchFromGithub]);

  const addMember = (member: Omit<Member, 'id' | 'tasks' | 'skills'>) => {
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      tasks: [],
      skills: []
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveToGithub(updatedMembers);
    setActiveView('members');
  };

  const updateMember = (updatedMember: Member) => {
    const updatedMembers = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setMembers(updatedMembers);
    saveToGithub(updatedMembers);
  };

  const deleteMember = (id: string) => {
    if (window.confirm("Confirm deletion of this resource? Changes will sync immediately.")) {
      const updatedMembers = members.filter(m => m.id !== id);
      setMembers(updatedMembers);
      saveToGithub(updatedMembers);
      if (selectedMemberId === id) setSelectedMemberId(null);
    }
  };

  const exportToCSV = () => {
    if (members.length === 0) {
      alert("No data available to export");
      return;
    }
    const headers = ["Name", "Employee ID", "Designation", "Department", "Task", "Client", "Role", "Duration", "Skills", "Certifications", "Day-to-Day Details"];
    const rows: string[][] = [];
    members.forEach(m => {
      const baseInfo = [m.name, m.empId, m.designation, m.department];
      const skillString = m.skills.map(s => `${s.name} (${s.proficiency})`).join('; ');
      const certString = m.skills.map(s => s.certifications).filter(c => c).join('; ');
      
      if (m.tasks.length === 0) {
        rows.push([...baseInfo, "N/A", "N/A", "N/A", "N/A", skillString, certString, "N/A"]);
      } else {
        m.tasks.forEach(t => {
          const duration = `${t.from} to ${t.isOngoing ? 'Ongoing' : t.to}`;
          rows.push([...baseInfo, t.name, t.client, t.role, duration, skillString, certString, t.dayToDay || ""]);
        });
      }
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Internal_Team_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filteredMembers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(lowerSearch) ||
      m.empId.toLowerCase().includes(lowerSearch) ||
      m.skills.some(s => s.name.toLowerCase().includes(lowerSearch)) ||
      m.tasks.some(t => t.client.toLowerCase().includes(lowerSearch))
    );
  }, [members, searchTerm]);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 bg-white">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(v) => { setActiveView(v); setSelectedMemberId(null); }} 
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">
              {activeView === 'dashboard' && 'Team Analytics'}
              {activeView === 'members' && (selectedMemberId ? 'Resource Profile' : 'Resource Directory')}
              {activeView === 'add-member' && 'Add Resource'}
            </h1>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 relative group">
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              ) : (
                <Cloud className="w-3 h-3 text-indigo-600" />
              )}
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : `Synced: ${lastSynced || 'Local Mode'}`}
              </span>
              
              {errorMessage && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search repository..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {selectedMemberId && selectedMember ? (
            <MemberDetail 
              member={selectedMember} 
              onUpdate={updateMember} 
              onBack={() => setSelectedMemberId(null)} 
              readOnly={false}
            />
          ) : (
            <>
              {activeView === 'dashboard' && <Dashboard members={members} onExport={exportToCSV} />}
              {activeView === 'members' && (
                <MemberList 
                  members={filteredMembers} 
                  onSelect={setSelectedMemberId} 
                  onDelete={deleteMember}
                  isAdmin={true}
                />
              )}
              {activeView === 'add-member' && <MemberForm onSubmit={addMember} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
