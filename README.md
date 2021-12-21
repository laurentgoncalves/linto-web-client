# linto-web-client

A full figured LinTO client designed for building custom voice interactions on a webpage.

See demo here : [linto.ai](https://linto.ai)

__Note__ : LinTO Web client relies on WebVoiceSDK for handling everything related to audio input, hotword triggers, recordings... See [LinTO WebVoiceSDK on NPM](https://www.npmjs.com/package/@linto-ai/webvoicesdk) for more informations

__Note__ : Any LinTO web client needs to have a token registered towards a LinTO server. See more information in LinTO's [official documentation](https://doc.linto.ai)

__Note__ : This library might cause issues (crashes) on your webpage as some browser's implementation of WebAssembly runtimes is still experimental

## Usage

With bundler :
```
npm i @linto.ai/linto-web-client
```

Static script from CDN :

```html
<script src="https://cdn.jsdelivr.net/gh/linto-ai/linto-web-client@master/dist/linto.min.js"></script>
```

Test right away :

- Tweak content in tests/index.js (your token, LinTO server endpoint etc)

```bash
npm run test
```

## instanciante

```js
try {
  window.linto = await new Linto(
    `${My_linto_stack_domain}/overwatch/local/web/login`,
    `${my_app_token}`,
    `${ms_timeout_delay_for_commands}`
  );
} catch (lintoError) {
  // handle the error
}
```

### Handling errors

This command might throw an error if something bad occurs

## Instance user methods
```js
- startAudioAcquisition(true, "linto", 0.99) // Uses hotword built in WebVoiceSDK by name / model / threshold
- startCommandPipeline() // Start to listen to hotwords and binds a publisher for acquired audio when speaking stop
- stopCommandPipeline()
- startStreamingPipeline() // Start to listen to hotwords and binds streaming start/stop event when audio acquired
- stopStreamingPipeline() 
- triggerHotword(dummyHotwordName = "dummy") // Manualy activate a hotword detection, use it when commandPipeline is active.
- pauseAudioAcquisition()
- resumeAudioAcquisition()
- stopAudioAcquisition()
- startStreaming(metadata = 1) // Tries to initiate a streaming transcription session with your LinTO server. The LinTO server needs a streaming skill and a streaming STT service
- addEventNlp() // Bind the event nlp to handle only linto answer
- removeEventNlp()
- stopStreaming()
- login() // Main startup command to initiate connexion towards your LinTO server
- loggout()
- startHotword()
- stopHotword()
- sendCommandText("blahblah") // Use chatbot pipeline 
- sendWidgetText("blahblah") // Publish text to linto (bypass transcribe) 
- triggerAction(payload, skillName, eventName) // Publish payload to the desired skill/event
- say("blahblah") // Use browser text to speech
- ask("blahblah ?") // Uses browser text to speech and immediatly triggers hotword when audiosynthesis is complete
- stopSpeech() // Stop linto current speech
```

## Instance events

Use events with :

```js
linto.addEventListener("event_name", customHandlingFunction);
```

Available events :

- "mqtt_connect"
- "mqtt_connect_fail"
- "mqtt_error"
- "mqtt_disconnect"
- "speaking_on"
- "speaking_off"
- "command_acquired"
- "command_published"
- "command_timeout"
- "hotword_on"
- "say_feedback_from_skill"
- "ask_feedback_from_skill"
- "streaming_start"
- "streaming_stop"
- "streaming_chunk"
- "streaming_final"
- "streaming_fail"
- "action_acquired"
- "action_published"
- "action_feedback"
- "action_error"
- "text_acquired"
- "text_published"
- "chatbot_acquired"
- "chatbot_published"
- "chatbot_feedback"
- "chatbot_error"
- "custom_action_from_skill"

__NOTE__ : See proposed implementation in ./tests/index.js


# linto-web-client Widget


## Building sources 

```
npm install
npm run build-widget
```

Those commands will build **linto.widget.min.js** file in the */dist* folder

## Using library

Import **linto.widget.min.js** file to your web page. Once it's done, you can create a **new Widget()** object and set custom parameters.

```html
<script type="text/javascript" src="YOUR_PATH/linto.widget.min.js"></script>
<script type="text/javascript">
window.chatbot = new Widget({
    debug: false,
    containerId: CONTAINER_BLOCK_HTML_ID,
    lintoWebToken: LINTO_APPLICATION_TOKEN,
    lintoWebHost: LINTO_APPLICATION_HOST,
    widgetMode: WIDGET_MODE, // Available modes: 'multi-modal','minimal-streaming'
    hotwordEnabled: 'true', // 'true' or 'false' (string)
    audioResponse: 'true', // 'true' or 'false' (string)
    lintoCustomEvents: [{flag: 'string', func: 'function'}]
})
</script>
```

## Testing

You can try the library localy by running the following command:
```
npm run test-widget
```

You can change widget parameteres for your tests by updating parameters in the following file: **/tests/widget/index.html**

## Custom handlers

To set custom handlers on events, you can write your own functions and call it when you declare your "new Widget". Here is an example: 

```javascript

const myCustomFunction = (event) => {
  console.log('Here is the code')
}
window.chatbot = new Widget({
    ...,
    lintoCustomEvents: [{
      flag: 'my_custom_event', 
      func: (event) => {
        myCustomFunction(event)
      }
    }]
})
```

