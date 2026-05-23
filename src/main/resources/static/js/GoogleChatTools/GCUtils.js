class GCUtils {

    static getSelectedChat() {
        return document.querySelector('.IL9EXe.PL5Wwe.dHI9xe.rcdhB.WD3P7.qs41qe');;
    }


    static getAllChats() {
        return document.querySelectorAll('.IL9EXe.PL5Wwe.dHI9xe.rcdhB');
    }

    static goToXChat(x) {
        GCUtils.getAllChats()[x].click();
        return GCUtils.getSelectedChat().textContent;
    }

    static getCurrConvName() {
        const res = document.querySelectorAll('.tB5Jxf-xl07Ob-XxIAqe-OWXEXe-oYxtQd.TZQ8c.UXqkkf.Da1OLc .njhDLd.O5OMdc')[0];
        return res != undefined ? res.textContent : "NoName";
    }

    static getCurrConvMessages() {
        const res = document.querySelectorAll('.auHzcc.cFc9ae')[0];
        return res != undefined ? res : [];
    }

    static getCurrConvMessagesText() {
        return GCUtils.getCurrConvMessages().textContent;
    }

    static formatConvMessages(messages = GCUtils.getCurrConvMessages()) {
        return messages.replaceAll('You', '/nYou').replaceAll('Add reaction', '/n');
    }

}