class GCUtils {
    static SCRAPE_X(x) {
        GCUtils.goToXChat(x);
        GCUtils.SCRAPE_CURR_CONV();
    }

    static SCRAPE_CURR_CONV() {
        setTimeout(() => {
            const convName = GCUtils.GET_CURR_CONV_NAME();
            const convMessages = GCUtils.GET_CURR_CONV_MESSAGES_TEXT();
            const formattedMessages = GCUtils.FORMAT_CONV_MESSAGES(convMessages);
            console.log(`Conversation Name: ${convName}`);
            console.log(`Conversation Messages: ${formattedMessages}`);
        }, 10000);
    }

    static GET_SELECTED_CHAT() {
        return document.querySelector('.IL9EXe.PL5Wwe.dHI9xe.rcdhB.WD3P7.qs41qe');;
    }


    static GET_ALL_CHATS() {
        return document.querySelectorAll('.IL9EXe.PL5Wwe.dHI9xe.rcdhB');
    }

    static goToXChat(x) {
        GCUtils.GET_ALL_CHATS()[x].click();
        return GCUtils.GET_SELECTED_CHAT().textContent;
    }

    static GET_CURR_CONV_NAME() {
        const res = document.querySelectorAll('.tB5Jxf-xl07Ob-XxIAqe-OWXEXe-oYxtQd.TZQ8c.UXqkkf.Da1OLc .njhDLd.O5OMdc')[0];
        return res != undefined ? res.textContent : "NoName";
    }

    static GET_CURR_CONV_MESSAGES() {
        const res = document.querySelectorAll('.auHzcc.cFc9ae')[0];
        return res != undefined ? res : [];
    }

    static GET_CURR_CONV_MESSAGES_TEXT() {
        return GCUtils.GET_CURR_CONV_MESSAGES().textContent;
    }

    static FORMAT_CONV_MESSAGES(messages = GCUtils.GET_CURR_CONV_MESSAGES()) {
        return messages.replaceAll('You', '/nYou').replaceAll('Add reaction', '/n');
    }
}