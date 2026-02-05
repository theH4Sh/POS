import { Printer } from "lucide-react";

const ReceiptCard = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Printer className="mr-2 h-5 w-5 text-gray-700" /> Receipt
        </h3>
      </div>
      <div className="p-6 pt-0 bg-white text-black font-mono text-sm min-h-[400px]">
        {/* ...receipt content... */}
      </div>
      <div className="flex items-center p-6 pt-0">
        <button className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full rounded-md flex items-center gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptCard;