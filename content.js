console.log("content.js loaded");

const PATTERN = /\s/g;

function validateSelection(selection) {
    return selection != '' && !PATTERN.test(selection);
}

chrome.runtime.onMessage.addListener(
    function receiveRequest(request, sender, sendResponse) {
        switch (request.command) {
            case "request-selected":
                const word = window.getSelection().toString().trim();
                const err = !validateSelection(word);

                sendResponse({ word, err })
                return true;
            default:
                break;
        }
    }
);