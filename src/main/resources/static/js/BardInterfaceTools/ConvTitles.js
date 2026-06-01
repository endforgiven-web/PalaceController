class ConvTitles {

    static GET_TITLES_TEXT() {

        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            let indexList = titles[item];
            if (indexList == undefined) { indexList = []; }
            titles[item.textContent.trim()] = indexList.push(index);
        });

        return titles;
    }

    static GET_CURR_TITLE_TEXT() {
        return ConvTitles.GET_CURR_TITLE().textContent.trim();
    }

    static GET_CURR_TITLE() {
        return document.querySelector("gem-nav-list-item[data-test-id='conversation'] > a.mdc-list-item--activated .title-text");
    }

    static GET_INDEX(title, prevCurrIndex = 0) {
        let titleIndexList = ConvTitles.GET_TITLES_TEXT()[title];
        return MathUtils.closest(titleIndexList, prevCurrIndex);
    }

    static GET_CURR_INDEX(prevCurrIndex) {
        const currTitle = ConvTitles.GET_CURR_TITLE_TEXT();
        console.log(currTitle);
        const currIndex = ConvTitles.GET_INDEX(currTitle, prevCurrIndex);

        return currIndex;
    }

    static GET_TITLES() {
        return document.querySelectorAll("gem-nav-list-item[data-test-id='conversation'] span.title-text");
    }

    static GOTO_PREV_CONV(prevCurrIndex) {
        const currIndex = ConvTitles.GET_CURR_INDEX(prevCurrIndex);
        if (currIndex >= 0) {
            const nextIndex = currIndex - 1;
            console.log("goto prev conv: " + nextIndex);
            ConvTitles.GOTO_X_CONV(nextIndex);
            return nextIndex;
        }
        return currIndex;
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
        if (ret == undefined) { ret = document.getElementsByTagName('infinite-scroller')[0]; }
        return ret;
    }

    static REMOVE_SPECIAL_CHARS(title) {
        return title.replaceAll("?", "_").replaceAll(":", "_").trim()
    }

    static GET_RECENT(onFinish = (titles) => { }) {
        //const checkXConversations = 40;
        const desiredCheck = 40;
        let infScroller = ConvTitles.GET_LEFT_INF_SCROLL();
        let convTitles;
        const interval = setInterval(() => {
            convTitles = ConvTitles.GET_TITLES();
            if (convTitles.length <= desiredCheck) {
                if (infScroller == undefined) { infScroller = ConvTitles.GET_LEFT_INF_SCROLL(); }
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