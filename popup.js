const themeToggle = document.getElementById("themeToggle");
const status = document.getElementById("status");
const logs = [];
const successSound = document.getElementById("successSound");
const errorSound = document.getElementById("errorSound");

// Toggle between light and dark themes
themeToggle.addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  document.documentElement.setAttribute("data-theme", isChecked ? "dark" : "light");
  document.querySelector(".theme-label").textContent = isChecked ? "Dark Mode" : "Light Mode";
});

// Form submission
document.getElementById("configForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const bin = document.getElementById("binInput").value.trim();
  const retryCount = parseInt(document.getElementById("retryCount").value, 10);
  const successKeyword = document.getElementById("successKeyword").value.trim();

  const binRegex = /^\d{6,16}$/;

  if (!binRegex.test(bin)) {
    errorSound.play();
    logAction("Invalid BIN entered.");
    status.textContent = "Status: Invalid BIN. Please enter 6–16 digits.";
    status.className = "error";
    return;
  }

  if (!retryCount || retryCount <= 0) {
    errorSound.play();
    logAction("Invalid retry count entered.");
    status.textContent = "Status: Invalid retry count. Please enter a positive number.";
    status.className = "error";
    return;
  }

  logAction(`Autofill started with BIN: ${bin}, Retries: ${retryCount}, Keyword: ${successKeyword || "None"}`);
  status.textContent = "Status: Autofill started!";
  status.className = "success";
  successSound.play();

  // Save settings for content script
  await chrome.storage.local.set({
    bin,
    retryCount,
    successKeyword,
  });

  chrome.runtime.sendMessage({ type: "startAutofill" });
});

// Log actions
function logAction(message) {
  const timestamp = new Date().toISOString();
  logs.push(`[${timestamp}] ${message}`);
  console.log(`[${timestamp}] ${message}`);
}

// Download logs
document.getElementById("downloadLogs").addEventListener("click", () => {
  const blob = new Blob([logs.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "autofill_logs.txt";
  a.click();
  URL.revokeObjectURL(url);
  logAction("Logs downloaded.");
});
