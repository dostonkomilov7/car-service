document.addEventListener('DOMContentLoaded', () => {

  // Alert dismiss
  document.addEventListener('click', (e) => {
    if (e.target.matches('.alert__close')) {
      const alert = e.target.closest('.alert');
      alert.style.transition = 'opacity 0.2s, transform 0.2s';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-4px)';
      const pathname = window.location.pathname
      window.history.replaceState({}, '', pathname);
      setTimeout(() => alert.remove(), 200);
    }
  });

  // Auto-dismiss (5 sekunddan keyin o'z-o'zidan o'chadi)
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      if (!document.contains(alert)) return;
      alert.style.transition = 'opacity 0.4s, transform 0.4s';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-4px)';
      const pathname = window.location.pathname
      window.history.replaceState({}, '', pathname);
      setTimeout(() => alert.remove(), 400);
    }, 5000);
  });

});