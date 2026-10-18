# Revisión técnica y adversaria

Fecha: 17 de octubre de 2026. Rama de trabajo: `codex/denali-study-upgrade`.

## Cambios comprobables en el núcleo

| Caso reproducible | Comportamiento anterior | Corrección |
| --- | --- | --- |
| Importar 40 aciertos de lectura B1 o B2 | Se conservaban 40 y podían mostrarse porcentajes superiores al 100 % | Se usan los límites del modelo configurado: B1 30, B2 36, A2 25 y C1 40 |
| Importar aciertos fraccionarios o no finitos | Las fracciones sobrevivían; `NaN` podía propagarse | Solo se conservan cantidades enteras finitas dentro de los límites |
| Corregir una lista vacía o respuestas con huecos | Podía producirse `NaN` o calificarse un cuestionario incompleto | El corrector exige preguntas y respuestas completas |
| Importar un resultado 1/1 para una unidad de seis preguntas | Se aceptaba como consolidada | Los resultados antiguos deben tener el número real de preguntas |
| Importar respuestas junto a un agregado manipulado | Se confiaba en el agregado y se perdían las respuestas | Se recalculan los aciertos a partir de las respuestas; se conserva la evidencia |
| Modificar un array después de validar una copia | Algunas referencias seguían compartidas con los datos de entrada | Se copian respuestas y valoraciones al validar |
| Importar fechas imposibles, etapas fuera de rango o claves especiales | Los nuevos campos todavía no estaban validados | Se validan fechas reales, etapas 0–4, límites de tamaño y claves admitidas |

## Compatibilidad y alcance

- Se conserva `denali-spanish-v1` y la versión 1 de las copias.
- Los resultados antiguos que solo contienen recuentos siguen siendo compatibles cuando corresponden al cuestionario real.
- Se mantienen los borradores, notas, valoraciones y revisiones válidos. Los textos se almacenan literalmente y se escapan al presentarse en HTML.
- Las copias antiguas reciben valores iniciales para `review`, `quizDrafts` y `sessionMinutes`; B1 sigue siendo el nivel inicial.
- Los nuevos borradores admiten casillas sin responder, respuestas numéricas y texto acotado. Los repasos tienen un máximo de 1.000 entradas importadas.
- Un archivo local editable no prueba que una persona haya realizado un examen. Esta validación protege la coherencia de los datos; no es un mecanismo de certificación o vigilancia.

## Pruebas añadidas

`tests/robustness.test.mjs` cubre nueve grupos de regresión: corrección incompleta, límites de examen, reconstrucción de resultados, copias v1, contenedores malformados y claves especiales, aislamiento de arrays, fechas y límites de repaso, borradores parciales y textos potencialmente peligrosos.

Verificación integrada: 37 de 37 pruebas pasan después de versionar los activos. Las seis pruebas de almacenamiento incluyen fallos de cuota y recuperación de copias anteriores.

## Hallazgos comunicados para la integración

- Evitar que rutas como `#constructor` o `#__proto__` accedan a propiedades heredadas del mapa de páginas.
- Bloquear solicitudes de micrófono simultáneas y detener una solicitud que termine después de abandonar su pantalla.
- Distinguir trabajo conservado en memoria de trabajo guardado en almacenamiento persistente; no comunicar éxito de guardado si falla.
- Pedir confirmación al sustituir una copia y ofrecer conservar el progreso actual antes de importarla.
- No restaurar respuestas posicionales de un repaso sobre una lista diferente de preguntas pendientes.

Los hallazgos de integración se han resuelto. La revisión final con Luna máximo excluye borradores de tandas dinámicas y añadió importación transaccional con regresiones de cuota. Los recorridos del navegador y los límites de la revisión se describen en VERIFICATION.md.
