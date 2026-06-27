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