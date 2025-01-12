chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startAutofill") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
    });
  }
});
