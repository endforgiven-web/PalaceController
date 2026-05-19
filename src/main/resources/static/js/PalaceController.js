



(function () {
    window.addEventListener('load', function () {
        setUpTestButton();
        startCheckingCycle();
    });
})();

function startCheckingCycle() {

    if (!hasCycleRun) {
        hasCycleRun = true;
        const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
        const CHECK_FREQUENCY = 10 * 1000; // 10 seconds

        console.log("Bard-O-Matic active. Initialized at: " + new Date(pageStartTime).toLocaleTimeString());

        setInterval(() => {
            const currentTime = Date.now();

            if ((currentTime - pageStartTime) > REFRESH_INTERVAL) {
                console.log("The hour has passed. Seeking fresh signals...");
                location.reload();
            } else {
                checkServerStatus(actOnStatus);
            }
        }, CHECK_FREQUENCY);
    }
}

function setUpTestButton() {
    const btn = document.createElement("button");
    btn.innerText = "test";
    btn.addEventListener("click", scrapeAndUploadNewConversations);
    document.body.appendChild(btn);
}

function checkServerStatus(responseCB = (resp) => { }) {

    console.log("Pinging Desktop...");
    GM_xmlhttpRequest({
        method: "POST",
        url: baseUrl + "serverStatus", // Replace 8080 with your actual Spring port
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        onload: function (response) {
            const data = JSON.parse(response.responseText);
            responseCB(data);
        },
        onerror: function (err) {
            console.error("Palace Uplink Failed!", err);
        }
    });
}

const ServerStatus = Object.freeze({
    SCRAPE: "scrape",
});

async function actOnStatus(data) {
    for (const status of data.serverStatus) {
        console.log(status);
        switch (status) {
            case ServerStatus.SCRAPE:
                console.log("scraping at: " + getDateCST());
                await scrapeAndUploadNewConversations();
                break;
        }
    }
}

function uploadFiles(files, onFinish = (response) => { }) {
    console.log(files);

    if (!files.length) {
        console.error("Please select at least one file.");
        return;
    }

    const formData = new FormData();

    // Append each file under the same key name "files"
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i], files[i].name);
    }

    GM_xmlhttpRequest({
        method: "POST",
        url: baseUrl + "uploadCloudConv",
        data: formData,
        onload: function (response) {

        },
        onerror: function (err) {
            console.error("Palace Uplink Failed!", err);
        }
    });
}


/** SCRAPER **/
async function scrapeAndUploadNewConversations() {
    getMasterList((masterList) => {
        getRecentConversations((titles) => {

            let startMLSlice = masterList.length - titles.length;
            startMLSlice = startMLSlice <= 0 ? 0 : startMLSlice;
            const masterListPortion = masterList.slice(startMLSlice, masterList.length);

            const cleanedMasterList = masterListPortion.map(title => {
                return title
                    .replace(/^_+/, '')
                    .replace(/\s+\d{2}.*$/, '')
                    .replace(/\.txt$/, '')
                    .trim();
            }).reverse();

            const scrapeStartPoint = findScrapeStartPoint(cleanedMasterList, titles);

            ConvTitles.GOTO_X_CONV(scrapeStartPoint - 1);

            const files = [];

            scrapeCallback = () => {
                setTimeout(() => {
                    const didMove = ConvTitles.GOTO_PREV_CONV();
                    if (didMove) { setTimeout(() => { scrollToTopAutoScrape(); }, 1500); }
                    else {
                        uploadFiles(files);
                    }
                }, 1000);

            }

            scrapeDataCallback = (name, data, type) => {
                const blob = new Blob([data], { type: "text/plain" });

                // 3️⃣ Convert Blob to a File object (gives it a name & metadata)
                const file = new File([blob], name + "." + type, {
                    type: "text/plain",
                    lastModified: Date.now()
                });
                files.push(file);
            }

            scrollToTopAutoScrape();
        });
    });
}


function getMasterList(onFinish = (data) => { }) {
    GM_xmlhttpRequest({
        method: "POST",
        url: baseUrl + "master",
        onload: function (response) {
            var data = JSON.parse(response.responseText);
            onFinish(data.resp);
        },
        onerror: function (err) {
            console.error("Palace Uplink Failed!", err);
        }
    });
}

function findScrapeStartPoint(masterList, recentList) {
    // We iterate backwards through the recent list (newest first)
    // to find the first title that ALREADY exists in the master list.
    for (let i = 0; i < recentList.length; i++) {
        if (masterList.includes(recentList[i])) {
            // Found a match! We should start scraping from the entry
            // immediately AFTER this one (the first truly "new" one).
            // If i is 0, it means the very first one we checked is old.
            return i;
        }
    }

    // No match found in this batch; the palace controller needs
    // to look further back to find the connection point.
    return -1;
}

let scrapeCallback = () => {
}

let scrapeDataCallback = (data) => { }

