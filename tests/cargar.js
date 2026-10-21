// Carga las utilidades y parseWorkbook() directo desde el HTML, para probar el código real.
const fs = require("fs"), path = require("path"), vm = require("vm"), XLSX = require("xlsx");

function cargar(html = fs.readFileSync(path.join(__dirname, "..", "control_carga_aletek.html"), "utf8"), globales = {}){
  const a = html.indexOf("/* ===================== utilidades");
  const b = html.indexOf("/* ===================== render de tablas");
  if(a < 0 || b < 0) throw new Error("no se encontró el bloque del parser en el HTML");
  const ctx = { XLSX, ...globales };
  vm.createContext(ctx);
  vm.runInContext(html.slice(a, b) + "\nObject.assign(this, { parseWorkbook, today, parseNum });", ctx);
  return ctx;
}

// arma un workbook en memoria y lo pasa por write/read, igual que un .xlsx subido
const libro = aoa => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Hoja1");
  return XLSX.read(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
};

const resumen = d => ({
  doc: d.doc, lineas: d.lines.length,
  pcs: d.lines.reduce((a, l) => a + (l.qty || 0), 0),
  nw: d.lines.reduce((a, l) => a + (l.peso || 0), 0),
  cajas: d.lines.reduce((a, l) => a + (l.cqty || 0), 0),
  pallets: d.lines.filter(l => l.palletId).length,
  volPallets: +d.lines.reduce((a, l) => a + l.volPallet, 0).toFixed(4),
  shared: d.lines.filter(l => l.shared).length,
});

module.exports = { cargar, libro, resumen };
