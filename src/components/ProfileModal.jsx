import { useState } from "react";
import { User, Lock, X, Check, Eye, EyeOff } from "lucide-react";

export default function ProfileModal({ isOpen, onClose, user, onUpdateSuccess }) {
    if (!isOpen) return null;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

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
                newUsername: newUsername !== user.username ? newUsername : undefined,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Username"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100 my-4" />

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            New Password <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Leave blank to keep current"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    {newPassword && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    )}

                    <hr className="border-gray-100 my-4" />

                    {/* Current Password (Confirmation) */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-semibold text-blue-900 mb-1">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-blue-600 mb-2">Required to save changes</p>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                            >
                                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message.type === "success" && <Check className="h-4 w-4" />}
                            {message.text}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    );
}
