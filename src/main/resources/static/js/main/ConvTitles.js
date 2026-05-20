class ConvTitles {

    static GET_TITLES_TEXT() {

        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            titles[item.textContent.trim()] = index;
        });

        console.log(titles);

        return titles;
    }

    static GET_CURR_TITLE_TEXT() {
        return ConvTitles.GET_CURR_TITLE().textContent.trim();
    }

    static GET_CURR_TITLE() {
        return document.querySelector("gem-nav-list-item[data-test-id='conversation'] > a.mdc-list-item--activated .title-text");
    }

    static GET_INDEX(title) {
        return ConvTitles.GET_TITLES_TEXT()[title];
    }

    static GET_CURR_INDEX() {
        const currTitle = ConvTitles.GET_CURR_TITLE_TEXT();
        console.log(currTitle);
        const currIndex = ConvTitles.GET_INDEX(currTitle);

        return currIndex;
    }

    static GET_TITLES() {
        return document.querySelectorAll('.conversation-title');
    }

    static GOTO_PREV_CONV() {
        const currIndex = ConvTitles.GET_CURR_INDEX();
        console.log("goto prev conv: " + currIndex);
        const prevIndex = currIndex - 1;
        if (prevIndex >= 0) {
            ConvTitles.GOTO_X_CONV(prevIndex);
            return true;
        }
        return false;
    }

    static GOTO_X_CONV(index) {
        const convTitle = ConvTitles.GET_TITLES()[index];
        convTitle.click();
    }

    static GET_CONV_CONT() {
        return document.getElementsByClassName('.conversations-container')[0];
    }

    static GET_LEFT_INF_SCROLL() {
        let ret = document.getElementsByTagName('infinite-scroller')[0];
        if (ret == undefined) ret = document.getElementsByTagName('infinite-scroller')[0];
        return ret;
    }

    static REMOVE_SPECIAL_CHARS(title) {
        return title.replaceAll("?", "_").replaceAll(":", "_").trim()
    }

    static GET_RECENT(onFinish = (titles) => { }) {
        //const checkXConversations = 40;
        const desiredCheck = 40;
        const convCont = ConvTitles.GET_CONV_CONT();
        const infScroller = ConvTitles.GET_LEFT_INF_SCROLL();
        let convTitles;
        const interval = setInterval(() => {
            convTitles = document.querySelectorAll('.conversation-title');
            if (convTitles.length <= desiredCheck) {
                ScrollUtils.BOTTOM(infScroller);
            } else {
                clearInterval(interval);
                const desiredConvTitles = Array.from(convTitles).slice(0, desiredCheck);
                const desiredConvTitleS = desiredConvTitles.map((v) => ConvTitles.REMOVE_SPECIAL_CHARS(v.textContent));
                onFinish(desiredConvTitleS);
            }
        }, 1500);
    }
}