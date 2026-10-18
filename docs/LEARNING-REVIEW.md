# Revisión didáctica — 17 de octubre de 2026

## Perfil y criterio de la revisión

La ruta inicial sigue siendo B1. A2 sirve como apoyo dirigido cuando una base dificulta el trabajo de B1. La estudiante tiene inglés como primera lengua, experiencia de vida en España y prefiere gramática, lectura y escucha que pueda practicar por su cuenta. La conversación sigue disponible como práctica opcional.

Se revisaron los enunciados, opciones y correcciones de las 216 preguntas de unidades, las 96 preguntas de los controles y los 48 ejercicios extra, además de la estructura de lecturas, fichas y ayudas bilingües. Esta pasada editorial busca errores y ambigüedades observables; no constituye una validación psicométrica ni acredita niveles MCER.

## Cambios realizados

| Problema | Cambio | Alcance |
| --- | --- | --- |
| «Yo ___ la respuesta» rechazaba «conozco», que también es correcto. | El enunciado pide explícitamente saber en presente; las explicaciones ES/EN reconocen ambas construcciones. La unidad también explica el solapamiento. | B1 Presente, pregunta 6 |
| Algunos ejercicios de pasado parecían convertir mientras, ayer o todos los veranos en reglas automáticas. | Se especifica el punto de vista o la forma verbal solicitada. La corrección distingue una respuesta que no cumple la instrucción de una oración imposible. | B1 Pasados, preguntas 1–4 y 6 |
| Hay/estar, por/para y algunos conectores admitían otras lecturas por falta de contexto. | Se indica si se pide existencia, localización de un evento, finalidad o consecuencia. | B1 Base, preguntas 1–2; B1 Preposiciones, pregunta 1; B2 Argumentar, pregunta 1; control B1, pregunta 21 |
| «No siempre funciona» se interpretaba sin contexto como si fijara cuántas veces funciona. | El enunciado da expresamente un caso con aciertos y fallos; la explicación limita la conclusión a ese contexto. | B2 Argumentar, pregunta 3 |
| Varios huecos escritos no fijaban el tiempo solicitado y uno tampoco fijaba la persona. | Se especifican presente/imperfecto/pluscuamperfecto de subjuntivo y yo cuando es necesario. | Controles B2, preguntas 3, 8 y 12; C1, preguntas 8 y 11 |
| Un futuro compuesto podía interpretarse sin una referencia temporal suficiente. | Se añade una hora actual, falta de confirmación y una inferencia explícita. | Control C1, pregunta 3 |
| La ficha atribuía estructuras diferentes a «se necesita personal» y «se necesitan camareros». | Se explica que ambas pueden ser pasivas reflejas, con sujeto singular o plural, y se contrasta con «se busca a los responsables». | Ficha Instrucciones |
| La ayuda B1 de relativos mencionaba el artículo donde debía hablar de comas. | Se corrige la explicación inglesa. | B1 Describir |
| Los quizzes B1 ofrecían ayuda en inglés para la teoría, pero no para cada corrección. | Se añaden 54 correcciones inglesas de B1 y 6 de argumentación B2, accesibles con el mecanismo bilingüe existente. | `lessonQuizEnglish` → `whyEn` |

En total se aclararon 18 enunciados: 11 de unidades y 7 de controles. No se añadieron preguntas ni se modificaron las opciones, su orden, el índice de respuesta correcta, los identificadores ni las listas de respuestas aceptadas. Se mantiene la aceptación de «las» y «se las» en el ejercicio de las fotos.

## Comprobación de compatibilidad

Se importó el contenido de la versión anterior desde Git en memoria y se comparó con la versión editada: coinciden los 36 identificadores de unidad, las opciones y respuestas de los 216 ítems de unidades y las opciones, respuestas e identificadores de los 96 ítems de gramática. Las ayudas inglesas añadidas cubren las 54 preguntas B1. El import añadido de `content.js` a `bilingual.js` no crea un ciclo: este último depende únicamente de `a2.js`.

La comprobación editorial no sustituye las pruebas de integración, que ejecuta el equipo de calidad. Conviene conservar como regresiones la aceptación de ambas respuestas del ejercicio de fotos, la indicación de verbo en saber/conocer y la cobertura de correcciones inglesas B1.

## Ruta recomendada para esta estudiante

Una sesión de 15–20 minutos puede combinar 3–5 minutos de recuperación de errores anteriores, una sola explicación con contraste, un bloque corto de preguntas y una aplicación de dos frases propias. Si hay tiempo, añadir una lectura breve o un fragmento de escucha. No hace falta terminar una unidad completa ni evaluar la conversación cada día.

