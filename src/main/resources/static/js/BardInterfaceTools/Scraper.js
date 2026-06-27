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
                    } else {
                        currIndex--;
                        ConvTitles.GOTO_X_CONV(currIndex);
                        setTimeout(() => { scrollToTopAutoScrape(); }, 1500);
                    }
                }, 1000);

            }

            ScrapeUtils.DATA_CALLBACK = (name, data, type) => {
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
            } else {
                ScrollUtils.TOP(chatScroller);
                prevScrollHeight = chatScroller.scrollHeight;
            }
        } else {
            ScrollUtils.TOP(chatScroller);
            prevScrollHeight = chatScroller.scrollHeight;
            hasHitTop = 0;
        }
    }, intervalMs);
}