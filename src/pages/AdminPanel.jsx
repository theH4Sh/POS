import { useState, useEffect } from "react";
import { Users, Plus, LogOut, Trash2, Keyboard, Shield, Activity, User } from "lucide-react";
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
      toast.error("Failed to add cashier");
      console.error(err);
    }
  };

  const handleDeleteCashier = async (cashier) => {
    if (!window.confirm(`Are you sure you want to remove '${cashier.username}'?`)) {
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
      toast.error("Failed to delete cashier");
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
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Admin Panel
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Manage users and settings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToApp}
              className="px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all border border-gray-200"
            >
              Go to POS
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile / Status Section (Moved to top) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Logged in as</p>
                <p className="text-xl font-bold text-gray-900">{user.username}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-xl font-bold text-gray-900 uppercase">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">System Status</p>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Add New Cashier */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <Plus className="h-6 w-6 text-blue-600" />
                  Add Cashier
                </h2>
                <p className="text-sm font-medium text-gray-400 mt-1">Create a new user account</p>
              </div>

              <form onSubmit={handleAddCashier} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-700"
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Add User
                </button>
              </form>
            </div>
          </div>

          {/* Cashiers List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Access List</h2>
                  <p className="text-sm font-medium text-gray-400 mt-1">Total users: {cashiers.length}</p>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="h-10 w-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-400">Loading users...</p>
                  </div>
                ) : cashiers.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                    <Users className="h-20 w-20 mb-4 stroke-[1]" />
                    <p className="text-lg font-bold text-gray-400">No users found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cashiers.map((cashier) => (
                      <div
                        key={cashier.id}
                        className="group relative flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {cashier.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 tracking-tight">{cashier.username}</p>
                            <p className="text-xs font-medium text-gray-400 mt-1">
                              Added: {new Date(cashier.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCashier(cashier)}
                          className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Remove user"
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
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                <Keyboard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shortcuts</h2>
                <p className="text-sm font-medium text-gray-400 mt-1">Quick keyboard controls</p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Navigation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Navigation
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + 1-3", action: "Switch Pages" },
                  { keys: "Alt + ←/→", action: "Switch Cart" },
                  { keys: "Alt + S", action: "Search" },
                  { keys: "Alt + B", action: "Barcode" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2 py-0.5 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono whitespace-nowrap ml-2">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Focus
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + Q", action: "Focus Latest" },
                  { keys: "Alt + D", action: "Cycle Discount (0-10%)" },
                  { keys: "Alt + ↑/↓", action: "Switch Item" },
                  { keys: "↑/↓", action: "Row Nav" },
                  { keys: "Enter", action: "Select Result" },
                ].map((s) => (

                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2 py-0.5 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono whitespace-nowrap ml-2">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Actions
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + Enter", action: "Instant Pay" },
                  { keys: "Alt + P", action: "Print" },
                  { keys: "Alt + N", action: "New Cart" },
                  { keys: "Alt + W", action: "Close Cart" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2 py-0.5 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono whitespace-nowrap ml-2">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Quantity
              </h3>
              <div className="space-y-2">
                {[
                  { keys: "Alt + =", action: "Increase" },
                  { keys: "Alt + -", action: "Decrease" },
                  { keys: "Enter", action: "Finish" },
                  { keys: "Esc", action: "Cancel" },
                ].map((s) => (
                  <div key={s.keys} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{s.action}</span>
                    <kbd className="px-2 py-0.5 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 shadow-sm font-mono whitespace-nowrap ml-2">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
