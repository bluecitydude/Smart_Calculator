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

Option A — Open directly (quick)
1. Open the file `d:/xampp/htdocs/Calculator/index.html` in your browser.
2. Use the UI or your keyboard to try calculations.

Option B — Serve via XAMPP (recommended for a local server URL)
1. Place this folder under your XAMPP `htdocs` (already in `d:/xampp/htdocs/Calculator`).
2. Start Apache from the XAMPP Control Panel.
3. Open `http://localhost/Calculator/` in your browser.

Usage & Controls
- Click/tap buttons or type on your keyboard.
- Keyboard: digits, `+ - * / ^ ( )`, `.` for decimal, `Enter` for equals, `Backspace` for DEL, `Escape` for AC.
- Press `M+` / `M-` to update memory, `MR` to recall, `MC` to clear memory.
- Use the theme button (top-right) to toggle light/dark themes.
- Use the `Clear` button in the History header to clear stored history.

Testing / Smoke checks
- 2 + 2 = 4
- 2 + 3 * 4 = 14 (operator precedence)
- (2 + 3) * 4 = 20 (parentheses)
- 2 ^ 8 = 256 (exponentiation)
- -5 + 2 = -3 (unary minus)
- 50 % = 0.5 (percent)
- Check memory operations and that history entries show up and can be clicked to paste expressions.

Implementation notes
- The evaluator uses a tokenizer + shunting-yard algorithm to convert expressions to Reverse Polish Notation (RPN), then evaluates the RPN. This prevents executing arbitrary code strings and improves safety.
- Supported operators: `+ - * / ^` (exponent), unary `-`, postfix `%`, and parentheses.

Known issues & troubleshooting
- If dark theme appears to hide some controls, try reloading the page — recent updates set explicit dark-mode colors for header controls and the theme toggle. If you still see issues, report the browser and how you're serving the file (direct file:// or via http://localhost).

Next steps / Improvements
- Add more scientific functions (sin/cos/log), expression editing, or copy-to-clipboard for results
- Add automated unit tests for the tokenizer/evaluator
- Add accessibility improvements (aria labels, better focus order)

License
- This project is provided without a license; add a LICENSE file if you want to set terms for reuse.

Questions or changes
- Tell me what you'd like tweaked (colors, extra functions, behavior) and I can update the code.
