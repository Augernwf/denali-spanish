# Final learning UX and accessibility review

Reviewed 18 October 2026. This is a static review of the study flow, search, question data and responsive CSS. No browser, screen-reader or device-width checks were run; those remain for the parent task. The earlier editorial scope and learner profile are in [LEARNING-REVIEW.md](LEARNING-REVIEW.md).

## Findings and status

### Addressed in this review

- **English feedback for the six original B1–C1 reading texts — fixed.** Their 24 questions lacked English explanations in review. Added `whyEn` for each question in `dist/practice.js`, leaving prompts, answers and option rotation untouched. A read-only data check confirms all four explanations are available for each of the six texts. The B1 lesson and grammar feedback paths were already complete; all B1 grammar-bank and extra-drill questions also resolve to English feedback.

### Remaining findings

1. **A2 support changes the saved route instead of acting as temporary support (high).** The dashboard says A2 can reinforce a specific obstacle, but its link opens the general A2 route and the click handler saves `state.level = 'A2'`. This conflicts with the learning review’s recommendation to return to the learner’s B1 point without changing the route permanently. The parent task is addressing this with temporary A2 support navigation.

2. **A wrong review answer can immediately repeat and delay other due errors (high).** The review takes the first eight due questions. Wrong answers remain due today; “Next review” re-renders the same sorted queue. A learner can see the same miss again immediately, and eight repeatedly missed low-sorting keys can keep later due items out of the batch. The parent task is rotating already-seen items so the queue can advance.

3. **Grammar search results do not open the grammar fiche they advertise (medium).** Search results are labelled “Ficha de gramática” but their links go to the associated lesson. All topic-to-lesson IDs were checked and resolve, so this is a destination mismatch rather than a broken link. The parent task is adding direct `#topic/id` views.

4. **English search still has gaps in its indexed text (medium).** The current catalog includes English unit-section text and the grammar rule, but omits English topic traps and strategies, reading task translations and glossaries. A read-only query check found useful results for “past tense” and “preterite”, while “vocabulary for cooking” produced none. The parent task is expanding this index to include those fields and visual aliases.

5. **“Accents are optional” overstates search normalization (low).** Search ignores acute accents and diaeresis, but preserves `ñ` because it is a distinct letter in Spanish. Clarify that written accents are ignored while `ñ` remains distinct, so a learner does not expect `ano` to match `año`.

6. **Route selection loses keyboard focus after rerender (medium).** Selecting a level card replaces the focused button without restoring focus. Changing the header’s route selector also rerenders without restoring focus; the session-length selector already demonstrates the needed refocus behavior. Restore focus to the selected card or header selector after rendering.

7. **Mobile quiz choices become quite small (low, static observation).** At widths under 760px, the base stylesheet reduces answer-option text to 12px. The radio control and label remain tappable, and the new study layout stacks its search and dashboard surfaces, but the reduced choice text deserves a visual check on narrow phones and at increased text size.

## Checks completed

- Confirmed all grammar-topic unit links resolve to existing lessons.
- Confirmed all grammar-bank and extra-drill items at A2, B1, B2 and C1 have English explanations.
- Confirmed all 24 original B1–C1 reading questions now have English explanations.
- Confirmed the B1 lesson-question English feedback is complete; the B1 reading questions were the uncovered feedback path.
- Reviewed the review batching, level-switching, search indexing and mobile CSS statically. No test suite or browser was run.

The user-facing score language generally keeps practice separate from proficiency: grammar reports call the result a score in this bank, and the reference page says the app has not certified or measured anyone’s CEFR level. Keep that distinction in any new route and support copy.

## Cierre de integración — 18 de octubre de 2026
Los puntos 1–6 anteriores quedaron resueltos por integración: apoyo temporal A2, rotación de tandas, fichas propias, índice bilingüe ampliado, aclaración de ñ y foco tras elegir tarjeta. El selector superior conserva su nodo y su foco. El punto 7 se comprobó en navegador: study.css mantiene opciones a 16 px a 390 px de ancho. Los textos fuente del repaso están disponibles en un desplegable. Véase VERIFICATION.md para los recorridos y límites. Esta actualización registra la comprobación del equipo principal; no añade una segunda auditoría independiente.
