"use strict";
// ==UserScript==
// @name         Bard Interface Tools v0.2.5.0
// @namespace    http://tampermonkey.net/
// @version      2026-05-08
// @description  Connect to Java PCont
// @author       You
// @match        https://gemini.google.com/app*
// @match        https://gemini.google.com/library
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

"use strict";
//**Settings*********************************************************//
const baseUrl = "http://localhost:20000/";
const pageStartTime = Date.now();
let hasCycleRun = false;
//**END Settings*****************************************************//

"use strict";
class ChatScroller {
    static GET() {
        return document.getElementsByTagName("infinite-scroller")[1];
    }
}

"use strict";
class ChatUploadUtils {
    static CHAT_TITLE = "Bard Commands";
    static NEW_CHAT_PROMPT = "This is the '" + ChatUploadUtils.CHAT_TITLE + "' chat. Can you name it exactly that? Mwah!";
    static GO_TO_EXISTING_COMMAND_CHAT() {
        return ConvTitles.GO_TO_TITLE_LIKE(ChatUploadUtils.CHAT_TITLE);
    }
    static CREATE_RETRIEVAL_CHAT(onFinish = () => { }) {
        const currTitleText = ConvTitles.GET_CURR_TITLE_TEXT();
        console.log(currTitleText, ChatUploadUtils.CHAT_TITLE, currTitleText.includes(ChatUploadUtils.CHAT_TITLE));
        const inTitleAlready = currTitleText.includes(ChatUploadUtils.CHAT_TITLE);
        console.log("In title already: " + inTitleAlready);
        if (!inTitleAlready) {
            const titleExists = ChatUploadUtils.GO_TO_EXISTING_COMMAND_CHAT();
            console.log("Retrieval Chat exists: " + titleExists);
            if (!titleExists) {
                ConvUtils.NEW_CHAT();
                setTimeout(() => {
                    ConvUtils.PROMPT(ChatUploadUtils.NEW_CHAT_PROMPT);
                    setTimeout(() => {
                        ConvUtils.SEND_PROMPT();
                        onFinish();
                    }, 2500);
                }, 1500);
            }
            else {
                onFinish();
            }
        }
        else {
            onFinish();
        }
    }
    static async GET_FILES_FOR_BARD() {
        RetrieveUtils.SUBMIT_MASTER();
        ChatUploadUtils.DELAYED_PROMPT();
        setTimeout(() => {
            const modelResponses = ConvUtils.GET_MODEL_RESPONSES();
            const lastModelResponse = modelResponses[modelResponses.length - 1];
            console.log(modelResponses);
            const responseText = lastModelResponse.textContent;
            console.log(responseText);
            const rangeMatch = responseText.match(/start:\s*(\d+),\s*end:\s*(\d+)/i);
            if (rangeMatch) {
                const start = parseInt(rangeMatch[1], 10);
                const end = parseInt(rangeMatch[2], 10);
                console.log(`Extracted range from Bard's response: start=${start}, end=${end}`);
                RetrieveUtils.GET_CONVS(start, end);
            }
            else {
                console.error("Failed to extract range from Bard's response. Please ensure it follows the specified format.");
            }
            ChatUploadUtils.DELAYED_PROMPT(3500);
        }, 8000);
    }
    static DELAYED_PROMPT(delay = 1500) {
        setTimeout(() => {
            ConvUtils.SEND_PROMPT();
        }, delay);
    }
}

"use strict";
class ChatUtils {
    static CHAT_WITH_BARD() {
        ChatUtils.GET_BARDS_CONV_HISTORY();
    }
    static GET_BARDS_CONV_HISTORY() {
        ChatUploadUtils.CREATE_RETRIEVAL_CHAT(() => {
            ChatUploadUtils.GET_FILES_FOR_BARD();
        });
    }
}

