(function () {
    let retryCount = 0;
    const maxRetries = 10;
    let autoRetryEnabled = false;
    let isVisible = true; // Tracks visibility of the popup

    /**
     * Main initializer function
     */
    function initPhiloTool() {
        createUI();
    }

    /**
     * Creates the user interface
     */
    function createUI() {
        const popupContainer = createPopupContainer();
        const header = createHeader(popupContainer);
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
            width: 200px;
            padding: 10px;
            border-radius: 10px;
            background: linear-gradient(135deg, #4e54c8, #8f94fb);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            color: white;
            z-index: 100000;
            transition: transform 0.3s ease, opacity 0.3s ease;
        `;
        return popupContainer;
    }

    /**
     * Creates the header with toggle visibility
     */
    function createHeader(popupContainer) {
        const header = document.createElement("div");
        header.id = "popup-header";
        header.textContent = "Philo Tool";
        header.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
            cursor: pointer;
        `;

        // Add click event to toggle visibility
        header.addEventListener("click", () => {
            isVisible = !isVisible;
            if (isVisible) {
                popupContainer.style.transform = "scale(1)";
                popupContainer.style.opacity = "1";
            } else {
                popupContainer.style.transform = "scale(0)";
                popupContainer.style.opacity = "0";
            }
        });

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
            padding: 5px;
            margin: 5px 0;
            border-radius: 5px;
            border: none;
            outline: none;
            font-size: 12px;
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
            font-size: 12px;
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
            margin-bottom: 5px;
            font-size: 12px;
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
            font-size: 12px;
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

        // Button styles
        [buttons.startButton, buttons.saveButton, buttons.stopButton].forEach((button) => {
            button.style.cssText = `
                width: 100%;
                background: linear-gradient(135deg, #ff6a00, #ee0979);
                border: none;
                border-radius: 5px;
                padding: 5px;
                margin: 5px 0;
                color: white;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s, background 0.3s ease-in-out;
            `;
            button.addEventListener("mouseenter", () => {
                button.style.transform = "scale(1.05)";
            });
            button.addEventListener("mouseleave", () => {
                button.style.transform = "scale(1)";
            });
        });

        return buttons;
    }

    /**
     * Adds CSS styles for animations and effects
     */
    function injectStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
            @keyframes slide-in {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleSheet);
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

    initPhiloTool();
})();
