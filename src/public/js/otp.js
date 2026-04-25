const digits  = document.querySelectorAll('.otp-digit');
const otpHidden = document.getElementById('otpValue');
const form = document.querySelector('form');

// 1. Har bir qutiga faqat raqam kiritish va keyingisiga o'tish
digits.forEach((input, i) => {

  input.addEventListener('input', (e) => {
    // Faqat raqamni qoldirish
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val.slice(-1); // faqat 1 ta belgi

    // Keyingi qutiga o'tish
    if (val && i < digits.length - 1) {
      digits[i + 1].focus();
    }
  });

  // Backspace bosilganda oldingiga qaytish
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      digits[i - 1].focus();
    }
  });

  // Emaildan nusxa olsa (paste) — barchasini to'ldirish
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')   // faqat raqamlar
      .slice(0, 6);

    [...pasted].forEach((char, j) => {
      if (digits[i + j]) digits[i + j].value = char;
    });

    // Oxirgi to'ldirilgan qutiga focus
    const next = digits[Math.min(i + pasted.length, digits.length - 1)];
    if (next) next.focus();
  });
});

// 2. Forma yuboriladigan payt — barcha raqamlarni birlashtirish
form.addEventListener('submit', (e) => {
  const code = [...digits].map(d => d.value).join('');

  // Tekshirish: 6 ta raqam to'liq kiritilganmi?
  if (code.length < 6) {
    e.preventDefault();
    alert('Iltimos, 6 ta raqamni kiriting.');
    digits[0].focus();
    return;
  }

  // Hidden fieldga yozish
  otpHidden.value = code;
  // Forma yuboriladi → POST /booking/confirm → body.otp = "374192"
});