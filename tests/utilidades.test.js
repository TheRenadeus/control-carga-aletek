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
