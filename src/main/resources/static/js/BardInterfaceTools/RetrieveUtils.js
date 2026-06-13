class RetrieveUtils {
    static CHECK_MASTER() {
        RetrieveUtils.GET_FILE((masterList) => {
            RetrieveUtils.SUBMIT([masterList]);
        }, "masterFile", "master_list.txt", "text/plain");
    }

    static CHECK_CONVS() {
        const start = 1;
        const end = 10;
        RetrieveUtils.GET_FILE((chatZipFile) => {
            RetrieveUtils.SUBMIT([chatZipFile]);
        }, "chatZip/" + start + "/" + end, "all_conversations.zip", "application/zip");
    }

    static GET_FILE(onFinish = (zipFile) => { }, url, fileName, fileType) {
        console.log("Downloading file from local Palace anchor...");

        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + url,
            // CRITICAL: Force Tampermonkey to intercept the raw payload as a true binary blob
            responseType: "blob",
            onload: function (response) {
                //console.log("Raw Response Metadata:", response);

                // 1. Grab the raw binary blob data safely
                const fileBlob = response.response;
                //console.log(`Blob extracted successfully. Size: ${fileBlob ? fileBlob.size : 0} bytes. Type: ${fileBlob ? fileBlob.type : 'unknown'}`);

                if (!fileBlob || fileBlob.size <= 22) {
                    console.error("Downloaded file is empty or invalid!");
                    return;
                }

                // 2. Wrap it directly into our standard File container with a zip MIME type
                const conversationsZipFile = new File([fileBlob], fileName, {
                    type: fileType,
                });

                /*console.group("--- PALACE ZIP FILE OBJECT DIAGNOSTICS ---");
                console.log("Is True File Instance:", conversationsZipFile instanceof File);
                console.log("File Name Specified:", conversationsZipFile.name);
                console.log("File Byte Count:", conversationsZipFile.size);
                console.log("MIME Content-Type Type:", conversationsZipFile.type);
                console.log("Last Modification String:", new Date(conversationsZipFile.lastModified).toISOString());
                console.groupEnd();*/

                // 3. Pass the actual zip File object to your callback!
                onFinish(conversationsZipFile);
            },
            onerror: function (err) {
                console.error("Palace Conversations Zip Uplink Failed!", err);
            }
        });
    }

    /*const reader = new FileReader();
 reader.onload = function (e) {
     // Add a guard check to make sure result exists before running substring
     if (e.target && e.target.result) {
         console.log("File Data Stream Preview (First 150 chars):", e.target.result.substring(0, 150));
     } else {
         console.log("File Data Stream Preview: (Stream processing...)");
     }
 };
 reader.readAsText(masterListFile);*/

    static SUBMIT(files) {
        // Ensure we are always dealing with an array, even if a single file slips through
        if (!Array.isArray(files)) {
            files = [files];
        }

        console.log(`🚀 SUBMIT: Processing a batch of ${files.length} file(s).`);

        // ── 0. Locate the drop zone ──────────────────────────────────────────────
        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Drop zone not found in DOM. Aborting.");
            return;
        }

        // ── 1. Build the DataTransfer bundle for ALL files ──────────────────────
        const dataTransfer = new DataTransfer();

        // Loop through the array and append every file to the dataTransfer payload
        files.forEach(file => {
            dataTransfer.items.add(file);
        });

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

        // Mock FileList collection to pass Angular's structural guards for multiple files
        try {
            const mockFileList = Object.create(FileList.prototype);
            files.forEach((file, index) => {
                Object.defineProperty(mockFileList, index.toString(), { value: file, enumerable: true });
            });
            Object.defineProperty(mockFileList, 'length', { value: files.length });
            mockFileList.item = (i) => mockFileList[i] || null;

            Object.defineProperty(dataTransfer, 'files', {
                value: mockFileList,
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("files override skipped:", e);
        }

        // ── 2. webkitGetAsEntry prototype patch ──────────────────────────────────
        // Since we are patching the item prototype globally, it will intercept 
        // calls sequentially as Angular iterates through the indices.
        const originalGetAsEntry = DataTransferItem.prototype.webkitGetAsEntry;

        DataTransferItem.prototype.webkitGetAsEntry = function () {
            // Find which item instance this is being called on to match the correct file
            const itemsArray = Array.from(dataTransfer.items);
            const itemIndex = itemsArray.indexOf(this);
            const associatedFile = files[itemIndex] || files[0];

            return {
                isFile: true,
                isDirectory: false,
                name: associatedFile.name,
                fullPath: '/' + associatedFile.name,
                file(successCb, _errorCb) { successCb(associatedFile); },
                createReader() { return { readEntries(cb) { cb([]); } }; }
            };
        };

        const restorePrototype = () => {
            DataTransferItem.prototype.webkitGetAsEntry = originalGetAsEntry;
        };

        // ── 3. PATH B — MutationObserver file-input intercept (Armed for array) ─
        let pathBFired = false;

        const injectIntoFileInput = (input) => {
            if (pathBFired) return;
            pathBFired = true;

            try {
                input.files = dataTransfer.files;
            } catch (e) {
                console.warn("PATH B: Could not assign .files directly:", e);
            }

            input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            try {
                input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
            } catch (e) { }

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
        const dragoverGuard = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        dropZone.addEventListener('dragover', dragoverGuard);

        dropZone.dispatchEvent(makeDragEvent('dragenter'));
        dropZone.dispatchEvent(makeDragEvent('dragover'));

        setTimeout(() => {
            const activeTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
            activeTarget.dispatchEvent(makeDragEvent('drop'));
        }, 150);

        setTimeout(() => {
            dropZone.dispatchEvent(makeDragEvent('dragleave'));
            dropZone.removeEventListener('dragover', dragoverGuard);
            restorePrototype();
            mutationObserver.disconnect();
            console.log(`🎉 Batch upload sequence complete for ${files.length} file(s)!`);
        }, 500);
    }
}
