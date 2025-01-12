chrome.storage.local.get(['settings'], (result) => {
  const settings = result.settings;
  if (!settings || !settings.cardDetails) return;

  const cardLines = settings.cardDetails.split('\n');
  const [cardNumber, month, year, cvv] = cardLines[0].split('|');

  const inputs = document.querySelectorAll('input');
  let filled = false;
  inputs.forEach(input => {
    if (input.name.toLowerCase().includes('card')) {
      input.value = cardNumber;
      filled = true;
    }
    if (input.name.toLowerCase().includes('expiry')) input.value = `${month}/${year}`;
    if (input.name.toLowerCase().includes('cvv')) input.value = cvv;
  });

  if (!filled) {
    chrome.runtime.sendMessage({ action: 'retry' });
  }
});
