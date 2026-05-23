// ==UserScript==
// @name         PalaceController v0.2.5.0
// @namespace    http://tampermonkey.net/
// @version      2026-05-08
// @description  Connect to Java PCont
// @author       You
// @match        https://gemini.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==
//**Settings*********************************************************//

const baseUrl = "http://localhost:20000/";
const pageStartTime = Date.now();
let hasCycleRun = false;

//**END Settings*****************************************************//

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
class MathUtils {
    static closest() {
        const closest = counts.reduce(function (prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        return closest;
    }
}
class ScrollUtils {
    static TOP(el) {
        el.scrollTo(0.0, 0.0);
    }

    static BOTTOM(el) {
        el.scrollTo(0, el.scrollHeight);
    }
}