class ConvUtils {
    static getPromptBox() {
        return document.getElementsByClassName("ng-tns-c1438131813-4 ng-star-inserted single-line-format")[0];
    }

    static getFileDropZone() {
        return document.querySelector('.xap-uploader-dropzone.chat-container.ng-trigger.ng-trigger-chatHistoryImmersiveTransitions');
    }

    static SUBMIT_FILE(files) {
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