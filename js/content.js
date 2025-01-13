(function () {
    let retryCount = 0;
    const maxRetries = 10;
    let autoRetryEnabled = false;

    // Create the popup container
    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";

    // Create the header
    const header = document.createElement("div");
    header.id = "popup-header";
    header.textContent = "Philo Tool";

    // Create the status message
    const statusMessage = document.createElement("div");
    statusMessage.id = "popup-status";
    statusMessage.textContent = "Idle";

    // Create BIN/Extrap input
    const binInput = document.createElement("input");
    binInput.type = "text";
    binInput.placeholder = "Enter BIN/Extrap";

    // Load saved BIN/Extrap on load
    chrome.storage.local.get(["bin"], (result) => {
        if (result.bin) {
            binInput.value = result.bin;
        }
    });

    // Create Auto Retry toggle
    const autoRetryToggle = document.createElement("div");
    autoRetryToggle.id = "auto-retry-toggle";
    const retryCheckbox = document.createElement("input");
    retryCheckbox.type = "checkbox";
    retryCheckbox.id = "retry-checkbox";
    retryCheckbox.addEventListener("change", () => {
        autoRetryEnabled = retryCheckbox.checked;
    });
    const retryLabel = document.createElement("label");
    retryLabel.textContent = "Enable Auto Retry";
    retryLabel.setAttribute("for", "retry-checkbox");
    autoRetryToggle.appendChild(retryCheckbox);
    autoRetryToggle.appendChild(retryLabel);

    // Create Retry Count display
    const retryCountDisplay = document.createElement("div");
    retryCountDisplay.id = "retry-count-display";
    retryCountDisplay.textContent = `Retry Count: ${retryCount}`;

    // Create buttons
    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.addEventListener("click", () => {
        const bin = binInput.value.trim();
        if (bin) {
            statusMessage.textContent = "Starting process...";
            retryCount = 0;
            retryCountDisplay.textContent = `Retry Count: ${retryCount}`;
            processWithRetry(bin);
        } else {
            statusMessage.textContent = "Please enter BIN/Extrap.";
        }
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
        const bin = binInput.value.trim();
        if (bin) {
            chrome.storage.local.set({ bin }, () => {
                statusMessage.textContent = "BIN/Extrap saved.";
            });
        } else {
            statusMessage.textContent = "Please enter BIN/Extrap.";
        }
    });

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.addEventListener("click", () => {
        retryCount = maxRetries; // Stop retry loop
        statusMessage.textContent = "Process stopped.";
    });

    // Add elements to the popup
    popupContainer.appendChild(header);
    popupContainer.appendChild(binInput);
    popupContainer.appendChild(saveButton);
    popupContainer.appendChild(autoRetryToggle);
    popupContainer.appendChild(startButton);
    popupContainer.appendChild(stopButton);
    popupContainer.appendChild(retryCountDisplay);
    popupContainer.appendChild(statusMessage);

    // Append the popup to the body
    document.body.appendChild(popupContainer);

    // Function to generate or parse card details
    function parseOrGenerateCard(input) {
        let bin, expiryMonth, expiryYear, cvv, cardNumber;

        if (input.includes("|")) {
            const parts = input.split("|");
            bin = parts[0];
            expiryMonth = parts[1];
            expiryYear = parts[2];
            cvv = parts[3];
            console.log(`Using provided details: BIN=${bin}, Expiry=${expiryMonth}/${expiryYear}, CVV=${cvv}`);

            const randomNumber = bin + Math.floor(Math.random() * Math.pow(10, 15 - bin.length)).toString().padStart(15 - bin.length, '0');
            const luhnDigit = calculateLuhn(randomNumber);
            cardNumber = randomNumber + luhnDigit;

        } else {
            bin = input;
            const randomNumber = bin + Math.floor(Math.random() * Math.pow(10, 15 - bin.length)).toString().padStart(15 - bin.length, '0');
            const luhnDigit = calculateLuhn(randomNumber);
            cardNumber = randomNumber + luhnDigit;

            expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
            expiryYear = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(2);
            cvv = String(Math.floor(Math.random() * 900) + 100);

            console.log(`Generated details: Card=${cardNumber}, Expiry=${expiryMonth}/${expiryYear}, CVV=${cvv}`);
        }

        return { cardNumber, expiryMonth, expiryYear, cvv };
    }

    // Function to calculate Luhn checksum
    function calculateLuhn(cardNumberWithoutCheckDigit) {
        let sum = 0;
        const reverseDigits = cardNumberWithoutCheckDigit.split("").reverse();

        for (let i = 0; i < reverseDigits.length; i++) {
            let digit = parseInt(reverseDigits[i], 10);
            if (i % 2 === 0) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }

        return (10 - (sum % 10)) % 10;
    }

    // Function to autofill and submit card details inside iframe
    function autofillAndSubmit({ cardNumber, expiryMonth, expiryYear, cvv }) {
        // Locate the iframe containing the card details
        const iframe = document.querySelector("iframe[name='stripe-card-frame']"); // Update iframe selector based on your inspection

        if (!iframe) {
            console.error("Iframe not found. Ensure the iframe selector is correct.");
            statusMessage.textContent = "Iframe not found.";
            return;
        }

        // Access the iframe's document
        const iframeDocument = iframe.contentWindow.document;

        // Locate fields inside the iframe
        const cardField = iframeDocument.querySelector("input[name='cardnumber']") || 
                          iframeDocument.querySelector("input[placeholder='Card Number']");
        const expiryField = iframeDocument.querySelector("input[name='exp-date']") || 
                            iframeDocument.querySelector("input[placeholder='MM / YY']");
        const cvvField = iframeDocument.querySelector("input[name='cvc']") || 
                         iframeDocument.querySelector("input[placeholder='CVC']");
        const submitButton = iframeDocument.querySelector("button[type='submit']") || 
                             iframeDocument.querySelector("button[class*='submit']");

        if (!cardField || !expiryField || !cvvField) {
            console.error("Card fields not found. Ensure the field selectors are correct.");
            statusMessage.textContent = "Card fields not found.";
            return;
        }

        // Autofill card details
        cardField.value = cardNumber;
        expiryField.value = `${expiryMonth}/${expiryYear}`;
        cvvField.value = cvv;

        console.log("Autofilled card details:", { cardNumber, expiryMonth, expiryYear, cvv });

        // Submit the form if the button is found
        if (submitButton) {
            console.log("Submitting form...");
            submitButton.click();
        } else {
            console.error("Submit button not found.");
        }
    }

    // Function to retry process
    function processWithRetry(bin) {
        if (retryCount >= maxRetries) {
            statusMessage.textContent = "Max retries reached.";
            return;
        }

        const cardDetails = parseOrGenerateCard(bin);
        retryCount++;
        retryCountDisplay.textContent = `Retry Count: ${retryCount}`;

        autofillAndSubmit(cardDetails);

        if (autoRetryEnabled) {
            setTimeout(() => processWithRetry(bin), 3000);
        }
    }
})();
