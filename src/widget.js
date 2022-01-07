import linto from './linto.js'
import lottie from './lib/lottie.min.js'
import * as handlers from './handlers/widget.js'


const micJson = require('./assets/json/microphone.json')
const lintoThinkJson = require('./assets/json/linto-think.json')
const lintoTalkJson = require('./assets/json/linto-talking.json')
const lintoSleepJson = require('./assets/json/linto-sleep.json')
const lintoAwakeJson = require('./assets/json/linto-awake.json')
const errorJson = require('./assets/json/error.json')
const validationJson = require('./assets/json/validation.json')
const audioFile = require('./assets/audio/beep.mp3')

//const htmlTemplate = require('./assets/template/widget-default.html')
const scss = require('./assets/scss/widget.scss')

export default class Widget {
    constructor(data) {
        /* REQUIRED */
        this.containerId = null
        this.lintoWebHost = ''
        this.lintoWebToken = ''

        /* GLOBAL */
        this.widget = null
        this.widgetEnabled = false
        this.widgetMode = 'mutli-modal'
        this.widgetContainer = null
        this.debug = false
        this.streamingStopWord = 'stop'

        /* STATES */
        this.streamingMode = 'vad'
        this.writingTarget = null
        this.streamingContent = ''

        /* SETTINGS */
        this.hotwordEnabled = 'true'
        this.audioResponse = 'true'

        /* ANIMATIONS */
        this.widgetRightCornerAnimation = null
        this.widgetminimalOverlayAnimation = null

        /* ELEMENTS */
        this.widgetFeedbackContent = []
        this.beep = null

        /* CUSTOM EVENTS */
        this.lintoCustomEvents = []

        /* STYLE */
        this.widgetTemplate = ""

        this.widgetMicAnimation = micJson
        this.widgetThinkAnimation = lintoThinkJson
        this.widgetSleepAnimation = lintoSleepJson
        this.widgetTalkAnimation = lintoTalkJson
        this.widgetAwakeAnimation = lintoAwakeJson
        this.widgetErrorAnimation = errorJson
        this.widgetValidateAnimation = validationJson

        /* INITIALIZATION */
        this.init(data)
    }


