class Server{
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