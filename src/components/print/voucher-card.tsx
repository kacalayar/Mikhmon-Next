"use client";

import QRCode from "react-qr-code";

export interface VoucherData {
  username: string;
  password?: string;
  profile: string;
  validity?: string;
  timeLimit?: string;
  dataLimit?: string;
  price?: string;
  server?: string;
  loginUrl?: string;
}

export interface PrintOptions {
  routerName?: string;
  showQr?: boolean;
}

interface VoucherCardProps {
  voucher: VoucherData;
  showQr?: boolean;
  className?: string;
}

export function VoucherCard({
  voucher,
  showQr = false,
  className = "",
}: VoucherCardProps) {
  const loginUrl =
    voucher.loginUrl ||
    `http://hotspot.local/login?username=${voucher.username}&password=${voucher.password || ""}`;

  return (
    <div
      className={`voucher-card border border-dashed border-gray-400 rounded p-2 bg-white text-black ${className}`}
    >
      <div className="flex gap-2">
        {/* QR Code Section */}
        {showQr && (
          <div className="flex-shrink-0">
            <QRCode value={loginUrl} size={40} level="L" className="bg-white" />
          </div>
        )}

        {/* Info Section */}
        <div className="flex-1">
          <div className="text-center border-b border-gray-300 pb-1 mb-1">
            <h3 className="font-bold text-xs">{voucher.profile}</h3>
          </div>

          <div className="space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>User:</span>
              <span className="font-bold">{voucher.username}</span>
            </div>

            {voucher.password && (
              <div className="flex justify-between">
                <span>Pass:</span>
                <span className="font-bold">{voucher.password}</span>
              </div>
            )}

            {voucher.price && (
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-bold">{voucher.price}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate filename for PDF: RouterName_YYYY-MM-DD_HH-mm-ss
 */
function generateFileName(routerName?: string): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-mm-ss
  const router = routerName?.replace(/[^a-zA-Z0-9]/g, "_") || "Voucher";
  return `${router}_${date}_${time}`;
}

/**
 * Print vouchers directly using browser print dialog
 * Layout: 5 columns x 8 rows = 40 vouchers per A4 page
 * @param vouchers - Array of voucher data to print
 * @param options - Print options including router name and QR display
 */
export function printVouchers(
  vouchers: VoucherData[],
  options: PrintOptions = {},
) {
  const { routerName, showQr = false } = options;
  const fileName = generateFileName(routerName);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups for printing");
    return;
  }

  const vouchersHtml = vouchers
    .map(
      (voucher) => `
      <div class="voucher-card">
        ${
          showQr
            ? `
          <div class="qr-section">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${encodeURIComponent(
              voucher.loginUrl ||
                `http://hotspot.local/login?username=${voucher.username}&password=${voucher.password || ""}`,
            )}" alt="QR" />
          </div>
        `
            : ""
        }
        <div class="info-section">
          <div class="header">${voucher.profile}</div>
          <div class="row"><span>User:</span><b>${voucher.username}</b></div>
          ${voucher.password ? `<div class="row"><span>Pass:</span><b>${voucher.password}</b></div>` : ""}
          ${voucher.price ? `<div class="row"><span>Price:</span><b>${voucher.price}</b></div>` : ""}
        </div>
      </div>
    `,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${fileName}</title>
      <style>
        @page {
          size: A4;
          margin: 5mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background: white;
        }
        .vouchers-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2mm;
          padding: 2mm;
        }
        .voucher-card {
          border: 1px dashed #666;
          border-radius: 3px;
          padding: 2mm;
          background: white;
          color: black;
          font-size: 8px;
          display: flex;
          gap: 2mm;
          break-inside: avoid;
          page-break-inside: avoid;
          min-height: 28mm;
        }
        .voucher-card .qr-section {
          flex-shrink: 0;
        }
        .voucher-card .qr-section img {
          width: 12mm;
          height: 12mm;
        }
        .voucher-card .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .voucher-card .header {
          text-align: center;
          font-weight: bold;
          font-size: 9px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 1mm;
          margin-bottom: 1mm;
        }
        .voucher-card .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5mm;
        }
        .voucher-card .row b {
          font-weight: bold;
        }
        @media print {
          body { 
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .vouchers-grid {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="vouchers-grid">
        ${vouchersHtml}
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
