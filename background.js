console.log("howsay: service worker active");

// CONTEXT MENU

const CONTEXT_MENU_ID = "search-merriam";
const MW_URL = "https://www.merriam-webster.com/dictionary/"

function searchMerriamWebster(word) {
    console.log(word);
    
    chrome.tabs.create({  
        url: MW_URL + word
    });
}

// CONTEXT MENUS

chrome.contextMenus.create({
    id: CONTEXT_MENU_ID, 
    title: "Search Merriam-Webster for \"%s\"", 
    contexts:["selection"], 
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case CONTEXT_MENU_ID:
            searchMerriamWebster(info.selectionText)
            break;
        default:
            break;
    }
})

// COMMANDS

chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case 'search-merriam':
            console.log("command: search-merriam");
            chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
                chrome.scripting.executeScript(
                  {
                    target: {tabId: tab.id},
                    function: () => {
                        const word = window.getSelection().toString();

                        if (word == '') return;

                        chrome.runtime.sendMessage({msg:"search-merriam", data: word}, null);
                    },
                  })
              })
            break;
        default:
            console.log(`Command ${command} not found`);
    }
});

// MESSAGES

chrome.runtime.onMessage.addListener(
    function receiveWord(request, sender, sendResponse) {
        if (request.msg == "search-merriam") {
            const word = request.data;
            searchMerriamWebster(word);
        } else if (request.msg == "request-selected") {
            chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
                chrome.scripting.executeScript(
                  {
                    target: {tabId: tab.id},
                    function: () => {
                        const word = window.getSelection().toString();

                        if (word == '') return;

                        chrome.runtime.sendMessage({msg:"word", data: word}, null);
                    },
                  })
              })
        }
    }
);