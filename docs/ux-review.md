# UX consistency review — 26 September 2026

## Assessment

The application had several competing visual systems: fixed green navigation and feature panels, blue dark-mode actions, coral calls to action, and inconsistent reading surfaces. Workflow problems also made some button labels unreliable. A strong UX claim would require observing learners complete real study tasks; passing a build or contrast check does not establish that.

## Changes made

| Finding                                                             | Resolution                                                                                                                                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Themes diverged across screens                                      | Centralized both palettes in `src/tokens.css`; removed fixed structural colors from navigation, heroes, details, reports, and source cards.                                                                     |
| Action and status colors overlapped                                 | Coral consistently identifies actions and selection. Green, amber, and rose identify success, pending/attention, and errors. Body text uses neutral colors. Java retains its dedicated syntax and diff palette. |
| Inconsistent control and panel shapes                               | Shared card/control radii, 44px primary controls, consistent focus treatment, and comparable page spacing.                                                                                                      |
| Decorative dashboard area and repeated starting actions             | Replaced the orbit illustration with real objective coverage; made the method panel informational and consolidated the main daily-practice action.                                                              |
| “Start” sometimes resumed another activity                          | Daily-practice entry points name the actual resume destination, including an active timed benchmark.                                                                                                            |
| Starting another activity silently replaced unfinished work         | Added an accessible continue-or-replace dialog with keyboard focus containment and a clear explanation of what is retained.                                                                                     |
| Objective tiles did not open their objective                        | Tiles now select the correct material. Search includes rules and clears unrelated selected detail. Stacked layouts focus the opened detail and return focus on close.                                           |
| Empty review pages ended the learning flow                          | Added context-specific explanations and a practice action.                                                                                                                                                      |
| Coverage chart bars used relative ranking                           | Bars now represent explored/available questions; coverage and accuracy are both labelled and remain visible on mobile.                                                                                          |
| Mutation reports hid status on phones                               | Kept status labels visible and exposed experiment status in navigation labels. Domain names now match the atlas.                                                                                                |
| Small code notes and inaccessible horizontal scrolling              | Increased note/Copy readability and made code containers keyboard focusable.                                                                                                                                    |
| Session bar disagreed with completion text                          | Both use the same completed count. Leaving a benchmark explicitly says its timer continues.                                                                                                                     |
| Timed runs forced a linear path and exposed familiar practice items | Added three isolated 50-question forms with mixed ordering, previous/jump navigation, answer editing, flags, unanswered states, final review, and first-attempt versus retake evidence.                         |
| Broad domain totals could hide an unstudied subtopic                | Added 31 atomic objective checks to the atlas and evidence view, backed by explicit gap-closing practice items.                                                                                                 |
| The circular benchmark counter overlapped controls on phones        | Reflowed it into a full-width summary row below the mobile actions.                                                                                                                                             |

## Verification

- Reviewed the dashboard, atlas, practice, Mutation Lab, benchmark, review, evidence, and sources in light and dark themes.
- DOM-based contrast checks found no failing enabled text in the eight main screens. Also checked correct practice feedback and incorrect mutation feedback in both themes. These checks are not a full accessibility certification.
- Checked all eight route layouts at a confirmed 320px viewport without document overflow, plus desktop and 390px study interactions. Rechecked the revised benchmark launch and question screens at 390×844.
- Exercised objective selection, search filtering, mobile detail focus/return, dialog keyboard containment, continuing a session, replacing it, answer feedback, and mutation report states.
- Exercised a full mock workflow on a separate local origin: answer persistence across reload, flagging, arbitrary navigation, clearing a response, final-review counts, submission confirmation, domain/pace reporting, and first-attempt history.
- Workflow tests used a separate local origin to keep test responses away from the main workspace’s study history.
- The production build and full automated suite pass, including 13 JDK 25 compiler/runtime/source-launch witnesses.

## Next validation

Observe learners finding a rule, completing a practice set, comparing mutation code, and returning to missed questions. Measure completion, navigation mistakes, and reading comfort during longer sessions before making a claim about exceptional usability or learning effectiveness.
