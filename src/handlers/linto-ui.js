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
    if (this.hotwordEnabled && this.widgetState === 'waiting') {
        this.widgetState = 'listening'
        if (this.widgetMode === 'minimal-streaming') {
            this.closeWidget()
            this.openMinimalOverlay()
            this.setMinimalOverlayAnimation('listening')
        } else {
            this.openWidget()
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
    this.setWidgetBubbleContent(event.detail.behavior.say.text)

    const mainContent = document.getElementById('widget-ms-content-current')
    this.setMinimalOverlaySecondaryContent(mainContent.innerHTML)
    this.setMinimalOverlayMainContent(event.detail.behavior.say.text)

    await this.widgetSay(event.detail.behavior.say.text)
}

export function streamingChunk(event) {
    if (this.widgetState === 'listening') {
        // VAD
        if (this.streamingMode === 'vad') {
            if (event.detail.behavior.streaming.partial) {
                if (this.debug) {
                    console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
                }
                this.streamingContent = event.detail.behavior.streaming.partial
                this.setUserBubbleContent(this.streamingContent)
                if (this.widgetMode === 'minimal-streaming') {
                    this.setMinimalOverlayMainContent(this.streamingContent)
                }
                this.widgetContentScrollBottom()
            }
            if (event.detail.behavior.streaming.text || event.detail.behavior.streaming.text === '') {
                if (this.debug) {
                    console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
                }
                this.linto.stopStreaming()
                if (this.streamingContent !== '') {
                    this.setUserBubbleContent(event.detail.behavior.streaming.text)
                    this.createBubbleWidget()
                    if (this.widgetMode === 'minimal-streaming') {
                        this.setMinimalOverlayMainContent(event.detail.behavior.streaming.text)
                        this.setMinimalOverlayAnimation('thinking')
                    }
                    this.linto.sendCommandText(event.detail.behavior.streaming.text)
                    this.streamingContent = ''
                    this.widgetState = 'treating'
                } else {
                    if (this.widgetMode === 'minimal-streaming') {
                        setTimeout(() => {
                            this.closeMinimalOverlay()
                            this.widgetState = 'waiting'
                        }, 2000)
                    }
                }
            }
        }
    } else {
        // VAD CUSTOM
        if (this.streamingMode === 'vad-custom' && this.writingTarget !== null) {
            if (event.detail.behavior.streaming.partial) {
                if (this.debug) {
                    console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
                }
                this.streamingContent = event.detail.behavior.streaming.partial
                this.writingTarget.innerHTML = this.streamingContent

            }
            if (event.detail.behavior.streaming.text) {
                if (this.debug) {
                    console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
                }
                this.streamingContent = event.detail.behavior.streaming.text

                this.writingTarget.innerHTML = this.streamingContent
                this.linto.stopStreaming()
                this.linto.startStreamingPipeline()
                this.widgetContentScrollBottom()
                this.streamingContent = ''
                this.widgetState = 'waiting'
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
                    this.streamingContent = ''
                    this.widgetState = 'waiting'

                } else {
                    this.streamingContent += (this.streamingContent.length > 0 ? '\n' : '') + event.detail.behavior.streaming.text
                    this.writingTarget.innerHTML = this.streamingContent
                }
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
    this.widgetState = 'waiting'
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
        let answer = !!e.detail.behavior.chatbot.answer.data[0].text ? e.detail.behavior.chatbot.answer.data[0].text : ''
        let data = e.detail.behavior.chatbot.answer.data // chatbot answers (links)
        if (answer.length > 0) {
            this.setWidgetBubbleContent(answer)
            if (this.widgetMode === 'minimal-streaming') {
                this.setMinimalOverlaySecondaryContent(ask)
                this.setMinimalOverlayMainContent(answer)
                this.setMinimalOverlayAnimation('talking')
            }
        }
        if (data.length > 1 || (answer.length != 0 && data.length === 1)) {
            data.shift()
        }
        this.setWidgetFeedbackData(data)
        this.bindWidgetButtons()
        if (typeof(answer) === 'string') await this.widgetSay(answer)
    }
}