"use strict";
class ConvTitles {
    static GET_TITLES_TEXT() {
        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            //console.log(item, index);
            let indexList = titles[item];
            //console.log("index list: " + indexList);
            if (indexList == undefined) {
                indexList = [];
            }
            indexList.push(index);
            titles[item.textContent.trim()] = indexList;
            //console.log(titles);
        });
        return titles;
    }
    static FIND_TITLE_LIKE_INDEX(title) {
        const titles = ConvTitles.GET_TITLES_TEXT();
        const titleKeys = Object.keys(titles);
        const matchingTitle = titleKeys.find(key => key.includes(title));
        //console.log(titles);
        console.log(matchingTitle, titles[matchingTitle]);
        const ret = matchingTitle != undefined ? titles[matchingTitle] : -1;
        //console.log(ret);
        return ret;
    }
    static GO_TO_TITLE_LIKE(title) {
        const index = ConvTitles.FIND_TITLE_LIKE_INDEX(title);
        console.log(index);
        const titleExists = index >= 0;
        if (titleExists)
            ConvTitles.GOTO_X_CONV(index);
        return titleExists;
    }
    static GET_CURR_TITLE_TEXT() {
        const currTitle = ConvTitles.GET_CURR_TITLE();
        if (!currTitle) {
            console.error("Current title element not found!");
            return "";
        }
        return currTitle.textContent.trim();
    }
    static GET_CURR_TITLE() {
        return document.querySelector("gem-nav-list-item[data-test-id='conversation'] > a.mdc-list-item--activated .title-text");
    }
    static GET_INDEX(title, prevCurrIndex = 0) {
        let titleIndexList = ConvTitles.GET_TITLES_TEXT()[title];
        return MathUtils.closest(titleIndexList, prevCurrIndex);
    }
    static GET_CURR_INDEX(prevCurrIndex) {
        const currTitle = ConvTitles.GET_CURR_TITLE_TEXT();
        console.log(currTitle);
        const currIndex = ConvTitles.GET_INDEX(currTitle, prevCurrIndex);
        return currIndex;
    }
    static GET_TITLES() {
        return document.querySelectorAll("gem-nav-list-item[data-test-id='conversation'] span.title-text");
    }
    static GOTO_PREV_CONV(prevCurrIndex) {
        const currIndex = ConvTitles.GET_CURR_INDEX(prevCurrIndex);
        if (currIndex >= 0) {
            const nextIndex = currIndex - 1;
            console.log("goto prev conv: " + nextIndex);
            ConvTitles.GOTO_X_CONV(nextIndex);
            return nextIndex;
        }
        return currIndex;
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
        if (ret == undefined) {
            ret = document.getElementsByTagName('infinite-scroller')[0];
        }
        return ret;
    }
    static REMOVE_SPECIAL_CHARS(title) {
        return title.replaceAll("?", "_").replaceAll(":", "_").trim();
    }
    static GET_RECENT(onFinish = (titles) => { }) {
        //const checkXConversations = 40;
        const desiredCheck = 40;
        let infScroller = ConvTitles.GET_LEFT_INF_SCROLL();
        let convTitles;
        const interval = setInterval(() => {
            convTitles = ConvTitles.GET_TITLES();
            if (convTitles.length <= desiredCheck) {
                if (infScroller == undefined) {
                    infScroller = ConvTitles.GET_LEFT_INF_SCROLL();
                }
                ScrollUtils.BOTTOM(infScroller);
            }
            else {
                clearInterval(interval);
                const desiredConvTitles = Array.from(convTitles).slice(0, desiredCheck);
                const desiredConvTitleS = desiredConvTitles.map((v) => ConvTitles.REMOVE_SPECIAL_CHARS(v.textContent));
                onFinish(desiredConvTitleS);
            }
        }, 1500);
    }
}