    async init(data) {

        // Set custom parameters
        if (!!data) {
            // Debug 
            if (!!data.debug) {
                this.debug = data.debug
            }
            // Web host url
            if (!!data.lintoWebHost) {
                this.lintoWebHost = data.lintoWebHost
            }
            // Web host Token
            if (!!data.lintoWebToken) {
                this.lintoWebToken = data.lintoWebToken
            }
            // Container ID
            if (!!data.containerId) {
                this.containerId = data.containerId
                this.widgetContainer = document.getElementById(this.containerId)
            }
            // Custom events
            if (!!data.lintoCustomEvents) {
                this.lintoCustomEvents = data.lintoCustomEvents
            }
            // Chatbot mode
            if (!!data.widgetMode) {
                this.widgetMode = data.widgetMode
            }
            // Streaming stop word
            if (!!data.streamingStopWord) {
                this.streamingStopWord = data.streamingStopWord
            }

            // Hotword enabled 
            if (!!data.hotwordEnabled) {
                this.hotwordEnabled = data.hotwordEnabled
            }
            if (!!data.audioResponse) {
                this.audioResponse = data.audioResponse
            }
            /* STYLE */
            if (!!data.widgetTemplate) {
                this.widgetTemplate = require(data.widgetTemplate)
            }
            // Animations
            if (!!data.widgetMicAnimation) {
                this.widgetMicAnimation = require(data.widgetMicAnimation)
            }
            if (!!data.widgetThinkAnimation) {
                this.widgetThinkAnimation = require(data.widgetThinkAnimation)
            }
            if (!!data.widgetSleepAnimation) {
                this.widgetSleepAnimation = require(data.widgetSleepAnimation)
            }
            if (!!data.widgetTalkAnimation) {
                this.widgetTalkAnimation = require(data.widgetTalkAnimation)
            }
            if (!!data.widgetAwakeAnimation) {
                this.widgetAwakeAnimation = require(data.widgetAwakeAnimation)
            }
            if (!!data.widgetErrorAnimation) {
                this.widgetErrorAnimation = require(data.widgetErrorAnimation)
            }
            if (!!data.widgetValidateAnimation) {
                this.widgetValidateAnimation = require(data.widgetValidateAnimation)
            }
        }

        // First initialisation
        if (!this.widgetEnabled) {
            // HTML (right corner)
            this.widgetContainer.innerHTML = `
            <div id="widget-mm-wrapper">
            <div id="widget-corner-anim">
                <button id="widget-show-btn" class="sleeping visible"></button>
                <button id="widget-show-minimal" class="hidden"><span class="icon"></span></button>
            </div>
            <div id="widget-mm" class="hidden">
        
                <!-- WIDGET INIT FRAME-->
                <div id="widget-init-wrapper" class="flex1 flex col">
                    <button class="widget-close-init widget-close-btn"></button>
                    <span class="widget-init-title">LinTO widget</span>
                    <svg width="80" height="80" viewBox="0 0 236 238" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_d)">
                      <circle cx="118" cy="118" r="105.579" fill="black"/>
                      </g>
                      <g clip-path="url(#clip0)">
                      <path d="M200.139 202.605C219.681 183.667 232.071 158.559 235.211 131.535C238.351 104.511 232.048 77.2334 217.368 54.3232C202.689 31.4129 180.536 14.2792 154.664 5.82487C128.792 -2.62945 100.791 -1.88446 75.4059 7.93364C50.0205 17.7517 28.8115 36.0392 15.3724 59.6975C1.93337 83.3558 -2.90935 110.93 1.66476 137.749C6.23887 164.567 19.9485 188.981 40.4709 206.853C60.9933 224.725 87.0664 234.957 114.273 235.814C114.273 235.814 114.273 235.952 114.273 236.014H214.791C204.748 229.31 195.529 217.05 200.139 202.605ZM83.0942 125.124C80.7022 125.127 78.3631 124.42 76.373 123.093C74.3829 121.767 72.8311 119.88 71.914 117.672C70.9969 115.464 70.7557 113.034 71.2209 110.689C71.686 108.344 72.8366 106.189 74.5272 104.498C76.2177 102.806 78.3722 101.654 80.7181 101.187C83.064 100.719 85.4959 100.958 87.7061 101.872C89.9163 102.787 91.8055 104.336 93.1347 106.323C94.4639 108.311 95.1734 110.648 95.1734 113.039C95.175 114.625 94.8638 116.197 94.2575 117.663C93.6512 119.129 92.7617 120.461 91.6399 121.584C90.5181 122.706 89.1859 123.596 87.7196 124.204C86.2532 124.811 84.6815 125.124 83.0942 125.124V125.124ZM137.144 167.572C132.548 169.632 124.94 170.806 117.358 170.806C110.188 170.806 103.03 169.757 98.4711 167.423C97.6133 167.046 96.8415 166.497 96.2031 165.812C95.5647 165.126 95.0732 164.317 94.7586 163.435C94.444 162.553 94.3129 161.615 94.3735 160.681C94.4342 159.746 94.6851 158.834 95.111 157.999C95.5369 157.165 96.1288 156.426 96.8504 155.829C97.572 155.231 98.4081 154.787 99.3075 154.524C100.207 154.26 101.151 154.184 102.081 154.298C103.011 154.412 103.908 154.715 104.717 155.188C109.713 157.684 125.69 157.684 131.473 155.038C132.306 154.566 133.227 154.273 134.179 154.177C135.131 154.081 136.093 154.185 137.002 154.482C137.912 154.778 138.75 155.261 139.462 155.899C140.175 156.537 140.746 157.317 141.14 158.188C141.534 159.06 141.742 160.004 141.751 160.96C141.759 161.916 141.569 162.864 141.19 163.742C140.812 164.62 140.254 165.41 139.554 166.061C138.853 166.712 138.024 167.21 137.119 167.522L137.144 167.572ZM152.834 125.124C150.442 125.127 148.103 124.42 146.112 123.093C144.122 121.767 142.571 119.88 141.653 117.672C140.736 115.464 140.495 113.034 140.96 110.689C141.425 108.344 142.576 106.189 144.267 104.498C145.957 102.806 148.112 101.654 150.458 101.187C152.803 100.719 155.235 100.958 157.446 101.872C159.656 102.787 161.545 104.336 162.874 106.323C164.203 108.311 164.913 110.648 164.913 113.039C164.914 114.625 164.603 116.197 163.997 117.663C163.391 119.129 162.501 120.461 161.379 121.584C160.258 122.706 158.925 123.596 157.459 124.204C155.993 124.811 154.421 125.124 152.834 125.124V125.124Z" fill="#3BBBF1"/>
                      </g>
                      <defs>
                      <filter id="filter0_d" x="2.42102" y="6.42105" width="231.158" height="231.158" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dy="4"/>
                      <feGaussianBlur stdDeviation="5"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                      </filter>
                      <clipPath id="clip0">
                      <rect width="236" height="236" fill="white"/>
                      </clipPath>
                      </defs>
                    </svg>

                    <p class="widget-init-content">Activez le widget pour lui poser vos questions vocalement en utilisant le mot-réveil “LinTO”</p>
                    <button class="widget-init-btn enable" id="widget-init-btn-enable">Activer</button>
                    <button class="widget-close-init widget-init-btn close" id="widget-init-btn-close">Fermer</button>
                </div>
                <!-- WIDGET MAIN-->
                <div id="widget-mm-main" class="flex1 flex col hidden">
                    <div class="widget-mm-header flex row">
                        <button id="widget-mm-settings-btn" class="closed"></button>
                        <span class="widget-mm-title">LinTO widget</span>
                        <button id="widget-mm-collapse-btn"></button>
                    </div>
                    <!-- WIDGET CONTENT -->
                    <div id="widget-main-body" class="flex1 flex col">
                        <div id="widget-main-content" class="flex1 flex col">
                        </div>
                        <!-- WIDGET CONTENT BTNS (mic + input + send)-->
                        <div id="widget-main-footer" class="flex row mic-enabled">
                            <button id="widget-mic-btn"><span class="icon"></span></button>
                            <input id="chabtot-msg-input" type="text" />
                            <button id="widget-msg-btn" class="txt-disabled"><span class="icon"></span></button>
                        </div>
                    </div>
                    <!-- WIDGET SETTINGS FRAME-->
                    <div id="widget-settings" class="flex1 flex col hidden">
                        <span class="widget-settings-title">Settings</span>
                        <div class="flex row widget-settings-checkbox">
                            <input type="checkbox" id="widget-settings-hotword" checked>
                            <span class="widget-settings-label">Enable HotWord</span>
                        </div>
                        <div class="flex row widget-settings-checkbox">
                            <input type="checkbox" id="widget-settings-say-response" checked>
                            <span class="widget-settings-label">Enable audio responses</span>
                        </div>
                        <div class="widget-settings-btn-container flex row">
                            <button id="widget-settings-cancel">Annuler</button>
                            <button id="widget-settings-save">Enregistrer</button>
                        </div>
                        <button id="widget-quit-btn">Quitter widget</button>
                    </div>
                </div>
            </div>
            <!-- WIDGET MINIMAL STREAMING -->
            <div id="widget-minimal-overlay" class="flex row hidden">
                <button id="widget-ms-close"></button>
                <div class="widget-ms-container flex1 flex row">
                    <div id="widget-ms-animation" class="widget-animation flex col"></div>
                    <div class="widget-ms-content flex col flex1">
                        <div id="widget-ms-content-previous" class="widget-ms-content-previous"></div>
                        <div id="widget-ms-content-current" class="widget-ms-content-current flex col"></div>
                    </div>
                </div>
            </div>
        </div>`

            /* Widget elements */
            const widgetStartBtn = document.getElementById('widget-init-btn-enable');
            const widgetCloseInitFrameBtn = document.getElementsByClassName('widget-close-init')
            const widgetCollapseBtn = document.getElementById('widget-mm-collapse-btn')
            const widgetSettingsBtn = document.getElementById('widget-mm-settings-btn')
            const widgetQuitBtn = document.getElementById('widget-quit-btn')
            const widgetCloseSettings = document.getElementById('widget-settings-cancel')
            const widgetSaveSettings = document.getElementById('widget-settings-save')
            const settingsHotword = document.getElementById('widget-settings-hotword')
            const settingsAudioResp = document.getElementById('widget-settings-say-response')
            const widgetShowMinimal = document.getElementById('widget-show-minimal')


            if (this.hotwordEnabled === 'false') {
                settingsHotword.checked = false
            }
            if (this.audioResponse === 'false') {
                settingsAudioResp.checked = false
            }

            // Audio hotword sound
            this.beep = new Audio(audioFile)
            this.beep.volume = 0.1

            // Widget Show button (right corner animation)
            const widgetShowBtn = document.getElementById('widget-show-btn')
            if (widgetShowBtn.classList.contains('sleeping')) {
                this.setWidgetRightCornerAnimation('sleep')
            }
            widgetShowBtn.onclick = () => {
                if (this.widgetMode === 'minimal-streaming' && this.widgetEnabled) {
                    this.openMinimalOverlay()
                    this.setMinimalOverlayAnimation('listening')
                    this.widget.startStreaming()
                } else {
                    this.openWidget()
                }
            }

            // Widget close init frame buttons
            for (let closeBtn of widgetCloseInitFrameBtn) {
                closeBtn.onclick = () => {
                    this.closeWidget()
                }
            }

            // Start widget
            widgetStartBtn.onclick = async() => {
                await this.initLintoWeb()
                this.startWidget()
            }

            // Collapse widget 
            widgetCollapseBtn.onclick = () => {
                this.closeWidget()
            }

            // Show / Hide widget settings
            widgetSettingsBtn.onclick = () => {
                if (widgetSettingsBtn.classList.contains('closed')) {
                    this.showSettings()
                } else if (widgetSettingsBtn.classList.contains('opened')) {
                    this.hideSettings()
                }
            }

            // Widget CLOSE BTN
            widgetQuitBtn.onclick = async() => {
                this.closeWidget()
                this.stopWidget()
                await this.stopAll()
            }

            // Close Settings
            widgetCloseSettings.onclick = () => {
                this.hideSettings()
            }

            // Save Settings
            widgetSaveSettings.onclick = () => {
                this.updateWidgetSettings()
            }

            // Widget MIC BTN
            const widgetFooter = document.getElementById('widget-main-footer')
            const inputContent = document.getElementById('chabtot-msg-input')
            const txtBtn = document.getElementById('widget-msg-btn')
            const micBtn = document.getElementById('widget-mic-btn')
            if (this.widgetMode === 'minimal-streaming') {
                widgetFooter.classList.add('hidden')
            }
            micBtn.onclick = async() => {
                if (widgetFooter.classList.contains('mic-disabled')) {
                    txtBtn.classList.remove('txt-enabled')
                    txtBtn.classList.add('txt-disabled')
                    widgetFooter.classList.remove('mic-disabled')
                    widgetFooter.classList.add('mic-enabled')

                }
                if (micBtn.classList.contains('recording')) {
                    this.widget.stopStreaming()
                    this.cleanUserBubble()
                } else {
                    this.widget.startStreaming()
                }
            }

            // Widget SEND BTN
            txtBtn.onclick = () => {
                // Disable mic, enable text
                if (txtBtn.classList.contains('txt-disabled')) {
                    txtBtn.classList.add('txt-enabled')
                    txtBtn.classList.remove('txt-disabled')
                    widgetFooter.classList.add('mic-disabled')
                    widgetFooter.classList.remove('mic-enabled')
                    inputContent.focus()

                } else {
                    this.createUserBubble()
                    const text = inputContent.value
                    this.setUserBubbleContent(text)
                    this.widget.sendCommandText(text)
                    this.createBubbleWidget()
                    inputContent.value = ''
                }
            }

            // MINIMAL OVERLAY
            const closeMinimalOverlayBtn = document.getElementById('widget-ms-close')
            closeMinimalOverlayBtn.onclick = () => {
                this.closeMinimalOverlay()
                this.widget.stopStreaming()
                this.widget.stopSpeech()
            }

            // MINIMAL SHOW WIDGET
            widgetShowMinimal.onclick = () => {
                this.openWidget()
            }
        }
    }

