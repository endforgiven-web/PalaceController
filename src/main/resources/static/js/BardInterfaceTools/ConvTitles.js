class ConvTitles {

    static GET_TITLES_TEXT() {

        const array = ConvTitles.GET_TITLES();
        const titles = {};
        array.forEach((item, index) => {
            //console.log(item, index);
            let indexList = titles[item];
            //console.log("index list: " + indexList);
            if (indexList == undefined) { indexList = []; }
            indexList.push(index);
            titles[item.textContent.trim()] = indexList;
            //console.log(titles);
        });

        return titles;
    }

    static FIND_TITLE_LIKE_INDEX(title) {
        const titles = ConvTitles.GET_TITLES_TEXT();
        const titleKeys = Object.keys(titles);
        const matchingTitle = titleKeys.find(key => key.includes(title));
        //console.log(titles);
        console.log(matchingTitle, titles[matchingTitle]);
        const ret = matchingTitle != undefined ? titles[matchingTitle] : -1;
        //console.log(ret);
        return ret;
    }

    static GO_TO_TITLE_LIKE(title) {
        const index = ConvTitles.FIND_TITLE_LIKE_INDEX(title);
        console.log(index);
        const titleExists = index >= 0;
        if (titleExists) ConvTitles.GOTO_X_CONV(index);
        return titleExists;
    }

    static GET_CURR_TITLE_TEXT() {
        const currTitle = ConvTitles.GET_CURR_TITLE();
        if (!currTitle) {
            console.error("Current title element not found!");
            return "";
        }
        return currTitle.textContent.trim();
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