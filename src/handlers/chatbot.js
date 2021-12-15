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
    if (this.chatbotMode === 'minimal-streaming') {
        this.showChatbotMinimal()
    } else if (this.chatbotMode === 'multi-modal') {
        this.showChatbotMultiModal('streaming')
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
        await this.say(event.detail.behavior.say.text)
    }
}
export async function say(text) {
    const toSay = await this.chatbot.say('fr-FR', text)
    return toSay
}

export function customStreaming(streamingMode, target) {
    this.beep.play()
    this.streamingMode = streamingMode
    this.writingTarget = document.getElementById(target)
    this.chatbot.stopStreamingPipeline()
    this.chatbot.startStreaming()
}
export function streamingStart(event) {
    this.beep.play()
    if (this.debug) {
        console.log("Streaming started with no errors")
    }
}
export function streamingFinal(event) {
    if (this.debug) {
        console.log("Streaming ended, here's the final transcript : ", event.detail.behavior.streaming.result)
    }
}
export function streamingStop(event) {
    if (this.debug) {
        console.log("Streaming stop")
    }
    this.streamingMode = 'vad'
    this.writingTarget = null
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
    this.chatbot.addEventListener(label, func)
}