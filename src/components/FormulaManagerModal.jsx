import { useState, useEffect } from "react";
import { X, FlaskConical, Trash2, AlertTriangle, Search } from "lucide-react";
import { toast } from "react-hot-toast";

export default function FormulaManagerModal({ isOpen, onClose }) {
    const [formulas, setFormulas] = useState([]);
    const [search, setSearch] = useState("");

    const load = async () => {
        const list = await window.api.listFormulas();
        setFormulas(list);
    };

    useEffect(() => {
        if (isOpen) load();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = formulas.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (formula) => {
        const result = await window.api.deleteFormula(formula.id);
        if (result.success) {
            toast.success(`Formula "${formula.name}" deleted`);
            load();
        } else {
            toast.error(result.message || "Failed to delete formula");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-100 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8 max-h-[75vh] flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-6 flex items-center justify-between z-10 border-b border-white/10 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                            <FlaskConical className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                                Manage <span className="opacity-60 font-light italic">Formulas</span>
                            </h2>
                            <p className="text-purple-100/60 text-[10px] font-bold uppercase tracking-widest mt-1.5 ml-0.5">
                                {formulas.length} formula{formulas.length !== 1 ? "s" : ""} total
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white border border-transparent hover:border-white/10"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search formulas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Formula List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                    {filtered.length > 0 ? (
                        filtered.map((f) => (
                            <div
                                key={f.id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-purple-50/50 group transition-all border border-transparent hover:border-purple-100"
                            >
                                <div className="flex items-center gap-3">
                                    <FlaskConical className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                                        {f.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(f)}
                                    className="p-2 rounded-lg bg-transparent text-gray-300 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                                    title="Delete formula"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                            <FlaskConical className="h-12 w-12 mb-3 stroke-[1.5]" />
                            <p className="text-sm font-medium">
                                {search ? "No formulas match your search" : "No formulas created yet"}
                            </p>
                            <p className="text-xs mt-1">
                                {search ? "Try a different search term" : "Create formulas when adding products"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer warning */}
                <div className="p-4 border-t border-gray-100 bg-amber-50/50 rounded-b-3xl">
                    <div className="flex items-start gap-2.5 text-amber-700">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-[11px] leading-relaxed">
                            Formulas linked to products cannot be deleted. Remove the formula from all products first.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
