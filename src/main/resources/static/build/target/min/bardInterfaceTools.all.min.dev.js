"use strict";
// ==UserScript==
// @name         Bard Interface Tools v0.2.5.0
// @namespace    http://tampermonkey.net/
// @version      2026-05-08
// @description  Connect to Java PCont
// @author       You
// @match        https://gemini.google.com/*
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
class ConvTitles {
    static GET_TITLES_TEXT() {
        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            let indexList = titles[item];
            if (indexList == undefined) {
                indexList = [];
            }
            titles[item.textContent.trim()] = indexList.push(index);
        });
        return titles;
    }
    static GET_CURR_TITLE_TEXT() {
        return ConvTitles.GET_CURR_TITLE().textContent.trim();
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
    static getPromptBox() {
        return document.getElementsByClassName("ng-tns-c1438131813-4 ng-star-inserted single-line-format")[0];
    }
    static getFileDropZone() {
        return document.querySelector('.xap-uploader-dropzone.chat-container.ng-trigger.ng-trigger-chatHistoryImmersiveTransitions');
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
    window.addEventListener('load', function () {
        setUpTestButton();
        startCheckingCycle();
    });
})();
function setUpTestButton() {
    const btn = document.createElement("button");
    btn.innerText = "test";
    btn.addEventListener("click", RetrieveUtils.CHECK_MASTER);
    document.body.appendChild(btn);
}

"use strict";
class RetrieveUtils {
    static CHECK_MASTER() {
        RetrieveUtils.GET_FILE((masterList) => {
            ConvUtils.SUBMIT_FILE([masterList]);
        }, "masterFile", "master_list.txt", "text/plain");
    }
    static CHECK_CONVS() {
        const start = 1;
        const end = 10;
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
            }
            else {
                Server.CHECK_STATUS(Server.ACT_ON_STATUS);
            }
        }, CHECK_FREQUENCY);
    }
}
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
            }
        }
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
