## AI Coding Challenge Reflection

- **Where AI saved time:** I used GitHub Copilot to help build features such as deck/card CRUD, modals, card flipping, navigation, search, LocalStorage, animations, and accessibility.

- **AI bug I identified and fixed:** My active deck heading was almost invisible because styles from `index.css` were conflicting with `App.css`. I reviewed the CSS and removed the conflicting starter styles.

- **Code I improved/refactored:** Instead of creating separate modals for every deck action, the code reused the existing modal pattern for creating and editing decks, which kept the code simpler.

- **Accessibility improvement:** I improved keyboard accessibility, modal Escape-key handling, input labels, focus styles, ARIA attributes, and disabled Previous/Next buttons when navigation is unavailable.

- **How I improved my prompts:** I learned to give Copilot specific instructions such as keeping existing functionality unchanged, modifying only the necessary CSS, adding smooth animations, handling edge cases, and explaining its changes. More specific prompts produced better results.
