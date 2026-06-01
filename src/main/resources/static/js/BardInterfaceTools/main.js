(function () {
    window.addEventListener('load', function () {
        setUpTestButton();
        startCheckingCycle();
    });
})();

function setUpTestButton() {
    const btn = document.createElement("button");
    btn.innerText = "test";
    btn.addEventListener("click", scrapeAndUploadNewConversations);
    document.body.appendChild(btn);
}