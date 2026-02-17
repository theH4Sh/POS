import { useState, useEffect } from "react";
import { UserPlus, ShieldCheck, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Setup() {
    const { completeSetup } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            // Simulate a small delay for the "premium feel" animation
            await new Promise(r => setTimeout(r, 800));

            const result = await window.api.registerAdmin({
                username: formData.username,
                password: formData.password
            });

            if (result.success) {
                toast.success("System initialized successfully!");
                completeSetup(result.user);
            } else {
                toast.error(result.message || "Setup failed");
            }
        } catch (error) {
            console.error("Setup error:", error);
            toast.error("An error occurred during setup");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-80" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className={`relative z-10 w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Left Panel: Visuals */}
                <div className="bg-slate-800/50 backdrop-blur-xl p-12 flex flex-col justify-between relative border-r border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-wide">Shah G Medical Store</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Initialize your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Workspace
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Set up your secure administrator account to begin managing your medical store inventory and sales with precision.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center`}>
                                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-400' : 'bg-slate-500'}`} />
                                </div>
                            ))}
                        </div>
                        <span>Secure Environment Ready</span>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Admin Account</h2>
                        <p className="text-slate-500">Enter your details to configure the system.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Username</label>
                            <div className="relative">
                                <UserPlus className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="e.g. administrator"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-600 transition-colors">Confirm Password</label>
                            <div className="relative">
                                <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="animate-pulse">Initializing System...</span>
                                </>
                            ) : (
                                <>
                                    Complete Setup
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-6 text-slate-500 text-sm font-medium opacity-60">
                System v0.0.0 • Secure Local Database
            </div>
        </div>
    );
}
