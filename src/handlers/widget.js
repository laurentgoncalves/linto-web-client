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
            this.openWidget()
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
    const toSay = await this.widget.say('fr-FR', event.detail.behavior.say.text)
    return toSay
}

export function streamingChunk(event) {

    // VAD
    if (this.streamingMode === 'vad') {
        if (event.detail.behavior.streaming.partial) {
            if (this.debug) {
                console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
            }

        }
        if (event.detail.behavior.streaming.text) {
            if (this.debug) {
                console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
            }
            this.setUserBubbleContent(event.detail.behavior.streaming.text)
            this.widget.stopStreaming()
            this.createBubbleWidget()
            setTimeout(() => {
                this.widget.sendCommandText(event.detail.behavior.streaming.text)

            }, 1000)

            /*if (this.widgetMode === 'minimal-streaming') {
                this.updateCurrentMSContent(event.detail.behavior.streaming.text)
                this.updatewidgetFeedback({
                    user: 'user',
                    value: event.detail.behavior.streaming.text
                })
            } else if (this.widgetMode === 'multi-modal') {
                this.updateMultiModalUser(event.detail.behavior.streaming.text)
                this.updateMultiModalInput('')
                const micBtn = document.getElementById('widget-mm-mic')
                micBtn.classList.remove('streaming')
            }
            */
        }
    }
    // VAD CUSTOM
    else if (this.streamingMode === 'vad-custom' && this.writingTarget !== null) {
        /*if (event.detail.behavior.streaming.partial) {
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

            this.widget.stopStreaming()
            this.widget.startStreamingPipeline()
        }*/
    }
    // STREAMING + STOP WORD ("stop")
    else if (this.streamingMode === 'infinite' && this.writingTarget !== null) {
        /*if (event.detail.behavior.streaming.partial) {
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
                this.widget.stopStreaming()
            } else {
                this.streamingContent += (this.streamingContent.length > 0 ? '\n' : '') + event.detail.behavior.streaming.text
                this.writingTarget.innerHTML = this.streamingContent
            }

        }*/
    }
}
export function customStreaming(streamingMode, target) {
    this.beep.play()
    this.streamingMode = streamingMode
    this.writingTarget = document.getElementById(target)
    this.widget.stopStreamingPipeline()
    this.widget.startStreaming()
}

export function streamingStart(event) {
    this.beep.play()
    if (this.debug) {
        console.log("Streaming started with no errors")
    }
    const micBtn = document.getElementById('widget-mic-btn')
    micBtn.classList.add('recording')
    this.createUserBubble()


}
export function streamingStop(event) {
    if (this.debug) {
        console.log("Streaming stop")
    }
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
        /*    this.widget.stopStreaming()
            this.widget.stopStreamingPipeline()
        }
        if (this.widgetMode === 'multi-modal') this.hideWidgetMultiModal()
        if (this.widgetMode === 'minimal-streaming') this.hideWidgetMinimal()

        const streamingBtns = document.getElementsByClassName('linto-widget-streaming-btn')
        for (let btn of streamingBtns) {
            if (btn.classList.contains('streaming-on')) {
                btn.classList.remove('streaming-on')
            }
        }

        this.setLintoRightCornerAnimation('error')
        this.lintoRightCornerAnimation.onComplete = () => {
            this.widget.startStreamingPipeline()
            setTimeout(() => {
                this.setLintoRightCornerAnimation('awake')
            }, 500)*/
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
}
export function askFeedback(event) {
    if (this.debug) {
        console.log('Ask feedback', event)
    }
}
export function setHandler(label, func) {
    this.widget.addEventListener(label, func)
}
export async function widgetFeedback(e) {
    if (this.debug) {
        console.log('chatbot feedback', e)
    }
    /* if (!!e.detail && !!e.detail.behavior) {
         let ask = e.detail.behavior.chatbot.ask
         let answer = e.detail.behavior.chatbot.answer.text
         let data = e.detail.behavior.chatbot.answer.data // chatbot answers (links)

         if (this.widgetMode === 'minimal-streaming') {
             this.updateCurrentMSContent(answer)
             this.updatePrevioustMSContent(ask)
             this.setLintoLeftCornerAnimation('talking')
             this.updatewidgetFeedback({
                 user: 'bot',
                 value: answer
             })
             this.updatewidgetFeedbackData(data)
         }
         if (this.widgetMode === 'multi-modal') {
             if (answer.length > 0) {
                 this.updateMultiModalBot(answer)
             }
             this.updateMultiModalData(data)
         }

         // Response
         let sayResp = await this.widget.say('fr-FR', answer)
         if (!!sayResp) {
             this.stopAll()
             if (this.widgetMode !== 'multi-modal') {
                 this.hideWidgetMinimal()
             }
         }
     }*/
}