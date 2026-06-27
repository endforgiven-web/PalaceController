(function () {
    console.log('Start Bard Interface Tools');
    window.addEventListener('load', function () {
        console.log('BIT load event');
        setUpTestButton();
        setUpTestButton("test2", ChatUtils.CHAT_WITH_BARD);
        //setUpTestButton("test3", ChatUploadUtils.CREATE_RETRIEVAL_CHAT);
        //setUpTestButton("test4", BardChatUploadUtils.GO_TO_EXISTING_RETRIEVAL_CHAT);
        //setUpTestButton("testScrape", scrapeAndUploadNewConversations);
        startCheckingCycle();
    });
})();


function setUpTestButton(name = "test", onClick = ChatUploadUtils.GET_FILES_FOR_BARD) {
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.addEventListener("click", onClick);
    document.body.appendChild(btn);
}

function startCheckingCycle() {
    if (!hasCycleRun) {
        hasCycleRun = true;
        const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
        const CHECK_FREQUENCY = 10 * 1000; // 10 seconds
        const ELEMENT_POLL_FREQUENCY = 500; // 500ms for element checking

        console.log("Bard-O-Matic active. Initialized at: " + new Date(pageStartTime).toLocaleTimeString());

        // Poller to verify the infinite scroll element is ready
        const waitForScroll = setInterval(() => {
            const problematicScroll = ConvTitles.GET_LEFT_INF_SCROLL();

            if (problematicScroll) {
                console.log("Left infinite scroll detected. Launching core cycle...");
                clearInterval(waitForScroll); // Stop checking for the element

                // Now start the main loop safely
                runMainCycle(REFRESH_INTERVAL, CHECK_FREQUENCY);
            } else {
                console.log("Waiting for infinite scroll element to load...");
            }
        }, ELEMENT_POLL_FREQUENCY);
    }
}

function runMainCycle(refreshInterval, checkFrequency) {
    setInterval(() => {
        const currentTime = Date.now();

        if ((currentTime - pageStartTime) > refreshInterval) {
            console.log("The hour has passed. Seeking fresh signals...");
            location.reload();
        } else {
            Server.CHECK_STATUS(Server.ACT_ON_STATUS);
        }
    }, checkFrequency);
}