(function () {
    window.addEventListener('load', function () {
        setUpTestButton();
        setUpTest2Button();
        startCheckingCycle();
    });
})();

function setUpTestButton() {
    const btn = document.createElement("button");
    btn.innerText = "test";
    btn.addEventListener("click", RetrieveUtils.SUBMIT_MASTER);
    document.body.appendChild(btn);
}

function setUpTest2Button() {
    const btn = document.createElement("button");
    btn.innerText = "test2";
    btn.addEventListener("click", RetrieveUtils.MASTER_LIST_PROMPT_TEST);
    document.body.appendChild(btn);
}