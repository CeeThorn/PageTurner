let currentSpeed = 1;
let currentDirection = 1; // 1 = down, -1 = up
let pageDelay = 2000;


const speedDisplay = document.getElementById("speedDisplay");
const delayDisplay = document.getElementById("delayDisplay");
const delayInput = document.getElementById("delayInput");

function updateSpeedDisplay() {
  speedDisplay.textContent = "Speed: " + currentSpeed;
}

function updateDelayDisplay() {
  delayDisplay.textContent = "Delay: " + pageDelay + "ms";
}

function sendMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}


document.getElementById("start").onclick = () => sendMessage({ action: "start" });
document.getElementById("stop").onclick = () => sendMessage({ action: "stop" });


document.getElementById("increase").onclick = () => {
  currentSpeed++;
  updateSpeedDisplay();
  sendMessage({ action: "speed", value: currentSpeed });
};

document.getElementById("decrease").onclick = () => {
  if (currentSpeed > 1) currentSpeed--;
  updateSpeedDisplay();
  sendMessage({ action: "speed", value: currentSpeed });
};

document.getElementById("forward").onclick = () => {
  currentDirection = 1;
  sendMessage({ action: "direction", value: 1 });
};

document.getElementById("reverse").onclick = () => {
  currentDirection = -1;
  sendMessage({ action: "direction", value: -1 });
};


document.getElementById("setDelay").onclick = () => {
  const val = parseInt(delayInput.value, 10);
  if (!isNaN(val) && val >= 0) {
    pageDelay = val;
    updateDelayDisplay();
    sendMessage({ action: "pageTurnDelay", value: pageDelay });
  }
};


updateSpeedDisplay();
updateDelayDisplay();