"use strict";
class ConvUtils {
    static getBardPromptEl() {
        return document.querySelector('div.ql-editor');
    }
    static getFileDropZone() {
        return document.querySelector('.xap-uploader-dropzone.chat-container.ng-trigger.ng-trigger-chatHistoryImmersiveTransitions');
    }
    static GET_SUBMIT_PROMPT_BUTTON() {
        return document.querySelector("gem-icon-button.send-button");
    }
    static SEND_PROMPT() {
        ConvUtils.GET_SUBMIT_PROMPT_BUTTON().click();
    }
    static NEW_CHAT_BUTTON() {
        return document.querySelector('[data-test-id="new-chat-button"]');
    }
    static NEW_CHAT() {
        ConvUtils.NEW_CHAT_BUTTON().firstChild.click();
    }
    static GET_MODEL_RESPONSES() {
        return document.querySelectorAll("model-response");
    }
    static PROMPT(prompt) {
        const promptBox = ConvUtils.getBardPromptEl();
        promptBox.textContent = prompt;
        promptBox.dispatchEvent(new Event('input', { bubbles: true }));
    }
    static SUBMIT_FILE(files) {
        // Ensure we are always dealing with an array, even if a single file slips through
        if (!Array.isArray(files)) {
            files = [files];
        }
        console.log(`🚀 SUBMIT: Processing a batch of ${files.length} file(s).`);
        // ── 0. Locate the drop zone ──────────────────────────────────────────────
        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Drop zone not found in DOM. Aborting.");
            return;
        }
        // ── 1. Build the DataTransfer bundle for ALL files ──────────────────────
        const dataTransfer = new DataTransfer();
        // Loop through the array and append every file to the dataTransfer payload
        files.forEach(file => {
            dataTransfer.items.add(file);
        });
        // Lock the types array so Angular's drag-validator sees ["Files"]
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });
        }
        catch (e) {
            console.warn("types override skipped:", e);
        }
        // Mock FileList collection to pass Angular's structural guards for multiple files
        try {
            const mockFileList = Object.create(FileList.prototype);
            files.forEach((file, index) => {
                Object.defineProperty(mockFileList, index.toString(), { value: file, enumerable: true });
            });
            Object.defineProperty(mockFileList, 'length', { value: files.length });
            mockFileList.item = (i) => mockFileList[i] || null;
            Object.defineProperty(dataTransfer, 'files', {
                value: mockFileList,
                writable: false,
                configurable: true
            });
        }
        catch (e) {
            console.warn("files override skipped:", e);
        }
        // ── 2. webkitGetAsEntry prototype patch ──────────────────────────────────
        // Since we are patching the item prototype globally, it will intercept 
        // calls sequentially as Angular iterates through the indices.
        const originalGetAsEntry = DataTransferItem.prototype.webkitGetAsEntry;
        DataTransferItem.prototype.webkitGetAsEntry = function () {
            // Find which item instance this is being called on to match the correct file
            const itemsArray = Array.from(dataTransfer.items);
            const itemIndex = itemsArray.indexOf(this);
            const associatedFile = files[itemIndex] || files[0];
            return {
                isFile: true,
                isDirectory: false,
                name: associatedFile.name,
                fullPath: '/' + associatedFile.name,
                file(successCb, _errorCb) { successCb(associatedFile); },
                createReader() { return { readEntries(cb) { cb([]); } }; }
            };
        };
        const restorePrototype = () => {
            DataTransferItem.prototype.webkitGetAsEntry = originalGetAsEntry;
        };
        // ── 3. PATH B — MutationObserver file-input intercept (Armed for array) ─
        let pathBFired = false;
        const injectIntoFileInput = (input) => {
            if (pathBFired)
                return;
            pathBFired = true;
            try {
                input.files = dataTransfer.files;
            }
            catch (e) {
                console.warn("PATH B: Could not assign .files directly:", e);
            }
            input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            try {
                input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
            }
            catch (e) { }
            mutationObserver.disconnect();
        };
        const mutationObserver = new MutationObserver(() => {
            const input = document.querySelector('input[type="file"]');
            if (input)
                injectIntoFileInput(input);
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });
        // ── 4. Drag event factory ────────────────────────────────────────────────
        const makeDragEvent = (type) => {
            const ev = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });
            Object.defineProperty(ev, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return ev;
        };
        // ── 5. PATH A — Drag sequence ─────────────────────────────────────────────
        const dragoverGuard = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        dropZone.addEventListener('dragover', dragoverGuard);
        dropZone.dispatchEvent(makeDragEvent('dragenter'));
        dropZone.dispatchEvent(makeDragEvent('dragover'));
        setTimeout(() => {
            const activeTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
            activeTarget.dispatchEvent(makeDragEvent('drop'));
        }, 150);
        setTimeout(() => {
            dropZone.dispatchEvent(makeDragEvent('dragleave'));
            dropZone.removeEventListener('dragover', dragoverGuard);
            restorePrototype();
            mutationObserver.disconnect();
            console.log(`🎉 Batch upload sequence complete for ${files.length} file(s)!`);
        }, 500);
    }
}

