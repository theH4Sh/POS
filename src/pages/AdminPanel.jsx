import { useState, useEffect } from "react";
import { Users, Plus, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [message, setMessage] = useState("");
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
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    try {
      const result = await window.api.registerCashier(newUsername, newPassword);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setNewUsername("");
        setNewPassword("");
        loadCashiers();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to register cashier" });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-600" />
              Admin Panel
            </h1>
            <p className="text-gray-600 mt-2">Manage cashiers and system settings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBackToApp}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Back to App
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Register New Cashier */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Register Cashier
              </h2>

              <form onSubmit={handleAddCashier} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add Cashier
                </button>
              </form>
            </div>
          </div>

          {/* Cashiers List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cashiers ({cashiers.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading cashiers...</p>
                </div>
              ) : cashiers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No cashiers registered yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cashiers.map((cashier) => (
                    <div
                      key={cashier.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{cashier.username}</p>
                        <p className="text-sm text-gray-600">
                          Registered: {new Date(cashier.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete cashier"
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

        {/* Admin Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Current User</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-bold text-gray-900">{user.username}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-bold text-blue-600 uppercase">{user.role}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-bold text-gray-900">#{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
