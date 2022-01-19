export function mqttConnectHandler(event) {
    if (this.debug) {
        console.log("MQTT: connected")
    }
}
export function mqttConnectFailHandler(event) {
    if (this.debug) {
        console.log("MQTT: failed to connect")
        console.log(event)
    }
}
export function mqttErrorHandler(event) {
    if (this.debug) {
        console.log("MQTT: error")
        console.log(event.detail)
    }
}
export function mqttDisconnectHandler(event) {
    if (this.debug) {
        console.log("MQTT: Offline")
    }
}
export function audioSpeakingOn(event) {
    if (this.debug) {
        console.log("Speaking")
    }
}
export function audioSpeakingOff(event) {
    if (this.debug) {
        console.log("Not speaking")
    }
}
export function commandAcquired(event) {
    if (this.debug) {
        console.log("Command acquired", event)
    }
}
export function commandPublished(event) {
    if (this.debug) {
        console.log("Command published id :", event.detail)
    }
}
export function hotword(event) {
    if (this.debug) {
        console.log("Hotword triggered : ", event.detail)
    }
    if (this.hotwordEnabled) {
        const widgetMultiModal = document.getElementById('widget-mm')
        if (widgetMultiModal.classList.contains('hidden')) {
            if (this.widgetMode !== 'minimal-streaming') {
                this.openWidget()
            } else {
                this.openMinimalOverlay()
                this.setMinimalOverlayAnimation('listening')
            }
        }
        const widgetFooter = document.getElementById('widget-main-footer')
        const txtBtn = document.getElementById('widget-msg-btn')
        if (widgetFooter.classList.contains('mic-disabled')) {
            txtBtn.classList.remove('txt-enabled')
            txtBtn.classList.add('txt-disabled')
            widgetFooter.classList.remove('mic-disabled')
            widgetFooter.classList.add('mic-enabled')

        }
    }
}
export function commandTimeout(event) {
    if (this.debug) {
        console.log("Command timeout, id : ", event.detail)
    }
}
export async function sayFeedback(event) {
    if (this.debug) {
        console.log("Saying : ", event.detail.behavior.say.text, " ---> Answer to : ", event.detail.transcript)
    }
    let toSay = null
    this.setWidgetBubbleContent(event.detail.behavior.say.text)
    if (this.widgetMode === 'minimal-streaming')  {
        const mainContent = document.getElementById('widget-ms-content-current')
        this.setMinimalOverlaySecondaryContent(mainContent.innerHTML)
        this.setMinimalOverlayMainContent(event.detail.behavior.say.text)

    }
    if (this.audioResponse === 'true') {
        toSay = await this.linto.say('fr-FR', event.detail.behavior.say.text)
        if (toSay !== null) {
            if (this.widgetMode === 'minimal-streaming')  {
                this.closeMinimalOverlay()
            }
        }
    }
    return toSay
}

export function streamingChunk(event) {
    // VAD
    if (this.streamingMode === 'vad') {
        if (event.detail.behavior.streaming.partial) {
            if (this.debug) {
                console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
            }
            this.setUserBubbleContent(event.detail.behavior.streaming.partial)
            if (this.widgetMode === 'minimal-streaming') {
                this.setMinimalOverlayMainContent(event.detail.behavior.streaming.partial)
            }
            this.widgetContentScrollBottom()

        }
        if (event.detail.behavior.streaming.text) {
            if (this.debug) {
                console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
            }
            this.setUserBubbleContent(event.detail.behavior.streaming.text)
            this.linto.stopStreaming()
            this.createBubbleWidget()

            if (this.widgetMode === 'minimal-streaming') {
                this.setMinimalOverlayMainContent(event.detail.behavior.streaming.text)
                this.setMinimalOverlayAnimation('thinking')
            }
            this.widgetContentScrollBottom()
            setTimeout(() => {
                this.linto.sendCommandText(event.detail.behavior.streaming.text)
            }, 1000)
        }
    }
    // VAD CUSTOM
    else if (this.streamingMode === 'vad-custom' && this.writingTarget !== null) {
        if (event.detail.behavior.streaming.partial) {
            if (this.debug) {
                console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
            }
            this.writingTarget.innerHTML = event.detail.behavior.streaming.partial
        }
        if (event.detail.behavior.streaming.text) {
            if (this.debug) {
                console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
            }
            this.writingTarget.innerHTML = event.detail.behavior.streaming.text

            this.linto.stopStreaming()
            this.linto.startStreamingPipeline()
            this.widgetContentScrollBottom()
        }
    }
    // STREAMING + STOP WORD ("stop")
    else if (this.streamingMode === 'infinite' && this.writingTarget !== null) {
        if (event.detail.behavior.streaming.partial) {
            if (this.debug) {
                console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
            }
            if (event.detail.behavior.streaming.partial !== this.streamingStopWord) {
                this.writingTarget.innerHTML = this.streamingContent + (this.streamingContent.length > 0 ? '\n' : '') + event.detail.behavior.streaming.partial
            }
        }
        if (event.detail.behavior.streaming.text) {
            if (this.debug) {
                console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
            }
            if (event.detail.behavior.streaming.text === this.streamingStopWord) {
                this.linto.stopStreaming()
                this.linto.startStreamingPipeline()

            } else {
                this.streamingContent += (this.streamingContent.length > 0 ? '\n' : '') + event.detail.behavior.streaming.text
                this.writingTarget.innerHTML = this.streamingContent
            }
        }
    }
}


