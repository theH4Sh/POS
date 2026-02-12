import { useState, useEffect } from "react";
import { Users, Plus, LogOut, Trash2, Keyboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AdminPanel({ user, onLogout }) {
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const [cashiers, setCashiers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCashiers();
  }, []);

  const loadCashiers = async () => {
    try {
      const data = await window.api.getCashiers();
      setCashiers(data);
    } catch (err) {
      console.error("Error loading cashiers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCashier = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await window.api.registerCashier(newUsername, newPassword);
      if (result.success) {
        toast.success(result.message);
        setNewUsername("");
        setNewPassword("");
        loadCashiers();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to register cashier");
      console.error(err);
    }
  };

  const handleDeleteCashier = async (cashier) => {
    if (!window.confirm(`Are you sure you want to revoke access for '${cashier.username}'?`)) {
      return;
    }

    try {
      const result = await window.api.deleteCashier(cashier.id);
      if (result.success) {
        toast.success(result.message);
        loadCashiers();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Failed to delete account");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await window.api.logout();
    onLogout();
  };

  const handleBackToApp = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/40 to-indigo-100/40 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-white">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Admin <span className="text-blue-600">Hub</span>
              </h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">System & User Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToApp}
              className="px-6 py-3 bg-white text-gray-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 hover:shadow-md transition-all border border-gray-100"
            >
              System Access
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 border border-red-100"
            >
              <LogOut className="h-4 w-4" />
              Terminate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Register New Cashier */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-50">
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <Plus className="h-6 w-6 text-blue-600" />
                  New Operator
                </h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Register cashier account</p>
              </div>

              <form onSubmit={handleAddCashier} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Identity Name
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. jsmith_cashier"
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Access Credentials
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Grant Access
                </button>
              </form>
            </div>
          </div>

          {/* Cashiers List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Operators</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total registered: {cashiers.length}</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter">System Audit</span>
              </div>

              <div className="p-8 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="h-10 w-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving logs...</p>
                  </div>
                ) : cashiers.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <Users className="h-20 w-20 mb-4 stroke-[1]" />
                    <p className="text-lg font-black text-gray-400 italic">No operators identified</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cashiers.map((cashier) => (
                      <div
                        key={cashier.id}
                        className="group relative flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-gray-50 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center font-black text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all duration-300 border border-gray-200/50 group-hover:border-transparent">
                            {cashier.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 tracking-tight">{cashier.username}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                              Enrolled: {new Date(cashier.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCashier(cashier)}
                          className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100"
                          title="Revoke access"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-50 rounded-2xl border border-violet-100">
                <Keyboard className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Keyboard Shortcuts</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">All shortcuts use Alt + Key</p>
              </div>
            </div>
            <span className="bg-violet-50 text-violet-700 text-[10px] font-black px-3 py-1 rounded-full border border-violet-100 uppercase tracking-tighter">Quick Reference</span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Navigation */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Navigation
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + 1", action: "Go to Checkout" },
                  { keys: "Alt + 2", action: "Go to Inventory" },
                  { keys: "Alt + 3", action: "Go to Analytics" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2.5 py-1 bg-white text-[11px] font-black text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono tracking-tight">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Lookup */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Product Lookup
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + S", action: "Focus Search" },
                  { keys: "Alt + B", action: "Focus Barcode" },
                  { keys: "↑ ↓", action: "Navigate Results" },
                  { keys: "Enter", action: "Select Result" },
                  { keys: "Escape", action: "Clear Results" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2.5 py-1 bg-white text-[11px] font-black text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono tracking-tight">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart & Checkout */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Cart & Checkout
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + N", action: "New Cart" },
                  { keys: "Alt + W", action: "Close Cart" },
                  { keys: "Alt + ← →", action: "Switch Carts" },
                  { keys: "Alt + Enter", action: "Complete Order" },
                  { keys: "Alt + P", action: "Print Receipt" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2.5 py-1 bg-white text-[11px] font-black text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono tracking-tight">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Identity Section */}
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Users className="h-40 w-40" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                <h3 className="text-xl font-black tracking-tight">Active Administrator Identity</h3>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[200px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
                  <p className="text-lg font-black text-white tracking-tight">{user.username}</p>
                </div>
                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Level</p>
                  <p className="text-lg font-black text-blue-400 uppercase tracking-tighter">{user.role}</p>
                </div>
                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Reference</p>
                  <p className="text-lg font-black text-white px-2 bg-slate-800 rounded-lg">#{user.id}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-center">System<br />Health</span>
                <span className="text-xl font-black text-green-400 mt-1">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
