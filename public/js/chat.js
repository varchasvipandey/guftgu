const socket = io();

//DOM elements
const DOM = {
  messageForm: document.querySelector("#message-form"),
  messageField: document.querySelector("#message-field"),
  sendMessageButton: document.querySelector("#send-message-button"),
  sendLocationButton: document.querySelector("#send-location-button"),
  messages: document.querySelector("#messages"),
  sidebar: document.querySelector("#sidebar")
};

//templates
const TEMP = {
  messageTemplate: document.querySelector("#message-template").innerHTML,
  locationTemplate: document.querySelector("#location-template").innerHTML,
  sidebarTemplate: document.querySelector("#sidebar-template").innerHTML
};

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  //new message element
  const $newMessage = DOM.messages.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = DOM.messages.offsetHeight;

  //height of messages container
  const containerHeight = DOM.messages.scrollHeight;

  //how far have user scrolled
  const scrollOffset = DOM.messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset)
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
};

//text messages
socket.on("message", msg => {
  console.log(msg);
  const html = Mustache.render(TEMP.messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a")
  });
  DOM.messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//location messages
socket.on("locationMessage", msg => {
  console.log(msg);
  const html = Mustache.render(TEMP.locationTemplate, {
    username: msg.username,
    location_url: msg.url,
    createdAt: moment(msg.createdAt).format("hh:mm a")
  });
  DOM.messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(TEMP.sidebarTemplate, {
    room,
    users
  });
  DOM.sidebar.innerHTML = html;
});

DOM.messageForm.addEventListener("submit", e => {
  e.preventDefault();
  //disable send button until previous msg is not sent
  DOM.sendMessageButton.setAttribute("disabled", "disabled");

  const message = DOM.messageField.value;

  socket.emit("sendMessage", message, err => {
    //re-enable send button and bring focus back to text field
    DOM.sendMessageButton.removeAttribute("disabled");
    DOM.messageField.value = "";
    DOM.messageField.focus();

    if (err) return console.log(`%c ${err} `, "color: red");
    console.log(`%c    Message sent `, "color: green");
  });
});

DOM.sendLocationButton.addEventListener("click", () => {
  //check if browser supports geolocation
  if (!navigator.geolocation)
    return console.log(
      `%c    Geolocation is not supported in your browser! `,
      "color: red"
    );

  //disable send location button
  DOM.sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    socket.emit("sendLocation", location, () => {
      //re-enable send location button
      DOM.sendLocationButton.removeAttribute("disabled");
      console.log(`%c    Location shared! `, "color: blue");
    });
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
