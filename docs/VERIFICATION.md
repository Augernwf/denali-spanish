# Verificación de la rama

Revisión final: 18 de octubre de 2026. Versión pública de referencia: `df346931028f95a0819aee9cba16ebf6951d977b`.

## Equipos

Investigación revisó enunciados, feedback y fuentes primarias; diseño ajustó legibilidad, contraste y navegación; red team probó validación e importaciones; integración añadió plan, búsqueda y repaso. Las revisiones finales y el cierre de fallos se hicieron con agentes **Luna, razonamiento máximo**, según la preferencia del usuario.

## Comprobaciones automatizadas

37 pruebas pasan: contenido e identificadores, calificación, compatibilidad de copias, límites DELE, claves peligrosas, respuestas incompletas, búsqueda bilingüe, planificación, calendario de repaso, rotación de tandas e importaciones con fallo de cuota. El versionador mantiene la misma versión en HTML, CSS e importaciones de módulos.

## Comprobaciones en navegador

- Escritorio y pantalla de 390 × 844, modos claro y oscuro; sin desbordamiento horizontal del documento. Opciones de cuestionario e inputs de 16 px en móvil.
- Plan de 10/15 minutos y nivel seleccionado; vuelta desde apoyo A2 a B1 sin alterar la ruta principal.
- Búsqueda «pronouns», filtros por nivel y esquemas; entrada de gramática por temas breves.
- Respuestas parciales que sobreviven a recarga; «se las» aceptado; corrección 3/4 con un fallo deliberado.
- Paso de errores al repaso; tanda 4/4 y cuatro preguntas programadas para el día siguiente.
- Importación de una copia de prueba: cancelar, confirmar, comprobar texto literal con etiquetas HTML, consultar texto de referencia y recuperar la copia anterior tras recarga.
- Ruta inesperada `#__proto__` tratada como no encontrada; navegación de vuelta al inicio.
- Consola sin errores o advertencias en los recorridos comprobados.

Se utilizaron datos de prueba en localhost. No se modificó el progreso del sitio público.

## Límites de esta verificación

No se hizo una auditoría con lector de pantalla ni se grabó audio real del micrófono. La grabación se revisó en código (peticiones simultáneas y abandono de pantalla). Los fallos de cuota se probaron con un almacenamiento simulado; no se llenó el navegador del usuario. El contenido sigue siendo material de estudio original, no un examen validado. El espaciado es orientativo y la transferencia a nuevas situaciones necesita práctica adicional.

Los controles y la revisión adversarial reducen fallos conocidos; no equivalen a garantizar que cada dispositivo, voz o combinación de datos se haya probado.
