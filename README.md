# Calculator (Modern, Responsive)

A sleek, responsive calculator web app with keyboard support, memory, history, and a safe expression evaluator.

Features
- Responsive UI with light/dark themes and animations
- Full calculator functionality: parentheses, exponentiation (`^`), percent, sqrt, reciprocal
- Memory buttons: `MC`, `MR`, `M+`, `M-`
- History panel (persisted to `localStorage`) with a clear-history button
- Keyboard support: numbers, operators, Enter (equals), Backspace (DEL), Escape (AC)
- Safe expression evaluation using a shunting-yard → RPN evaluator (no `eval`/`Function` execution)

Files
- `index.html` — application entry + markup
- `assets/css/style.css` — styles, themes, animations
- `assets/js/script.js` — calculator logic, tokenizer, shunting-yard parser, RPN evaluator, UI wiring

Quick start

Link:<a href="https://codepen.io/bluecitydude">Click Here</a><br>
Usage & Controls
- Click/tap buttons or type on your keyboard.
- Keyboard: digits, `+ - * / ^ ( )`, `.` for decimal, `Enter` for equals, `Backspace` for DEL, `Escape` for AC.
- Press `M+` / `M-` to update memory, `MR` to recall, `MC` to clear memory.
- Use the theme button (top-right) to toggle light/dark themes.
- Use the `Clear` button in the History header to clear stored history.





