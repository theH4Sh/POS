import { useEffect, useState } from "react";
import { Plus, Save, Barcode } from "lucide-react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [meds, setMeds] = useState([]);

  const load = async () => {
    const data = await window.api.listMedicines();
    setMeds(data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name || !purchasePrice || !salePrice) return;

    await window.api.addMedicine({
      name,
      barcode,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
      stock: Number(stock),
      description,
    });

    // reset
    setName("");
    setBarcode("");
    setPurchasePrice("");
    setSalePrice("");
    setStock("");
    setDescription("");
    load();
  };

  const inputClass =
    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50";

  const iconSpanClass =
    "inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500";

  return (
    <div className="mt-5 rounded-lg bg-white text-gray-800 shadow-lg">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
          <Plus className="mr-2 h-5 w-5 text-blue-600" /> Add New Product
        </h3>
        <p className="text-sm text-gray-500">
          Add a new product to the inventory database
        </p>
      </div>

      {/* Form */}
      <div className="p-6 pt-0">
        <form className="space-y-4" onSubmit={add}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barcode */}
            <div className="space-y-2">
              <label htmlFor="barcode" className="text-sm font-medium">
                Barcode (required)
              </label>
              <div className="flex">
                <span className={iconSpanClass}>
                  <Barcode className="h-4 w-4" />
                </span>
                <input
                  id="barcode"
                  placeholder="Enter product barcode"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Product Name (required)
              </label>
              <input
                id="name"
                placeholder="Enter product name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Price */}
            <div className="space-y-2">
              <label htmlFor="purchasePrice" className="text-sm font-medium">
                Purchase Price (required)
              </label>
              <div className="flex">
                <span className={iconSpanClass}>PKR</span>
                <input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </div>

            {/* Sale Price */}
            <div className="space-y-2">
              <label htmlFor="salePrice" className="text-sm font-medium">
                Sale Price (required)
              </label>
              <div className="flex">
                <span className={iconSpanClass}>PKR</span>
                <input
                  id="salePrice"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                placeholder="Enter stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <input
                id="description"
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Save className="mr-2 h-4 w-4" /> Save Product
          </button>
        </form>
      </div>
    </div>
  );
}