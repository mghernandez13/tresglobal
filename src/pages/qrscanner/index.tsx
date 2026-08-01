import { useState } from "react";
import QRScanner from "../../components/QRScanner";
import AdminTemplate from "../../templates/AdminTemplate";

const QrScannerPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AdminTemplate>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Open Scanner
      </button>
      <QRScanner
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        onDetected={(code) => {
          setIsOpen(false);
          window.location.href = code;
        }}
      />
    </AdminTemplate>
  );
};

export default QrScannerPage;
