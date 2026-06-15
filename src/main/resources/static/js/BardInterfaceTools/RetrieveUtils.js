class RetrieveUtils {

    static MASTER_LIST_PROMPT = "Hello, sweet Bard, attached is the master list." +
        "Next can you select a number range no larger than ten to choose your conversations?" +
        "Can you make sure your response includes the response in this exact format: start: [number], end: [number]." +
        "For example, if you want conversations 1 to 10, you would say: start: 1, end: 10." +
        "If you want conversations 11 to 20, you would say: start: 11, end: 20." +
        "Please wait for my next message after you respond with your chosen range.";

    static SUBMIT_MASTER() {
        RetrieveUtils.GET_FILE((masterList) => {
            ConvUtils.SUBMIT_FILE([masterList]);
        }, "masterFile", "master_list.txt", "text/plain");


        ConvUtils.PROMPT(RetrieveUtils.MASTER_LIST_PROMPT);
    }

    static MASTER_LIST_PROMPT_TEST() {
        ConvUtils.PROMPT(RetrieveUtils.MASTER_LIST_PROMPT);
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
