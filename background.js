let retries = 0;
let maxRetries = 5;
let retryInterval = 2000;

chrome.storage.local.get(['settings'], (result) => {
  const settings = result.settings || {};
  maxRetries = settings.maxRetries || 5;
  retryInterval = settings.retryInterval || 2000;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'retry') {
    if (retries < maxRetries) {
      retries++;
      console.log(`Retrying... Attempt ${retries}`);
      chrome.tabs.reload(sender.tab.id);
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'retry' });
      }, retryInterval);
    } else {
      retries = 0;
      console.log('Retry limit reached.');
    }
  }
});
