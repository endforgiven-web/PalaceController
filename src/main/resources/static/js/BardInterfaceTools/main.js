(function () {
    window.addEventListener('load', function () {
        setUpTestButton();
        setUpTest2Button();
        setUpTest3Button();
        startCheckingCycle();
    });
})();

function setUpTestButton() {
    const btn = document.createElement("button");
    btn.innerText = "test";
    btn.addEventListener("click", BardChatUploadUtils.GET_FILES_FOR_BARD);
    document.body.appendChild(btn);
}

function setUpTest2Button() {
    const btn = document.createElement("button");
    btn.innerText = "test2";
    btn.addEventListener("click", RetrieveUtils.MASTER_LIST_PROMPT_TEST);
    document.body.appendChild(btn);
}

function setUpTest3Button() {
    const btn = document.createElement("button");
    btn.innerText = "testScrape";
    btn.addEventListener("click", scrapeAndUploadNewConversations);
    document.body.appendChild(btn);
}