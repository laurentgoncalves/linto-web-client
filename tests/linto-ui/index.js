import LintoUI from '../../src/linto-ui.js'

window.LintoUI = new LintoUI({
    debug: true,
    containerId: 'chatbot-wrapper',
    lintoWebToken: 'v2lS299nR5Fv8k7Q',
    lintoWebHost: 'https://stage.linto.ai/overwatch/local/web/login',
    widgetMode: 'multi-modal'
})

const formNameBtn = document.getElementById('form-name-button')
formNameBtn.onclick = function() {
    formNameBtn.classList.add('streaming-on')
    window.LintoUI.customStreaming('vad-custom', 'form-name')
}