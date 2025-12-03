// Main calculator script — supports memory, history, keyboard and theme
(() => {
  const displayEl = document.getElementById('display');
  const exprEl = document.getElementById('expression');
  const historyList = document.getElementById('historyList');
  const historyClearBtn = document.getElementById('historyClear');
  const themeToggle = document.getElementById('themeToggle');
  const memIndicator = document.getElementById('memIndicator');

  let expr = '';           // full expression shown above
  let current = '0';       // value shown in main display
  let memory = 0;          // memory register
  let lastResult = null;
  let history = JSON.parse(localStorage.getItem('calc_history') || '[]');

  const maxHistory = 20;

  function render() {
    exprEl.textContent = expr;
    displayEl.textContent = String(current).slice(0, 20);
    memIndicator.style.visibility = memory !== 0 ? 'visible' : 'hidden';
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    const items = history.slice().reverse();
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;
      li.title = item;
      li.addEventListener('click', () => {
        expr = item.split(' = ')[0] || item;
        current = '';
        render();
      });
      if (index === 0) {
        li.classList.add('new');
        setTimeout(() => li.classList.remove('new'), 900);
      }
      historyList.appendChild(li);
    });
  }

  function pushHistory(entry) {
    history.push(entry);
    if (history.length > maxHistory) history.shift();
    localStorage.setItem('calc_history', JSON.stringify(history));
  }

  // Clear history handler
  if (historyClearBtn) {
    historyClearBtn.addEventListener('click', () => {
      history = [];
      localStorage.removeItem('calc_history');
      renderHistory();
    });
  }

  // Helpers
  function clearAll() {
    expr = '';
    current = '0';
    lastResult = null;
    render();
  }

  function delChar() {
    if (current && current !== '0') {
      current = current.slice(0, -1) || '0';
    } else if (expr) {
      expr = expr.slice(0, -1);
    }
    render();
  }

  function appendToExpr(text) {
    // append current (if any) then operator/paren
    if (current !== '' && current !== '0') {
      expr += current;
    }
    expr += text;
    current = '';
    render();
  }

  function inputDigit(d) {
    if (current === '0') current = d;
    else current = (current || '') + d;
    render();
  }

  function inputDot() {
    if (!current) current = '0.';
    else if (!current.includes('.')) current += '.';
    render();
  }

  function toggleSign() {
    if (!current || current === '0') return;
    if (current.startsWith('-')) current = current.slice(1);
    else current = '-' + current;
    render();
  }

  function applyUnary(op) {
    try {
      let val = parseFloat(current || lastResult || '0');
      if (isNaN(val)) return;
      if (op === 'sqrt') val = Math.sqrt(val);
      else if (op === 'recip') val = 1 / val;
      else if (op === 'percent') val = val / 100;
      current = String(precise(val));
      render();
    } catch (e) { current = 'Error'; render(); }
  }

  function precise(n){
    // reduce floating errors
    if (!isFinite(n)) return n;
    return Math.round((n + Number.EPSILON) * 1e12) / 1e12;
  }

  // --- Safe expression evaluator using shunting-yard (no Function/eval) ---
  function evaluateExpression() {
    try {
      let toEval = expr;
      if (current && current !== '') toEval += current;
      toEval = (toEval || '').trim();
      if (!toEval) return;

      // Allow only digits, operators, parentheses, dot, spaces and percent
      if (!/^[0-9+\-*/().^%\s]+$/.test(toEval)) {
        current = 'Error'; render(); return;
      }

      // Tokenize
      const tokens = tokenize(toEval);
      const rpn = shuntingYard(tokens);
      const result = evaluateRPN(rpn);
      const value = precise(result);
      pushHistory(`${toEval} = ${value}`);
      expr = '';
      current = String(value);
      lastResult = value;
      render();
    } catch (e) {
      current = 'Error'; render();
    }
  }

  // Tokenizer: numbers, operators, parentheses, percent
  function tokenize(s) {
    const tokens = [];
    const re = /\s*([0-9]*\.?[0-9]+|\^|\+|\-|\*|\/|\(|\)|%)/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      tokens.push(m[1]);
    }
    return tokens;
  }

  function shuntingYard(tokens) {
    const output = [];
    const ops = [];

    const precedence = { '+': 2, '-': 2, '*': 3, '/': 3, '^': 4, '%': 5, 'u-': 5 };
    const rightAssoc = { '^': true, 'u-': true };

    let prev = null;
    for (let tok of tokens) {
      if (/^[0-9]/.test(tok)) {
        output.push(tok);
        prev = 'number';
      } else if (tok === '(') {
        ops.push(tok);
        prev = '(';
      } else if (tok === ')') {
        while (ops.length && ops[ops.length-1] !== '(') output.push(ops.pop());
        ops.pop(); // pop '('
        prev = ')';
      } else if (tok === '%') {
        // percent is postfix unary
        while (ops.length && ((precedence[ops[ops.length-1]] || 0) > precedence['%'])) output.push(ops.pop());
        ops.push('%');
        prev = 'op';
      } else {
        // operator: detect unary minus
        if (tok === '-' && (prev === null || prev === 'op' || prev === '(')) {
          tok = 'u-';
        }
        while (ops.length) {
          const top = ops[ops.length-1];
          if (top === '(') break;
          const p1 = precedence[tok] || 0;
          const p2 = precedence[top] || 0;
          if (p2 > p1 || (p1 === p2 && !rightAssoc[tok])) {
            output.push(ops.pop());
            continue;
          }
          break;
        }
        ops.push(tok);
        prev = 'op';
      }
    }
    while (ops.length) output.push(ops.pop());
    return output;
  }

  function evaluateRPN(rpn) {
    const st = [];
    for (let tok of rpn) {
      if (/^[0-9]/.test(tok)) st.push(parseFloat(tok));
      else if (tok === '+') {
        const b = st.pop(), a = st.pop(); st.push(a + b);
      } else if (tok === '-') {
        const b = st.pop(), a = st.pop(); st.push(a - b);
      } else if (tok === '*') {
        const b = st.pop(), a = st.pop(); st.push(a * b);
      } else if (tok === '/') {
        const b = st.pop(), a = st.pop(); st.push(a / b);
      } else if (tok === '^') {
        const b = st.pop(), a = st.pop(); st.push(Math.pow(a, b));
      } else if (tok === 'u-') {
        const a = st.pop(); st.push(-a);
      } else if (tok === '%') {
        const a = st.pop(); st.push(a / 100);
      } else {
        throw new Error('Unknown token ' + tok);
      }
    }
    if (st.length !== 1) throw new Error('Invalid expression');
    return st[0];
  }

  // Memory operations
  function memoryClear(){ memory = 0; memIndicator.style.visibility = 'hidden'; }
  function memoryRecall(){ current = String(memory); render(); }
  function memoryAdd(){ memory = precise(memory + parseFloat(current || lastResult || 0)); memIndicator.style.visibility = memory !== 0 ? 'visible' : 'hidden'; }
  function memorySub(){ memory = precise(memory - parseFloat(current || lastResult || 0)); memIndicator.style.visibility = memory !== 0 ? 'visible' : 'hidden'; }

  // Button clicks
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // small press animation
      btn.classList.add('btn-press');
      setTimeout(() => btn.classList.remove('btn-press'), 140);
      const v = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');
      if (v) {
        if (/^[0-9]$/.test(v)) inputDigit(v);
        else if (v === '.') inputDot();
        else if (v === '(' || v === ')') appendToExpr(v);
        else if (v === '^') appendToExpr('^');
        else if (['+','-','*','/'].includes(v)) appendToExpr(v);
      } else if (action) {
        if (action === 'equals') evaluateExpression();
        else if (action === 'clear') clearAll();
        else if (action === 'del') delChar();
        else if (action === 'neg') toggleSign();
        else if (action === 'sqrt' || action === 'recip' || action === 'percent') applyUnary(action);
        else if (action === 'mc') memoryClear();
        else if (action === 'mr') memoryRecall();
        else if (action === 'mplus') memoryAdd();
        else if (action === 'mminus') memorySub();
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((/^[0-9]$/).test(key)) { inputDigit(key); e.preventDefault(); }
    else if (key === '.') { inputDot(); e.preventDefault(); }
    else if (key === 'Backspace') { delChar(); e.preventDefault(); }
    else if (key === 'Enter' || key === '=') { evaluateExpression(); e.preventDefault(); }
    else if (key === 'Escape') { clearAll(); e.preventDefault(); }
    else if (['+','-','*','/','(',')','^'].includes(key)) { appendToExpr(key); e.preventDefault(); }
    else if (key === '%') { applyUnary('percent'); e.preventDefault(); }
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('calc_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  // Restore theme and history
  if (localStorage.getItem('calc_theme') === 'dark') document.body.classList.add('dark');

  // Initial render
  render();

})();
