export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  // 1. Extract Headers
  const headers = Object.keys(data[0]);

  // 2. Convert Data to CSV String
  const csvContent = [
    headers.join(","), // Header Row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          let value = row[fieldName] || "";
          // Handle strings with commas by wrapping in quotes
          if (typeof value === "string" && value.includes(",")) {
            value = `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // 3. Create Blob and Trigger Download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
