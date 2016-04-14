var APP_ID = undefined;

var AlexaSkill = require('./AlexaSkill');
var urban = require('urban');

var UrbanDefine = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
UrbanDefine.prototype = Object.create(AlexaSkill.prototype);
UrbanDefine.prototype.constructor = UrbanDefine;

UrbanDefine.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("UrbanDefine onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

UrbanDefine.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("UrbanDefine onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Yo, sup?";
    var repromptText = "You can say stuff";
    response.ask(speechOutput, repromptText);
};

UrbanDefine.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("UrbanDefine onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

UrbanDefine.prototype.intentHandlers = {
    // register custom intent handlers
    "DefineIntent": function (intent, session, response) {
        var phrase,
            phraseSlot = intent.slots.phrase;

        if (phraseSlot && phraseSlot.value){
            phrase = phraseSlot.value.toLowerCase();
        }

        var cardTitle = "Definition of " + phrase,
            speechOutput,
            repromptOutput;
        var defPromise = urban(phrase);

        defPromise.first(function(result){
            console.log(result);

            if(result){
                speechOutput = {
                    speech: 'Definition: ' + result.definition + '. Example: ' + result.example,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, result.definition);
            }else{
                var speech;
                if (phrase) {
                    speech = "Looks like no one knows what " + phrase + "is. What else can I find for you?";
                } else {
                    speech = "That doesn't sound right, but I don't know enough about dumb internet definitions to dispute it.";
                }
                speechOutput = {
                    speech: speech,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                repromptOutput = {
                    speech: "What else can I find for you?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.ask(speechOutput, repromptOutput);
            }
        });
    },

    "RandomIntent": function (intent, session, response) {
        urban.random().first(function(result){
            console.log(result);

            if(result){
                var cardTitle = "Definition of " + result.word,
                    speechOutput,
                    repromptOutput;
                speechOutput = {
                    speech: result.word + '. Definition: ' + result.definition + '. Example: ' + result.example,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, result.definition);
            }else{
                var speech = "That doesn't sound right, but I don't know enough about dumb internet definitions to dispute it.";
                speechOutput = {
                    speech: speech,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                repromptOutput = {
                    speech: "What else can I find for you?",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.ask(speechOutput, repromptOutput);
            }
        });
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Ask me to define a phrase via Urban Dictionary!", "Ask me to define a phrase via Urban Dictionary!");
    },
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "See ya";
        response.tell(speechOutput);
    },
    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Bye";
        response.tell(speechOutput);
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the UrbanDefine skill.
    var urbanDefine = new UrbanDefine();
    urbanDefine.execute(event, context);
};
