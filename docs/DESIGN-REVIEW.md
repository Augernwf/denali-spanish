# Study design and accessibility review

This review keeps Denali's rose/plum day and night palettes, serif headings and flower, while giving study content priority over decoration. B1 remains the initial route; A2 is available as support.

## Implemented

- Added `dist/study.css`, intended as the final stylesheet after `visuals.css`. It consolidates the study-facing improvements without rewriting lesson templates or data.
- Increased lesson prose, transcripts, questions and answer choices to 16 px, with 15 px bilingual explanations and feedback. Metadata is generally 12–14 px rather than the previous 8–11 px. Small-screen rules retain readable text rather than shrinking it further.
- Limited prose to approximately 72 characters per line, added space between examples and questions, and clarified heading/card hierarchy. Reading and correction content now have comparable visual importance.
- Increased ordinary controls, topic filters, diagram buttons and primary navigation targets to at least 44 px. Input text stays at 16 px on small screens. Radio/checkbox targets also benefit from their full clickable labels.
- Strengthened light and dark input borders, preserved high-contrast accent text, added a focused answer-label outline, a contrasting hero focus indicator and forced-colors support. Selected options have a visible inset edge in addition to background color.
- Kept mobile navigation horizontally scrollable with a visible thin scrollbar, clear selected state, nonshrinking links and readable labels. The topbar wraps when needed. At the narrowest widths its visible route label becomes visually hidden rather than inaccessible.
- Reflowed lesson metadata beneath content on small screens and kept tables horizontally scrollable. Long labels can wrap without forcing the page wider.
- Added shared presentation hooks for the daily plan, cross-library search and error review. The root agent owns their semantic markup and application behavior.
- Removed the render-blocking third-party Google Fonts import. Sans-serif text uses the device's system font; Georgia remains the serif family. The site no longer depends on a font request for its typography.
- Expanded reduced-motion handling to pseudo-elements and animations. Added print styles for lesson text, examples, diagrams and answer feedback; modern browsers expose collapsed details through `::details-content` when printing.

## Review boundaries

Calculated contrast against the standard card surface: light text 11.44:1, light muted text 6.27:1, light accent text 6.59:1 and light input borders 3.88:1; dark text 12.31:1, dark muted text 8.15:1, dark accent text 8.10:1 and dark input borders 4.26:1. These calculations cover the palette pairs, not every rendered state. `git diff --check` reports no whitespace errors.

This is a focused design/accessibility improvement, not a certification of WCAG conformance. UI behavior, keyboard focus after routing, accessible control names, answer status announcements and final screenshots are checked by the integration/quality team. Important checks: 320/390 px layouts, 200% zoom, both themes, keyboard-only controls, long translated text and printed lesson output.

The CSS keeps all educational content available in the document. Diagrams still use text labels alongside color. Browser support for printing closed `<details>` varies; users can open the sections they want to print if the browser does not support `::details-content`.

## Recommended future iteration

1. Observe which navigation destinations are used most often on a phone, then consider reducing top-level navigation rather than making text smaller.
2. Add an optional reading-width/text-size preference only if the learner requests it; current defaults already favor legibility.
3. Review the daily plan against actual study sessions before adding streaks or further progress decoration. The most useful next action should remain the clearest item.
