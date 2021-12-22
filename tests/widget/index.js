import Widget from '../../src/widget.js'

window.widget = new Widget({
    debug: true,
    containerId: 'chatbot-wrapper',
    lintoWebToken: 'LiC8SBbvj73HcpxV',
    lintoWebHost: 'https://alpha.linto.ai/overwatch/local/web/login',
    widgetMode: 'minimal-streaming',
    hotwordEnabled: 'true',
    audioResponse: 'true'
})

const formNameBtn = document.getElementById('form-name-button')
formNameBtn.onclick = function() {
    formNameBtn.classList.add('streaming-on')
    window.widget.customStreaming('vad-custom', 'form-name')
}