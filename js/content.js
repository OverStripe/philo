(function () {
    // Create the popup container
    const popupContainer = document.createElement("div");
    popupContainer.id = "popup-container";

    // Create the header
    const header = document.createElement("div");
    header.id = "popup-header";
    header.textContent = "DestroyerX Tools";

    // Create the status message
    const statusMessage = document.createElement("div");
    statusMessage.id = "popup-status";
    statusMessage.textContent = "";

    // Create buttons
    const enterBINButton = document.createElement("button");
    enterBINButton.textContent = "Enter BIN";
    enterBINButton.addEventListener("click", () => {
        const bin = prompt("Enter BIN:");
        if (bin) {
            document.querySelector("input[type='text']").value = bin; // Example selector for BIN field
            statusMessage.textContent = "BIN entered successfully!";
        }
    });

    const setEmailButton = document.createElement("button");
    setEmailButton.textContent = "Set Email";
    setEmailButton.addEventListener("click", () => {
        const email = prompt("Enter Email:");
        if (email) {
            document.querySelector("input[type='email']").value = email; // Example selector for email field
            statusMessage.textContent = "Email set successfully!";
        }
    });

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.addEventListener("click", () => {
        alert("Stopped any ongoing process.");
        statusMessage.textContent = "Process stopped!";
    });

    // Add header and buttons to the popup
    popupContainer.appendChild(header);
    popupContainer.appendChild(enterBINButton);
    popupContainer.appendChild(setEmailButton);
    popupContainer.appendChild(stopButton);
    popupContainer.appendChild(statusMessage);

    // Append the popup to the body
    document.body.appendChild(popupContainer);
})();
