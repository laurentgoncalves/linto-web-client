import Widget from '../../src/widget.js'

window.chatbot = new Widget({
    debug: true,
    containerId: 'chatbot-wrapper',
    lintoWebToken: 'LiC8SBbvj73HcpxV',
    lintoWebHost: 'https://alpha.linto.ai/overwatch/local/web/login',
    widgetMode: 'multi-modal',
    hotwordEnabled: 'true'
})