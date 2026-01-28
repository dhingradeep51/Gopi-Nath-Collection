import html2pdf from "html2pdf.js";
import { renderToString } from "react-dom/server";
import Barcode from "react-barcode";
import moment from "moment";


// Function 2: GENERATE LABEL (Admin Only)
export const generateLabel = (order) => {
    const barcodeHtml = renderToString(
        <Barcode 
            value={order.awbNumber || order._id.slice(-8)} 
            width={1.5} 
            height={50} 
            fontSize={12} 
        />
    );

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="width: 400px; border: 2px solid #000; padding: 20px; font-family: Arial, sans-serif; color: #000; background: #fff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
          <strong style="font-size: 14px;">Gopi Nath Collection</strong>
          <span style="font-size: 12px;">ID: #${order._id.slice(-6).toUpperCase()}</span>
        </div>
        
        <div style="text-align: center; margin-bottom: 15px;">
          ${barcodeHtml}
        </div>

        <div style="border-top: 1px solid #000; padding-top: 10px;">
          <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #555;">Ship To:</p>
          <h2 style="margin: 5px 0; font-size: 20px; text-transform: uppercase;">${order.buyer?.name}</h2>
          <p style="margin: 0; font-size: 14px; line-height: 1.4;">${order.address}</p>
          <div style="margin-top: 10px; font-weight: bold; font-size: 16px;">
            PH: ${order.buyer?.phone}
          </div>
        </div>

        <div style="margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px;">
          <p style="margin: 0;"><b>Return Address:</b> Gopi Nath Collection, Your Store Address, City, State - Pincode</p>
        </div>
      </div>`;

    const opt = {
        margin: 0.2,
        filename: `Label_${order._id.slice(-6)}.pdf`,
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' } // Standard 4x6 Label Size
    };

    html2pdf().from(element).set(opt).save();
};