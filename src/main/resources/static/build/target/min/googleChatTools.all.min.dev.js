"use strict";
// ==UserScript==
// @name         Google Chat Tools v0.2.5.0
// @namespace    http://tampermonkey.net/
// @version      2026-05-08
// @description  Connect to Java PCont
// @author       You
// @match        https://chat.google.com/u/0/app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

"use strict";
//**Settings*********************************************************//
const baseUrl = "http://localhost:20000/";
const pageStartTime = Date.now();
let hasCycleRun = false;
//**END Settings*****************************************************//

"use strict";
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
        return document.querySelector('.IL9EXe.PL5Wwe.dHI9xe.rcdhB.WD3P7.qs41qe');
        ;
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

"use strict";
(function () {
    'use strict';
    console.log('gctools');
    // Your code here...
    setTimeout(() => {
        uploadConversation();
    }, 1500);
})();
function uploadConversation() {
    console.log("uploadConversation");
    const arr = GCUtils.SCRAPE_X(3);
}

"use strict";
class MathUtils {
    /**
     * Finds the number in an array closest to a target goal.
     * @param counts - An array of numbers to search through
     * @param goal - The target number to approach
     * @returns The number from the array closest to the goal
     */
    static closest(counts, goal) {
        const closest = counts.reduce((prev, curr) => {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        });
        return closest;
    }
}

"use strict";
class ScrollUtils {
    static TOP(el) {
        el.scrollTo(0.0, 0.0);
    }
    static BOTTOM(el) {
        el.scrollTo(0, el.scrollHeight);
    }
}
