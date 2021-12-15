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

export default class Widget {
    constructor(data) {
        /* REQUIRED */
        this.containerId = null
        this.lintoWebHost = ''
        this.lintoWebToken = ''

        /* GLOBAL */
        this.widget = null
        this.widgetEnabled = false
        this.widgetMode = 'minimal-streaming'
        this.widgetContainer = null
        this.debug = false
        this.streamingStopWord = 'stop'

        /* STATES */
        this.streamingMode = 'vad'
        this.writingTarget = null
        this.streamingContent = ''

        /* ANIMATIONS */
        this.widgetRightCornerAnimation = null

        /* ELEMENTS */
        this.widgetFeedbackContent = []
        this.beep = null

        /* CUSTOM EVENTS */
        this.lintoCustomEvents = []

        /* STYLE */
        this.widgetTitle = 'LinTO chatbot'
        this.widgetTitleColor = '#fff'
        this.primaryColor = '#24a7ff'
        this.secondaryColor = '#003c65'
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
            /* STYLE */
            if (!!data.widgetTitle) {
                this.widgetTitle = data.widgetTitle
            }
            if (!!data.widgetTitleColor) {
                this.widgetTitleColor = data.widgetTitleColor
            }
            if (!!data.primaryColor) {
                this.primaryColor = data.primaryColor
            }
            if (!!data.secondaryColor) {
                this.secondaryColor = data.secondaryColor
            }
            // Animations
            if (!!data.widgetMicAnimation) {
                this.widgetMicAnimation = data.widgetMicAnimation
            }
            if (!!data.widgetThinkAnimation) {
                this.widgetThinkAnimation = data.widgetThinkAnimation
            }
            if (!!data.widgetSleepAnimation) {
                this.widgetSleepAnimation = data.widgetSleepAnimation
            }
            if (!!data.widgetTalkAnimation) {
                this.widgetTalkAnimation = data.widgetTalkAnimation
            }
            if (!!data.widgetAwakeAnimation) {
                this.widgetAwakeAnimation = data.widgetAwakeAnimation
            }
            if (!!data.widgetErrorAnimation) {
                this.widgetErrorAnimation = data.widgetErrorAnimation
            }
            if (!!data.widgetValidateAnimation) {
                this.widgetValidateAnimation = data.widgetValidateAnimation
            }
        }