export function streamingStart(event) {
    this.beep.play()
    if (this.debug) {
        console.log("Streaming started with no errors")
    }
    const micBtn = document.getElementById('widget-mic-btn')
    micBtn.classList.add('recording')
    this.cleanUserBubble()
    this.createUserBubble()
}

export function streamingStop(event) {
    if (this.debug) {
        console.log("Streaming stop")
    }
    this.cleanUserBubble()
    this.streamingMode = 'vad'
    this.writingTarget = null
    const micBtn = document.getElementById('widget-mic-btn')
    micBtn.classList.remove('recording')
}
export function streamingFinal(event) {
    if (this.debug) {
        console.log("Streaming ended, here's the final transcript : ", event.detail.behavior.streaming.result)
    }
}
export function streamingFail(event) {
    if (this.debug) {
        console.log("Streaming cannot start : ", event.detail)
    }
    if (event.detail.behavior.streaming.status === 'chunk') {
        this.linto.stopStreaming()
        this.linto.stopStreamingPipeline()
    }
    this.cleanUserBubble()

    if (this.widgetMode === 'multi-modal') this.closeWidget()
    if (this.widgetMode === 'minimal-streaming') this.closeMinimalOverlay()

    const micBtn = document.getElementById('widget-mic-btn')
    if (micBtn.classList.contains('recording')) {
        micBtn.classList.remove('recording')
    }

    this.setWidgetRightCornerAnimation('error')
    this.widgetRightCornerAnimation.onComplete = () => {
        this.linto.startStreamingPipeline()
        setTimeout(() => {
            this.setWidgetRightCornerAnimation('awake')
        }, 500)
    }
}
export function textPublished(e) {
    if (this.debug) {
        console.log('textPublished', e)
    }
}
export function chatbotAcquired(e) {
    if (this.debug) {
        console.log('chatbotAcquired', e)
    }
}
export function chatbotPublished(e) {
    if (this.debug) {
        console.log('chatbotPublished', e)
    }
}
export function actionPublished(e) {
    if (this.debug) {
        console.log('actionPublished', e)
    }
}
export function actionFeedback(e) {
    if (this.debug) {
        console.log('actionFeedback', e)
    }
}
export async function customHandler(e) {
    if (this.debug) {
        console.log('customHandler', e)
    }
    this.cleanWidgetBubble()
    this.closeMinimalOverlay()
}
export function askFeedback(event) {
    if (this.debug) {
        console.log('Ask feedback', event)
    }
}
export async function widgetFeedback(e) {
    if (this.debug) {
        console.log('chatbot feedback', e)
    }
    if (!!e.detail && !!e.detail.behavior.chatbot) {
        let ask = e.detail.behavior.chatbot.ask
        let answer = e.detail.behavior.chatbot.answer.text
        let data = e.detail.behavior.chatbot.answer.data // chatbot answers (links)

        if (answer.length > 0) {
            this.setWidgetBubbleContent(answer)
            if (this.widgetMode === 'minimal-streaming') {
                this.setMinimalOverlaySecondaryContent(ask)
                this.setMinimalOverlayMainContent(answer)
                this.setMinimalOverlayAnimation('talking')
            }
        }

        this.setWidgetFeedbackData(data)
        let isLink = this.stringIsHTML(answer)
        if (this.audioResponse === 'true') {
            if (!isLink) {
                let sayResp = await this.linto.say('fr-FR', answer)
                if (this.widgetMode === 'minimal-streaming') {
                    if (!!sayResp) {
                        this.closeMinimalOverlay()
                    } else {
                        setTimeout(() => {
                            this.closeMinimalOverlay()
                        }, 4000)
                    }
                }
            }
        } else {
            if (this.widgetMode === 'minimal-streaming') {
                setTimeout(() => {
                    this.closeMinimalOverlay()
                }, 4000)
            }
        }
    }
}