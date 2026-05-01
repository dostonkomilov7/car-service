document.addEventListener('DOMContentLoaded', () => {
  const pwInput      = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const strengthBar  = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');
  const matchCheck   = document.getElementById('matchCheck');
  const matchError   = document.getElementById('matchError');
  const form         = document.getElementById('resetForm');

  if (!pwInput) return;

  // ── Eye toggle ─────────────────────────────────────
  document.querySelectorAll('.input-eye__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.classList.toggle('active', !isText);
    });
  });

  // ── Password strength ──────────────────────────────
  const rules = {
    len:   { el: document.getElementById('rule-len'),   test: v => v.length >= 8 },
    upper: { el: document.getElementById('rule-upper'), test: v => /[A-Z]/.test(v) },
    num:   { el: document.getElementById('rule-num'),   test: v => /[0-9!@#$%^&*]/.test(v) },
  };

  const checkSVG  = `<svg class="pw-rule__icon" width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l3 3 5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const circleSVG = `<svg class="pw-rule__icon" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/></svg>`;

  const levelLabels = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG'];

  pwInput.addEventListener('input', () => {
    const val = pwInput.value;
    let score = 0;

    Object.values(rules).forEach(({ el, test }) => {
      const passed = test(val);
      el.classList.toggle('passed', passed);
      el.querySelector('.pw-rule__icon').outerHTML; // trigger repaint trick
      el.innerHTML = (passed ? checkSVG : circleSVG) + el.textContent.trim();
      if (passed) score++;
    });

    // Bonus point for long password
    if (val.length >= 12) score = Math.min(score + 1, 4);

    if (val.length === 0) {
      strengthBar.removeAttribute('data-level');
      strengthLabel.textContent = '';
    } else {
      strengthBar.dataset.level = score;
      strengthLabel.textContent = levelLabels[score] || '';
    }

    checkMatch();
  });

  // ── Confirm match ──────────────────────────────────
  function checkMatch() {
    const pw  = pwInput.value;
    const cpw = confirmInput.value;
    if (!cpw) {
      matchCheck.hidden = true;
      matchError.hidden = true;
      confirmInput.classList.remove('input--error', 'input--success');
      return;
    }
    const match = pw === cpw;
    matchCheck.hidden  = !match;
    matchError.hidden  = match;
    confirmInput.classList.toggle('input--error',   !match);
    confirmInput.classList.toggle('input--success',  match);
  }

  confirmInput.addEventListener('input', checkMatch);

  // ── Form submit guard ──────────────────────────────
  form.addEventListener('submit', e => {
    if (pwInput.value !== confirmInput.value) {
      e.preventDefault();
      checkMatch();
      confirmInput.focus();
    }
  });
});