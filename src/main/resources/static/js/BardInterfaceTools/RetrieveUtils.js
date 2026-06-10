class RetrieveUtils {
    static CHECK_CONVS() {
        RetrieveUtils.GET_MASTER_LIST2((masterList) => {
            RetrieveUtils.SUBMIT23
                (masterList);
        });
    }

    static GET_MASTER_LIST(onFinish = (data) => { }) {
        GM_xmlhttpRequest({
            method: "GET",
            url: baseUrl + "masterFile",
            onload: function (response) {
                console.log(response);

                // 2. Grab the raw blob data
                const fileBlob = response.response;

                // 3. Instead of parsing, wrap it cleanly into a File object
                const masterListFile = new File([fileBlob], "palace_master_list.json", {
                    type: "application/json"
                });

                // 4. Pass the actual File object to your callback!
                onFinish(masterListFile);
            },
            onerror: function (err) {
                console.error("Palace Uplink Failed!", err);
            }
        });
    }

    static GET_MASTER_LIST2(onFinish = (data) => { }) {
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

    static SUBMIT23(masterListFile) {
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

    // GPT attempt, worked but no upload. Just showed the dialogue open and collapse.
    static SUBMIT22(masterListFile) {

        console.log("🚀 SUBMIT22: Enhanced Drag-Drop Injection");

        const dropZone = ConvUtils.getFileDropZone();

        if (!dropZone) {
            console.error("CRITICAL: Dropzone missing.");
            return;
        }

        console.group("=== FILE DIAGNOSTICS ===");
        console.log("Name:", masterListFile.name);
        console.log("Type:", masterListFile.type);
        console.log("Size:", masterListFile.size);
        console.groupEnd();

        // Install temporary debugging hooks

        const rejectionHandler = (e) => {
            console.error("PROMISE REJECTION:", e.reason);
        };

        const errorHandler = (e) => {
            console.error("WINDOW ERROR:", e.error);
        };

        window.addEventListener("unhandledrejection", rejectionHandler);
        window.addEventListener("error", errorHandler);

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(masterListFile);

        const mockFileEntry = {
            isFile: true,
            isDirectory: false,
            name: masterListFile.name,
            fullPath: "/" + masterListFile.name,

            file(callback) {
                callback(masterListFile);
            }
        };

        if (dataTransfer.items[0]) {

            try {

                Object.defineProperty(
                    dataTransfer.items[0],
                    "webkitGetAsEntry",
                    {
                        value: () => mockFileEntry,
                        configurable: true
                    }
                );

            } catch (e) {
                console.warn("webkitGetAsEntry patch failed", e);
            }
        }

        try {

            Object.defineProperty(
                dataTransfer,
                "types",
                {
                    value: Object.freeze(["Files"]),
                    configurable: true
                }
            );

        } catch (e) {
            console.warn("types override failed", e);
        }

        console.group("=== DATATRANSFER DIAGNOSTICS ===");
        console.log("Files:", dataTransfer.files);
        console.log("File Count:", dataTransfer.files.length);
        console.log("Items:", dataTransfer.items);
        console.log("Item Count:", dataTransfer.items.length);
        console.log("Types:", dataTransfer.types);
        console.groupEnd();

        const createEvent = (type) => {

            const event = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(
                event,
                "dataTransfer",
                {
                    value: dataTransfer,
                    configurable: true
                }
            );

            return event;
        };

        console.log("Phase 1: dragenter");
        dropZone.dispatchEvent(createEvent("dragenter"));

        setTimeout(() => {

            console.log("Phase 2: dragover");

            dropZone.dispatchEvent(
                createEvent("dragover")
            );

        }, 50);

        setTimeout(() => {

            console.log("Phase 3: drop");

            dropZone.dispatchEvent(
                createEvent("drop")
            );

        }, 150);

        setTimeout(() => {

            console.log("Phase 4: dragleave");

            dropZone.dispatchEvent(
                createEvent("dragleave")
            );

        }, 300);

        setTimeout(() => {

            window.removeEventListener(
                "unhandledrejection",
                rejectionHandler
            );

            window.removeEventListener(
                "error",
                errorHandler
            );

            console.log(
                "SUBMIT22 diagnostic window closed."
            );

        }, 5000);
    }

    static SUBMIT21(masterListFile) {
        console.log("🚀 SUBMIT21: Hybrid Angular/Uploader Assault Beginning...");

        const attachButton =
            document.querySelector('button[aria-label*="Attach"]') ||
            document.querySelector('button[aria-label*="file"]') ||
            document.querySelector('button[aria-label*="upload"]') ||
            document.querySelector('.xap-uploader-dropzone');

        if (!attachButton) {
            console.error("No attachment trigger found.");
            return;
        }

        const injectIntoInput = (input) => {

            console.log("🎯 File input located:", input);

            const dt = new DataTransfer();
            dt.items.add(masterListFile);

            try {
                input.files = dt.files;
            }
            catch (err) {
                console.error("Failed assigning FileList:", err);
            }

            [
                'input',
                'change'
            ].forEach(type => {
                input.dispatchEvent(
                    new Event(type, {
                        bubbles: true,
                        composed: true
                    })
                );
            });

            console.log("📦 Native input injection completed.");

            setTimeout(() => {

                try {

                    const ctx = input.__ngContext__;

                    if (!ctx) {
                        console.warn("No Angular context found.");
                        return;
                    }

                    console.log("Angular context found.");

                    const candidates = [];

                    for (const item of ctx) {

                        if (!item || typeof item !== "object")
                            continue;

                        for (const key of Object.keys(item)) {

                            const lower = key.toLowerCase();

                            if (
                                lower.includes("file") ||
                                lower.includes("upload") ||
                                lower.includes("attach") ||
                                lower.includes("drop") ||
                                lower.includes("select")
                            ) {
                                candidates.push({
                                    obj: item,
                                    method: key
                                });
                            }
                        }
                    }

                    console.log("Potential handlers:", candidates);

                    for (const candidate of candidates) {

                        const fn = candidate.obj[candidate.method];

                        if (typeof fn !== "function")
                            continue;

                        try {

                            console.log(
                                `Trying ${candidate.method}(FileList)`
                            );

                            fn.call(
                                candidate.obj,
                                dt.files
                            );

                            console.log(
                                `SUCCESS via ${candidate.method}(FileList)`
                            );

                            return;

                        }
                        catch (e1) {

                            try {

                                console.log(
                                    `Trying ${candidate.method}(File[])`
                                );

                                fn.call(
                                    candidate.obj,
                                    [masterListFile]
                                );

                                console.log(
                                    `SUCCESS via ${candidate.method}(File[])`
                                );

                                return;

                            }
                            catch (e2) {
                                console.warn(
                                    `Rejected by ${candidate.method}`
                                );
                            }
                        }
                    }

                }
                catch (err) {
                    console.error(
                        "Angular discovery failed:",
                        err
                    );
                }

            }, 250);
        };

        const observer = new MutationObserver(
            (mutations, obs) => {

                const input =
                    document.querySelector(
                        'input[type="file"]'
                    );

                if (!input)
                    return;

                obs.disconnect();

                console.log(
                    "🕵️ Hidden file input intercepted."
                );

                injectIntoInput(input);
            }
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log(
            "🖱️ Triggering attachment button..."
        );

        attachButton.click();

        setTimeout(() => {

            observer.disconnect();

            console.log(
                "Observer safety timeout reached."
            );

        }, 5000);
    }

    static SUBMIT20(masterListFile) {
        console.log("Initiating Phase 1: Arming Ultra-Precision Interceptor Trap...");

        // 1. A much tighter search net for the physical attachment/plus/upload button
        const attachButton = document.querySelector('button[aria-label*="Attach"]') ||
            document.querySelector('button[aria-label*="file"]') ||
            document.querySelector('button[aria-label*="upload"]') ||
            document.querySelector('.xap-uploader-dropzone'); // Fallback

        if (!attachButton) {
            console.error("CRITICAL: Visual trigger control button could not be located!");
            return;
        }

        console.log("Targeted anchor located:", attachButton);

        // 2. The Mutation Observer Trap (Same brilliant engine as before)
        const injectPayload = (inputElement) => {
            console.log("🎯 Target input channel intercepted! Injecting file stream...");
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);
            inputElement.files = dataTransfer.files;

            inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            console.log("Payload synchronized on input channel! Check for the card! :D");
        };

        const observer = new MutationObserver((mutations, obs) => {
            const hiddenInput = document.querySelector('input[type="file"]');
            if (hiddenInput) {
                injectPayload(hiddenInput);
                obs.disconnect();
                console.log("Mutation observer successfully disarmed.");
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 3. Forced Native Interaction Sequence
        // Instead of a simple click(), we simulate a full human Pointer/Mouse sequence to flush out the hidden input
        console.log("Simulating full synthetic human click sequence on anchor...");

        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            composed: true
        });

        attachButton.dispatchEvent(clickEvent);

        // Safety timeout
        setTimeout(() => {
            observer.disconnect();
            console.log("Observer safety window closed.");
        }, 2500);
    }

    static SUBMIT19(masterListFile) {
        console.log("Initiating Supercharged Phase 1: Arming DOM Mutation Interceptor Trap...");

        // 1. Target the physical trigger button
        const attachButton = document.querySelector('button[aria-label*="file"]') ||
            document.querySelector('button[aria-label*="upload"]') ||
            document.querySelector('.xap-uploader-dropzone');

        if (!attachButton) {
            console.error("CRITICAL: Visual trigger button could not be resolved.");
            return;
        }

        // 2. Build the engine that injects the file card payload
        const injectPayload = (inputElement) => {
            console.log("🎯 Hidden file input intercepted in real-time! Injecting stream...");

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            inputElement.files = dataTransfer.files;

            // Fire full cascading framework events to force Angular change detection
            inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            console.log("Payload synchronized on input channel! Check the UI for the card! :D");
        };

        // 3. Set up the high-speed Mutation Observer trap
        const observer = new MutationObserver((mutations, obs) => {
            // Deep search the DOM for the newly spawned input element
            const hiddenInput = document.querySelector('input[type="file"]');
            if (hiddenInput) {
                injectPayload(hiddenInput);
                obs.disconnect(); // Disarm the trap immediately after success
                console.log("Mutation observer successfully disarmed.");
            }
        });

        // Arm the observer to watch the entire document tree for structure changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 4. Fire the mechanical click to force Angular to spawn the file input element
        console.log("Simulating mechanical activation click sequence...");
        attachButton.click();

        // Safety timeout: If nothing spawns within 2 seconds, disarm to save memory
        setTimeout(() => {
            observer.disconnect();
            console.log("Observer safety window closed.");
        }, 2000);
    }

    static SUBMIT18(masterListFile) {
        console.log("Initiating Strategy 2: Text Stream Bypass...");

        const reader = new FileReader();
        reader.onload = function (e) {
            const fileText = e.target.result;

            // Format a clean, beautifully structured markdown block for the prompt box
            const formattedPayload = `\n[SYSTEM UPDATE: LOCAL PALACE DATA ATTACHED]\n\`\`\`json\n${fileText}\n\`\`\`\n`;

            const promptBox = ConvUtils.getPromptBox() || document.querySelector('textarea') || document.querySelector('[contenteditable="true"]');

            if (!promptBox) {
                console.error("CRITICAL: Prompt input box could not be resolved!");
                return;
            }

            console.log("Target text node located. Injecting data payload stream...");

            // If it's a standard text area/input element
            if (promptBox.tagName === 'TEXTAREA' || promptBox.tagName === 'INPUT') {
                promptBox.value += formattedPayload;
                promptBox.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                // If it's an Angular contenteditable container (highly likely given the class name)
                promptBox.focus();

                // Use the native browser execution engine to safely execute a clean insert text command
                // This forces Angular's internal dynamic document bindings to capture the string perfectly
                document.execCommand('insertText', false, formattedPayload);
            }

            console.log("Data stream fully compiled and typed into the prompt interface! :D");
        };

        reader.readAsText(masterListFile);
    }

    static SUBMIT17(masterListFile) {
        console.log("Initiating Phase 1: Locating the underlying Angular architecture...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Dropzone element missing.");
            return;
        }

        // 1. Attempt to hook into the global Angular debug engine
        // Modern Angular (Ivy) exposes 'ng' globally in development/certain environments
        if (typeof ng === 'undefined') {
            console.warn("Angular 'ng' global helper is not exposed. Attempting DOM context extraction...");
        }

        try {
            // 2. Extract the component or directive bound to the dropzone
            // We search for the component or directives handling the file uploads
            const componentInstance = ng ? ng.getComponent(dropZone) : null;
            const directives = ng ? ng.getDirectives(dropZone) : [];

            console.log("Extracted Angular Component:", componentInstance);
            console.log("Extracted Angular Directives:", directives);

            // Find any object containing file handling methods (e.g., 'onFileDrop', 'handleFiles', 'upload')
            const targets = [componentInstance, ...directives].filter(Boolean);
            let methodFound = false;

            targets.forEach(target => {
                // Scan the object properties for anything that looks like a file array receiver
                for (let key in target) {
                    if (typeof target[key] === 'function' &&
                        (key.toLowerCase().includes('file') || key.toLowerCase().includes('drop') || key.toLowerCase().includes('upload'))) {

                        console.log(`BINGO! Found potential file interface: target.${key}`);

                        // Create a standard FileList-like container
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(masterListFile);

                        // Directly invoke Angular's internal handler method with our spoofed payload/event!
                        // Sometimes it expects a File[], sometimes a FileList, sometimes a raw event
                        try {
                            target[key](dataTransfer.files);
                            console.log(`Invoked target.${key} with raw FileList!`);
                            methodFound = true;
                        } catch (e) {
                            try {
                                target[key]([masterListFile]); // Try flat array
                                console.log(`Invoked target.${key} with File Array!`);
                                methodFound = true;
                            } catch (err) {
                                console.warn(`Invocation failed for ${key}:`, err);
                            }
                        }
                    }
                }
            });

            if (methodFound) {
                console.log("Internal state injection complete! Triggering global change detection...");
                // Force Angular to redraw the UI and show the file card
                if (window.ng && window.ng.applyChanges) {
                    window.ng.applyChanges(dropZone);
                }
                return;
            }
        } catch (error) {
            console.error("Angular state hijack failed:", error);
        }

        console.log("System Status: Direct state injection unavailable. Proceeding to fallback...");
    }

    static SUBMIT16(masterListFile) {
        console.log("Initiating Phase 1: Locating physical upload anchor button...");

        const attachButton = document.querySelector('button[aria-label*="file"]') ||
            document.querySelector('button[aria-label*="upload"]') ||
            document.querySelector('.xap-uploader-dropzone') ||
            document.querySelector('[xapfileselectordropzone]');

        if (!attachButton) {
            console.error("CRITICAL: Could not resolve physical upload anchor control button!");
            return;
        }

        console.log("Visual trigger anchor located:", attachButton);

        // 1. Establish the Async Injection Strategy
        const injectPayloadIntoInput = (inputElement) => {
            console.log("Target input channel locked! Injecting file payload...");

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // Directly override the target input files property
            inputElement.files = dataTransfer.files;

            // CRITICAL FOR FRAMEWORKS: Force angular lifecycle change recognition
            // We fire 'choose', 'input', and 'change' cascading triggers back-to-back
            inputElement.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            console.log("Payload synchronized directly on native element stream! :D");
        };

        // 2. Set up our dynamic DOM monitoring net
        // This watches the tree for 1000ms after the click to capture any freshly spawned inputs
        let checkCount = 0;
        const maxChecks = 20; // 20 checks * 25ms = 500ms window

        const pollForHiddenInput = () => {
            const nativeInputs = Array.from(document.querySelectorAll('input[type="file"]'));

            if (nativeInputs.length > 0) {
                console.log(`Success! Flushed out ${nativeInputs.length} inputs after ${checkCount * 25}ms.`);
                nativeInputs.forEach(input => injectPayloadIntoInput(input));
                return true; // Target acquired
            }

            checkCount++;
            if (checkCount < maxChecks) {
                setTimeout(pollForHiddenInput, 25); // Poll every 25ms
            } else {
                console.warn("Polling timeout reached: No hidden file input materialized in DOM.");
            }
            return false;
        };

        // 3. Fire the click trigger to force the framework to compile/spawn the uploader
        console.log("Simulating mechanical anchor click activation sequence...");
        attachButton.click();

        // 4. Immediately launch the polling net to catch it the moment it hits the DOM
        setTimeout(pollForHiddenInput, 10);
    }

    // Gemini rework, shows the dialogue open and close, but no upload. GPT's 22 was based on this. Gemini made all those below this one and up to 19.
    static SUBMIT15(masterListFile) {
        console.log("Initiating Phase 1: Setting up deep-spoof validation models...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        // 1. Construct our organic DataTransfer bundle
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        // 2. MOCK THE WEBKIT FILE SYSTEM ENTRY API
        // This is the golden ticket for framework file-drop components!
        const mockFileEntry = {
            isFile: true,
            isDirectory: false,
            name: masterListFile.name,
            fullPath: '/' + masterListFile.name,
            file: function (callback) { callback(masterListFile); }
        };

        // Safely inject the entry getter onto the DataTransferItem prototype/instance
        if (dataTransfer.items[0]) {
            Object.defineProperty(dataTransfer.items[0], 'webkitGetAsEntry', {
                value: () => mockFileEntry,
                writable: false,
                configurable: true
            });
        }

        // 3. Ensure standard array and type guarantees are locked down
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("Types override skipped:", e);
        }

        // Helper to generate perfectly forged DragEvents
        const createFrameworkDragEvent = (type) => {
            const dragEvent = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(dragEvent, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return dragEvent;
        };

        // 4. Wake up the framework drop gates
        console.log("Dispatching framework activation events...");
        dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));
        dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

        // Phase 2: Wait for the visual state to settle, then execute the drop payload
        setTimeout(() => {
            console.log("Phase 2: Slamming deep-spoof file payload into receiver...");
            const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;

            activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));
            console.log("Sequence finalized! Let's check the prompt area for that card... :D");
        }, 150);
    }

    static SUBMIT14(masterListFile) {
        console.log("Initiating Phase 1: Locating visual attachment controls...");

        // 1. Hunt for the explicit file attachment button/paperclip wrapper
        // We look for common uploader trigger targets nearby the prompt box
        const attachButton = document.querySelector('button[aria-label*="file"]') ||
            document.querySelector('button[aria-label*="upload"]') ||
            document.querySelector('.xap-uploader-dropzone') ||
            document.querySelector('[xapfileselectordropzone]');

        if (!attachButton) {
            console.error("CRITICAL: Could not resolve a physical upload anchor control button!");
            return;
        }

        console.log("Visual trigger anchor located:", attachButton);

        // 2. Add an instant, global single-use observer trap to capture the input element the moment it spawns
        const captureTrap = (e) => {
            console.log("DOM Event intercepted! Scanning local branch for spawned input streams...");

            // Force a deep query sweep across the document tree
            const nativeInputs = Array.from(document.querySelectorAll('input[type="file"]'));

            if (nativeInputs.length > 0) {
                console.log(`Success! Flushed out ${nativeInputs.length} hidden input channels.`);

                nativeInputs.forEach((input) => {
                    // Package the text file directly into the true HTML element property
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(masterListFile);
                    input.files = dataTransfer.files;

                    // Dispatch native lifecycle updates directly to the channel
                    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                });

                console.log("Payload synchronization executed directly on the native stream! :D");
                window.removeEventListener('click', captureTrap, true);
            }
        };

        // Arm our trap on the window capturing phase
        window.addEventListener('click', captureTrap, true);

        // 3. Fire a native mechanical click at the framework button to force initialization
        console.log("Simulating native anchor click activation sequence...");
        attachButton.click();

        // Self-cleaning fallback loop in case the dialogue blocks execution threads
        setTimeout(() => {
            window.removeEventListener('click', captureTrap, true);
            console.log("Interaction sequence phase complete.");
        }, 1000);
    }

    static SUBMIT13(masterListFile) {
        console.log("Initiating Phase 1: Waking up framework UI event listeners...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        // 1. Read the raw text from our existing file object
        const reader = new FileReader();
        reader.onload = function (e) {
            const rawTextContent = e.target.result;

            // 2. Build a completely fresh text/plain BLOB from scratch to clear JSON headers
            const pureTextBlob = new Blob([rawTextContent], { type: 'text/plain' });
            const cleanTextFile = new File([pureTextBlob], "master_list.txt", { type: 'text/plain' });

            // 3. Create a clean DataTransfer object
            const freshDataTransfer = new DataTransfer();
            freshDataTransfer.items.add(cleanTextFile);

            // Force types check to pass
            try {
                Object.defineProperty(freshDataTransfer, 'types', {
                    value: Object.freeze(['Files']),
                    writable: false,
                    configurable: true
                });
            } catch (err) {
                console.warn("Types override skipped.");
            }

            // Helper to generate the drag events using our rebuilt text file
            const createFrameworkDragEvent = (type) => {
                const dragEvent = new DragEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });

                Object.defineProperty(dragEvent, 'dataTransfer', {
                    value: freshDataTransfer,
                    writable: false,
                    configurable: true
                });
                return dragEvent;
            };

            // Wake up the blue icon gate
            dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));
            dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

            // Phase 2: Slam the clean text file home
            setTimeout(() => {
                console.log("Phase 2: Dropping pure text-rebound file payload...");

                const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
                activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));

                console.log("Sequence finalized! Checking for text asset card... :D");
            }, 150);
        };

        // Trigger the reader pass
        reader.readAsText(masterListFile);
    }

    static SUBMIT12(masterListFile) {
        console.log("Initiating Phase 1: Waking up framework UI event listeners...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        // 1. Create our standard DataTransfer container
        const dataTransfer = new DataTransfer();

        // Populate the standard items array
        dataTransfer.items.add(masterListFile);

        // 2. FORCEFULLY MOCK A NATIVE FILELIST ARRAY
        // This ensures both dataTransfer.items AND dataTransfer.files are fully populated
        const mockFileList = Object.create(FileList.prototype);
        Object.defineProperty(mockFileList, '0', { value: masterListFile });
        Object.defineProperty(mockFileList, 'length', { value: 1 });

        // CRITICAL OVERRIDE: Bind the types AND the files property securely so Angular's checks pass
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });

            Object.defineProperty(dataTransfer, 'files', {
                value: mockFileList,
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("Could not patch native descriptors:", e);
        }

        // Helper to build pristine DragEvents with our fully spoofed payload
        const createFrameworkDragEvent = (type) => {
            const dragEvent = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(dragEvent, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return dragEvent;
        };

        // Fire activation sequence to open the blue gate
        dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));
        dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

        // Phase 2: Execute drop after UI compilation completes
        setTimeout(() => {
            console.log("Phase 2: Executing deep-synchronized file list injection...");

            const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
            activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));

            console.log("Sequence finalized! Watch the chat prompt area for the text asset card! :D");
        }, 150);
    }

    static SUBMIT11(masterListFile) {
        console.log("Initiating Phase 1: Waking up framework UI event listeners...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        // Tell the framework's drag validator it is handling a native OS File array
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("Types descriptor locked.");
        }

        const createFrameworkDragEvent = (type) => {
            const dragEvent = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(dragEvent, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return dragEvent;
        };

        // Fire activation sequence
        dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));
        dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

        // Phase 2: Execute drop after UI compilation completes
        setTimeout(() => {
            console.log("Phase 2: Executing text-aligned file injection...");

            const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;
            activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));

            console.log("Sequence finalized! Watch the chat prompt area for the text asset card! :D");
        }, 150);
    }

    static SUBMIT10(masterListFile) {
        console.log("Initiating Phase 1: Waking up framework UI event listeners...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        // 1. Create a fresh DataTransfer container
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        // CRITICAL FRAMEWORK PATCH: Force the types array to read exactly like an organic file drop
        try {
            Object.defineProperty(dataTransfer, 'types', {
                value: Object.freeze(['Files']),
                writable: false,
                configurable: true
            });
        } catch (e) {
            console.warn("Could not patch dataTransfer.types natively, attempting standard allocation.");
        }

        // Helper to build pristine DragEvents with our patched payload injected
        const createFrameworkDragEvent = (type) => {
            const dragEvent = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(dragEvent, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return dragEvent;
        };

        // Wake up the dropzone overlay and make the blue icon appear
        console.log("Dispatching dragenter and dragover to lock state in place...");
        dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));
        dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

        // Phase 2: Wait for Angular to process the visual state change, then slam the payload home
        setTimeout(() => {
            console.log("Phase 2: Framework is wide awake. Executing forced type-spoof drop...");

            // Target the active drop zone container
            const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;

            console.log("Slamming payload directly into the active event receiver...");
            activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));

            console.log("Injection sequence complete! Watch the prompt area for the file attachment card. :D");
        }, 150);
    }

    static SUBMIT9(masterListFile) {
        console.log("Initiating Phase 1: Waking up framework UI event listeners...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("CRITICAL: Visual dropzone target missing from DOM!");
            return;
        }

        // Create our unified DataTransfer bundle
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        // Helper to build pristine DragEvents with our payload injected
        const createFrameworkDragEvent = (type) => {
            const dragEvent = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                composed: true
            });

            Object.defineProperty(dragEvent, 'dataTransfer', {
                value: dataTransfer,
                writable: false,
                configurable: true
            });
            return dragEvent;
        };

        // 1. Wake up the dropzone overlay and make the blue icon appear
        console.log("Dispatching dragenter to activate drop state...");
        dropZone.dispatchEvent(createFrameworkDragEvent('dragenter'));

        // 2. Sustain the hover state so the framework keeps its gates open
        console.log("Dispatching dragover to lock state in place...");
        dropZone.dispatchEvent(createFrameworkDragEvent('dragover'));

        // Phase 2: Wait for Angular's Zone.js to process the UI shift, then drop the file!
        setTimeout(() => {
            console.log("Phase 2: Framework is active. Attempting direct drop injection...");

            // Look for the newly appeared blue icon area or stick to the dropzone element
            const activeDropTarget = document.querySelector('.xap-uploader-dropzone') || dropZone;

            console.log("Slamming payload directly into the active event receiver...");
            activeDropTarget.dispatchEvent(createFrameworkDragEvent('drop'));

            console.log("Symphony complete! Watch the chat prompt area to see if the file card materializes! :D");
        }, 150);
    }
}
