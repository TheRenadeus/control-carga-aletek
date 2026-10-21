const test = require("node:test"), assert = require("node:assert");
const { cargar, libro, resumen } = require("./cargar");
const { parseWorkbook } = cargar();

const ITEMS = [
  ["181-680B", "Cat 798 AC HAA Manifold Cover Group",        8, "48x39x33", 1],
  ["163-681B", "Cat 798 AC HAA Turbo Cover Group",          25, "70x48x42", 1],
  ["101-466B", "Cat 798 AC HAA Connection Pipe Cover Group",  8, "48x39x33", 1],
  ["172-350B", "Cat 798 AC HAA Junction Cover Group",       18, "70x48x42", 1],
  ["116-925B", "Cat 798 AC HAA Engine Pipe Cover Group",    48, "70x48x42", 2],
];
const KIT = "116-740B Cat 798 AC HAA Cover Kit QTY x 1";

test("packing list con encabezados en español (caso real que fallaba)", () => {
  const aoa = [["PL 4520110677"],
    ["Orden", "Producto", "Código Aletek", "Cantidad de Kit", "Total de Cajas", "Descripción",
     "Total N.W (KGS)", "Cartón Dimensiones (cm)", "Cajon #", "Pallet Tamaño (cm)", "Pallet Peso (KGS) (Gross)"]];
  for(const cajon of [1, 2]) ITEMS.forEach((it, i) => aoa.push([
    i ? null : "4520110677", i ? null : KIT, it[0], 1, it[4], it[1], it[2], it[3],
    i ? null : cajon, i ? null : "158x128x108", i ? null : 216]));

  const docs = parseWorkbook(libro(aoa), "pl.xlsx", "despacho");
  assert.equal(docs.length, 1);
  assert.deepEqual(resumen(docs[0]),
    { doc: "4520110677", lineas: 10, pcs: 10, nw: 214, cajas: 12, pallets: 2, volPallets: 4.3684, shared: 0 });
  const l = docs[0].lines[0];
  assert.equal(l.code, "181-680B");
  assert.equal(l.desc, "Cat 798 AC HAA Manifold Cover Group");
  assert.equal(l.kit, "116-740B ×1");
  assert.equal(l.po, "4520110677");
  assert.deepEqual(docs[0].lines.map(x => x.cajon).filter(Boolean), ["1", "2"]);
  assert.deepEqual(docs[0].warnings, []);
});

test("packing list en inglés sigue igual (varios documentos, misma caja)", () => {
  const hdr = ["PO", "Kit", "Product", "Description", "QTY (PCS)", "N.W (KGS)", "Carton Dims (cm)",
               "Carton QTY", "Cajón", "Pallet Dims (cm)", "Pallet Weight (KGS)"];
  const aoa = [["Packing List 4510009999"], hdr];
  ITEMS.forEach((it, i) => aoa.push([i ? null : "4510009999", i ? null : KIT, it[0], it[1], 1, it[2],
    i === 2 ? null : it[3], i === 2 ? null : it[4], i ? null : "1", i ? null : "158x128x108", i ? null : 216]));
  aoa.push(["GD 12345"], hdr, ["PO 1", "Kit X", "200-100A", "Thing", 3, 5, "10x10x10", 1, "3", "100x100x100", 50]);

  const docs = parseWorkbook(libro(aoa), "pl.xlsx", "despacho");
  assert.deepEqual(docs.map(resumen), [
    { doc: "4510009999", lineas: 5, pcs: 5, nw: 107, cajas: 5, pallets: 1, volPallets: 2.1842, shared: 1 },
    { doc: "12345", lineas: 1, pcs: 3, nw: 5, cajas: 1, pallets: 1, volPallets: 1, shared: 0 },
  ]);
  assert.equal(docs[0].lines[2].shared, true);
  assert.equal(docs[0].lines[0].kit, "116-740B ×1");
});

test("título PL acepta 'PL 123', 'PL: 123' y 'PL#123'", () => {
  for(const t of ["PL 123", "PL: 123", "PL#123"]){
    const docs = parseWorkbook(libro([[t], ["Código Aletek", "Descripción"], ["181-680B", "x"]]), "a.xlsx", "ingreso");
    assert.equal(docs[0]?.doc, "123", t);
  }
});
