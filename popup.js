console.log("popup.js loaded");

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { command: "request-selected" }, function (response) {
        if (response && !response.err) {
            _defineWord(response.word)
        }
    });
});

// ELEMENTS 

const $query = document.getElementById("query");

const $word = document.getElementById("word");
const $pos = document.getElementById("pos");
const $definition = document.getElementById("definition");
const $audio_source = document.getElementById("audio-source");
const $syllables = document.getElementById("syllables");
const $pronunciation = document.getElementById("pronunciation");

const $player = document.getElementById("player");
const $pronounce_button = document.getElementById("pronounce-button")

const $submitButton = document.getElementById("define-word");

// EVENT LISTENERS

$submitButton.addEventListener("click", defineWord);

$pronounce_button.addEventListener("click", playAudio);

function playAudio() {
    $player.play();
}

const API_KEY = "<API_KEY>";

const PATTERN = /^([_.,:!?]|[0-9])/

const BULLET = "·"

function getUrl(word) {
    return `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${API_KEY}`
}

function getAudio(filename) {

    let subdirectory;

    if (filename.startsWith("bix")) subdirectory = "bix";
    else if (filename.startsWith("gg")) subdirectory = "gg";
    else if (!!filename.match(PATTERN)) subdirectory = "number";
    else subdirectory = filename[0];

    return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${filename}.mp3`
}

async function getData(word) {
    const response = await fetch(getUrl(word));
    const data = await response.json();
    return data;
}

function parseWord(id) {
    return id.split(":")[0];
}

function parseResponse(response) {
    
    const responseObject = {
        word: parseWord(response["0"]["meta"]["id"]),
        definitions: response["0"]["shortdef"],
        pos: response["0"]["fl"],
        syllables: response["0"]["hwi"]["hw"],
        pronunciation: "Pronunciation unavailable",
        audio: ""
    }

    if (response["0"]["hwi"]["prs"]) {
        responseObject.pronunciation = response["0"]["hwi"]["prs"]["0"]["mw"];
        responseObject.audio = response["0"]["hwi"]["prs"]["0"]["sound"]["audio"];
    }

    return responseObject;
}

function formatDefinition(definition, last) {
    return BULLET + " " + definition.trim() + (last ? "." : ";");
}

function populateDefinition(definitions) {
    $definition.innerHTML = "";

    for (let i = 0; i < definitions.length; i++) {
        const definition = definitions[i];
        // Create a paragraph
        const p = document.createElement("p");
        // Change its text
        p.innerHTML = formatDefinition(definition, i == definitions.length - 1);
        // Add to definition div
        $definition.appendChild(p);
    }
}

async function defineWord() {
    _defineWord($query.value);
}

async function _defineWord(query) {
    console.log(`searching for word '${query}'`);

    // TODO: Error Handling
    const response = await getData(query);

    console.log(response);

    const responseObject = parseResponse(response);

    $word.innerHTML = responseObject.word;
    $pos.innerHTML = responseObject.pos;

    populateDefinition(responseObject.definitions)

    if (responseObject.audio != "") {
        $audio_source.src = getAudio(responseObject.audio);
        document.getElementById("player").load();
        $pronounce_button.style.visibility = "visible";
    } else {
        $pronounce_button.style.visibility = "hidden";
    }

    $syllables.innerHTML = responseObject.syllables.replaceAll("*", BULLET);
    $pronunciation.innerHTML = responseObject.pronunciation;
}