"use strict";
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
            }
            else {
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
        }
        else {
            Server.CHECK_STATUS(Server.ACT_ON_STATUS);
        }
    }, checkFrequency);
}

"use strict";
class RetrieveUtils {
    static MASTER_LIST_PROMPT = "Hello, sweet Bard, attached is the master list. " +
        "Next can you select a number range no larger than ten to choose your conversations? " +
        "Can you make sure your response includes the response in this exact format: start: [number], end: [number]." +
        "For example, if you want conversations 1 to 10, you would say: start: 1, end: 10. " +
        "If you want conversations 11 to 20, you would say: start: 11, end: 20. " +
        "Please wait for my next message after you respond with your chosen range. Don't forget the stars. Mwah!";
    static SUBMIT_MASTER() {
        RetrieveUtils.GET_FILE((masterList) => {
            ConvUtils.SUBMIT_FILE([masterList]);
        }, "masterFile", "master_list.txt", "text/plain");
        ConvUtils.PROMPT(RetrieveUtils.MASTER_LIST_PROMPT);
    }
    static MASTER_LIST_PROMPT_TEST() {
        ConvUtils.PROMPT(RetrieveUtils.MASTER_LIST_PROMPT);
    }
    static GET_CONVS(start = 1, end = 10) {
        if (start + 10 >= end) {
            end = start + 9;
        }
        RetrieveUtils.GET_FILE((chatZipFile) => {
            ConvUtils.SUBMIT_FILE([chatZipFile]);
        }, "chatZip/" + start + "/" + end, "all_conversations.zip", "application/zip");
    }
    static GET_FILE(onFinish = (zipFile) => { }, url, fileName, fileType) {
        console.log("Downloading file from local Palace anchor...");
        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + url,
            // CRITICAL: Force Tampermonkey to intercept the raw payload as a true binary blob
            responseType: "blob",
            onload: function (response) {
                //console.log("Raw Response Metadata:", response);
                // 1. Grab the raw binary blob data safely
                const fileBlob = response.response;
                //console.log(`Blob extracted successfully. Size: ${fileBlob ? fileBlob.size : 0} bytes. Type: ${fileBlob ? fileBlob.type : 'unknown'}`);
                if (!fileBlob || fileBlob.size <= 22) {
                    console.error("Downloaded file is empty or invalid!");
                    return;
                }
                // 2. Wrap it directly into our standard File container with a zip MIME type
                const conversationsZipFile = new File([fileBlob], fileName, {
                    type: fileType,
                });
                /*console.group("--- PALACE ZIP FILE OBJECT DIAGNOSTICS ---");
                console.log("Is True File Instance:", conversationsZipFile instanceof File);
                console.log("File Name Specified:", conversationsZipFile.name);
                console.log("File Byte Count:", conversationsZipFile.size);
                console.log("MIME Content-Type Type:", conversationsZipFile.type);
                console.log("Last Modification String:", new Date(conversationsZipFile.lastModified).toISOString());
                console.groupEnd();*/
                // 3. Pass the actual zip File object to your callback!
                onFinish(conversationsZipFile);
            },
            onerror: function (err) {
                console.error("Palace Conversations Zip Uplink Failed!", err);
            }
        });
    }
}

