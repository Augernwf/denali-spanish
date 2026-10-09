# Denali Spanish

Una web de estudio de español para ganar soltura, con rutas abiertas B1, B2 y C1.

## Qué incluye

- 26 unidades completas con explicación, ejemplos, ayuda breve en inglés y frases reutilizables.
- 252 preguntas con explicación: 156 de unidad, 24 de comprensión y 72 de gramática.
- Taller de gramática con 12 fichas, controles B1/B2/C1 de 24 preguntas, formas escritas, resultados por tema, enlaces de repaso y diez últimos intentos completos.
- Avance por ≥80% en ejercicios de unidad; conversación y escritura opcionales. El indicador mide el cuestionario, no el dominio de la habilidad.
- 6 textos originales para lectura o escucha con síntesis de voz del navegador.
- 12 temas de conversación adaptados a tres dificultades, temporizador y grabación descargable.
- Tareas escritas, ejemplos, borradores, rúbrica oral y 12 fichas de consulta.
- Modelos oficiales DELE B1, B2 y C1, registro de comprensión y guía para revisar producción.
- Progreso local y exportación/importación. Diseño responsive y navegación por teclado.

El contenido es original y orientativo. Los cuestionarios no están validados como pruebas de nivel. Los modelos oficiales se enlazan desde el Instituto Cervantes, sin redistribuir sus contenidos. Las tareas orales y escritas necesitan revisión humana; ninguna puntuación local certifica un nivel.

## Ejecutar

Requiere Node 18 o posterior. No hay dependencias ni compilación.

```sh
npm start
```

Abre `http://127.0.0.1:4173`. Para verificar datos y lógica:

```sh
npm test
```

## GitHub Pages

El directorio publicable es `dist`. El workflow de `.github/workflows/pages.yml` ejecuta las pruebas y publica ese directorio. En **Settings → Pages → Build and deployment**, selecciona **GitHub Actions**. El workflow usa el entorno `github-pages` y los permisos mínimos de lectura de contenido, escritura de Pages y emisión del token de identidad de despliegue.

La URL será `https://<usuario>.github.io/denali-spanish/` si el repositorio tiene ese nombre. Todos los activos usan rutas relativas. No se necesitan claves, servidor ni servicios de pago.

## Datos personales

Los borradores, notas y resultados se guardan en `localStorage` del navegador. No se suben al repositorio ni se sincronizan. Exportar genera un JSON con esos textos. Importar sustituye la copia local. Las grabaciones se mantienen en memoria hasta descargarlas; salir de la sección elimina la copia temporal. La síntesis de voz puede utilizar servicios del navegador según la voz disponible. Las fuentes web se solicitan a Google Fonts; si no cargan se usan tipografías del sistema.

## Referencias

- [Plan curricular del Instituto Cervantes](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/indice.htm).
- [MCER y volumen complementario](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions).
- [Modelos administrados DELE](https://examenes.cervantes.es/es/dele/preparar-prueba/modelos-examen).
- [Calificación del DELE](https://examenes.cervantes.es/es/dele/como).

Estructura y enlaces consultados el 9 de octubre de 2026. C1 utiliza el modelo del formato renovado en 2024. Comprueba las instrucciones oficiales antes de preparar una convocatoria.

## Mantener el contenido

`dist/content.js` contiene las unidades; `dist/practice.js`, biblioteca, temas y referencias rápidas. `dist/grammar.js` contiene el taller, sus bancos y la corrección de formas escritas. `dist/core.js` concentra corrección, criterios de consolidación y validación de copias. `dist/app.js` contiene la interfaz. No añadas datos personales de la estudiante al código publicado.
