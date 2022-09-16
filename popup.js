console.log("popup.js loaded");

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { command: "request-selected" }, function (response) {
        if (!response.err) {
            _defineWord(response.word)
        }
    });
});

const $query = document.getElementById("query");

const $word = document.getElementById("word");
const $pos = document.getElementById("pos");
const $definition = document.getElementById("definition");
const $audio_source = document.getElementById("audio_source");
const $syllables = document.getElementById("syllables");
const $pronunciation = document.getElementById("pronunciation");

const $player = document.getElementById("player");

document.getElementById("define-word").addEventListener("click", defineWord);

const API_KEY = "<API_KEY>";

const PATTERN = /^([_.,:!?]|[0-9])/

const SYLLABLE_SEPARATOR = "·"

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

// TODO: Add word instead of taking the word from the query
function parseResponse(response) {
    return {
        definition: response["0"]["shortdef"],
        pos: response["0"]["fl"],
        syllables: response["0"]["hwi"]["hw"],
        // TODO: pronunciation doesn't always exist
        pronunciation: response["0"]["hwi"]["prs"]["0"]["mw"],
        audio: response["0"]["hwi"]["prs"]["0"]["sound"]["audio"]
    }
}

function populateDefinition(definition) {
    $definition.innerHTML = "";

    definition.forEach(element => {
        // Create a paragraph
        const p = document.createElement("p");
        // Change its text
        p.innerHTML = element;
        // Add to definition div
        $definition.appendChild(p);
    });

}

async function defineWord() {
    _defineWord($query.value);
}

async function _defineWord(query) {
    console.log(`searching for word '${query}'`);

    const response = await getData(query);

    console.log(response);

    const responseObject = parseResponse(response);

    $word.innerHTML = query;
    $pos.innerHTML = responseObject.pos;

    populateDefinition(responseObject.definition)

    $audio_source.src = getAudio(responseObject.audio);
    document.getElementById("player").load();

    $syllables.innerHTML = responseObject.syllables.replaceAll("*", SYLLABLE_SEPARATOR);
    $pronunciation.innerHTML = responseObject.pronunciation;
}