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
            } else {
                onFinish();
            }
        } else {
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
            } else {
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