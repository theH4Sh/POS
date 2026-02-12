import { SquarePen, TriangleAlert, Trash2, ListFilter } from "lucide-react";
import { useState } from "react";

export default function InventoryTable({ products, onEditProduct, onDeleteProduct, canEdit = false }) {
  // Tooltip state
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm relative border-separate">
      {hoveredProduct && (
        <div
          className="fixed z-[100] bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl text-sm pointer-events-none max-w-xs animate-in fade-in zoom-in-95 duration-150"
          style={{ top: mousePos.y + 20, left: mousePos.x + 20 }}
        >
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <p className="font-black text-blue-100 uppercase tracking-tighter">{hoveredProduct.name}</p>
          </div>
          <p className="text-gray-300 mb-3 leading-relaxed text-xs">
            {hoveredProduct.description ? hoveredProduct.description : <span className="italic text-gray-500">No description available</span>}
          </p>
          <div className="flex justify-between items-center text-[10px] text-white/50 bg-white/5 p-2 rounded-lg">
            <span className="font-bold uppercase">{hoveredProduct.category || "General"}</span>
            <span className="font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">{hoveredProduct.stock || 0} IN STOCK</span>
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[600px] custom-scrollbar">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Barcode</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Product Information</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Price (Buy/Sell)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Stock Details</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length > 0 ? (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="group hover:bg-blue-50/40 transition-all duration-200 cursor-default"
                  onMouseEnter={() => setHoveredProduct(p)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                >
                  {/* Barcode */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-700 transition-colors font-semibold">
                      {p.barcode || "NONE"}
                    </span>
                  </td>

                  {/* Name & Category */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 text-base group-hover:text-blue-800 transition-colors tracking-tight">{p.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {p.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-5 text-center flex items-center ">
                    <div className="inline-flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2 border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-colors min-w-[100px]">
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Buy</span>
                        <span className="text-sm font-bold text-gray-700 font-mono">PKR {Number(p.purchasePrice || 0)}</span>
                      </div>
                      <div className="w-full h-px bg-gray-200 my-0.5"></div>
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Sell</span>
                        <span className="text-md font-black text-blue-700 font-mono pl-1"> PKR {Number(p.salePrice || 0)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Stock & Status */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-black font-mono tracking-tighter ${p.stock < 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                          {p.stock}
                        </span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">units</span>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter border-2 flex items-center gap-1.5 shadow-sm ${p.status === "In Stock"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : p.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                          }`}
                      >
                        {p.status === "Out of Stock" && <TriangleAlert className="h-2.5 w-2.5" />}
                        {p.status}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    {canEdit && (
                      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditProduct(p); }}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm border border-blue-100"
                          title="Edit Product"
                        >
                          <SquarePen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteProduct(p); }}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm border border-red-100"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <ListFilter className="h-16 w-16 mb-4 stroke-[1]" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search or add a new product</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
