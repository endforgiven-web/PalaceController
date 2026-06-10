class RetrieveUtils {
    static CHECK_CONVS() {
        RetrieveUtils.GET_MASTER_LIST((masterList) => {
            RetrieveUtils.SUBMIT
                (masterList);
        });
    }

    static GET_MASTER_LIST(onFinish = (data) => { }) {
        console.log("Downloading master list file stream from local Palace anchor...");

        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + "masterFile",
            // CRITICAL: Force the browser to intercept the raw payload as a true binary blob
            responseType: "blob",
            onload: function (response) {
                console.log("Raw Response Metadata:", response);

                // 1. Grab the raw binary blob data safely
                const fileBlob = response.response;
                console.log(`Blob extracted successfully. Size: ${fileBlob ? fileBlob.size : 0} bytes. Type: ${fileBlob ? fileBlob.type : 'unknown'}`);

                // 2. Wrap it directly into our standard File container
                const masterListFile = new File([fileBlob], "master_list.txt", {
                    type: "text/plain",
                });

                console.group("--- PALACE FILE OBJECT DIAGNOSTICS ---");
                console.log("Is True File Instance:", masterListFile instanceof File);
                console.log("File Name Specified:", masterListFile.name);
                console.log("File Byte Count:", masterListFile.size);
                console.log("MIME Content-Type Type:", masterListFile.type);
                console.log("Last Modification String:", new Date(masterListFile.lastModified).toISOString());
                console.groupEnd();

                // 3. Optional: Read a tiny slice of the string to ensure it's not corrupted text
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log("File Data Stream Preview (First 150 chars):", e.target.result.substring(0, 150));
                };
                reader.readAsText(masterListFile);

                // 4. Pass the actual File object to your callback!
                onFinish(masterListFile);
            },
            onerror: function (err) {
                console.error("Palace Uplink Failed!", err);
            }
        });
    }

    static SUBMIT(masterListFile) {
        console.group("🚀 SUBMIT23: Dual-Path Angular Drop Injection");
        console.log("File:", masterListFile.name, "| Size:", masterListFile.size, "bytes | Type:", masterListFile.type);

        // ── 0. Locate the drop zone ──────────────────────────────────────────────
        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Drop zone not found in DOM. Aborting.");
            console.groupEnd();
            return;
        }
        console.log("Drop zone located:", dropZone);

        // ── 1. Build the DataTransfer bundle ────────────────────────────────────
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        // Lock the types array so Angular's drag-validator sees ["Files"]
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("types override skipped:", e);
        }

        // Mock FileList so dataTransfer.files also passes Angular's guards
        try {
            const mockFileList = Object.create(FileList.prototype);
            Object.defineProperty(mockFileList, '0', { value: masterListFile, enumerable: true });
            Object.defineProperty(mockFileList, 'length', { value: 1 });
            mockFileList.item = (i) => i === 0 ? masterListFile : null;
            Object.defineProperty(dataTransfer, 'files', {
                value: mockFileList,
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("files override skipped:", e);
        }

        // ── 2. webkitGetAsEntry prototype patch (survives Angular's async digest) ─
        //
        //  WHY prototype-level instead of instance-level:
        //  Angular's XAP uploader calls webkitGetAsEntry() inside a Zone.js
        //  microtask that runs AFTER the drop event handler returns. By the time
        //  that microtask fires, any Object.defineProperty patch on the *instance*
        //  (dataTransfer.items[0]) may have been reset by the browser's garbage
        //  collector clearing the DataTransferItemList. Patching the prototype
        //  means the mock survives for the full tick.
        const originalGetAsEntry = DataTransferItem.prototype.webkitGetAsEntry;

        const mockFileEntry = {
            isFile: true,
            isDirectory: false,
            name: masterListFile.name,
            fullPath: '/' + masterListFile.name,
            file(successCb, _errorCb) { successCb(masterListFile); },
            // Some Angular uploaders also call createReader on directories — stub it safely
            createReader() { return { readEntries(cb) { cb([]); } }; }
        };

        DataTransferItem.prototype.webkitGetAsEntry = function () {
            console.log("webkitGetAsEntry() intercepted on prototype — returning mock entry.");
            return mockFileEntry;
        };

        const restorePrototype = () => {
            DataTransferItem.prototype.webkitGetAsEntry = originalGetAsEntry;
            console.log("webkitGetAsEntry prototype restored.");
        };

        // ── 3. PATH B — MutationObserver file-input intercept (armed early) ──────
        //
        //  Some versions of Gemini's uploader respond to the drop by spawning a
        //  hidden <input type="file"> and expecting it to be populated. We watch
        //  for it in parallel so we win either way.
        let pathBFired = false;

        const injectIntoFileInput = (input) => {
            if (pathBFired) return; // only fire once
            pathBFired = true;
            console.log("PATH B: Hidden file input intercepted:", input);

            const dt = new DataTransfer();
            dt.items.add(masterListFile);

            try {
                input.files = dt.files;
            } catch (e) {
                console.warn("PATH B: Could not assign .files directly:", e);
            }

            // Dispatch in the order Angular expects: focus → input → change
            input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            // Also fire a native InputEvent so Angular's (input) binding triggers
            try {
                input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
            } catch (e) { /* InputEvent not available in all environments */ }

            console.log("PATH B: Payload injected into file input. ✅");
            mutationObserver.disconnect();
        };

        const mutationObserver = new MutationObserver(() => {
            const input = document.querySelector('input[type="file"]');
            if (input) injectIntoFileInput(input);
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        // ── 4. Drag event factory ────────────────────────────────────────────────
        const makeDragEvent = (type) => {
            const ev = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });
            Object.defineProperty(ev, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return ev;
        };

        // ── 5. PATH A — Drag sequence ─────────────────────────────────────────────
        //
        //  CRITICAL: We must add a real dragover listener that calls preventDefault()
        //  before we dispatch our fake dragover. Without preventDefault() on dragover,
        //  browsers silently discard the subsequent "drop" event — this is the #1
        //  reason SUBMIT9–15 showed the blue UI flash open and then immediately close
        //  with no file card appearing.

        const dragoverGuard = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        dropZone.addEventListener('dragover', dragoverGuard);

        console.log("PATH A Phase 1: dragenter + dragover → opening blue gate...");
        dropZone.dispatchEvent(makeDragEvent('dragenter'));
        dropZone.dispatchEvent(makeDragEvent('dragover'));

        // Phase 2: drop — fire after Angular's Zone.js processes the visual state change
        setTimeout(() => {
            console.log("PATH A Phase 2: drop → injecting file payload...");
            const activeTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
            activeTarget.dispatchEvent(makeDragEvent('drop'));
        }, 150);

        // Phase 3: dragleave + cleanup
        setTimeout(() => {
            console.log("PATH A Phase 3: dragleave + cleanup.");
            dropZone.dispatchEvent(makeDragEvent('dragleave'));
            dropZone.removeEventListener('dragover', dragoverGuard);
            restorePrototype();
            mutationObserver.disconnect();
            console.groupEnd();
            console.log("SUBMIT23 sequence complete — check the prompt area for the file card! 🎉");
        }, 500);
    }
}
