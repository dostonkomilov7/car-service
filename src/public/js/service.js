document.addEventListener('DOMContentLoaded', () => {

  const titleInput = document.getElementById('title');
  const descInput = document.getElementById('description');
  const priceInput = document.getElementById('price');
  const previewTitle = document.getElementById('previewTitle');
  const previewDesc = document.getElementById('previewDesc');
  const previewPrice = document.getElementById('previewPrice');

  titleInput.addEventListener('input', () => {
    const val = titleInput.value.trim();
    previewTitle.textContent = val || 'Service Title';
  });

  priceInput.addEventListener('input', () => {
    const val = priceInput.value.trim();
    previewPrice.textContent = val || 'Price';
  });

  descInput.addEventListener('input', () => {
    const val = descInput.value.trim();
    previewDesc.textContent = val
      ? val.slice(0, 90) + (val.length > 90 ? '...' : '')
      : 'Your description will appear here...';
  });

});