    // ANIMATION RIGHT CORNER
    setWidgetRightCornerAnimation(name, cb) { // Lottie animations 
        let jsonPath = ''
            // animation
        if (name === 'listening') {
            jsonPath = this.widgetMicAnimation
        } else if (name === 'thinking') {
            jsonPath = this.widgetThinkAnimation
        } else if (name === 'talking') {
            jsonPath = this.widgetTalkAnimation
        } else if (name === 'sleep') {
            jsonPath = this.widgetSleepAnimation
        } else if (name === 'awake') {
            jsonPath = this.widgetAwakeAnimation
        } else if (name === 'error') {
            jsonPath = this.widgetErrorAnimation
        } else if (name === 'validation') {
            jsonPath = this.widgetValidateAnimation
        } else if (name === 'destroy') {
            this.widgetRightCornerAnimation.destroy()
        }
        if (this.widgetRightCornerAnimation !== null && name !== 'destroy') {
            this.widgetRightCornerAnimation.destroy()
        }
        if (name !== 'destroy') {
            this.widgetRightCornerAnimation = lottie.loadAnimation({
                container: document.getElementById('widget-show-btn'),
                renderer: 'svg',
                loop: !(name === 'validation' || name === 'error'),
                autoplay: true,
                animationData: jsonPath,
                rendererSettings: {
                    className: 'linto-animation'
                }
            })
            this.widgetRightCornerAnimation.onComplete = () => {
                cb()
            }
        }
    }
    startWidget() {
        const widgetInitFrame = document.getElementById('widget-init-wrapper')
        const widgetMain = document.getElementById('widget-mm-main')
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        widgetInitFrame.classList.add('hidden')
        this.closeWidget()
        widgetMain.classList.remove('hidden')
        this.setWidgetRightCornerAnimation('validation', () => {
            widgetShowBtn.classList.remove('sleeping')
            widgetShowBtn.classList.add('awake')
            this.setWidgetRightCornerAnimation('awake')
        })

        if (this.widgetMode === 'minimal-streaming') {
            setTimeout(() => {
                widgetShowMinimal.classList.remove('hidden')
                widgetShowMinimal.classList.add('visible')
            }, 2000)
        }
    }

