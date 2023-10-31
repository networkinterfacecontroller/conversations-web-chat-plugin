# conversations-web-chat-plugin

This an embeddable chat widget for Twilio Conversations. It uses the [Paste](https://paste.twilio.design/) design system for the UI and the [Conversations](https://www.twilio.com/en-us/messaging/apis/conversations-api) JS SDK for chat. When a new user opens the chat, it authenticates them anonymously, creates a conversation and adds them to it. To keep the context for returning users, it stores the user's `uuid` and `conversation_sid` in local storage.

## Authentication

The Conversations SDK requires an valid access token created with a Twilio API Key Secret in order to initialize and connect to Conversations. This token should created in a backend service to keep the secret secure. We do this with a [Twilio Function](https://www.twilio.com/docs/serverless/functions-assets/functions):

```javascript
const headers = {
    'Access-Control-Allow-Origin': '*',
  };

exports.handler = function(context, event, callback) {
    try {
        const response = new Twilio.Response();
        response.setHeaders(headers);

        const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, SERVICE_SID, PUSH_CREDENTIAL_SID } = context;

        const AccessToken = Twilio.jwt.AccessToken;
        const token = new AccessToken(ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
            identity: event.identity,
            ttl: 3600
        });

        const chatGrant = new AccessToken.ChatGrant({ serviceSid: SERVICE_SID });
        if (PUSH_CREDENTIAL_SID) {
            chatGrant.pushCredentialSid = PUSH_CREDENTIAL_SID; // Optional for push notifications
        }
        token.addGrant(chatGrant);

        response.setStatusCode(200);
        response.setBody(token.toJwt());

        callback(null, response);
    } catch (error) {
        console.error('Error generating token:', error);
        const errorResponse = new Twilio.Response();
        errorResponse.setStatusCode(500);
        errorResponse.setBody('Error generating token');
        callback(error, errorResponse);
        }
};
```

Conversations SDK token require a unique user `identity`. Since chat widget users are generally anonymous, this widget generates a `uuid` for each user and sends that as the `identity`.

Create a `.env` file and set `REACT_APP_TOKEN_SERVICE_URL=https://your-endpoint-example.com/chat-widget`.

## Chatbots

You can optionally connect chatbot to talk to users. Conversations Webhooks are the best way to power this type of automation. Optionally, you can also connect to Twilio Studio Flows for drag and drop workflows.

1. Create a Global or Service Scoped Webhook that triggers `onConversationAdded` events. Set the target to a Twilio Funcion (or your own backend service) for the next step.

2. Create a Conversation Scoped Webhook for each new converation that triggers `onMessageAdded` events. This webhook will be the main connection point for your chatbot. This example Function creates a Studio Flow specific webhook.

```javascript
exports.handler = function(context, event, callback) {
  let conversationSid = event.ConversationSid
  console.log(conversationSid);
  // Is authenticated if you have set "Add my Twilio Credentials (ACCOUNT_SID) and (AUTH_TOKEN) to ENV"
  const twilioClient = context.getTwilioClient();

  twilioClient.conversations.v1.conversations(conversationSid)
      .webhooks
      .create({
        target: 'studio',
        'configuration.flowSid': 'FWXXXXXXXXXXXXXXXXXXXXXXX',
        'configuration.filters': ['onMessageAdded']
       })
      .then((webhook) => {
        console.log(webhook.sid);
        return callback(null, {});
      }) 
      .catch((error) => {
        console.error(error);
        return callback(error);
      });
};
```

3. Respond to incoming messages via the Converations API or a Studio Flow. If using the API, the [onMessageAdded event](https://www.twilio.com/docs/conversations/conversations-webhooks#onmessageadded) will have all the context you need to respond. For Studio, use the "Incoming Conversation" trigger and the the Send and Wait for Reply widgets to start.
