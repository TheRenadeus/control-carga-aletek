const test = require("node:test"), assert = require("node:assert");
const { cargar } = require("./cargar");

test("today() usa la fecha local, no UTC (22:30 en Chile sigue siendo el mismo día)", () => {
  process.env.TZ = "America/Santiago";
  const Real = Date, fijo = new Real("2026-10-21T22:30:00-03:00");
  class FakeDate extends Real { constructor(...a){ super(...(a.length ? a : [fijo])); } }
  const { today } = cargar(undefined, { Date: FakeDate });
  assert.equal(fijo.toISOString().slice(0, 10), "2026-10-22");   // lo que daba antes
  assert.equal(today(), "2026-10-21");
});

test("parseNum acepta coma decimal y rechaza texto", () => {
  const { parseNum } = cargar();
  assert.equal(parseNum("8,5"), 8.5);
  assert.equal(parseNum(" 8.5 "), 8.5);
  assert.equal(parseNum("1.234,5"), 1234.5);
  assert.equal(parseNum("12"), 12);
  assert.equal(parseNum(""), null);
  assert.equal(parseNum("abc"), undefined);
  assert.equal(parseNum("8,5kg"), undefined);
});