El retorno a A2 debe depender del obstáculo concreto:

| Dificultad de B1 | Apoyo A2 |
| --- | --- |
| Ser, estar y concordancia | `a2-identidad`, `a2-lugares` |
| Presente, reflexivos y gustar | `a2-presente`, `a2-rutina`, `a2-gustos` |
| Indefinido e imperfecto | `a2-ayer`, `a2-antes` |
| Pronombres de objeto | `a2-pronombres` |
| Comparación y cantidad | `a2-compras` |
| Planes y obligaciones | `a2-planes` |

Este mapa es una recomendación pedagógica para la interfaz, no una nueva prueba diagnóstica. La estudiante debe poder abrir el apoyo y regresar al punto de B1 sin cambiar permanentemente su ruta.

## Prioridades para siguientes iteraciones

1. **Recuperación de errores y revisión diferida.** Mostrar errores recientes y pendientes de repaso, permitir responder antes de ver la explicación y volver a encontrarlos en otra sesión. Un acierto inmediatamente después de leer la solución no demuestra retención. La investigación sobre recuperación y espaciado apoya esta dirección general, pero no valida por sí sola un calendario concreto de 1/3/7 días para esta estudiante.
2. **Transferencia con nuevos contextos.** Añadir variantes originales de cada contraste y tareas breves de producción con modelo después del intento. Repetir exactamente el mismo banco puede mejorar la familiaridad sin garantizar que la regla se use espontáneamente. Las nuevas variantes deben tener IDs nuevos y no reemplazar posiciones guardadas.
3. **Escucha humana con evidencia verificable.** Vincular audios autorizados o recursos oficiales con transcripción, fuente y preguntas cuya respuesta pueda localizarse. Ocultar el texto durante el primer intento; mostrar fragmentos de evidencia después. Mantener las voces sintéticas como apoyo de estudio. No inferir nivel de escucha a partir del reconocimiento de un texto ya leído.
4. **Completar el feedback bilingüe de B2/C1.** La cobertura nueva completa B1; los demás quizzes de unidades todavía no tienen todos una corrección inglesa. La teoría y los controles gramaticales ya disponen de ayudas.
5. **Profundizar B2/C1.** Parte de las preguntas avanzadas evalúa conocimiento de estrategias o elección entre distractores evidentemente inadecuados. Añadir contextos discursivos, matices, referencias y evidencias de lectura antes de aumentar el recuento por sí mismo. Un curso puede practicar estas habilidades; un porcentaje de respuestas a estos ítems no equivale a un C1 acreditado.
6. **Observación con la estudiante.** Probar dos sesiones: una autónoma B1 y otra con apoyo A2. Registrar dónde duda del enunciado, qué explicación abre y si puede crear una frase nueva. Estas observaciones deben decidir la siguiente ampliación.

## Fuentes y límites

- [RAE/ASALE, DLE: conocer](https://dle.rae.es/conocer). Consultado el 17 de octubre de 2026. Sus acepciones incluyen entender o saber algo; respalda evitar la falsa exclusión de conocer para información. La aplicación a «conozco la respuesta» es una decisión editorial de esta revisión.
- [RAE/ASALE, DPD: se, apartados 2.1–2.2](https://www.rae.es/dpd/se). Consultado el 17 de octubre de 2026. Distingue la concordancia de la pasiva refleja de la impersonal con objeto de persona introducido por a. Sirve de base para corregir la ficha.
- [Consejo de Europa: volumen complementario del MCER y versiones lingüísticas](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions). Referencia oficial para describir competencias y actividades. Se mantiene la distinción entre orientaciones de estudio y certificación.
- [Koval, Testing the reminding account of the lag effect in L2 vocabulary learning](https://doi.org/10.1017/S0142716421000370). Artículo original, publicado en línea en 2021. El resumen informa de un estudio de vocabulario finés con angloparlantes y relaciona los beneficios del espaciado con recuperación esforzada y exitosa. Justifica investigar recuperación diferida con feedback; extrapolar a gramática española, fluidez y un intervalo específico requiere comprobación adicional.
- [Instituto Cervantes: inventario gramatical B1–B2](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_b1-b2.htm). Es una referencia curricular ya utilizada por el proyecto. En la consulta de esta revisión redirigió a mantenimiento; no se presenta como contenido nuevamente verificado ni se cambiaron formatos DELE a partir de esa página.

Las correcciones y traducciones son redacción original. No se han copiado preguntas de exámenes oficiales ni se atribuye a Cervantes la validación de este banco.
