# Denali Spanish

Una web de estudio de español para ganar soltura, con rutas abiertas A2, B1, B2 y C1.

## Qué incluye

- 36 unidades completas: diez nuevas de A2 y las 26 de B1–C1. Explicaciones, ejemplos, inglés y frases reutilizables.
- 440 preguntas con explicación: 216 de unidad, 80 de comprensión, 96 de examen de gramática y 48 de práctica extra.
- Taller de gramática con 26 fichas bilingües, controles A2/B1/B2/C1 de 24 preguntas, formas escritas, resultados por tema, enlaces de repaso y diez últimos intentos completos.
- Avance por ≥80% en ejercicios de unidad; conversación y escritura opcionales. El indicador mide el cuestionario, no el dominio de la habilidad.
- 16 textos originales para lectura o escucha con síntesis de voz del navegador; diez con traducción completa al inglés y vocabulario, incluidos los cuatro de A2.
- Ayudas en inglés en las 108 secciones de las 36 unidades, instrucciones, fichas y correcciones del examen de gramática. El botón ES + EN abre o recoge ayudas sin borrar respuestas en curso.
- Seis temas sencillos de conversación A2 y doce temas para B1–C1, temporizador y grabación descargable.
- Tareas escritas, ejemplos, borradores, rúbrica oral y 12 fichas de consulta.
- Modelos oficiales DELE A2, B1, B2 y C1, registro de comprensión y guía para revisar producción.
- Progreso local y exportación/importación. Diseño responsive y navegación por teclado.
- Paleta rosada con modo día/noche. Respeta la apariencia del dispositivo hasta elegir con el botón superior; recuerda esa elección en el navegador y conserva las respuestas al cambiar de tema.

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

Antes de las pruebas del despliegue se ejecuta `node tools/version-assets.mjs`. Asigna una versión derivada del contenido a CSS y módulos JavaScript para que una recarga obtenga la actualización completa. Al cambiar activos localmente, ejecuta también este comando antes de `npm test`.

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

`dist/content.js` contiene las unidades; `dist/practice.js`, biblioteca, temas y referencias rápidas. `dist/bilingual.js` contiene las ayudas en inglés; `dist/extra.js`, lecturas y práctica adicionales. `dist/grammar.js` contiene el taller, sus bancos y la corrección de formas escritas. `dist/core.js` concentra corrección, criterios de consolidación y validación de copias. `dist/app.js` contiene la interfaz. `dist/theme.css` define las dos paletas y `dist/theme.js` aplica la elección antes de cargar estilos. La apariencia se guarda separada del progreso y no se incluye en sus copias. No añadas datos personales de la estudiante al código publicado.

`dist/a2.js` reúne la ruta A2, sus ayudas bilingües, cuatro lecturas, seis temas orales y los nuevos bancos. Añadir A2 no cambia los identificadores ni la posición de las respuestas de los bancos antiguos. La revisión B1 acepta tanto `las` como `se las` en la pregunta de las fotos; también aclara instrucciones de perspectiva temporal.
