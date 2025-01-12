const primaryBin = document.getElementById('primaryBin');
const secondaryBin = document.getElementById('secondaryBin');
const generateKey = document.getElementById('generateKey');
const clearKey = document.getElementById('clearKey');
const retryInterval = document.getElementById('retryInterval');
const maxRetries = document.getElementById('maxRetries');
const cardDetails = document.getElementById('cardDetails');
const saveSettings = document.getElementById('saveSettings');
const resetDefaults = document.getElementById('resetDefaults');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get(['settings'], (result) => {
  const settings = result.settings || {};
  primaryBin.value = settings.primaryBin || '';
  secondaryBin.value = settings.secondaryBin || '';
  generateKey.value = settings.generateKey || '';
  clearKey.value = settings.clearKey || '';
  retryInterval.value = settings.retryInterval || 2000;
  maxRetries.value = settings.maxRetries || 5;
  cardDetails.value = settings.cardDetails || '';
});

// Save settings
saveSettings.addEventListener('click', () => {
  const settings = {
    primaryBin: primaryBin.value,
    secondaryBin: secondaryBin.value,
    generateKey: generateKey.value,
    clearKey: clearKey.value,
    retryInterval: parseInt(retryInterval.value, 10),
    maxRetries: parseInt(maxRetries.value, 10),
    cardDetails: cardDetails.value,
  };
  chrome.storage.local.set({ settings }, () => {
    statusDiv.innerText = 'Settings saved successfully!';
    setTimeout(() => (statusDiv.innerText = ''), 3000);
  });
});

// Reset to defaults
resetDefaults.addEventListener('click', () => {
  primaryBin.value = '';
  secondaryBin.value = '';
  generateKey.value = '';
  clearKey.value = '';
  retryInterval.value = 2000;
  maxRetries.value = 5;
  cardDetails.value = '';
  chrome.storage.local.set({ settings: {} }, () => {
    statusDiv.innerText = 'Settings reset to defaults!';
    setTimeout(() => (statusDiv.innerText = ''), 3000);
  });
});
