import linto from './linto.js'
import lottie from './lib/lottie.min.js'
import * as handlers from './handlers/widget.js'
import fs from 'fs'

const micJson = require('./assets/json/microphone.json')
const lintoThinkJson = require('./assets/json/linto-think.json')
const lintoTalkJson = require('./assets/json/linto-talking.json')
const lintoSleepJson = require('./assets/json/linto-sleep.json')
const lintoAwakeJson = require('./assets/json/linto-awake.json')
const errorJson = require('./assets/json/error.json')
const validationJson = require('./assets/json/validation.json')

// Beep audio file > base64
const audioFileBase64 = 'data:audio/ogg;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uSwAAAAAABLBQAAALww+e/OUAAABAAADAGAHAIAwSAAAGI8/+ZHBGQYYZf/YvG2TqZMA3/b0YxGJEE/AzKEA5n+BhgwG/DgYQ5/gagMBslgKKAAhf/hQAEwAGSAAZ0SF+v/eLgFkCEgeoLEJD/1m5uhEAwwWBlKQHsaAd1mDA4ep//+XSXIIOYRBioZm//2939FOThTNxO5PuRMw////d/HAF9Ab3AaBhdwYUDVYDBcLGBBgAoMAYeNscZQ/////////2Fxm6aCzcPgD5CQHAAAAAAQAUAgAkDgAAAAAMSUCP3IxYGbXmA0w3EHEy/HIwKCMaAOgGgAqmQhuGEQZhYA8AcCWY6LjTQ2mmH0bKh4niETmbQnfxjO6lgEHMBGAzoKE86mb+3rkafiZbKIQgYVCaNyCKzDanMmqdeFyJfgtVuLRwUH1TAwF3uwCuGJ1MOPon0718GhowiIjI5OO+0kxoXDCIiAyEAAHfkkAJiQ3BgTjAcHzAYCfoUARjI4g4GtLGAAMA0cAgNALDYZg53WAN46FMPAKg/t+RW4XSrov/7ksBoACyKH03Z3hADPi3vd7DwB1/OZ0lO+FI7a4YosBLtPtHqGn7ucwpJb23uP2e1Z7VyY3eps1pmCQCyVDoBhsiCBAQYEDEFqaFA4RqhSgEqhhgmDVCsBSx2kDdxuDoeyv2JO3PJw0i6dbaNcnbKptat8s0jpTnZ23SOkp6UxP///////////ghkk9hEJ6aY06uUA///////////9PQxnsYt21Em83UrLLm390qBbM0sMwIVMPKU0BTGwz9PEJ2hc2XrvkeLxWIQboWyfPVyNBD2eG5qtnpuKwOBhoJXLZ8KyP83zqh+vJZsSPJoK3CVk9Jme19K28+NZzXJLY//97KQOp48iv53mmOqGHGvD0GQvmmaczw5ydlzUceArFYyP349ZCy3qNEF0E0BzhG0ebghAKQWBfJ2WAc4KcWMzA1ByibqoSd8EcJoN9CiWHuY5b0kSwzzzUB/qZCS8DyRSpOtsgqRNRGb3xrPpp9ThhbKQ/82nfJs8Ketu20jRCEWdm5PymMspXSgKSOOENOW/Bw8ChzEgRM0+3t093rxPIn/+5LAFIAVeVeFrT2Nurmq7zWnpbJga0PcEm3KhD1UciVVxoEMd3L4Xw4IFq794nzS35e+0pW+duZSnTszmda8/P71q2o9dnmrs1ZW1aXTVatatVatWrVpyfH1nrWXPfZpq1vqtozWWntW0swSkYgkQRjsfTpSSh7HUQiWaE4qrzUShSQDciloxqiDll1VVWahapHZEYkznvkUaVl1tttFaXPm89ahjMF0zdDSYDoRAC5NgLbNa1q6/xnT7OIUd4YCGGIWh1l9C+CSkEAxEmVzMXH1xFbp48aOylFmRPBNmBgXXDIm40imJjDYpjBkmMueTCQjJEJ5KQoXxjicgQpkBCIwpqicBWiuDMTci9HS6hIpjHIDKFFpIw1eCsVm9fUZsT0yX2KjyAgHeskogtI99bgbNz//oxd4XeoQDScEBpAuBDIHDgCHeDEAZ3uutkg5Zwl8saWDIhzviVBcreu/8zP1mhfEMG4NyAHwNQmH6rsvfPXuvP/OJ6OK1609rfa1/JrU2tRs6j4ltWPXdaWtumYUKskCb1t/S0GnmtWLXFIN//uSwC2AFZlZi+0x7brDKu+1tj2yYO81vFmrmHDm3Fa/JDa5ZctklmB8vJRthuUifQ44zgU60TA4CdkvUwuY/0QEMBUBgDADUFgDVgqwTYDG0kwAOCWEbpnqcDnVAxKjcoNjNLiwMttIVsttttsGtWIbFAoxwiNQtDKoFpvf/n/qwmCGFYSD2ps1C6+xRhQzGsP12urZ13rLP+dvS959sxsVzjGN1tvFPCtmmr+l9X1WlsUzE8eG3z3h2gUb39mB0pjoaj5J2xEEQ0v5C3MT8FOHOEfAWxCxxjkEMAzlABcFJAhkuBAAmxNgaQZADmHQEjBiCJiAgJxzHOMUvyOIKsF+JMpi3EKZtpE6UNL6hTlWCcqGrKeOoNqArJbbbIyjlZgdHQzFIL75D//+VevNAsOJO11shWY5ZOOlhlqIjnTIN6eyx6jTaJXPet487T61WvY7t2613Kk5nNQxLYftQxXnI3XdCEMzeWINBo0xGUDIYcmFDgGOrYFTSUgRCgYoVTLxAEMiTCxIgCL1CEUBIs5C4QCGR5Lk3qsRpYzDMO1YzP/7ksBFABWtRYGtIy2yeibvfYYxs7aanh2pflPdfjvDLvcbP75/5Z97Z3l3n1GhAiI/9FdTlE6hsMIETIqNtvo3Anq3J6xARkQBEySWb+xnVhl1ajiPAqAITOtOWNi9cmEuM5SLzbIDmBQpVPV9xP0a7VZ8+eHawbwOsQoTo4kdvap0rrr0D5ZuSjLeZ7etaBam+zry0JT1KSRBEUGoik0TgSNQbIIUioSyYNx0HQKxoHEfwkIo5h/CE4jmZbuVz8zJChOZvLK+wrXv6+wsm6yQ6sjnsRyC1hLcckkssTDipzQyyJD0AJGCgOygKNCiUtez17m9bIsylRomQpCnNORVxM2exT9VLc4XZIbGr2NT2rjcd7LqsGMrnBmjKOGzLiLBiNytf3zDjx2/0zpkkba4bWS7bD8V9KsSt9Viu5Vllzanhq5zeq1iVzeXGw+jrkZo7pmunWJ9DOVDTRLihqwnSUoSvEKXxwm8hYNIIaFCFnBYCTh+BrkqFWFYI+KIJAgQVZ5jkBjoWexCBbAbgmghAxL3tAiZB44T6vq/zDm0lt3/+5LAZYAYqWNvrL3tkxez7vWGMbO2zLYmtv8w3JcrxF73JVKfRtkdWLToqw8WnznVYMjIRhqFY/6Sz9aytpe0EnrrolIR+YVbLa9VT7mBWfeQyO2fRHx4PZVWpDGxoqLf4cJizZxneaOICghlpcyRSwZHZVQmSvRWVrIxBcZLuusWJ5kmZJ6pEUh8XHRoERaPRFNDNtQIB+KgPCWflVKrptbY9RVyVRdK0JTYkllkqg1PTFxm5zAuXWZW4uhVLYE6xesbYaiX4eNr/YXv3++3u+qPMuoAh3cCJHht///8ID9risb0v4EjmEATBJxj219JfcfWFxoq1q8+VQah6BYUjMwLaYiGJ8jOmI8sVDo/Sk4cjsyEktA0UnZsuJBkdYW33B4LHFQREVV2NJzM0Ox0MDFHCT3ikTKiWS0ZMOCwWGYFZIMCgdB4nQhHoYRCBBcnDAmwCGdJR4ENauDc1bFZ4IZfJLjoToC84Dk4aUNRvGKK6wusMu+zEXjf7qTonGyVbBP//7rR6DSED91cQ7KAErtddtvwEcZyQM5JkilB6kNJ//uSwGYAFtVZg+exjZK8qu+897GyzI+LsStCzjp2JlUdi0LHoyIaPVz1m1mrejTmCuM8OQWcpy4MiRez0izwcuVJCT+n5MOh6HMGzalDHI8D8nqiBY1jKokxqTk5KzCDQyK10sCM6PuY4yQ3kw5Kkx8vPCkUFicxjow8f3YI4lBKhg0OlcGiKeEFWeLhFHJzz4+LFoFxdYVeJN2hc5So5GZcJ4knq0QVsrS3hANR1Jh3ZgEkX3/f/gHETstgdUQ2Fo7oSoH8GptDQ0JMasY641fXNc1zFrpFRWxdsLfBmbn6Gq1h01Rm5mY6ratUkMQz1MqgNViZO0iJtlxOupTPFVQZOc6ZF1orVLJ9AhmDa7SQ2TLEg/Sk1fSKiEbLmly7z5nVLwsPCUgpU+FZw7ITSWsSx0kdCgI4nw8etFEePxrCLMK5KW3SUtdiKZseugxbPLlJ+Ih3ZAAAu/2tgDunxhZY1ZubMopAfRKHUYS////iHOdcrw58HyFMU5L6RsDpNJpSQ30I8THVniqPlrJ3aqTlErZKo6NN1gqhRaqFKlCghv/7ksB5gBSRV3nnvY2Sj6rvvJWxt4iQmz1cVUh8OsWHqc9juuk9LpqPJZRtPwGbSqSYXlrJKeTCUvmVDxOPktGUh47fHCnAxctrzOSoeJRDJaocwTBMG4Nz+1lP+AOidPEDzyKSpQMqqqhgl2Z2UAAHbbrECUrgcpLB6lEW4uR3radQ1lqf2aIcfADcARB1NtN////Ot4w5srC2LVL0bmNkVUzNWFvtyibXhfjqQ5Dl5XpU6sHUwzKZwZlM0uO2pRTxk6qRzDyNFWxGtjVMsVtJyeh5N0zasxm5aisSRQrCisxXYUNVs6dpfXrIzZpduY3i7VifV6EIMsJchgl0JuOlhbFUnXiHN6hXkNbDSdn6aLipi3GiqZE8aRpE6J0Tp69e1rh8+jYhRsvdQtwbvcBMoNDVupAAAFlllIzsNQ0dQl+L8eqSTKYSJ7GaVB2KNwvi+JW5uh0vr4gwoUOl6ZxnGP/9WgwpJcZc1IpIIqKzR7Lp0/MTExMsura5qSibH1bXKzExxMT/05pKKSkwVURNhtDIFQpDAdY+GZaTiSSiCKz/+5LAm4AZIYFZ573tmnS24eA3rbnQ+x9XETF/zETH//dOa41JRAkCUG5x7HsmYv+XTMTExMTLLpzXIpJJsHP5Siq+vYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwK6AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwP+AAAABLAAAAAAAACWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7ksD/gAAAASwAAAAAAAAlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAD/+5LA/4AAAAEsAAAAAAAAJYAAAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAA'

