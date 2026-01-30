import { useEffect, useState } from "react";

export default function Product () {
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [meds, setMeds] = useState([]);

  const load = async () => {
    const data = await window.api.listMedicines();
    setMeds(data);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name || !purchasePrice || !salePrice) return;

    await window.api.addMedicine({
      name,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(salePrice),
    });

    setName("");
    setPurchasePrice("");
    setSalePrice("");
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pharmacy POS – Inventory</h1>

      {/* Form */}
      <div className="flex gap-3 mb-6">
        <input
          className="border p-2 flex-1"
          placeholder="Medicine name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-32"
          type="number"
          placeholder="Buy"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
        />

        <input
          className="border p-2 w-32"
          type="number"
          placeholder="Sell"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4"
          onClick={add}
        >
          Add
        </button>
      </div>

      {/* List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2">Buy (PKR)</th>
            <th className="border p-2">Sell (PKR)</th>
          </tr>
        </thead>
        <tbody>
          {meds.map((m) => (
            <tr key={m.id}>
              <td className="border p-2">{m.name}</td>
              <td className="border p-2">{m.purchasePrice}</td>
              <td className="border p-2">{m.salePrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}