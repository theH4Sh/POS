import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, DollarSign, AlertCircle, Package, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);
  const [period, setPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });

  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const params = period === "custom-year" ? { period: "custom-year", year: selectedYear } : period;
        const dashboardData = await window.api.getDashboardStats(params);
        setStats(dashboardData.stats);
        setTopProducts(dashboardData.topProducts || []);
        setRecentOrders(dashboardData.recentOrders || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [period, selectedYear]);

  const periodLabels = {
    daily: "Today",
    monthly: "This Month",
    yearly: "This Year",
    overall: "Overall",
    "custom-year": `Year ${selectedYear}`,
  };

  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('-4', '-100')}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Period Selector */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-blue-600" />
              Business Analytics
            </h1>
            <p className="text-gray-600 mt-2">Track your pharmacy's performance and profitability</p>
          </div>

          {/* Period Selector - Sexy Modern Design */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-1 backdrop-blur-sm border border-white/50">
            <div className="p-4 space-y-4">
              {/* Quick Period Buttons */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(periodLabels).map(([key, label]) => (
                  key !== "custom-year" && (
                    <button
                      key={key}
                      onClick={() => setPeriod(key)}
                      className={`group relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                        period === key
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white/80 hover:shadow-md"
                      }`}
                    >
                      {period === key && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                      )}
                      <Calendar className={`h-4 w-4 transition-transform ${period === key ? "scale-110" : "group-hover:scale-110"}`} />
                      <span className="relative">{label}</span>
                    </button>
                  )
                ))}
              </div>
              
              {/* Year Selector - Sexy Variant */}
              <div className={`mt-4 p-4 rounded-xl transition-all duration-300 ${
                period === "custom-year"
                  ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-purple-300/50"
                  : "bg-white/40 border border-gray-200/50 hover:bg-white/60"
              }`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setPeriod("custom-year")}
                    className={`relative px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap overflow-hidden group ${
                      period === "custom-year"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                        : "text-gray-700 hover:text-gray-900 bg-white hover:shadow-md hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50"
                    }`}
                  >
                    {period === "custom-year" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    )}
                    <Calendar className={`h-4 w-4 transition-transform ${period === "custom-year" ? "scale-110" : "group-hover:scale-110"}`} />
                    <span className="relative">View Year</span>
                  </button>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-fit">
                    <label className={`text-sm font-semibold transition-colors ${period === "custom-year" ? "text-purple-700" : "text-gray-600"}`}>
                      Year:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="2020"
                        max={new Date().getFullYear()}
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(parseInt(e.target.value) || new Date().getFullYear());
                          setPeriod("custom-year");
                        }}
                        className={`w-32 px-4 py-3 rounded-xl font-bold text-center text-lg transition-all duration-300 focus:outline-none focus:ring-2 ${
                          period === "custom-year"
                            ? "border-2 border-purple-400 bg-white text-purple-700 focus:ring-purple-500/50 shadow-md shadow-purple-200"
                            : "border-2 border-gray-300 bg-white/80 text-gray-700 focus:ring-blue-500/50 hover:border-gray-400 hover:bg-white"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">📅</div>
                    </div>
                  </div>
                  
                  {period === "custom-year" && (
                    <div className="ml-auto text-sm font-bold text-purple-600 px-4 py-2 bg-purple-100/50 rounded-lg whitespace-nowrap">
                      ✨ {selectedYear}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${parseFloat(stats.totalRevenue).toFixed(2)}`}
            subtext="From all sales"
            color="border-green-500"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Cost"
            value={`$${parseFloat(stats.totalCost).toFixed(2)}`}
            subtext="Purchase expenses"
            color="border-orange-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Net Profit"
            value={`$${parseFloat(stats.profit).toFixed(2)}`}
            subtext={stats.profit >= 0 ? "Keep it up! 📈" : "Time to optimize 📉"}
            color={stats.profit >= 0 ? "border-blue-600" : "border-red-500"}
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            subtext="Completed transactions"
            color="border-purple-500"
          />
          <StatCard
            icon={Package}
            label="Products"
            value={stats.totalProducts}
            subtext="In inventory"
            color="border-cyan-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Low Stock"
            value={stats.lowStockCount}
            subtext="Need restocking"
            color="border-yellow-500"
          />
        </div>

        {/* Detailed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Top Selling Products
            </h2>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.orders} orders sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${parseFloat(product.revenue).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No sales data yet</p>
              )}
            </div>
          </div>

          {/* Profit Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Financial Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Revenue</span>
                <span className="text-lg font-bold text-green-600">+${parseFloat(stats.totalRevenue).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-gray-700 font-medium">Purchase Cost</span>
                <span className="text-lg font-bold text-orange-600">-${parseFloat(stats.totalCost).toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${stats.profit >= 0 ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'}`}>
                <span className="text-gray-900 font-bold">Net Profit</span>
                <span className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.profit >= 0 ? '+' : ''} ${parseFloat(stats.profit).toFixed(2)}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Profit Margin:{" "}
                  <span className="font-bold text-gray-900">
                    {stats.totalRevenue > 0 ? ((stats.profit / stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Recent Orders ({periodLabels[period]})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-700">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">{order.itemCount} items</td>
                      <td className="px-4 py-3 font-bold text-green-600">${parseFloat(order.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                      No orders yet for {periodLabels[period].toLowerCase()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
