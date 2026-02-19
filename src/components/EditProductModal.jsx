import { useState, useEffect, useRef } from "react";
import { Save, SquarePen, X, Barcode, FlaskConical, Plus, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";

function formFromProduct(product) {
  if (!product) {
    return {
      name: "",
      barcode: "",
      quantity: "",
      purchasePrice: "",
      salePrice: "",
      description: "",
      category: "medicine",
      formulaId: null,
    };
  }
  return {
    name: product.name ?? "",
    barcode: product.barcode ?? "",
    quantity: product.stock ?? product.quantity ?? "",
    purchasePrice: product.purchasePrice ?? "",
    salePrice: product.salePrice ?? "",
    description: product.description ?? "",
    category: product.category ?? "medicine",
    formulaId: product.formulaId ?? null,
  };
}

export default function EditProductModal({ isOpen, product, onClose, onSuccess }) {
  const [form, setForm] = useState(() => formFromProduct(product));
  const [formulas, setFormulas] = useState([]);
  const [formulaSearch, setFormulaSearch] = useState(product?.formulaName ?? "");
  const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Load formulas on mount
  useEffect(() => {
    if (isOpen) {
      window.api.listFormulas().then(setFormulas);
      setFormulaSearch(product?.formulaName ?? "");
    }
  }, [isOpen, product]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFormulaDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard Shortcuts: Ctrl+Enter (Submit), Esc (Close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit({ preventDefault: () => { } });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, form]);

  if (!isOpen) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => onClose();

  const filteredFormulas = formulas.filter((f) =>
    f.name.toLowerCase().includes(formulaSearch.toLowerCase())
  );

  const selectFormula = (formula) => {
    update("formulaId", formula.id);
    setFormulaSearch(formula.name);
    setShowFormulaDropdown(false);
  };

  const handleCreateFormula = async () => {
    if (!formulaSearch.trim()) return;
    try {
      const newFormula = await window.api.addFormula(formulaSearch.trim());
      if (newFormula) {
        setFormulas((prev) => {
          const exists = prev.some((f) => f.id === newFormula.id);
          return exists ? prev : [...prev, newFormula].sort((a, b) => a.name.localeCompare(b.name));
        });
        update("formulaId", newFormula.id);
        setFormulaSearch(newFormula.name);
        setShowFormulaDropdown(false);
      }
    } catch (err) {
      toast.error("Failed to create formula");
    }
  };

  const clearFormula = () => {
    update("formulaId", null);
    setFormulaSearch("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      await window.api.updateMedicine({
        id: product.id,
        name: form.name,
        barcode: form.barcode,
        quantity: parseInt(form.quantity, 10) || 0,
        category: form.category,
        purchasePrice: form.purchasePrice,
        salePrice: form.salePrice,
        description: form.description,
        formulaId: form.formulaId,
      });
      onClose();
      onSuccess?.();
      toast.success("Product updated successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to update product");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-100 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 flex items-center justify-between z-10 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner text-white">
              <SquarePen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                Update <span className="opacity-60 font-light italic">Product</span>
              </h2>
              <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mt-1.5 ml-0.5">Edit Item</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white border border-transparent hover:border-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100"></div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Details</h4>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Product Name <span className="text-rose-500 ml-1">*</span></label>
                <input
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500 h-12 text-base font-medium`}
                  placeholder="Enter full product name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Barcode</label>
                <div className="relative group">
                  <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    className={`${inputClass} pl-11 !bg-white !border-gray-200 focus:!border-blue-500 font-mono h-12`}
                    placeholder="Scan product barcode"
                    value={form.barcode}
                    onChange={(e) => update("barcode", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Category <span className="text-rose-500 ml-1">*</span></label>
                <select
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500 h-12 pr-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat`}
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  required
                >
                  <option value="medicine">Medicine / Healthcare</option>
                  <option value="cosmetics">Cosmetics & Personal Care</option>
                  <option value="supplements">Supplements & Nutrition</option>
                  <option value="medical-devices">Medical Equipment</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Formula / Generic Name Combobox */}
              <div className="md:col-span-2" ref={dropdownRef}>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">
                  Formula / Generic Name
                </label>
                <div className="relative group">
                  <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                  <input
                    className={`${inputClass} pl-11 pr-20 !bg-white !border-gray-200 focus:!border-purple-500 focus:!ring-purple-200 h-12`}
                    placeholder="Type to search or create formula..."
                    value={formulaSearch}
                    onChange={(e) => {
                      setFormulaSearch(e.target.value);
                      setShowFormulaDropdown(true);
                      if (!e.target.value) update("formulaId", null);
                    }}
                    onFocus={() => setShowFormulaDropdown(true)}
                  />
                  {form.formulaId && (
                    <button
                      type="button"
                      onClick={clearFormula}
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${showFormulaDropdown ? 'rotate-180' : ''}`} />

                  {showFormulaDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {filteredFormulas.length > 0 ? (
                        filteredFormulas.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => selectFormula(f)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 ${form.formulaId === f.id ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700'}`}
                          >
                            <FlaskConical className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            {f.name}
                          </button>
                        ))
                      ) : null}

                      {formulaSearch.trim() && !formulas.some((f) => f.name.toLowerCase() === formulaSearch.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={handleCreateFormula}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 text-emerald-700 font-medium border-t border-gray-100"
                        >
                          <Plus className="h-3.5 w-3.5 shrink-0" />
                          Create &quot;{formulaSearch.trim()}&quot;
                        </button>
                      )}

                      {!formulaSearch.trim() && filteredFormulas.length === 0 && (
                        <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                          No formulas yet. Type a name to create one.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {form.formulaId && (
                  <div className="mt-1.5 ml-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                      <FlaskConical className="h-3 w-3" />
                      {formulaSearch}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100"></div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory & Pricing</h4>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Stock Qty <span className="text-rose-500 ml-1">*</span></label>
                <input
                  className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500 text-center font-black h-12 text-lg`}
                  placeholder="0"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Purchase Cost</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs group-focus-within:text-blue-500 transition-colors">PKR</span>
                  <input
                    className={`${inputClass} pl-14 !bg-white !border-gray-200 focus:!border-blue-500 font-mono h-12 text-right pr-4`}
                    placeholder="0"
                    type="number"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => update("purchasePrice", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block ml-1">Selling Price</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-black text-xs">PKR</span>
                  <input
                    className={`${inputClass} pl-14 !bg-blue-50/50 !border-blue-100 focus:!border-blue-600 font-mono h-12 text-right pr-4 text-blue-700 font-black`}
                    placeholder="0"
                    type="number"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => update("salePrice", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100"></div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Notes & Description</h4>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            <div>
              <textarea
                className={`${inputClass} !bg-white !border-gray-200 focus:!border-blue-500 resize-none py-4 min-h-[100px] leading-relaxed`}
                placeholder="Enter detailed description, ingredients, usage instructions, etc..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-14 rounded-2xl border-2 border-gray-100 text-gray-500 font-black uppercase text-xs tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] h-14 rounded-2xl bg-blue-700 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-800 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              title="Shortcut: Ctrl + Enter"
            >
              <Save className="h-5 w-5" /> Save Changes <span className="opacity-50 text-[10px] normal-case tracking-normal ml-1">(Ctrl+Enter)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