    // WIDGET MAIN 
    openWidget() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetMultiModal = document.getElementById('widget-mm')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        if (this.widgetMode === 'minimal-streaming') {
            widgetShowMinimal.classList.remove('visible')
            widgetShowMinimal.classList.add('hidden')
        }
        widgetShowBtn.classList.remove('visible')
        widgetShowBtn.classList.add('hidden')
        widgetMultiModal.classList.remove('hidden')
        widgetMultiModal.classList.add('visible')
    }
    closeWidget() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetMultiModal = document.getElementById('widget-mm')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        if (this.widgetMode === 'minimal-streaming') {
            widgetShowMinimal.classList.add('visible')
            widgetShowMinimal.classList.remove('hidden')
        }
        widgetMultiModal.classList.add('hidden')
        widgetMultiModal.classList.remove('visible')
        widgetShowBtn.classList.add('visible')
        widgetShowBtn.classList.remove('hidden')
        if (widgetShowBtn.classList.contains('sleeping')) {
            this.setWidgetRightCornerAnimation('sleep')
        } else {
            this.setWidgetRightCornerAnimation('awake')
        }
    }

    stopWidget() {
        const widgetInitFrame = document.getElementById('widget-init-wrapper')
        const widgetMain = document.getElementById('widget-mm-main')
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        if (this.widgetMode === 'minimal-streaming') {
            widgetShowMinimal.classList.remove('visible')
            widgetShowMinimal.classList.add('hidden')
        }
        widgetInitFrame.classList.remove('hidden')
        widgetMain.classList.add('hidden')
        if (widgetShowBtn.classList.contains('awake')) {
            widgetShowBtn.classList.add('sleeping')
            widgetShowBtn.classList.remove('awake')
            this.setWidgetRightCornerAnimation('sleep')
        }
    }

    // WIDGET SETTINGS
    showSettings() {
        const widgetSettingsBtn = document.getElementById('widget-mm-settings-btn')
        const widgetSettings = document.getElementById('widget-settings')
        const widgetBody = document.getElementById('widget-main-body')
        widgetSettingsBtn.classList.remove('closed')
        widgetSettingsBtn.classList.add('opened')
        widgetSettings.classList.remove('hidden')
        widgetBody.classList.add('hidden')
    }
    hideSettings() {
        const widgetSettingsBtn = document.getElementById('widget-mm-settings-btn')
        const widgetSettings = document.getElementById('widget-settings')
        const widgetBody = document.getElementById('widget-main-body')
        widgetSettingsBtn.classList.remove('opened')
        widgetSettingsBtn.classList.add('closed')
        widgetBody.classList.remove('hidden')
        widgetSettings.classList.add('hidden')
    }
    updateWidgetSettings() {
        const hotwordCheckbox = document.getElementById('widget-settings-hotword')
        const audioRespCheckbox = document.getElementById('widget-settings-say-response')
        if (!hotwordCheckbox.checked && this.hotwordEnabled === 'true') {
            this.hotwordEnabled = 'false'
            this.widget.stopStreamingPipeline()
            this.widget.stopAudioAcquisition()
            this.widget.startAudioAcquisition(false, "linto", 0.99)
            this.widget.startStreamingPipeline()
        } else if (hotwordCheckbox.checked && this.hotwordEnabled === 'false') {
            this.hotwordEnabled = 'true'
            this.widget.stopStreamingPipeline()
            this.widget.stopAudioAcquisition()
            this.widget.startAudioAcquisition(true, "linto", 0.99)
            this.widget.startStreamingPipeline()
        }
        if (!audioRespCheckbox.checked && this.audioResponse === 'true') {
            this.audioResponse = 'false'
        } else if (audioRespCheckbox.checked && this.audioResponse === 'false') {
            this.audioResponse = 'true'
        }
    }

    // WIDGET CONTENT BUBBLES
    cleanUserBubble() {
        let userBubbles = document.getElementsByClassName('user-bubble')
        if (userBubbles.length > 0) {
            let current = userBubbles[userBubbles.length - 1]
            if (current.innerHTML.indexOf('loading') >= 0) {
                current.remove()
            }
        }
    }
    createUserBubble() {
        const contentWrapper = document.getElementById('widget-main-content')
        contentWrapper.innerHTML += `
        <div class="content-bubble flex row user-bubble">
          <span class="loading"></span>
        </div> `
    }
    setUserBubbleContent(text) {
        let userBubbles = document.getElementsByClassName('user-bubble')
        let current = userBubbles[userBubbles.length - 1]
        current.innerHTML = `<span class="content-item">${text}</span>`
    }
    createBubbleWidget() {
        const contentWrapper = document.getElementById('widget-main-content')
        contentWrapper.innerHTML += `
        <div class="content-bubble flex row widget-bubble">
          <span class="loading"></span>
        </div> `
    }
    setWidgetBubbleContent(text) {
        let widgetBubbles = document.getElementsByClassName('widget-bubble')
        let current = widgetBubbles[widgetBubbles.length - 1]
        current.innerHTML = `<span class="content-item">${text}</span>`
    }
    cleanWidgetBubble() {
        let widgetBubbles = document.getElementsByClassName('widget-bubble')
        if (widgetBubbles.length > 0) {
            let current = widgetBubbles[widgetBubbles.length - 1]
            if (current.innerHTML.indexOf('loading') >= 0) {
                current.remove()
            }
        }
    }

    // Update feedback window data content (links, img...)
    setWidgetFeedbackData(data) {
        let jhtml = '<div class="content-bubble flex row widget">'
        for (let item of data) {
            if (item.eventType === 'choice') {
                jhtml += `<button class="widget-content-link">${item.text}</button>`
            } else if (item.eventType === 'attachment') {
                if (!!item.file && item.file.type === 'image') {
                    jhtml += `<img src="${item.file.url}" class="widget-content-img">`
                }
            }
        }
        jhtml += '</div>'
        const contentWrapper = document.getElementById('widget-main-content')
        contentWrapper.innerHTML += jhtml

        let widgetEventsBtn = document.getElementsByClassName('widget-content-link')
        for (let btn of widgetEventsBtn) {
            btn.onclick = (e) => {
                let value = e.target.innerHTML
                this.createUserBubble()
                this.setUserBubbleContent(value)
                this.createBubbleWidget()
                this.widget.sendWidgetText(value)
            }
        }
        this.widgetContentScrollBottom()

    }
    widgetContentScrollBottom() {
        const contentWrapper = document.getElementById('widget-main-content')
        contentWrapper.scrollTo({
            top: contentWrapper.offsetHeight,
            left: 0,
            behavior: 'smooth'
        })
    }

    // Minimal streaming overlay 
    setMinimalOverlayAnimation(name, cb) {
        let jsonPath = ''
            // animation
        if (name === 'listening') {
            jsonPath = this.widgetMicAnimation
        } else if (name === 'thinking') {
            jsonPath = this.widgetThinkAnimation
        } else if (name === 'talking') {
            jsonPath = this.widgetTalkAnimation
        } else if (name === 'sleep') {
            jsonPath = this.widgetSleepAnimation
        } else if (name === 'destroy') {
            this.widgetminimalOverlayAnimation.destroy()
        }
        if (this.widgetminimalOverlayAnimation !== null && name !== 'destroy') {
            this.widgetminimalOverlayAnimation.destroy()
        }
        if (name !== 'destroy') {
            this.widgetminimalOverlayAnimation = lottie.loadAnimation({
                container: document.getElementById('widget-ms-animation'),
                renderer: 'svg',
                loop: !(name === 'validation' || name === 'error'),
                autoplay: true,
                animationData: jsonPath,
                rendererSettings: {
                    className: 'linto-animation'
                }
            })
            this.widgetminimalOverlayAnimation.onComplete = () => {
                cb()
            }
        }
    }
    openMinimalOverlay() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const minOverlay = document.getElementById('widget-minimal-overlay')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        this.closeWidget()
        widgetShowMinimal.classList.remove('visible')
        widgetShowMinimal.classList.add('hidden')
        widgetShowBtn.classList.remove('visible')
        widgetShowBtn.classList.add('hidden')
        minOverlay.classList.remove('hidden')
        minOverlay.classList.add('visible')
    }
    closeMinimalOverlay() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const minOverlay = document.getElementById('widget-minimal-overlay')
        const widgetShowMinimal = document.getElementById('widget-show-minimal')
        widgetShowMinimal.classList.add('visible')
        widgetShowMinimal.classList.remove('hidden')
        widgetShowBtn.classList.add('visible')
        widgetShowBtn.classList.remove('hidden')
        minOverlay.classList.add('hidden')
        minOverlay.classList.remove('visible')
        this.setMinimalOverlayAnimation('')
        this.setMinimalOverlaySecondaryContent('')
    }
    setMinimalOverlayMainContent(txt) {
        const mainContent = document.getElementById('widget-ms-content-current')
        mainContent.innerHTML = txt
    }
    setMinimalOverlaySecondaryContent(txt) {
        const secContent = document.getElementById('widget-ms-content-previous')
        secContent.innerHTML = txt
    }
    say = async(text) => {
        const toSay = await this.widget.say('fr-FR', text)
        return toSay
    }
    async stopAll() {
        this.widget.stopStreaming()
        this.widget.stopStreamingPipeline()
        this.widget.stopAudioAcquisition()
        this.widget.stopSpeech()
        await this.widget.logout
        this.widgetEnabled = false
        this.hideSettings()
    }

    customStreaming(streamingMode, target) {
        this.beep.play()
        this.streamingMode = streamingMode
        this.writingTarget = document.getElementById(target)
        this.widget.stopStreamingPipeline()
        this.widget.startStreaming()
    }

    initLintoWeb = async() => {
        // Set chatbot
        this.widget = new Linto(this.lintoWebHost, this.lintoWebToken)

        // Chatbot events
        this.widget.addEventListener("mqtt_connect", handlers.mqttConnectHandler.bind(this))
        this.widget.addEventListener("mqtt_connect_fail", handlers.mqttConnectFailHandler.bind(this))
        this.widget.addEventListener("mqtt_error", handlers.mqttErrorHandler.bind(this))
        this.widget.addEventListener("mqtt_disconnect", handlers.mqttDisconnectHandler.bind(this))
        this.widget.addEventListener("command_acquired", handlers.commandAcquired.bind(this))
        this.widget.addEventListener("command_published", handlers.commandPublished.bind(this))
        this.widget.addEventListener("speaking_on", handlers.audioSpeakingOn.bind(this))
        this.widget.addEventListener("speaking_off", handlers.audioSpeakingOff.bind(this))
        this.widget.addEventListener("streaming_start", handlers.streamingStart.bind(this))
        this.widget.addEventListener("streaming_stop", handlers.streamingStop.bind(this))
        this.widget.addEventListener("streaming_chunk", handlers.streamingChunk.bind(this))
        this.widget.addEventListener("streaming_final", handlers.streamingFinal.bind(this))
        this.widget.addEventListener("streaming_fail", handlers.streamingFail.bind(this))
        this.widget.addEventListener("hotword_on", handlers.hotword.bind(this))
        this.widget.addEventListener("ask_feedback_from_skill", handlers.askFeedback.bind(this))
        this.widget.addEventListener("say_feedback_from_skill", handlers.sayFeedback.bind(this))
        this.widget.addEventListener("custom_action_from_skill", handlers.customHandler.bind(this))
        this.widget.addEventListener("startRecording", handlers.textPublished.bind(this))
        this.widget.addEventListener("chatbot_acquired", handlers.chatbotAcquired.bind(this))
        this.widget.addEventListener("chatbot_published", handlers.chatbotPublished.bind(this))
        this.widget.addEventListener("action_published", handlers.actionPublished.bind(this))
        this.widget.addEventListener("action_feedback", handlers.actionFeedback.bind(this))
        this.widget.addEventListener("chatbot_feedback", handlers.widgetFeedback.bind(this))
        this.widget.addEventListener("chatbot_feedback_from_skill", handlers.widgetFeedback.bind(this))

        // Bind custom events
        if (this.lintoCustomEvents.length > 0) {
            for (let event of this.lintoCustomEvents) {
                this.setHandler(event.flag, event.func)
            }
        }

        // Widget login
        await this.widget.login()

        if (this.hotwordEnabled === 'false') {
            this.widget.startAudioAcquisition(false, "linto", 0.99)
        } else {
            this.widget.startAudioAcquisition(true, "linto", 0.99)
        }

        this.widget.startStreamingPipeline()
        this.widgetEnabled = true
    }
}

window.Widget = Widget
module.exports = Widget