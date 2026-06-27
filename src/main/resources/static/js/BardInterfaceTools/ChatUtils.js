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