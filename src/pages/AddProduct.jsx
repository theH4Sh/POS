import { useState } from "react";
import { Plus, Save } from "lucide-react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [tabletsPerStrip, setTabletsPerStrip] = useState(12);
  const [stripsPerBox, setStripsPerBox] = useState(5);
  const [boxes, setBoxes] = useState(0);
  const [purchasePriceBox, setPurchasePriceBox] = useState("");
  const [salePriceTablet, setSalePriceTablet] = useState("");
  const [salePriceStrip, setSalePriceStrip] = useState("");
  const [salePriceBox, setSalePriceBox] = useState("");
  const [description, setDescription] = useState("");

  const add = async (e) => {
    e.preventDefault();

    const stockTablets = Number(boxes) * Number(stripsPerBox) * Number(tabletsPerStrip);

    await window.api.addMedicine({
      name,
      barcode,
      tabletsPerStrip: Number(tabletsPerStrip),
      stripsPerBox: Number(stripsPerBox),
      stockTablets,
      purchasePriceBox: Number(purchasePriceBox),
      prices: JSON.stringify({
        tablet: Number(salePriceTablet),
        strip: Number(salePriceStrip),
        box: Number(salePriceBox),
      }),
      description,
    });

    // reset
    setName("");
    setBarcode("");
    setBoxes(0);
    setPurchasePriceBox("");
    setSalePriceTablet("");
    setSalePriceStrip("");
    setSalePriceBox("");
    setDescription("");
    console.log("Medicine added successfully");
  };

  const input =
    "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mt-5 rounded-lg bg-white shadow-lg">
      <div className="p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Plus className="mr-2 h-5 w-5 text-blue-600" />
          Add Medicine
        </h3>
        <p className="text-sm text-gray-500">Tablet / Strip / Box based inventory</p>
      </div>

      <form onSubmit={add} className="p-6 pt-0 space-y-4">
        <input
          className={input}
          placeholder="Medicine name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className={input}
          placeholder="Barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            className={input}
            type="number"
            min="1"
            value={tabletsPerStrip}
            onChange={(e) => setTabletsPerStrip(e.target.value)}
            placeholder="Tablets / Strip"
            required
          />
          <input
            className={input}
            type="number"
            min="1"
            value={stripsPerBox}
            onChange={(e) => setStripsPerBox(e.target.value)}
            placeholder="Strips / Box"
            required
          />
          <input
            className={input}
            type="number"
            min="0"
            value={boxes}
            onChange={(e) => setBoxes(e.target.value)}
            placeholder="Boxes in stock"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            className={input}
            placeholder="Sale price / tablet"
            type="number"
            value={salePriceTablet}
            onChange={(e) => setSalePriceTablet(e.target.value)}
          />
          <input
            className={input}
            placeholder="Sale price / strip"
            type="number"
            value={salePriceStrip}
            onChange={(e) => setSalePriceStrip(e.target.value)}
          />
          <input
            className={input}
            placeholder="Sale price / box"
            type="number"
            value={salePriceBox}
            onChange={(e) => setSalePriceBox(e.target.value)}
          />
        </div>

        <textarea
          className={`${input} h-20`}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white h-10 rounded-md hover:bg-blue-700 flex items-center justify-center">
          <Save className="inline mr-2 h-4 w-4" /> Save Medicine
        </button>
      </form>
    </div>
  );
}