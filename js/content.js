(function () {
    let retryCount = 0;
    const maxRetries = 10;
    let autoRetryEnabled = false;

    /**
     * Main initializer function
     */
    function initPhiloTool() {
        createUI();
    }

    /**
     * Creates the user interface with animations
     */
    function createUI() {
        const popupContainer = createPopupContainer();
        const header = createHeader();
        const binInput = createBINInput();
        const autoRetryToggle = createAutoRetryToggle();
        const retryCountDisplay = createRetryCountDisplay();
        const statusMessage = createStatusMessage();
        const buttons = createButtons(binInput, statusMessage, retryCountDisplay);

        // Append elements to the container
        popupContainer.appendChild(header);
        popupContainer.appendChild(binInput);
        popupContainer.appendChild(buttons.saveButton);
        popupContainer.appendChild(autoRetryToggle);
        popupContainer.appendChild(buttons.startButton);
        popupContainer.appendChild(buttons.stopButton);
        popupContainer.appendChild(retryCountDisplay);
        popupContainer.appendChild(statusMessage);

        document.body.appendChild(popupContainer);
        injectStyles();
    }

    /**
     * Creates the popup container element
     */
    function createPopupContainer() {
        const popupContainer = document.createElement("div");
        popupContainer.id = "popup-container";
        popupContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            padding: 15px;
            border-radius: 10px;
            background: linear-gradient(135deg, #4e54c8, #8f94fb);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            color: white;
            z-index: 100000;
            animation: slide-in 0.5s ease-out;
        `;
        return popupContainer;
    }

    /**
     * Creates the header element
     */
    function createHeader() {
        const header = document.createElement("div");
        header.id = "popup-header";
        header.textContent = "Philo Tool";
        header.style.cssText = `
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        `;
        return header;
    }

    /**
     * Creates the BIN input field
     */
    function createBINInput() {
        const binInput = document.createElement("input");
        binInput.type = "text";
        binInput.placeholder = "Enter BIN/Extrap";
        binInput.style.cssText = `
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border: none;
            outline: none;
            font-size: 14px;
            color: black;
        `;

        // Load saved BIN on load
        chrome.storage.local.get(["bin"], (result) => {
            if (result.bin) {
                binInput.value = result.bin;
            }
        });
        return binInput;
    }

    /**
     * Creates the auto retry toggle
     */
    function createAutoRetryToggle() {
        const autoRetryToggle = document.createElement("div");
        autoRetryToggle.id = "auto-retry-toggle";
        autoRetryToggle.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        `;
        const retryCheckbox = document.createElement("input");
        retryCheckbox.type = "checkbox";
        retryCheckbox.id = "retry-checkbox";
        retryCheckbox.addEventListener("change", () => {
            autoRetryEnabled = retryCheckbox.checked;
        });
        const retryLabel = document.createElement("label");
        retryLabel.textContent = "Enable Auto Retry";
        retryLabel.setAttribute("for", "retry-checkbox");
        retryLabel.style.cssText = `
            margin-left: 5px;
            font-size: 14px;
        `;
        autoRetryToggle.appendChild(retryCheckbox);
        autoRetryToggle.appendChild(retryLabel);

        return autoRetryToggle;
    }

    /**
     * Creates the retry count display
     */
    function createRetryCountDisplay() {
        const retryCountDisplay = document.createElement("div");
        retryCountDisplay.id = "retry-count-display";
        retryCountDisplay.textContent = `Retry Count: ${retryCount}`;
        retryCountDisplay.style.cssText = `
            text-align: center;
            margin-bottom: 10px;
        `;
        return retryCountDisplay;
    }

    /**
     * Creates the status message display
     */
    function createStatusMessage() {
        const statusMessage = document.createElement("div");
        statusMessage.id = "popup-status";
        statusMessage.textContent = "Idle";
        statusMessage.style.cssText = `
            text-align: center;
            margin-bottom: 10px;
        `;
        return statusMessage;
    }

    /**
     * Creates the control buttons
     */
    function createButtons(binInput, statusMessage, retryCountDisplay) {
        const buttons = {};

        // Start button
        buttons.startButton = document.createElement("button");
        buttons.startButton.textContent = "Start";
        buttons.startButton.addEventListener("click", () => {
            const bin = binInput.value.trim();
            if (bin) {
                statusMessage.textContent = "Starting process...";
                retryCount = 0;
                retryCountDisplay.textContent = `Retry Count: ${retryCount}`;
                processWithRetry(bin, statusMessage, retryCountDisplay);
            } else {
                statusMessage.textContent = "Please enter BIN/Extrap.";
            }
        });

        // Save button
        buttons.saveButton = document.createElement("button");
        buttons.saveButton.textContent = "Save";
        buttons.saveButton.addEventListener("click", () => {
            const bin = binInput.value.trim();
            if (bin) {
                chrome.storage.local.set({ bin }, () => {
                    statusMessage.textContent = "BIN/Extrap saved.";
                });
            } else {
                statusMessage.textContent = "Please enter BIN/Extrap.";
            }
        });

        // Stop button
        buttons.stopButton = document.createElement("button");
        buttons.stopButton.textContent = "Stop";
        buttons.stopButton.addEventListener("click", () => {
            retryCount = maxRetries; // Stop retry loop
            statusMessage.textContent = "Process stopped.";
        });

        return buttons;
    }

    /**
     * Handles retry logic for filling the card details
     */
    function processWithRetry(bin, statusMessage, retryCountDisplay) {
        if (retryCount >= maxRetries) {
            statusMessage.textContent = "Max retries reached.";
            return;
        }

        const cardDetails = generateCardDetails(bin);
        const success = detectIframeAndAutofill(cardDetails);

        if (!success && autoRetryEnabled) {
            retryCount++;
            retryCountDisplay.textContent = `Retry Count: ${retryCount}`;
            setTimeout(() => processWithRetry(bin, statusMessage, retryCountDisplay), 3000);
        } else if (success) {
            statusMessage.textContent = "Process completed successfully!";
        }
    }

    /**
     * Generates card details using the BIN or extrap data
     */
    function generateCardDetails(input) {
        let bin, expiryMonth, expiryYear, cvv, cardNumber;

        if (input.includes("|")) {
            const parts = input.split("|");
            bin = parts[0];
            expiryMonth = parts[1];
            expiryYear = parts[2];
            cvv = parts[3];
        } else {
            bin = input;
            expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
            expiryYear = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(2);
            cvv = String(Math.floor(Math.random() * 900) + 100);
        }

        cardNumber = generateLuhn(bin);
        return { cardNumber, expiryMonth, expiryYear, cvv };
    }

    /**
     * Generates a Luhn-compliant card number
     */
    function generateLuhn(bin) {
        const incompleteCard = bin + Math.random().toString().slice(2, -1).slice(0, 16 - bin.length);
        let sum = 0;

        for (let i = 0; i < incompleteCard.length; i++) {
            let digit = parseInt(incompleteCard[i]);
            if (i % 2 === 0) digit *= 2;
            if (digit > 9) digit -= 9;
            sum += digit;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return incompleteCard + checkDigit;
    }

    /**
     * Detects iframe and autofills fields
     */
    function detectIframeAndAutofill(cardDetails) {
        const iframe = document.querySelector("iframe[name='__privateStripeFrame']"); // Replace with actual iframe name
        if (!iframe) return false;

        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        const cardField = iframeDocument.querySelector("input[name='cardnumber']");
        const expiryField = iframeDocument.querySelector("input[name='exp-date']");
        const cvvField = iframeDocument.querySelector("input[name='cvc']");

        if (!cardField || !expiryField || !cvvField) return false;

        cardField.value = cardDetails.cardNumber;
        expiryField.value = `${cardDetails.expiryMonth}/${cardDetails.expiryYear}`;
        cvvField.value = cardDetails.cvv;

        const submitButton = iframeDocument.querySelector("button[type='submit']");
        if (submitButton) submitButton.click();

        return true;
    }

    initPhiloTool();
})();
