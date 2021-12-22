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
const htmlTemplate = require('./assets/template/widget-default.html')

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
        this.widgetTemplate = htmlTemplate
            /*this.widgetTitle = 'LinTO chatbot'
            this.widgetTitleColor = '#fff'
            this.primaryColor = '#24a7ff'
            this.secondaryColor = '#003c65'*/
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
            let jhtml = htmlTemplate
            this.widgetContainer.innerHTML = jhtml

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

module.exports = Widget