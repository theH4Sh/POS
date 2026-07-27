import { Printer } from "lucide-react";
import "../App.css"

const ReceiptCard = ({ cart, lastOrder, discount = 0 }) => {
  const subtotal = cart.reduce(
    (acc, item) => acc + parseFloat(item.salePrice) * item.quantity,
    0
  );

  const discountAmount = (subtotal * discount / 100);
  const total = subtotal - discountAmount;

  const displayOrder = lastOrder || {
    items: cart,
    total: Math.round(total),
    originalTotal: Math.round(subtotal),
    discount: discount,
    discountAmount: Math.round(discountAmount),
    date: new Date().toLocaleString(),
    isRefund: total < 0,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-5 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between z-10">
        <h3 className="text-lg font-bold flex items-center text-gray-800 gap-2">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Printer className="h-5 w-5 text-purple-600" />
          </div>
          Receipt Preview
        </h3>
      </div>

      {/* RECEIPT CONTENT CONTAINER */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6 flex justify-center items-start bg-gray-100">

        {/* THE RECEIPT PAPER */}
        <div
          id="print-area"
          className="bg-white w-full max-w-[420px] shadow-sm text-black font-mono text-[14px] relative flex flex-col shrink-0 h-fit tracking-tighter" style={{
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
          }}
        >
          {/* Paper Texture Pattern (CSS-only subtle noise could be added here if needed) */}

          <div className="p-6 pb-8 print:p-0">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex flex-col items-center mb-2">
                <div className="text-4xl font-black tracking-tighter leading-none text-black">SHAH G</div>
                <div className="text-[14px] font-black tracking-[0.25em] mt-2 uppercase border-y-2 border-black py-1.5 px-6 text-black">Medical Store</div>
              </div>
              <div className="text-[15px] text-black font-black uppercase tracking-[0.1em] mt-5">Official Receipt</div>

              {displayOrder.isRefund && (
                <div className="inline-block border-2 border-red-600 text-red-600 font-bold px-2 py-1 transform -rotate-6 mb-2">
                  *** REFUND ***
                </div>
              )}

              <div className="text-black text-[14px] font-black">{displayOrder.date}</div>
              <div className="text-[14px] text-black mt-3 font-black uppercase text-center leading-relaxed">
                Main Street, Madina Town<br />
                Bhara Kahu, Islamabad<br />
                PH: 0313-5259204
              </div>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

            {/* Column Header */}
            <div className="flex font-black text-[14px] text-black border-b-2 border-dashed border-black uppercase mb-3 pb-1">
              <div className="flex-1">Item</div>
              <div className="w-12 text-center">Qty</div>
              <div className="w-16 text-right">Price</div>
              <div className="w-16 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              {displayOrder.items && displayOrder.items.length > 0 ? (
                displayOrder.items.map((item, idx) => (
                  <div key={idx} className="flex text-black font-black text-[14px] leading-snug">
                    <div className="flex-1 pr-1 truncate">{item.name}</div>
                    <div className="w-12 text-center text-black">{item.quantity}</div>
                    <div className="w-16 text-right text-black">
                      {Math.round(parseFloat(item.salePrice))}
                    </div>
                    <div className="w-16 text-right font-black">
                      {Math.round(parseFloat(item.salePrice) * item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-300 italic py-8">No items</div>
              )}
            </div>

            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

            {/* Subtotal & Discount */}
            <div className="space-y-1 text-right">
              {displayOrder.discount > 0 && (
                <>
                  <div className="flex justify-between text-black font-black text-[14px]">
                    <span>Subtotal</span>
                    <span>{displayOrder.originalTotal}</span>
                  </div>
                  <div className="flex justify-between text-black font-black text-[14px] border-b-2 border-dashed border-black">
                    <span>Discount ({displayOrder.discount}%)</span>
                    <span>-{displayOrder.discountAmount}</span>
                  </div>
                </>
              )}
            </div>

            {/* Total */}
            <div className={`flex justify-between items-end mt-4 pt-4 border-t-2 border-black ${displayOrder.isRefund ? 'text-red-600' : 'text-black'}`}>
              <span className="font-black text-2xl uppercase">Total</span>
              <span className="font-black text-5xl tracking-tighter">{displayOrder.total}</span>
            </div>

            <div className="text-center mt-10 space-y-2">
              <p className="font-black text-xl uppercase text-black border-y-2 border-dashed border-black py-2">Thank you!</p>
              <p className="text-[16px] text-black font-black">Please come again</p>
            </div>

            {/* Return Policy */}
            <div className="mt-10 pt-5 border-t-2 border-dashed border-black text-center">
              <div className="text-[14px] text-black uppercase tracking-widest mb-2 font-black">Return Policy</div>
              <div className="text-[14px] text-black font-black leading-tight uppercase">
                Exchange/Return within 3 days<br />
                with original receipt.
              </div>
            </div>
          </div>

          {/* Jagged Edge Bottom (CSS Clip Path) */}
          <div
            className="absolute -bottom-3 left-0 w-full h-3 bg-white print-hidden"
            style={{
              clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
            }}
          ></div>
        </div>
      </div>

      {/* Print Button */}
      <div className="p-6 border-t border-gray-200 bg-white z-20">
        <button
          onClick={handlePrint}
          className="bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 h-12 px-4 w-full rounded-xl flex items-center gap-2 justify-center font-bold text-md shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <Printer className="h-5 w-5" /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptCard;