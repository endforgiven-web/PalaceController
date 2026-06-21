class BardChatUploadUtils {
    static async GET_FILES_FOR_BARD() {
        RetrieveUtils.SUBMIT_MASTER();

        BardChatUploadUtils.DELAYED_PROMPT();

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
            } else {
                console.error("Failed to extract range from Bard's response. Please ensure it follows the specified format.");
            }
            BardChatUploadUtils.DELAYED_PROMPT(3500);
        }, 8000);
    }

    static DELAYED_PROMPT(delay = 1500) {
        setTimeout(() => {
            ConvUtils.SEND_PROMPT();
        }, delay);
    }
}