        // First initialisation
        if (!this.widgetEnabled) {
            // HTML (right corner)
            let jhtml = require('./assets/template/test.html')
            this.widgetContainer.innerHTML = jhtml

            /* Widget elements */
            const widgetMultiModal = document.getElementById('widget-mm')
            const widgetInitFrame = document.getElementById('widget-init-wrapper')
            const widgetMain = document.getElementById('widget-mm-main')
            const widgetStartBtn = document.getElementById('widget-init-btn-enable');
            const widgetCloseInitFrameBtn = document.getElementsByClassName('widget-close-init')

            const widgetCollapseBtn = document.getElementById('widget-mm-collapse-btn')
            const widgetSettingsBtn = document.getElementById('widget-mm-settings-btn')
            const widgetSettings = document.getElementById('widget-settings')
            const widgetBody = document.getElementById('widget-main-body')


            // Widget Show button (right corner animation)
            const widgetShowBtn = document.getElementById('widget-show-btn')
            if (widgetShowBtn.classList.contains('sleeping')) {
                this.setWidgetRightCornerAnimation('sleep')
            }
            widgetShowBtn.onclick = () => {
                this.openWidget()

            }

            // Widget close init frame buttons
            for (let closeBtn of widgetCloseInitFrameBtn) {
                closeBtn.onclick = () => {
                    this.closeWidget()
                }
            }

            // Start widget
            widgetStartBtn.onclick = () => {
                // INIT LINTO
                this.startWidget()
            }

            /*
                        // Init audio beep.mp3
                        this.beep = new Audio(audioFile)
                        this.beep.volume = 0.1


                        // Binding actions buttons
                        const initBtn = document.getElementById('linto-widget-init-btn')
                        const closeFrameBtn = document.getElementById('init-frame-btn-close')
                        const enableWidgetBtn = document.getElementById('init-frame-btn-enable')

                        this.setLintoRightCornerAnimation('sleep')

                        // Toggle initialisation frame
                        initBtn.onclick = (e) => {
                            this.toggleInitFrame()
                        }

                        // Close initialisation frame
                        closeFrameBtn.onclick = (e) => {
                            this.toggleInitFrame()
                        }

                        // enable minimal streaming mode
                        enableWidgetBtn.onclick = (e) => {
                            this.closeInitFrame()
                            if (this.widgetMode === 'minimal-streaming') {
                                this.setWidgetMinimal()
                            } else if (this.widgetMode === 'multi-modal') {
                                this.setWidgetMultiModal()
                            }
                            this.initLintoWeb()

                        }*/
        }
    }

    // ANIMATION RIGHT CORNER
    setWidgetRightCornerAnimation(name) { // Lottie animations 
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
        }
    }



    openWidget() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetMultiModal = document.getElementById('widget-mm')
        widgetShowBtn.classList.remove('visible')
        widgetShowBtn.classList.add('hidden')
        widgetMultiModal.classList.remove('hidden')
        widgetMultiModal.classList.add('visible')
    }
    closeWidget() {
        const widgetShowBtn = document.getElementById('widget-show-btn')
        const widgetMultiModal = document.getElementById('widget-mm')
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
    startWidget() {
        const widgetInitFrame = document.getElementById('widget-init-wrapper')
        const widgetMain = document.getElementById('widget-mm-main')
        const widgetShowBtn = document.getElementById('widget-show-btn')

        widgetInitFrame.classList.add('hidden')
        widgetMain.classList.remove('hidden')
        if (widgetShowBtn.classList.contains('sleeping')) {
            widgetShowBtn.classList.remove('sleeping')
            widgetShowBtn.classList.add('awake')
            this.setWidgetRightCornerAnimation('awake')

        }
    }

    // Show / Hide initialisation frame
    toggleInitFrame() {
        const initBtn = document.getElementById('linto-widget-init-btn')
        const initFrame = document.getElementById('linto-widget-init-frame')
        if (initFrame.classList.contains('hidden')) {
            initFrame.classList.remove('hidden')
            this.setLintoRightCornerAnimation('destroy')
            initBtn.innerHTML = '<span class="linto-icon"></span>'
        } else {
            initFrame.classList.add('hidden')
            initBtn.innerHTML = ''
            this.setLintoRightCornerAnimation('sleep')
        }
    }

    // Close initialisation frame
    closeInitFrame() {
        const initBtn = document.getElementById('linto-widget-init-btn')
        const initFrame = document.getElementById('linto-widget-init-frame')
        initFrame.classList.add('hidden')
        initBtn.innerHTML = ''
    }

    // SET MINIMAL STREAMING MODE
    setWidgetMinimal() {
        this.widgetMode = 'minimal-streaming'
        let jhtml = `
        <div id="widget-minimal" class="${this.widgetMode} flex row hidden">
            <button id="widget-ms-close"></button>
            <div class="widget-ms-container flex1 flex row">
                <div id="widget-ms-animation" class="widget-animation flex col"></div>
                <div class="widget-ms-content flex col flex1">
                    <div id="widget-ms-content-previous" class="widget-ms-content-previous"></div>
                    <div id="widget-ms-content-current" class="widget-ms-content-current flex col"></div>
                </div>
            </div>
        </div>`

        const widgetCorner = document.getElementById('linto-widget-corner')
        widgetCorner.innerHTML += `
        
        <button id="widget-feedback-btn" class="closed hidden"><span class="icon"></span></button>
        <div id="widget-feedback-frame" class="hidden">
            <div class="widget-feedback-header flex row">
              <button id="widget-feedback-close"></button>
            </div>
          <div id="widget-feedback-items"></div>
        </div>`

        this.widgetContainer.innerHTML += jhtml

        // Minimal mode close button
        const widgetMSCloseBtn = document.getElementById('widget-ms-close')
        widgetMSCloseBtn.onclick = (e) => {
            this.stopAll()
            this.hideWidgetMinimal()
        }

        // Minilal mode LinTO button (corner right)
        const widgetLintoBtn = document.getElementById('linto-widget-init-btn')
        widgetLintoBtn.onclick = (e) => {
            this.showWidgetMinimal()
            this.widget.startStreaming()
        }

        // Feedback window button
        const feedbackBtn = document.getElementById('widget-feedback-btn')
        const feedbackFrame = document.getElementById('widget-feedback-frame')
        feedbackBtn.onclick = (e) => {
            if (this.widgetFeedbackContent.length > 0) {
                if (feedbackFrame.classList.contains('hidden')) {
                    this.showwidgetFeedback()
                } else {
                    this.hidewidgetFeedback()
                }
            }
        }

        // Feedback close window button
        const feedbackCloseBtn = document.getElementById('widget-feedback-close')
        feedbackCloseBtn.onclick = (e) => {
            feedbackFrame.classList.remove('visible')
            feedbackFrame.classList.add('hidden')
            feedbackBtn.classList.remove('opened')
            feedbackBtn.classList.add('closed')
        }

        // Close Minimal Streaming mode
        const widgetClose = document.getElementById('widget-close')
        widgetClose.onclick = (e) => {
            this.hideWidgetMinimal()
            this.widgetContainer.innerHTML = ''
            this.widgetEnabled = false
            this.widget.stopStreaming()
            this.widget.stopStreamingPipeline()
            this.widget.stopAudioAcquisition()
            this.setLintoRightCornerAnimation('destroy')
            this.widget.logout()
            setTimeout(() => {
                this.init()
            }, 1000)
        }
    }

    // Hide Minimal streaming content Area
    hideWidgetMinimal() {
        const widgetRightCorner = document.getElementById('linto-widget-corner')
        const widgetMS = document.getElementById('widget-minimal')
        if (widgetMS.classList.contains('visible')) {
            widgetMS.classList.add('hidden')
            widgetMS.classList.remove('visible')
            widgetRightCorner.classList.add('visible')
            widgetRightCorner.classList.remove('hidden')
            this.updateCurrentMSContent('')
            this.updatePrevioustMSContent('')
        }
    }

    // Show Minimal streaming content Area
    showWidgetMinimal() {
        const widgetRightCorner = document.getElementById('linto-widget-corner')
        const widgetMS = document.getElementById('widget-minimal')
        if (widgetMS.classList.contains('hidden')) {
            widgetMS.classList.remove('hidden')
            widgetMS.classList.add('visible')
            widgetRightCorner.classList.remove('visible')
            widgetRightCorner.classList.add('hidden')
            this.setLintoLeftCornerAnimation('listening')
        }
    }



    // Set chatbot Left corner (Minimal streaming) animation
    setLintoLeftCornerAnimation(name) { // Lottie animations 
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
            this.lintoLeftCornerAnimation.destroy()
        }
        if (this.lintoLeftCornerAnimation !== null && name !== 'destroy') {
            this.lintoLeftCornerAnimation.destroy()
        }
        if (name !== 'destroy') {
            this.lintoLeftCornerAnimation = lottie.loadAnimation({
                container: document.getElementById('widget-ms-animation'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: jsonPath,
                rendererSettings: {
                    className: 'linto-animation'
                }
            })
        }
    }

    // Update Current response (minimal streaming content area) 
    updateCurrentMSContent(value) {
        const currentContent = document.getElementById('widget-ms-content-current')
        currentContent.innerHTML = value
    }

    // Update Previous response (minimal streaming content area) 
    updatePrevioustMSContent(value) {
        const currentContent = document.getElementById('widget-ms-content-previous')
        currentContent.innerHTML = value
    }

    // Show feedback window
    showwidgetFeedback() {
        const feedbackBtn = document.getElementById('widget-feedback-btn')
        const feedbackFrame = document.getElementById('widget-feedback-frame')
        if (this.widgetFeedbackContent.length > 0) {
            if (feedbackFrame.classList.contains('hidden')) {
                feedbackFrame.classList.remove('hidden')
                feedbackFrame.classList.add('visible')
                feedbackBtn.classList.remove('closed')
                feedbackBtn.classList.add('opened')
            }
        }
    }

    // Hide feedback windows
    hidewidgetFeedback() {
        const feedbackBtn = document.getElementById('widget-feedback-btn')
        const feedbackFrame = document.getElementById('widget-feedback-frame')
        if (this.widgetFeedbackContent.length > 0) {
            if (feedbackFrame.classList.contains('visible')) {
                feedbackFrame.classList.remove('visible')
                feedbackFrame.classList.add('hidden')
                feedbackBtn.classList.remove('opened')
                feedbackBtn.classList.add('closed')
            }
        }
    }

    // Update feedback window content
    updatewidgetFeedback(obj) {
        this.widgetFeedbackContent.push(obj)
        let feedbackBtn = document.getElementById('widget-feedback-btn')
        if (feedbackBtn.classList.contains('hidden')) {
            feedbackBtn.classList.remove('hidden')
        }
        const feedbackContent = document.getElementById('widget-feedback-items')
        feedbackContent.innerHTML += `
          <div class="feedback-item ${obj.user} flex row">
            <span class="content">${obj.value}</span>
          </div>
        `
        feedbackContent.scrollTo({
            top: feedbackContent.offsetHeight,
            left: 0,
            behavior: 'smooth'
        })
    }

    // Update feedback window data content (links, img...)
    updatewidgetFeedbackData(data) {
        let jhtml = '<div class="feedback-item data flex col">'
        for (let item of data) {
            if (item.eventType === 'choice') {
                jhtml += `<button class="widget-event-btn">${item.text}</button>`
            } else if (item.eventType === 'attachment') {
                if (!!item.file && item.file.type === 'image') {
                    jhtml += `<img src="${item.file.url}" class="widget-event-img">`
                }
            }
        }
        jhtml += '</div>'
        const feedbackContent = document.getElementById('widget-feedback-items')
        feedbackContent.innerHTML += jhtml

        let widgetEventsBtn = document.getElementsByClassName('widget-event-btn')
        for (let btn of widgetEventsBtn) {
            btn.onclick = (e) => {

                let value = e.target.innerHTML
                this.updatewidgetFeedback({ user: 'user', value })
                this.widget.sendWidgetText(value)
            }
        }
        feedbackContent.scrollTo({
            top: feedbackContent.offsetHeight,
            left: 0,
            behavior: 'smooth'
        })
    }

    /* LinTO Chatbot MULTI-MODAL MODE */
    setWidgetMultiModal() {
        this.widgetMode = 'multi-modal'

        let jhtml = `
        <div id="widget-multi-modal" class="flex col hidden">
            <div class="header flex row" style="background-color:${this.primaryColor};">
                <span class="widget-mm-title flex1" style="color: ${this.widgetTitleColor};">${this.widgetTitle}</span>
                <div class="widget-mm-actions">
                    <!-- <button id="widget-mm-mic-mute" class="widget-mm-actions-btn"><span class="icon mic mute"></span></button> -->
                    <button id="widget-mm-collapse" class="widget-mm-actions-btn"><span class="icon collapse"></span></button>
                    <button id="widget-mm-close" class="widget-mm-actions-btn"><span class="icon close"></span></button>
                </div>
            </div>
            <div class="body flex1 flex col" id="widget-body">
              <div id="widget-mm-content" class="flex col">
              </div>
            </div>
            <div class="footer flex row" style="background-color:${this.primaryColor};">
                <button id="widget-mm-mic"><span class="icon"></span></button>
                <span id="widget-mm-input" class="flex1" contenteditable></span>
                <button id="widget-mm-submit"><span class="icon"></span></button>
            </div>
        </div>
        `
        this.widgetContainer.innerHTML += jhtml

        const widgetLintoBtn = document.getElementById('linto-widget-init-btn')
        widgetLintoBtn.onclick = (e) => {
            this.showWidgetMultiModal()
        }

        const micBtn = document.getElementById('widget-mm-mic')
        micBtn.onclick = (e) => {
            this.widget.startStreaming()
            micBtn.classList.add('streaming')
        }

        const collapseBtn = document.getElementById('widget-mm-collapse')
        collapseBtn.onclick = (e) => {
            this.hideWidgetMultiModal()
        }

        const widgetInput = document.getElementById('widget-mm-input')
        const widgetInputSubmit = document.getElementById('widget-mm-submit')
        widgetInputSubmit.onclick = (e) => {
            let content = widgetInput.innerHTML
            if (content.length > 0) {
                this.updateMultiModalUser(content)
                this.widget.sendWidgetText(content)
                widgetInput.innerHTML = ''
            }
        }

        const closeWidgetBtn = document.getElementById('widget-mm-close')
        closeWidgetBtn.onclick = (e) => {
            this.hideWidgetMultiModal()
            this.widgetContainer.innerHTML = ''
            this.widgetEnabled = false
            this.widget.stopStreaming()
            this.widget.stopStreamingPipeline()
            this.widget.stopAudioAcquisition()
            this.setLintoRightCornerAnimation('destroy')
            this.widget.logout()
            setTimeout(() => {
                this.init()
            }, 1000)
        }

    }
    showWidgetMultiModal(value) {
        const multiModal = document.getElementById('widget-multi-modal')
        const widgetLintoBtn = document.getElementById('linto-widget-init-btn')
        multiModal.classList.remove('hidden')
        multiModal.classList.add('visible')
        widgetLintoBtn.classList.remove('visible')
        widgetLintoBtn.classList.add('hidden')
        if (!!value && value === 'streaming') {
            const micBtn = document.getElementById('widget-mm-mic')
            micBtn.classList.add('streaming')
        }
    }
    hideWidgetMultiModal() {
        const multiModal = document.getElementById('widget-multi-modal')
        const widgetLintoBtn = document.getElementById('linto-widget-init-btn')
        multiModal.classList.remove('visible')
        multiModal.classList.add('hidden')
        widgetLintoBtn.classList.remove('hidden')
        widgetLintoBtn.classList.add('visible')
    }
    updateMultiModalUser(content) {
        const multiModalContent = document.getElementById('widget-mm-content')
        let jhtml = `
        <div class="widget-mm-content-item user flex row">
          <span class="content">${content}</span>
        </div>`
        multiModalContent.innerHTML += jhtml
        document.getElementById('widget-body').scrollTo({
            top: multiModalContent.offsetHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    updateMultiModalBot(content) {
        const multiModalContent = document.getElementById('widget-mm-content')
        let jhtml = `
      <div class="widget-mm-content-item bot flex row">
        <span class="content">${content}</span>
      </div>`
        multiModalContent.innerHTML += jhtml
        document.getElementById('widget-body').scrollTo({
            top: multiModalContent.offsetHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    updateMultiModalData(data) {
        const multiModalContent = document.getElementById('widget-mm-content')
        let jhtml = '<div class="widget-mm-content-item data flex col">'
        for (let item of data) {
            if (item.eventType === 'choice') {
                jhtml += `<button class="widget-event-btn">${item.text}</button>`
            } else if (item.eventType === 'attachment') {
                if (!!item.file && item.file.type === 'image') {
                    jhtml += `<img src="${item.file.url}" class="widget-event-img">`
                }
            }
        }
        jhtml += '</div>'
        multiModalContent.innerHTML += jhtml

        let widgetEventsBtn = document.getElementsByClassName('widget-event-btn')
        for (let btn of widgetEventsBtn) {
            btn.onclick = (e) => {
                let value = e.target.innerHTML
                this.updateMultiModalUser(value)
                this.widget.sendWidgetText(value)
            }
        }

        document.getElementById('widget-body').scrollTo({
            top: multiModalContent.offsetHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    updateMultiModalInput(content) {
        const multiModalInput = document.getElementById('widget-mm-input')
        multiModalInput.innerHTML = content
    }
    closeAll() {
        if (this.widgetMode === 'minimal-streaming') {
            this.hideWidgetMinimal()
        } else if (this.widgetMode === 'multi-modal') {
            this.hideWidgetMultiModal()
        }
    }
    say = async(text) => {
        const toSay = await this.widget.say('fr-FR', text)
        return toSay
    }
    stopAll() {
        this.widget.stopStreaming()
        this.widget.stopSpeech()
        this.setLintoLeftCornerAnimation('destroy')
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
        this.widget.startAudioAcquisition(true, "slinfox", 0.99)
        this.widget.startStreamingPipeline()
        this.widgetEnabled = true

        // set animation
        this.setLintoRightCornerAnimation('validation')
        this.lintoRightCornerAnimation.onComplete = () => {
            setTimeout(() => {
                this.setLintoRightCornerAnimation('awake')
                const widgetCloseBtn = document.getElementById('widget-close')
                widgetCloseBtn.classList.remove('hidden')
                widgetCloseBtn.classList.add('visible')
            }, 500)
        }
    }
}

module.exports = Widget