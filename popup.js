document.getElementById("start-button").addEventListener("click", () => {
  const bin = document.getElementById("bin-input").value.trim();
  if (!bin) {
    alert("Please enter a valid BIN.");
    return;
  }

  // Clear previous status updates
  const statusList = document.getElementById("status-list");
  statusList.innerHTML = "";

  // Send BIN to the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "start", bin });
  });
});

// Listen for status updates from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "status-update") {
    const statusList = document.getElementById("status-list");
    const listItem = document.createElement("li");
    listItem.textContent = message.status;
    statusList.appendChild(listItem);
  }
});
