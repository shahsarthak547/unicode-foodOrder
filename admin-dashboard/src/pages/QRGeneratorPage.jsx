import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGeneratorPage() {
  const [restaurantId, setRestaurantId] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const baseUrl = "http://10.195.227.158:5173";

  const menuUrl =
    restaurantId && tableNumber
      ? `${baseUrl}/restaurant/${restaurantId}/table/${tableNumber}`
      : "";

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `restaurant-${restaurantId}-table-${tableNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(menuUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = menuUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      alert("Menu link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy link. Please copy it manually.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/serveflow-logo.png" alt="ServeFlow Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ServeFlow QR Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate QR for restaurant tables
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Restaurant ID"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
          />

          <input
            type="text"
            placeholder="Table Number (e.g. T1)"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>
        {menuUrl && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <QRCodeCanvas
              id="qr-code"
              value={menuUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />

            <p className="text-xs text-gray-500 break-all text-center">
              {menuUrl}
            </p>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
              >
                Copy Link
              </button>

              <button
                onClick={downloadQR}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
              >
                Download QR
              </button>
            </div>
          </div>
        )}
        {!menuUrl && (
          <div className="text-center text-gray-400 text-sm py-6">
            Enter Restaurant ID and Table Number to generate QR
          </div>
        )}
      </div>
    </div>
  );
}
