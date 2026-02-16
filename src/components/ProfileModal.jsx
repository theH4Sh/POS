import { useState, useEffect } from "react";
import { User, Lock, X, Check, Eye, EyeOff } from "lucide-react";

export default function ProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Sync state with user data when it arrives or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setNewUsername(user.username || "");
            // Reset other fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage(null);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Basic validation
        if (!currentPassword) {
            setMessage({ type: "error", text: "Current password is required" });
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (!newUsername.trim()) {
            setMessage({ type: "error", text: "Username cannot be empty" });
            return;
        }

        setLoading(true);

        try {
            const result = await window.api.updateProfile({
                currentPassword,
                newUsername: (newUsername && newUsername !== user?.username) ? newUsername : undefined,
                newPassword: newPassword || undefined,
            });

            if (result.success) {
                setMessage({ type: "success", text: "Profile updated successfully" });
                setTimeout(() => {
                    onUpdateSuccess();
                    onClose();
                }, 1500);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex min-h-full items-center justify-center p-4 md:p-8">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-400 border border-white my-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Edit Profile</h2>
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-0.5">Update account details</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-white/20 rounded-xl transition-all relative z-10 group"
                        >
                            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-2"></div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                New Password <span className="text-gray-300 font-bold">(Optional)</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-14 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                    placeholder="Leave blank to maintain"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        {newPassword && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Current Password (Gatekeeper) */}
                        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border-2 border-indigo-100 shadow-inner group">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                                Current Password
                                <span className="text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full">Required</span>
                            </label>
                            <p className="text-[11px] font-bold text-indigo-900/40 mb-3 mt-1 uppercase tracking-tight">Required to save changes</p>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-transparent rounded-xl focus:border-blue-500/50 outline-none transition-all font-bold text-gray-700 shadow-sm"
                                    placeholder="Enter current password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-blue-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        {message && (
                            <div
                                className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in fade-in duration-300 border-2 ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border-green-100"
                                    : "bg-red-50 text-red-700 border-red-100"
                                    }`}
                            >
                                {message.type === "success" ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-all border border-transparent hover:border-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
