class ConvUtils {
    /*
    const targetContainer = document.querySelectorAll('infinite-scroller, .chat-history-scroll-container')[1];
    console.log(targetContainer);
    if (targetContainer) {
        const observer = new MutationObserver((mutationsList) => {
            //console.log(mutationsList);
            for (const mutation of mutationsList) {
                //console.log(mutation);
                // We only care if new DOM nodes were added
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is an element and matches our conversation container
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('conversation-container')) {
                            handleNewMessageContainer(node);
                        }
                    });
                }
            }
        });
    
        // Configuration: Watch the immediate children being added to the scroller
        observer.observe(targetContainer, { childList: true, subtree: true });
        console.log("Astral Scraper: MutationObserver attached smoothly!");
    } else {
        console.error("Astral Scraper: Couldn't find the main chat history container.");
    }
    
    let lastTextLength = 0;
    let checkTicks = 0;
    let stabilityTimer;
    
    function handleNewMessageContainer(containerElement) {
        const modelResponseEl = containerElement.querySelector('model-response');
        if (!modelResponseEl) return;
    
        // Clear the stability checker on every mutation event
        clearTimeout(stabilityTimer);
    
        function verifyStability() {
            const currentText = modelResponseEl.innerText.trim();
            const currentLength = currentText.length;
    
            // If the text length is identical to the last check, it might be done
            if (currentLength > 0 && currentLength === lastTextLength) {
                checkTicks++;
                
                // Require 3 consecutive cycles (e.g., 3 * 500ms = 1.5s) of absolute zero growth to confirm completion
                if (checkTicks >= 3) {
                    const userQueryEl = containerElement.querySelector('user-query');
                    
                    const dataPayload = {
                        timestamp: new Date().toISOString(),
                        prompt: userQueryEl ? userQueryEl.innerText.trim() : null,
                        response: currentText
                    };
    
                    console.log("🚀 Caught 100% Finalized Exchange:", dataPayload);
                    // Reset trackers for the next message block
                    lastTextLength = 0;
                    checkTicks = 0;
                    return;
                }
            } else {
                // Text is still growing! Update the length and reset the ticks
                lastTextLength = currentLength;
                checkTicks = 0;
            }
    
            // Keep polling every 500ms until it passes the stability check
            stabilityTimer = setTimeout(verifyStability, 500);
        }
    
        // Start the stability verification loop
        stabilityTimer = setTimeout(verifyStability, 500);
    }
    
    // Where you can hook up your archival processing
    function yourCustomPipelineCallback(data) {
        console.log("🚀 Caught new exchange:", data);
        // Your code to send this data to your local backend, local storage, or loop goes here!
    }
    */

    /*********** CHAT CONTROL **********/


    static NEW_CHAT_BUTTON() {
        return document.querySelector('[data-test-id="new-chat-button"]');
    }

    static NEW_CHAT() {
        ConvUtils.NEW_CHAT_BUTTON().firstChild.click();
    }

    /*********** PROMPTING *************/
    static getBardPromptEl() {
        return document.querySelector('div.ql-editor');
    }

    static GET_SUBMIT_PROMPT_BUTTON() {
        return document.querySelector("gem-icon-button.send-button");
    }

    static PROMPT(prompt) {
        const promptBox = ConvUtils.getBardPromptEl();
        promptBox.textContent = prompt;
        promptBox.dispatchEvent(new Event('input', { bubbles: true }));
    }


    static SEND_PROMPT() {
        ConvUtils.GET_SUBMIT_PROMPT_BUTTON().click();
    }

    static GET_MODEL_RESPONSES() {
        return document.querySelectorAll("model-response");
    }

    /************** FILES ***************/
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