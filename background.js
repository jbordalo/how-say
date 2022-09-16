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

chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Search Merriam-Webster for \"%s\"",
    contexts: ["selection"],
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
