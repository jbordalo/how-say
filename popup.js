console.log("popup.js loaded");

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { command: "request-selected" }, function (response) {
        if (response && !response.err) {
            _defineWord(response.word)
        }
    });
});

// ELEMENTS 

const $form = document.getElementById("form");
const $query = document.getElementById("query");

const $word = document.getElementById("word");
const $pos = document.getElementById("pos");
const $definition = document.getElementById("definition");
const $audio_source = document.getElementById("audio-source");
const $syllables = document.getElementById("syllables");
const $pronunciation = document.getElementById("pronunciation");

const $player = document.getElementById("player");
const $pronounce_button = document.getElementById("pronounce-button")

const $alternatives = document.getElementById("alternatives")

const $error = document.getElementById("error");
const $separator = document.getElementById("separator");

// EVENT LISTENERS

$form.addEventListener("submit", e => {
    e.preventDefault();
    defineWord();
});

$pronounce_button.addEventListener("click", playAudio);

function playAudio() {
    $player.play();
}

// CONSTANTS

const API_KEY = "<API_KEY>";

const PATTERN = /^([_.,:!?]|[0-9])/

const BULLET = "·"

const MAX_ALTERNATIVES = 3;

// Focus text input on popup open

$query.focus();

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

function getErrorMessage(query) {
    return `No results for "${query}".`;
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
        setInnerHTML(p, formatDefinition(definition, i == definitions.length - 1));
        // Add to definition div
        $definition.appendChild(p);
    }
}


function formatAlternatives(alternatives) {
    $alternatives.innerHTML = `Try: ${alternatives.map(x => `"${x}"`).join(", ")}`;
}

function validateResponse(response) {
    return response["0"] !== undefined && response["0"]["meta"] !== undefined;
}

async function defineWord() {
    _defineWord($query.value);
}

async function _defineWord(query) {
    const response = await getData(query);

    if (!validateResponse(response)) {
        clear()
        setInnerHTML($error, getErrorMessage(query));
        show($error, "block");

        formatAlternatives(response.slice(0, MAX_ALTERNATIVES));       
        show($alternatives);
        return;
    }

    reset();
    hide($error); hide($alternatives);

    const { word, pos, definitions, syllables, pronunciation, audio } = parseResponse(response);

    setInnerHTML($word, word);
    setInnerHTML($pos, pos);

    populateDefinition(definitions)

    if (audio !== "") {
        $audio_source.src = getAudio(audio);
        $player.load();
        show($pronounce_button);
    } else {
        hide($pronounce_button);
    }

    setInnerHTML($syllables, syllables.replaceAll("*", BULLET));
    setInnerHTML($pronunciation, pronunciation)
}

function setInnerHTML(elem, value) {
    elem.innerHTML = value;
}

function clear() {
    [$word, $pos, $syllables, $pronunciation, $pronounce_button, $definition, $separator].forEach(elem => {
        hide(elem);
    });
}

function reset() {
    [$word, $pos, $syllables, $pronunciation, $separator].forEach(elem => {
        show(elem);
    });
    show($definition, "block");
}

function show(element, mode = "inline") {
    element.style.display = mode;
}

function hide(element) {
    element.style.display = "none";
}
