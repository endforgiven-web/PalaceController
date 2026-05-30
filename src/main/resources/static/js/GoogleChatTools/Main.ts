(function() {
    'use strict';
    console.log('gctools');
    // Your code here...
    setTimeout(()=>{
        uploadConversation();
    }, 1500);
})();

function test() {
    console.log("test");
}

function uploadConversation() {
    console.log("uploadConversation");
    const arr = GCUtils.SCRAPE_X(3);
}