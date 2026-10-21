# Control de Carga · Aletek

Herramienta de un solo archivo (`control_carga_aletek.html`) para registrar ingresos por packing list,
despachos por GD e insumos, con cálculo automático de volumen. No necesita servidor: se abre en el
navegador y guarda los datos en `localStorage` (usar "Respaldo JSON" para respaldar o mover a otro equipo).

## Pruebas

```
npm install
npm test
```

Las pruebas cargan el parser y las utilidades directo desde el HTML (`tests/cargar.js`).