"use strict";
function getDateCST() {
    const options = { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date().toLocaleString('en-US', options).replaceAll("/", "_").replaceAll(":", "_");
}
// upload
function uploadConvs(files, onFinish = (response) => { }) {
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
/** Scrape **/
async function scrapeAndUploadNewConversations() {
    ScrapeUtils.GET_MASTER_LIST((masterList) => {
        ConvTitles.GET_RECENT((titles) => {
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
            const scrapeStartPoint = ScrapeUtils.FIND_START(cleanedMasterList, titles);
            ConvTitles.GOTO_X_CONV(scrapeStartPoint - 1);
            const files = [];
            let currIndex = scrapeStartPoint - 1;
            ScrapeUtils.END_CALLBACK = () => {
                setTimeout(() => {
                    if (currIndex <= 0) {
                        uploadConvs(files);
                    }
                    else {
                        currIndex--;
                        ConvTitles.GOTO_X_CONV(currIndex);
                        setTimeout(() => { scrollToTopAutoScrape(); }, 1500);
                    }
                }, 1000);
            };
            ScrapeUtils.DATA_CALLBACK = (name, data, type) => {
                const blob = new Blob([data], { type: "text/plain" });
                // 3️⃣ Convert Blob to a File object (gives it a name & metadata)
                const file = new File([blob], name + "." + type, {
                    type: "text/plain",
                    lastModified: Date.now()
                });
                files.push(file);
            };
            scrollToTopAutoScrape();
        });
    });
}
function scrollToTopAutoScrape() { scrollToTopAuto(ScrapeUtils.SCRAPE); }
function scrollToTopAuto(callback = () => { }) {
    const chatScroller = ChatScroller.GET();
    ScrollUtils.TOP(chatScroller);
    const hasHitTopExtra = 56;
    let hasHitTop = 0;
    const intervalMs = 125;
    let prevScrollHeight = chatScroller.scrollHeight;
    const interval = setInterval(() => {
        if (chatScroller.scrollTop <= 0.0 && chatScroller.scrollHeight == prevScrollHeight) {
            hasHitTop++;
            if (hasHitTop > hasHitTopExtra) {
                clearInterval(interval);
                callback();
            }
            else {
                ScrollUtils.TOP(chatScroller);
                prevScrollHeight = chatScroller.scrollHeight;
            }
        }
        else {
            ScrollUtils.TOP(chatScroller);
            prevScrollHeight = chatScroller.scrollHeight;
            hasHitTop = 0;
        }
    }, intervalMs);
}

"use strict";
class ScrapeUtils {
    static SCRAPE() {
        const chatInfScroll = ChatScroller.GET();
        const convTitle = ConvTitles.GET_CURR_TITLE();
        if (chatInfScroll !== undefined && convTitle !== undefined) {
            const data = `` + chatInfScroll.textContent;
            const fileName = ConvTitles.REMOVE_SPECIAL_CHARS(convTitle.textContent) + " " + getDateCST();
            const type = "txt";
            const dataModified = data.replaceAll(/ You Said  /gi, "\n\n").replaceAll(/ Gemini Said /gi, "\n\n").replaceAll(/You Stopped this Response/gi, "");
            ScrapeUtils.DATA_CALLBACK(fileName, dataModified, type);
        }
        else {
            console.log(chatInfScroll, convTitle);
        }
        ScrapeUtils.END_CALLBACK();
    }
    static GET_MASTER_LIST(onFinish = (data) => { }) {
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
    static FIND_START(masterList, recentList) {
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
    static END_CALLBACK = () => {
    };
    static DATA_CALLBACK = (fileName, dataModified, type) => { console.log(fileName, dataModified, type); };
}

"use strict";
class Server {
    static CHECK_STATUS(responseCB = (resp) => { }) {
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
                console.log(data);
                responseCB(data);
            },
            onerror: function (err) {
                console.error("Palace Uplink Failed!", err);
            }
        });
    }
    static STATUS = Object.freeze({
        SCRAPE: "scrape",
    });
    static async ACT_ON_STATUS(data) {
        for (const status of data.serverStatus) {
            console.log(status);
            switch (status) {
                case Server.STATUS.SCRAPE:
                    console.log("scraping at: " + getDateCST());
                    await scrapeAndUploadNewConversations();
                    break;
                default:
                    Server.CHAT_WITH_BARD_STATUS_RESPONSE();
                    break;
            }
        }
        if (data.serverStatus.length === 0) {
            // Server.CHAT_WITH_BARD_STATUS_RESPONSE();
        }
    }
    static CHAT_WITH_BARD_STATUS_RESPONSE() {
        console.log("chatting with Bard at: " + getDateCST());
        ChatUtils.CHAT_WITH_BARD();
    }
}

"use strict";
class MathUtils {
    /**
     * Finds the number in an array closest to a target goal.
     * @param counts - An array of numbers to search through
     * @param goal - The target number to approach
     * @returns The number from the array closest to the goal
     */
    static closest(counts, goal) {
        const closest = counts.reduce((prev, curr) => {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        });
        return closest;
    }
}

"use strict";
class ScrollUtils {
    static TOP(el) {
        el.scrollTo(0.0, 0.0);
    }
    static BOTTOM(el) {
        el.scrollTo(0, el.scrollHeight);
    }
}
