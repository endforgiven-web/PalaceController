/*class RetrieveUtils {
    static CHECK_CONVS() {
        RetrieveUtils.GET_MASTER_LIST((masterList) => {
            RetrieveUtils.SUBMIT(masterList);
        });
    }

    static GET_MASTER_LIST(onFinish = (data) => { }) {
        GM_xmlhttpRequest({
            method: "POST",
            url: baseUrl + "masterFile",
            onload: function (response) {
                var data = JSON.parse(response.responseText);
                onFinish(data.resp);
            },
            onerror: function (err) {
                console.error("Palace Uplink Failed!", err);
            }
        });
    }

    static SUBMIT(masterList) {
        console.log(masterList);
    }
}

*/