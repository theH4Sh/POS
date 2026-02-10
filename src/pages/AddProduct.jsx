import { useState } from "react";
import { Plus, Save } from "lucide-react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("medicine");

  const add = async (e) => {
    e.preventDefault();

    await window.api.addMedicine({
      name,
      barcode,
      quantity: parseInt(quantity),
      category,
      purchasePrice,
      salePrice,
      description,
    });

    // reset
    setName("");
    setBarcode("");
    setQuantity(0);
    setPurchasePrice("");
    setSalePrice("");
    setDescription("");
    console.log("Medicine added successfully");
    alert("Medicine added successfully");
  };

  const input =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";
  
  const label = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <div className="min-h-screen ">
      {/* bg-gradient-to-br from-blue-50 to-indigo-100 p-6 */}
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl bg-white shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <Plus className="h-8 w-8" />
              Add New Product
            </h3>
            <p className="text-blue-100 text-sm mt-2">Add medicine, cosmetics, or other products to your inventory</p>
          </div>

          <form onSubmit={add} className="p-8 space-y-6">
            {/* Product Name */}
            <div>
              <label className={label}>Product Name *</label>
              <input
                className={input}
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Barcode */}
            <div>
              <label className={label}>Barcode</label>
              <input
                className={input}
                placeholder="Enter or scan barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>

            {/* Quantity and Category - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Quantity *</label>
                <input
                  className={input}
                  placeholder="0"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={label}>Category *</label>
                <select
                  className={input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="medicine">Medicine</option>
                  <option value="cosmetics">Cosmetics</option>
                  <option value="supplements">Supplements</option>
                  <option value="medical-devices">Medical Devices</option>
                </select>
              </div>
            </div>

            {/* Purchase and Sale Price - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500 font-semibold">$</span>
                  <input
                    className={`${input} pl-8`}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={label}>Sale Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-500 font-semibold">$</span>
                  <input
                    className={`${input} pl-8`}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={label}>Description</label>
              <textarea
                className={`${input} resize-none py-3`}
                placeholder="Add product description, ingredients, usage instructions, etc."
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            >
              <Save className="h-5 w-5" /> 
              Save Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}