import { getItemName } from "../../util/get-item-name.js";

export function printSale(sale) {
  const printWindow = window.open("", "PRINT", "height=600, width=800");

  printWindow.document.write(`
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>거래명세서</title>
        <style>
          .title-div {
            display: flex;
            justify-content: space-between;
            width: 100%;
            border: 1px solid black;
            box-sizing: border-box;
            margin-top: 100px;
          }
          .title-div h2 {
            width: 85%;
            text-align: center;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 0;
            font-size: 20px;
          }
          .approval-box {
            display: flex;
            flex-direction: column;
            width: 15%;
            font-size: 10px;
          }
          .approval-box .header {
            display: flex;
            text-align: center;
          }
          .approval-box .header span {
            flex: 1;
            border-left: 1px solid black;
            border-bottom: 1px solid black;
            padding: 2px 0;
          }
          .approval-box .signatures {
            flex: 1;
            display: flex;
          }
          .approval-box .signatures .signature {
            flex: 1;
            border-left: 1px solid black;
            padding: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th,
          td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
          .single-row th,
          .single-row td {
            padding: 0;
            border-right: 1px solid black;
            border-bottom: 1px solid black;
          }
          .single-row td {
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <div class="title-div">
          <h2>거래명세서</h2>
          <div class="approval-box">
            <div class="header">
              <span>담당</span>
              <span>결재</span>
            </div>
            <div class="signatures">
              <div class="signature"></div>
              <div class="signature"></div>
            </div>
          </div>
        </div>
        <table>
          <tr class="single-row">
            <th>전표번호</th>
            <td colspan="5">${sale.slipCode}</td>
          </tr>
          <tr>
            <th>전표일자</th>
            <th colspan="2">품목</th>
            <th>수량</th>
            <th>단가</th>
            <th>금액</th>
          </tr>
          <tr>
            <td>${sale.slipDate}</td>
            <td colspan="2">${getItemName(sale.itemCode)}</td>
            <td>${parseInt(sale.qty, 10).toLocaleString()}</td>
            <td>${parseInt(sale.price, 10).toLocaleString()}</td>
            <td>${(
              parseInt(sale.qty, 10) * parseInt(sale.price, 10)
            ).toLocaleString()}</td>
          </tr>
          <tr class="single-row">
            <th>적요</th>
            <td colspan="5">${sale.description}</td>
          </tr>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
}
