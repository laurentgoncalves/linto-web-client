import LintoUI from "../../src/linto-ui.js"

window.LintoUI = new LintoUI({
  debug: true,
  containerId: "chatbot-wrapper",
  lintoWebToken: "RDviNAcFYYbRUzAu",
  lintoWebHost: "https://gamma.linto.ai/overwatch/local/web/login",
  widgetMode: "minimal-streaming",
  transactionMode: "command", // 'command' to use sendCommandText() ||'chatbot' to use sendChatbotText()
})

const formNameBtn = document.getElementById("form-name-button")
formNameBtn.onclick = function () {
  formNameBtn.classList.add("streaming-on")
  window.LintoUI.customStreaming("vad-custom", "form-name")
}
