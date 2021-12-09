import Chatbot from '../../src/chatbot.js'

window.chatbot = new Chatbot({
    debug: true,
    containerId: 'chatbot-wrapper',
    lintoWebToken: 'LiC8SBbvj73HcpxV', //LiC8SBbvj73HcpxV (local)
    lintoWebHost: 'https://alpha.linto.ai/overwatch/local/web/login',
    lintoSayResponse: true,
    chatbotTitle: 'Title custom',
    primaryColor: "red",
    chatbotMode: 'multi-modal'


})