// HMTL Template file
const htmlTemplate = fs.readFileSync('./src/assets/template/widget-default.html', 'utf8');

// Inserting CSS to DOM
const cssFile = fs.readFileSync('./dist/widget.min.css', 'utf8');

export default class LintoUI {
    constructor(data) {
        /* REQUIRED */
        this.containerId = null
        this.lintoWebHost = ''
        this.lintoWebToken = ''

        // GLOBAL 
        this.linto = null
        this.widgetEnabled = false
        this.widgetMode = 'mutli-modal'
        this.widgetContainer = null
        this.debug = false
        this.streamingStopWord = 'stop'

        // STATES 
        this.streamingMode = 'vad'
        this.writingTarget = null
        this.streamingContent = ''
        this.widgetState = 'sleeping'

        // SETTINGS 
        this.hotwordValue = 'linto'
        this.hotwordEnabled = 'true'
        this.audioResponse = 'true'

        // ELEMENTS 
        this.widgetFeedbackContent = []
        this.beep = null

        // CUSTOM EVENTS 
        this.lintoCustomEvents = []

        // ANIMATIONS 
        this.widgetRightCornerAnimation = null
        this.widgetminimalOverlayAnimation = null
        this.widgetMicAnimation = micJson
        this.widgetThinkAnimation = lintoThinkJson
        this.widgetSleepAnimation = lintoSleepJson
        this.widgetTalkAnimation = lintoTalkJson
        this.widgetAwakeAnimation = lintoAwakeJson
        this.widgetErrorAnimation = errorJson
        this.widgetValidateAnimation = validationJson

        // CUSTOMIZATION
        this.widgetTitle = 'Linto Widget'

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
            if (!!data.hotwordValue) {
                this.hotwordValue = data.hotwordValue
            }
            if (!!data.hotwordEnabled) {
                this.hotwordEnabled = data.hotwordEnabled
            }
            if (!!data.audioResponse) {
                this.audioResponse = data.audioResponse
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
            // CUSTO / CSS
            if (!!data.widgetTitle) {
                this.widgetTitle = data.widgetTitle
            }
            let style = document.createElement('style');
            let cssRewrite = cssFile
            if (!!data.cssPrimarycolor) {
                cssRewrite = cssRewrite.replace(/#59bbeb/g, data.cssPrimarycolor)
            }
            if (!!data.cssSecondaryColor) {
                cssRewrite = cssRewrite.replace(/#055e89/g, data.cssSecondaryColor)
            }
            style.textContent = cssRewrite;
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        // First initialisation
        if (!this.widgetEnabled) {
            // HTML (right corner)
            this.widgetContainer.innerHTML = htmlTemplate
            setTimeout(() => {
                this.updateStyle(data)
            }, 400)

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
            const widgetFooter = document.getElementById('widget-main-footer')
            const inputContent = document.getElementById('chabtot-msg-input')
            const txtBtn = document.getElementById('widget-msg-btn')
            const micBtn = document.getElementById('widget-mic-btn')
            const inputError = document.getElementById('chatbot-msg-error')
            const closeMinimalOverlayBtn = document.getElementById('widget-ms-close')
            if (this.widgetMode === 'minimal-streaming') {
                widgetFooter.classList.add('hidden')
            }

            // Audio hotword sound
            this.beep = new Audio(audioFileBase64)
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
                    this.linto.startStreaming(0)
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

                let hotwordEnabled = document.getElementById('widget-init-settings-hotword')
                let audioResponseEnabled = document.getElementById('widget-init-settings-say-response')

                let options = {
                    hotwordEnabled: hotwordEnabled.checked,
                    audioResponseEnabled: audioResponseEnabled.checked
                }
                await this.initLintoWeb(options)
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
                this.hideSettings()
            }

            // Widget MIC BTN
            micBtn.onclick = async() => {
                if (widgetFooter.classList.contains('mic-disabled')) {
                    txtBtn.classList.remove('txt-enabled')
                    txtBtn.classList.add('txt-disabled')
                    widgetFooter.classList.remove('mic-disabled')
                    widgetFooter.classList.add('mic-enabled')

                }
                if (micBtn.classList.contains('recording')) {
                    this.linto.stopStreaming()
                    this.cleanUserBubble()
                } else {
                    this.linto.startStreaming(0)
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
                    const text = inputContent.innerHTML
                    if (this.stringAsSpecialChar(text)) {
                        inputError.innerHTML = 'Caractères non autorisés'
                        return
                    } else {
                        this.createUserBubble()

                        this.setUserBubbleContent(text)
                        this.linto.sendCommandText(text)
                        this.createBubbleWidget()
                        inputContent.innerHTML = ''
                    }
                }
            }
            document.addEventListener('keypress', (e) => {
                if (e.key == 13 || e.key === 'Enter') {
                    e.preventDefault()

                    if (inputContent === document.activeElement && inputContent.innerHTML !== '') {
                        const text = inputContent.innerHTML
                        if (this.stringAsSpecialChar(text)) {
                            inputError.innerHTML = 'Caractères non autorisés'
                            return
                        } else {
                            this.createUserBubble()
                            this.setUserBubbleContent(text)
                            this.linto.sendCommandText(text)
                            this.createBubbleWidget()
                            inputContent.innerHTML = ''
                        }

                    }
                }
            })
            inputContent.oninput = () => {
                if (inputError.innerHTML.length > 0) {
                    inputError.innerHTML = ''
                }
            }

            // MINIMAL OVERLAY
            closeMinimalOverlayBtn.onclick = () => {
                this.closeMinimalOverlay()
                this.linto.stopStreaming()
                this.linto.stopSpeech()
            }

            // MINIMAL SHOW WIDGET
            widgetShowMinimal.onclick = () => {
                this.openWidget()
            }

            // Local Storage and settings
            if (localStorage.getItem('lintoWidget') !== null) {
                const storage = JSON.parse(localStorage.getItem('lintoWidget'))

                if (!!storage.hotwordEnabled) {
                    this.hotwordEnabled = storage.hotwordEnabled

                }
                if (!!storage.audioRespEnabled) {
                    this.audioResponse = storage.audioRespEnabled
                }
                let options = {
                    hotwordEnabled: storage.hotwordEnabled,
                    audioResponseEnabled: storage.audioRespEnabled
                }

                if (storage.widgetEnabled === true || storage.widgetEnabled === 'true') {
                    await this.initLintoWeb(options)

                }
            }
            this.hotwordEnabled === 'false' ? settingsHotword.checked = false : settingsHotword.checked = true
            this.audioResponse === 'false' ? settingsAudioResp.checked = false : settingsAudioResp.checked = true
        }
    }
    updateStyle(data) {
        const widgetTitleMain = document.getElementsByClassName('widget-mm-title')[0]
        const widgetTitleInit = document.getElementsByClassName('widget-init-title')[0]
        widgetTitleMain.innerHTML = this.widgetTitle
        widgetTitleInit.innerHTML = this.widgetTitle
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
            if (!!cb) {
                this.widgetRightCornerAnimation.onComplete = () => {
                    cb()
                }
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
        this.widgetContentScrollBottom()
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

        let enableHotwordInput = document.getElementById('widget-settings-hotword')
        let enableSayRespInput = document.getElementById('widget-settings-say-response')
        if (!this.hotwordEnabled || this.hotwordEnabled === 'false') {
            enableHotwordInput.checked = false
        }
        if (!this.audioResponse || this.audioResponse === 'false') {
            enableSayRespInput.checked = false
        }
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
            this.linto.stopStreamingPipeline()
            this.linto.stopAudioAcquisition()
            this.linto.startAudioAcquisition(false, this.hotwordValue, 0.99)
            this.linto.startStreamingPipeline()
        } else if (hotwordCheckbox.checked && this.hotwordEnabled === 'false') {
            this.hotwordEnabled = 'true'
            this.linto.stopStreamingPipeline()
            this.linto.stopAudioAcquisition()
            this.linto.startAudioAcquisition(true, this.hotwordValue, 0.99)
            this.linto.startStreamingPipeline()
        }
        if (!audioRespCheckbox.checked && this.audioResponse === 'true') {
            this.audioResponse = 'false'
        } else if (audioRespCheckbox.checked && this.audioResponse === 'false') {
            this.audioResponse = 'true'
        }
        let widgetStatus = {
            widgetEnabled: this.widgetEnabled,
            hotwordEnabled: this.hotwordEnabled,
            audioRespEnabled: this.audioResponse
        }
        localStorage.setItem('lintoWidget', JSON.stringify(widgetStatus))
    }

    // WIDGET CONTENT BUBBLES
    cleanUserBubble() {
        let userBubbles = document.getElementsByClassName('user-bubble')
        for (let bubble of userBubbles) {
            if (bubble.innerHTML.indexOf('loading') >= 0) {
                bubble.remove()
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
        this.widgetContentScrollBottom()
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
        if (this.stringIsHTML(text)) {
            current.innerHTML = text
        } else {
            current.innerHTML = `<span class="content-item">${text}</span>`
        }
        this.widgetContentScrollBottom()
    }
    cleanWidgetBubble() {
        let widgetBubbles = document.getElementsByClassName('widget-bubble')
        for (let bubble of widgetBubbles) {
            if (bubble.innerHTML.indexOf('loading') >= 0) {
                bubble.remove()
            }
        }
    }
    stringIsHTML(str) {
        const regex = /[<>]/
        return regex.test(str)
    }
    stringAsSpecialChar(str) {
        const regex = /[!@#$%^&*()"{}|<>]/
        return regex.test(str)
    }

    // Update feedback window data content (links, img...)
    setWidgetFeedbackData(data) {
        this.cleanWidgetBubble()
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
                this.linto.sendWidgetText(value)
            }
        }
        this.widgetContentScrollBottom()

    }
    widgetContentScrollBottom() {
        const contentWrapper = document.getElementById('widget-main-content')
        contentWrapper.scrollTo({
            top: contentWrapper.scrollHeight,
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
        this.setMinimalOverlayMainContent('')
    }
    setMinimalOverlayMainContent(txt) {
        const mainContent = document.getElementById('widget-ms-content-current')
        mainContent.innerHTML = txt
    }
    setMinimalOverlaySecondaryContent(txt) {
        const secContent = document.getElementById('widget-ms-content-previous')
        secContent.innerHTML = txt
    }
    async widgetSay(answer) {
        this.linto.stopSpeech()
        let isLink = this.stringIsHTML(answer)
        let sayResp = null
        this.widgetState = 'saying'
        if (this.audioResponse === 'true' && !isLink) {
            sayResp = await this.linto.say('fr-FR', answer)
            this.widgetState = 'waiting'
        } else {
            this.widgetState = 'waiting'
        }
        if (sayResp !== null) {
            if (this.widgetMode === 'minimal-streaming') {
                this.closeMinimalOverlay()
            }
            this.widgetState = 'waiting'
        } else {
            if (this.widgetMode === 'minimal-streaming') {
                setTimeout(() => {
                    this.closeMinimalOverlay()
                }, 4000)
                this.widgetState = 'waiting'
            }
        }
    }
    async stopAll() {
        this.linto.stopStreaming()
        this.linto.stopStreamingPipeline()
        this.linto.stopAudioAcquisition()
        this.linto.stopSpeech()
        await this.linto.logout
        this.widgetEnabled = false
        this.hideSettings()
        localStorage.clear()
    }

    customStreaming(streamingMode, target) {
        this.beep.play()
        this.streamingMode = streamingMode
        this.writingTarget = document.getElementById(target)
        this.linto.stopStreamingPipeline()
        this.linto.startStreaming(0)
    }
    setHandler(label, func) {
        this.linto.addEventListener(label, func)
    }
    initLintoWeb = async(options) => {
        // Set chatbot
        this.linto = new Linto(this.lintoWebHost, this.lintoWebToken)

        // Chatbot events
        this.linto.addEventListener("mqtt_connect", handlers.mqttConnectHandler.bind(this))
        this.linto.addEventListener("mqtt_connect_fail", handlers.mqttConnectFailHandler.bind(this))
        this.linto.addEventListener("mqtt_error", handlers.mqttErrorHandler.bind(this))
        this.linto.addEventListener("mqtt_disconnect", handlers.mqttDisconnectHandler.bind(this))
        this.linto.addEventListener("command_acquired", handlers.commandAcquired.bind(this))
        this.linto.addEventListener("command_published", handlers.commandPublished.bind(this))
        this.linto.addEventListener("speaking_on", handlers.audioSpeakingOn.bind(this))
        this.linto.addEventListener("speaking_off", handlers.audioSpeakingOff.bind(this))
        this.linto.addEventListener("streaming_start", handlers.streamingStart.bind(this))
        this.linto.addEventListener("streaming_stop", handlers.streamingStop.bind(this))
        this.linto.addEventListener("streaming_chunk", handlers.streamingChunk.bind(this))
        this.linto.addEventListener("streaming_final", handlers.streamingFinal.bind(this))
        this.linto.addEventListener("streaming_fail", handlers.streamingFail.bind(this))
        this.linto.addEventListener("hotword_on", handlers.hotword.bind(this))
        this.linto.addEventListener("ask_feedback_from_skill", handlers.askFeedback.bind(this))
        this.linto.addEventListener("say_feedback_from_skill", handlers.sayFeedback.bind(this))
        this.linto.addEventListener("custom_action_from_skill", handlers.customHandler.bind(this))
        this.linto.addEventListener("startRecording", handlers.textPublished.bind(this))
        this.linto.addEventListener("chatbot_acquired", handlers.chatbotAcquired.bind(this))
        this.linto.addEventListener("chatbot_published", handlers.chatbotPublished.bind(this))
        this.linto.addEventListener("action_published", handlers.actionPublished.bind(this))
        this.linto.addEventListener("action_feedback", handlers.actionFeedback.bind(this))
        this.linto.addEventListener("chatbot_feedback", handlers.widgetFeedback.bind(this))
        this.linto.addEventListener("chatbot_feedback_from_skill", handlers.widgetFeedback.bind(this))

        // Widget login

        try {
            let login = await this.linto.login()
            if (login === true) {
                this.widgetEnabled = true

                // Bind custom events
                if (this.lintoCustomEvents.length > 0) {
                    for (let event of this.lintoCustomEvents) {
                        this.setHandler(event.flag, event.func)
                    }
                }
                this.hotwordEnabled = options.hotwordEnabled
                this.audioResponse = options.audioResponseEnabled

                if (!this.hotwordEnabled || this.hotwordEnabled === 'false') {
                    this.linto.startAudioAcquisition(false, this.hotwordValue, 0.99)
                } else {
                    this.linto.startAudioAcquisition(true, this.hotwordValue, 0.99)
                }

                this.linto.startStreamingPipeline()
                this.widgetState = 'waiting'
                let widgetStatus = {
                    widgetEnabled: this.widgetEnabled,
                    hotwordEnabled: this.hotwordEnabled,
                    audioRespEnabled: this.audioResponse
                }
                localStorage.setItem('lintoWidget', JSON.stringify(widgetStatus))
                this.startWidget()
            } else {
                throw login
            }
        } catch (error) {
            this.closeWidget()
            this.setWidgetRightCornerAnimation('error', () => {
                if (!!error.message) {
                    let widgetErrorMsg = document.getElementById('widget-error-message')
                    widgetErrorMsg.classList.remove('hidden')
                    widgetErrorMsg.innerHTML = error.message
                    setTimeout(() => {
                        widgetErrorMsg.classList.add('hidden')
                        widgetErrorMsg.innerHTML = ''
                        this.setWidgetRightCornerAnimation('sleep')
                        let widgetStatus = {
                            widgetEnabled: false,
                            hotwordEnabled: false,
                            audioRespEnabled: false
                        }
                        localStorage.setItem('lintoWidget', JSON.stringify(widgetStatus))
                    }, 4000)
                }
            })
            return
        }
    }
}

window.LintoUI = LintoUI
module.exports = LintoUI