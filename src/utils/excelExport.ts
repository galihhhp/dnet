import * as XLSX from "xlsx";

export interface ExcelColumn {
  key: string;
  title: string;
  width?: number;
  formatter?: (value: any) => string;
}

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExcelColumn[];
  data: any[];
}

export const exportToExcel = ({
  filename,
  sheetName = "Sheet1",
  columns,
  data,
}: ExcelExportOptions): void => {
  try {
    const headers = columns.map((col) => col.title);

    const formattedData = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        return col.formatter ? col.formatter(value) : value;
      })
    );

    const worksheetData = [headers, ...formattedData];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    columns.forEach((col, index) => {
      if (col.width) {
        if (!worksheet["!cols"]) worksheet["!cols"] = [];
        worksheet["!cols"][index] = { width: col.width };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, finalFilename);
  } catch (error) {
    throw new Error("Failed to export Excel file");
  }
};

export const formatCurrency = (value: number): string => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatStatus = (status: string): string => {
  return status.toUpperCase();
};
