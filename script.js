import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

let messages = [];

const chatLog = document.getElementById("chat_container");
const message = document.getElementById("message");
const form = document.querySelector("form");

let loadInterval;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += ".";

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 400);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
          <div class="wrapper ${isAi && "ai"}">
              <div class="chat">
                  <div class="profile">
                      <img 
                        src=${isAi ? bot : user} 
                        alt="${isAi ? "bot" : "user"}" 
                      />
                  </div>
                  <div class="message" id=${uniqueId}>${value}</div>
              </div>
          </div>
      `;
}

const baseUrl = "http://localhost:3000";

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatLog.innerHTML += chatStripe(false, data.get("message"));

  const messageText = message.value;
  const newMessage = { role: "user", content: `${messageText}` };
  messages.push(newMessage);
  message.value = "";
  chatLog.scrollTop = chatLog.scrollHeight;

  // to clear the textarea input
  // form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatLog.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatLog.scrollTop = chatLog.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  //   messageDiv.innerHTML = "...";
  loader(messageDiv);

  fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Request failed");
      }
      return response.json();
    })
    .then((data) => {
      let newAssistantMessage = {
        role: "assistant",
        content: data.completion.content,
      };
      messages.push(newAssistantMessage);
      const messageElement = data.completion.content;
      clearInterval(loadInterval);
      messageDiv.innerHTML = messageElement;
    })
    .catch((error) => {
      messageDiv.innerHTML = "Something went wrong";
      console.error(error);
    });
};
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
