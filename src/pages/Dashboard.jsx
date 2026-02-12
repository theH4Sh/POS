
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, DollarSign, AlertCircle, Package, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const periodLabels = {
  daily: "Today",
  monthly: "This Month",
  yearly: "This Year",
  overall: "Overall",
};

const StatCard = ({ icon: IconComponent, label, value, subtext, color, trend }) => (
  <div className={`relative overflow-hidden bg-white rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-7 group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1`}>
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 bg-current ${color.replace('border-', 'text-')}`} />

    <div className="flex items-start justify-between relative z-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`p-2.5 rounded-xl ${color.replace('border-', 'bg-').replace('-500', '-50').replace('-600', '-50')} ${color.replace('border-', 'text-')}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{label}</p>
        </div>

        <div>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${trend.positive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
            <p className="text-[11px] font-bold text-gray-400">{subtext}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Decorative sparkline-like SVG */}
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-50">
      <div className={`h-full transition-all duration-1000 ease-out ${color.replace('border-', 'bg-')}`} style={{ width: '65%' }} />
    </div>
  </div>
);

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const [period, setPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
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
        let params = period;
        if (period === "custom-year") {
          params = { period: "custom-year", year: selectedYear };
        } else if (period === "custom-month") {
          params = { period: "custom-month", year: selectedYear, month: selectedMonth };
        }

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
  }, [period, selectedYear, selectedMonth]);

  const getPeriodLabel = () => {
    if (period === "custom-year") return `Year ${selectedYear}`;
    if (period === "custom-month") return `${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    return periodLabels[period];
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/30 to-indigo-100/50 p-8">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-white max-w-sm w-full mx-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tight">Synchronizing Data</p>
            <p className="mt-2 text-gray-500 font-bold text-sm tracking-wide uppercase">Crunching analytics...</p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-50">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  Business <span className="text-blue-600">Analytics</span>
                </h1>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">Command Center Overview</p>
              </div>
            </div>
          </div>

          {/* New Integrated Period Selector */}
          <div className="bg-white/70 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl border border-white flex flex-col md:flex-row gap-2">
            <div className="flex p-1 bg-gray-100/80 rounded-3xl">
              {Object.entries(periodLabels).map(([key, label]) => (
                !key.startsWith("custom") && (
                  <button
                    key={key}
                    onClick={() => setPeriod(key)}
                    className={`px-6 py-2.5 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${period === key
                      ? "bg-white text-blue-700 shadow-md translate-y-[-1px]"
                      : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {label}
                  </button>
                )
              ))}
            </div>

            <div className="flex gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-3xl transition-all duration-300 border-2 ${period === "custom-year" ? "bg-purple-50 border-purple-200" : "bg-gray-50/50 border-transparent"}`}>
                <Calendar className={`h-4 w-4 ${period === "custom-year" ? "text-purple-600" : "text-gray-400"}`} />
                <input
                  type="number"
                  min="2020"
                  max={new Date().getFullYear()}
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(parseInt(e.target.value) || new Date().getFullYear());
                    setPeriod("custom-year");
                  }}
                  className="bg-transparent text-sm font-black text-gray-700 w-16 outline-none text-center"
                />
                <button onClick={() => setPeriod("custom-year")} className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${period === "custom-year" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-gray-600"}`}>Year</button>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-3xl transition-all duration-300 border-2 ${period === "custom-month" ? "bg-rose-50 border-rose-200" : "bg-gray-50/50 border-transparent"}`}>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(parseInt(e.target.value));
                    setPeriod("custom-month");
                  }}
                  className="bg-transparent text-sm font-black text-gray-700 outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString('default', { month: 'short' })}
                    </option>
                  ))}
                </select>
                <button onClick={() => setPeriod("custom-month")} className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${period === "custom-month" ? "bg-rose-600 text-white" : "text-gray-400 hover:text-gray-600"}`}>Month</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`Rs ${Number(stats.totalRevenue)}`}
            subtext="Gross income from sales"
            color="border-green-500"
            trend={{ positive: true, value: 12.5 }}
          />
          <StatCard
            icon={ShoppingCart}
            label="Cost of Goods"
            value={`Rs ${Number(stats.totalCost)}`}
            subtext="Inventory purchase expenses"
            color="border-amber-500"
            trend={{ positive: false, value: 4.2 }}
          />
          <StatCard
            icon={TrendingUp}
            label="Net Profit"
            value={`Rs ${Number(stats.profit)}`}
            subtext={stats.profit >= 0 ? "Profitable Period" : "Below Baseline"}
            color={stats.profit >= 0 ? "border-blue-600" : "border-red-500"}
            trend={{ positive: stats.profit >= 0, value: 8.1 }}
          />
          <StatCard
            icon={ShoppingCart}
            label="Transactions"
            value={stats.totalOrders}
            subtext="Completed checkouts"
            color="border-indigo-500"
          />
          <StatCard
            icon={Package}
            label="Inventory Items"
            value={stats.totalProducts}
            subtext="Unique SKU count"
            color="border-cyan-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Restock Alerts"
            value={stats.lowStockCount}
            subtext="Items below threshold"
            color="border-red-500"
          />
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Top Products Card */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Top Performers
                </h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Best selling products</p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">Live Ranking</span>
            </div>

            <div className="p-4 flex-1">
              <div className="space-y-3">
                {topProducts.length > 0 ? (
                  topProducts.map((product, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 border border-transparent hover:border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center font-black text-gray-400 group-hover:text-blue-600 group-hover:border-blue-200">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-blue-700 transition-colors">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="text-[10px] font-black text-blue-500 uppercase">{product.orders} Orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-green-600">Rs {Number(product.revenue)}</p>
                        <div className="w-20 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (product.revenue / stats.totalRevenue) * 500)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                    <Package className="h-16 w-16 mb-4 stroke-[1]" />
                    <p className="text-lg font-black text-gray-400">No performance data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col text-white">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  Financial Summary
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Net profitability audit</p>
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Inflow</p>
                  <p className="text-2xl font-black text-green-400 tracking-tight">Rs {Number(stats.totalRevenue)}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Outflow</p>
                  <p className="text-2xl font-black text-amber-400 tracking-tight">- Rs {Number(stats.totalCost)}</p>
                </div>
              </div>

              <div className={`p-8 rounded-[2rem] border-2 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden ${stats.profit >= 0 ? 'bg-blue-600/10 border-blue-500/50' : 'bg-red-600/10 border-red-500/50'}`}>
                {/* Decorative background pulse */}
                <div className={`absolute inset-0 opacity-20 animate-pulse ${stats.profit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>

                <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 relative z-10">Net Performance Profit</p>
                <p className={`text-6xl font-black tracking-tighter relative z-10 ${stats.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {stats.profit >= 0 ? '+' : ''}Rs {Math.abs(Number(stats.profit)).toLocaleString()}
                </p>
                <div className="mt-6 flex items-center gap-3 relative z-10">
                  <div className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase border ${stats.profit >= 0 ? 'bg-blue-500/20 border-blue-400 text-blue-300' : 'bg-red-500/20 border-red-400 text-red-300'}`}>
                    {stats.totalRevenue > 0 ? ((stats.profit / stats.totalRevenue) * 100).toFixed(1) : 0}% Margin
                  </div>
                </div>
              </div>

              <div className="p-6 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm font-bold text-indigo-100">Performance Status</span>
                </div>
                <span className="text-sm font-black uppercase tracking-tighter">
                  {stats.profit > 0 ? 'Optimized Operation' : stats.profit === 0 ? 'Breaking Even' : 'Strategic Adjustment Required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                Audit Logs: Recent Transactions
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Activity for {getPeriodLabel()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{recentOrders.length} records retrieved</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Audit ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Itemized Manifest</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className="group hover:bg-blue-50/30 transition-all duration-200">
                      <td className="px-8 py-5">
                        <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-gray-900 flex items-center gap-2">
                            {order.itemCount} Units
                            {order.itemCount > 5 && <span className="bg-indigo-50 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-indigo-100 shadow-sm">BULK ORDER</span>}
                          </span>
                          <span className="text-[11px] font-medium text-gray-500 line-clamp-1 italic">
                            {order.items && order.items.map(i => `${i.name}`).join(" • ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-base font-black ${order.total > 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(order.total)} PKR </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-900 leading-none">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <ShoppingCart className="h-16 w-16 mb-4 stroke-[1]" />
                        <p className="text-lg font-black text-gray-400 italic">No activity logs found for this cycle</p>
                      </div>
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
