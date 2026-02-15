
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, DollarSign, AlertCircle, Package, Calendar, X, Receipt, Search, Filter, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

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
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProcessor, setFilterProcessor] = useState('all');

  // Derived State: Unique Processors
  const uniqueProcessors = [...new Set(recentOrders.map(o => o.processedBy))];

  // Derived State: Filtered Orders
  const filteredOrders = recentOrders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchQuery) ||
      order.total.toString().includes(searchQuery);
    const matchesProcessor = filterProcessor === 'all' || order.processedBy === filterProcessor;
    return matchesSearch && matchesProcessor;
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (filteredOrders.length === 0) {
      toast.error("No data to export!");
      return;
    }

    setExporting(true);
    try {
      const result = await window.api.exportOrders({ orders: filteredOrders });
      if (result.success) {
        toast.success("Excel file saved successfully!");
      } else if (result.message !== "Export cancelled") {
        toast.error(result.message || "Export failed");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("An error occurred during export");
    } finally {
      setExporting(false);
    }
  };



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
            <p className="text-xl font-black text-gray-900 tracking-tight">Loading Dashboard</p>
            <p className="mt-2 text-gray-500 font-bold text-sm tracking-wide uppercase">Please wait...</p>
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
                  Store <span className="text-blue-600">Overview</span>
                </h1>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">Summary</p>
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
            label="Total Sales"
            value={`Rs ${Number(stats.totalRevenue)}`}
            subtext="Gross Income"
            color="border-green-500"
            trend={{ positive: true, value: 12.5 }}
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Expenses"
            value={`Rs ${Number(stats.totalCost)}`}
            subtext="Cost of Goods"
            color="border-amber-500"
            trend={{ positive: false, value: 4.2 }}
          />
          <StatCard
            icon={TrendingUp}
            label="Profit"
            value={`Rs ${Number(stats.profit)}`}
            subtext={stats.profit >= 0 ? "Profitable" : "Loss"}
            color={stats.profit >= 0 ? "border-blue-600" : "border-red-500"}
            trend={{ positive: stats.profit >= 0, value: 8.1 }}
          />
          <StatCard
            icon={ShoppingCart}
            label="Orders"
            value={stats.totalOrders}
            subtext="Completed"
            color="border-indigo-500"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            subtext="In Inventory"
            color="border-cyan-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Low Stock"
            value={stats.lowStockCount}
            subtext="Items to Restock"
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
                  Top Products
                </h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Best Sellers</p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">Live</span>
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
                  Money In/Out
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Profitability Check</p>
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

                <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 relative z-10">Net Profit</p>
                <p className={`text-6xl font-black tracking-tighter relative z-10 ${stats.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {stats.profit >= 0 ? '+' : ''}Rs {Math.abs(Number(stats.profit)).toLocaleString()}
                </p>
                <div className="mt-6 flex items-center gap-3 relative z-10">
                  <div className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase border ${stats.profit >= 0 ? 'bg-blue-50/20 border-blue-400 text-blue-300' : 'bg-red-500/20 border-red-400 text-red-300'}`}>
                    {stats.totalRevenue > 0 ? Math.round((stats.profit / stats.totalRevenue) * 100) : 0}% Margin
                  </div>
                </div>
              </div>

              <div className="p-6 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm font-bold text-indigo-100">Performance Status</span>
                </div>
                <span className="text-sm font-black uppercase tracking-tighter">
                  {stats.profit > 0 ? 'Good' : stats.profit === 0 ? 'Break Even' : 'Loss'}
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
                Sales History
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Activity for {getPeriodLabel()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exporting || recentOrders.length === 0}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 group"
              >
                {exporting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileSpreadsheet className="h-4 w-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{exporting ? 'Exporting...' : 'Export to Excel'}</span>
              </button>
              <span className="text-xs font-bold text-gray-500">{filteredOrders.length} of {recentOrders.length} records</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by Order ID or Amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Processor Filter */}
            <div className="relative group min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <select
                value={filterProcessor}
                onChange={(e) => setFilterProcessor(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="all">All Cashiers</option>
                {uniqueProcessors.map(processor => (
                  <option key={processor} value={processor}>{processor}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="h-0 w-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-400"></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Order ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Cashier</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Items</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedOrder(order)}
                      className="group hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs ${order.processorRole === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {order.processedBy[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 leading-none">{order.processedBy}</p>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${order.processorRole === 'admin' ? 'text-blue-500' : 'text-gray-400'}`}>
                              {order.processorRole || 'System'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-900 flex items-center gap-2">
                          {order.itemCount} {order.itemCount === 1 ? 'Item' : 'Items'}
                          {order.itemCount > 5 && <span className="bg-indigo-50 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-indigo-100 shadow-sm">BULK</span>}
                        </span>
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
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <ShoppingCart className="h-16 w-16 mb-4 stroke-[1]" />
                        <p className="text-lg font-black text-gray-400 italic">No matching records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 flex items-center justify-between z-10 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Order Details</h2>
                  <p className="text-blue-100 text-sm font-bold mt-0.5">Audit ID: #{selectedOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Processed By</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedOrder.processorRole === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedOrder.processedBy[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 leading-none">{selectedOrder.processedBy}</p>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedOrder.processorRole === 'admin' ? 'text-blue-500' : 'text-gray-400'}`}>
                        {selectedOrder.processorRole || 'System'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                  <p className="text-sm font-black text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-xs font-bold text-gray-500">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Itemized Breakdown
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:border-blue-100 transition-all">
                      <div className="flex-1">
                        <p className="font-black text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-500">{item.category}</span>
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                          <span className="text-xs font-black text-blue-600">Qty: {item.quantity}</span>
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                          <span className="text-xs font-bold text-gray-500">@ Rs {item.salePrice} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-gray-900">Rs {Math.round(item.salePrice * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                  <div className="space-y-4">
                    {/* Subtotal before discount */}
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                      <span className="font-black">Rs {selectedOrder.items?.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0).toLocaleString()}</span>
                    </div>

                    {/* Discount line (only if exists) */}
                    {(selectedOrder.discount > 0) && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          Discount Applied
                          <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">-{Math.round((selectedOrder.discount / (selectedOrder.items?.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0) || 1)) * 100)}%</span>
                        </span>
                        <span className="font-black">- Rs {selectedOrder.discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="h-px bg-blue-200/50"></div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className={`text-3xl font-black tracking-tight ${selectedOrder.total > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Rs {Math.abs(Number(selectedOrder.total)).toLocaleString()}
                        </p>
                      </div>
                      {selectedOrder.total < 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-200 uppercase">Refund</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