function scrape() {
    const chatInfScroll = getChatInfScroll();
    const convTitle = ConvTitles.GET_CURR_TITLE();
    if (chatInfScroll !== undefined && convTitle !== undefined) {
        const data = chatInfScroll.textContent;
        const fileName = ConvTitles.REMOVE_SPECIAL_CHARS(convTitle.textContent) + " " + getDateCST();
        const type = "txt"
        const dataModified = data.replaceAll(/ You Said  /gi, "\n\n").replaceAll(/ Gemini Said /gi, "\n\n").replaceAll(/You Stopped this Response/gi, "");

        scrapeDataCallback(fileName, dataModified, type);
    } else {
        console.log(chatInfScroll, convTitle);
    }
    scrapeCallback();
}

function scrollToTopAutoScrape() { scrollToTopAuto(scrape); }

function scrollToTopAuto(callback = () => { }) {
    const infiniteScroller = getChatInfScroll();
    scrollToOrigin(infiniteScroller);
    const hasHitTopExtra = 6;
    let hasHitTop = 0;

    let prevScrollHeight = infiniteScroller.scrollHeight;
    const interval = setInterval(() => {
        if (infiniteScroller.scrollTop <= 0.0 && infiniteScroller.scrollHeight == prevScrollHeight) {
            hasHitTop++;
            if (hasHitTop > hasHitTopExtra) {
                clearInterval(interval);
                callback();
            } else {
                scrollToOrigin(infiniteScroller);
                prevScrollHeight = infiniteScroller.scrollHeight;
            }
        } else {
            scrollToOrigin(infiniteScroller);
            prevScrollHeight = infiniteScroller.scrollHeight;
            hasHitTop = 0;
        }
    }, 1500);
}

function scrollToOrigin(scroller) {
    scroller.scrollTo(0.0, 0.0);
}

function getChatInfScroll() {
    return document.getElementsByTagName("infinite-scroller")[1];
}


/** CONVERSATIONS **/
class ConvTitles {

    static GET_TITLES_TEXT() {

        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            titles[item.textContent.trim()] = index;
        });

        console.log(titles);

        return titles;
    }

    static GET_CURR_TITLE_TEXT() {
        return ConvTitles.GET_CURR_TITLE().textContent.trim();
    }

    static GET_CURR_TITLE() {
        return document.querySelector(".conversation.selected").firstChild;
    }

    static GET_INDEX(title) {
        return ConvTitles.GET_TITLES_TEXT()[title];
    }

    static GET_CURR_INDEX() {
        const currTitle = ConvTitles.GET_CURR_TITLE_TEXT();
        console.log(currTitle);
        const currIndex = ConvTitles.GET_INDEX(currTitle);

        return currIndex;
    }

    static GET_TITLES() {
        return document.querySelectorAll('.conversation-title');
    }

    static GOTO_PREV_CONV() {
        const currIndex = ConvTitles.GET_CURR_INDEX();
        console.log("goto prev conv: " + currIndex);
        const prevIndex = currIndex - 1;
        if (prevIndex >= 0) {
            ConvTitles.GOTO_X_CONV(prevIndex);
            return true;
        }
        return false;
    }

    static GOTO_X_CONV(index) {
        const convTitle = ConvTitles.GET_TITLES()[index];
        convTitle.click();
    }

    static GET_CONV_CONT() {
        return document.getElementsByClassName('.conversations-container')[0];
    }

    static GET_LEFT_INF_SCROLL() {
        let ret = document.getElementsByTagName('infinite-scroller')[0];
        if (ret == undefined) ret = document.getElementsByTagName('infinite-scroller')[0];
        return ret;
    }

    static REMOVE_SPECIAL_CHARS(title) {
        return title.replaceAll("?", "_").replaceAll(":", "_").trim()
    }
}


function getRecentConversations(onFinish = (titles) => { }) {
    //const checkXConversations = 40;
    const desiredCheck = 40;
    const convCont = ConvTitles.GET_CONV_CONT();
    const infScroller = ConvTitles.GET_LEFT_INF_SCROLL();
    let convTitles;
    const interval = setInterval(() => {
        convTitles = document.querySelectorAll('.conversation-title');
        if (convTitles.length <= desiredCheck) {
            scrollToBottom(infScroller);
        } else {
            clearInterval(interval);
            const desiredConvTitles = Array.from(convTitles).slice(0, desiredCheck);
            const desiredConvTitleS = desiredConvTitles.map((v) => ConvTitles.REMOVE_SPECIAL_CHARS(v.textContent));
            onFinish(desiredConvTitleS);
        }
    }, 1500);
}

function scrollToTop(el) {
    el.scrollTo(0.0, 0.0);
}

function scrollToBottom(el) {
    el.scrollTo(0, el.scrollHeight);
}

function getDateCST() {
    const options = { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date().toLocaleString('en-US', options).replaceAll("/", "_").replaceAll(":", "_");
}