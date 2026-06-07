class RetrieveUtils {
    static CHECK_CONVS() {
        RetrieveUtils.GET_MASTER_LIST((masterList) => {
            RetrieveUtils.SUBMIT10
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

    static SUBMIT8(masterListFile) {
        console.log("Initiating Phase 1: Waking up lazy framework layers...");

        const dropZone = ConvUtils.getFileDropZone();
        if (!dropZone) {
            console.error("Could not find visual dropzone to wake up!");
            return;
        }

        // 1. Create a simulated drag event to trigger the framework's overlay state
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(masterListFile);

        const wakeEvent = new DragEvent('dragenter', {
            bubbles: true,
            cancelable: true,
            composed: true
        });

        Object.defineProperty(wakeEvent, 'dataTransfer', {
            value: dataTransfer,
            writable: false,
            configurable: true
        });

        // Fire the wake event
        dropZone.dispatchEvent(wakeEvent);
        console.log("Dragenter dispatched. Yielding execution for DOM compilation...");

        // 2. Phase 2: Wait 150ms for Angular to potentially mount the hidden input
        setTimeout(() => {
            console.log("Phase 2: Sweeping DOM for dynamically compiled inputs...");

            const discoveredInput = document.querySelector('input[type="file"]') ||
                dropZone.querySelector('input[type="file"]');

            if (!discoveredInput) {
                console.warn("Still zero inputs found. Framework might be intercepting purely via JS event streams, or it's locked in a Shadow DOM.");
                return;
            }

            console.log("SUCCESS! Hidden channel flushed out of hiding:", discoveredInput);

            // Shove the file in and trigger change detection
            discoveredInput.files = dataTransfer.files;

            const changeEvent = new Event('change', { bubbles: true, composed: true });
            const inputEvent = new Event('input', { bubbles: true, composed: true });

            discoveredInput.dispatchEvent(inputEvent);
            discoveredInput.dispatchEvent(changeEvent);

            console.log("Injection sequence complete on dynamically discovered channel! :D");
        }, 150);
    }

    static SUBMIT7(masterListFile) {
        console.log("Initiating backend endpoint injection (v7)...");

        // We will swap this placeholder URL with the exact string you find in the Network tab!
        const targetUploadUrl = "https://push.clients6.google.com/upload/";

        const formData = new FormData();
        // We match the exact key name the network trace expects
        formData.append('file', masterListFile);

        GM_xmlhttpRequest({
            method: "POST",
            url: targetUploadUrl,
            data: formData,
            // We can explicitly clone any required authorization or session headers here!
            headers: {
                "Accept": "application/json"
            },
            onload: function (response) {
                console.log("Palace Archive injected directly into the backend pipe!", response);
                console.log("Check if the chat attachment data structure populated successfully. :D");
            },
            onerror: function (err) {
                console.error("Direct backend pipe upload failed:", err);
            }
        });
    }

    static SUBMIT6(masterListFile) {
        console.log("Initiating native input extraction protocol (v6)...");

        try {
            // 1. Force a global query to look for ANY file inputs hidden by the framework
            let nativeInputs = Array.from(document.querySelectorAll('input[type="file"]'));

            console.log(`Crawl complete. Found ${nativeInputs.length} hidden native input channels on page.`);

            if (nativeInputs.length === 0) {
                console.error("CRITICAL: No native input elements exist in the current DOM branch!");
                return;
            }

            // 2. Build our standard browser-compliant DataTransfer payload package
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // 3. Iterate through every discovered input to find the one bound to the chat tray
            nativeInputs.forEach((input, index) => {
                console.log(`Injecting data payload into input channel [${index}]...`);

                try {
                    // Force input value allocation
                    input.files = dataTransfer.files;

                    // Trigger the exact lifecycle events Angular's change-detection watches for
                    const changeEvent = new Event('change', { bubbles: true, composed: true });
                    const inputEvent = new Event('input', { bubbles: true, composed: true });

                    input.dispatchEvent(inputEvent);
                    input.dispatchEvent(changeEvent);

                    // If the component relies on blur states for validation processing
                    const blurEvent = new Event('blur', { bubbles: true, composed: true });
                    input.dispatchEvent(blurEvent);

                    console.log(`Channel [${index}] synchronized successfully.`);
                } catch (channelError) {
                    console.warn(`Channel [${index}] rejected assignment:`, channelError);
                }
            });

            console.log("Global input synchronization sweep complete! Check the prompt box area. :D");

        } catch (error) {
            console.error("Native input injection routine collapsed:", error);
        }
    }

    static SUBMIT5(masterListFile) {
        console.log("Initiating split-element targeted injection protocol (v5)...");

        try {
            // 1. Target the overarching framework overlay container from the DOM printout
            const highLevelIndicator = document.querySelector('file-drop-indicator');

            // 2. Target the deep inner zone that houses the actual file absorption loops
            const deepDropZone = document.querySelector('.xap-uploader-dropzone');

            if (!highLevelIndicator || !deepDropZone) {
                console.error("Failed to bind separated elements. Indicator:", !!highLevelIndicator, "Dropzone:", !!deepDropZone);
                // Fallback strategy just in case elements are compiling dynamically
                const fallback = document.querySelector('.text-input-field');
                if (!fallback) return;
                console.log("Using unified text-field fallback coordinate.");
            }

            // Helper function to build custom drag events with explicit descriptors
            const fireEventOnTarget = (element, type) => {
                const dragEvent = new DragEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });

                // CRITICAL OVERRIDE: Re-instantiate a clean DataTransfer state per event pass
                const cleanDataTransfer = new DataTransfer();
                cleanDataTransfer.items.add(masterListFile);

                // Force physical properties arrays sync directly on the instance level
                // This stops Angular's validator from seeing an empty list structure
                Object.defineProperty(dragEvent, 'dataTransfer', {
                    value: cleanDataTransfer,
                    writable: false,
                    configurable: true
                });

                // Sneaky Framework Trick: Explicitly patch the native files array length check
                try {
                    Object.defineProperty(cleanDataTransfer, 'files', {
                        value: cleanDataTransfer.files,
                        writable: false,
                        configurable: true
                    });
                } catch (e) {
                    console.log("Browser files descriptor locked, proceeding with native list allocation.");
                }

                element.dispatchEvent(dragEvent);
                console.log(`Dispatched ${type} successfully on:`, element.tagName || 'DIV');
            };

            // PHASE 1: Wake up the global overlay context to update application state
            console.log("Waking up high-level drop indicator layer...");
            fireEventOnTarget(highLevelIndicator || deepDropZone, 'dragenter');
            fireEventOnTarget(highLevelIndicator || deepDropZone, 'dragover');

            // Allow a zero-millisecond yield for Angular's Zone.js change detection to catch the shift
            setTimeout(() => {
                // PHASE 2: Deliver the final payload stream straight to the deep data zone
                console.log("Dropping payload data directly into internal zone receiver matrix...");
                fireEventOnTarget(deepDropZone || highLevelIndicator, 'drop');
                console.log("Automation sequence finalized. Check the chat frame! :D");
            }, 0);

        } catch (error) {
            console.error("Separated drag-and-drop orchestration failed:", error);
        }
    }

    static SUBMIT4(masterListFile) {
        console.log("Initiating split-element targeted injection protocol...");

        try {
            // 1. Target the overarching framework overlay container
            const highLevelIndicator = document.querySelector('file-drop-indicator');

            // 2. Target the deep inner zone that houses the actual file absorption loops
            const deepDropZone = document.querySelector('.xap-uploader-dropzone');

            if (!highLevelIndicator || !deepDropZone) {
                console.error("Failed to bind separated elements. Indicator:", !!highLevelIndicator, "Dropzone:", !!deepDropZone);
                // Fallback strategy just in case elements are compiling dynamically
                const fallback = document.querySelector('.text-input-field');
                if (!fallback) return;
                console.log("Using unified text-field fallback coordinate.");
            }

            // Package the file into a clean DataTransfer bundle
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // Helper function to build custom drag events with explicit descriptors
            const fireEventOnTarget = (element, type) => {
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

                element.dispatchEvent(dragEvent);
                console.log(`Dispatched ${type} successfully on:`, element.tagName || 'Fallback');
            };

            // PHASE 1: Wake up the global overlay context to update application state
            console.log("Waking up high-level drop indicator layer...");
            fireEventOnTarget(highLevelIndicator || deepDropZone, 'dragenter');
            fireEventOnTarget(highLevelIndicator || deepDropZone, 'dragover');

            // Allow a zero-millisecond yield for Angular's Zone.js change detection to catch the shift
            setTimeout(() => {
                // PHASE 2: Deliver the final payload stream straight to the deep data zone
                console.log("Dropping payload data directly into internal zone receiver matrix...");
                fireEventOnTarget(deepDropZone, 'drop');
                console.log("Automation sequence finalized. Check the chat frame! :D");
            }, 0);

        } catch (error) {
            console.error("Separated drag-and-drop orchestration failed:", error);
        }
    }

    static SUBMIT3(masterListFile) {
        console.log("Executing high-tier drag/drop sequence execution...");

        try {
            // 1. Target the absolute top-most element handling file drops from the DOM printout
            const dropIndicator = document.querySelector('file-drop-indicator') ||
                document.querySelector('.xap-uploader-dropzone') ||
                document.querySelector('.text-input-field');

            if (!dropIndicator) {
                console.error("CRITICAL: Failed to bind to any viable file-drop targets in the DOM tree!");
                return;
            }

            console.log("Target bound successfully for injection:", dropIndicator);

            // 2. Build the structural DataTransfer array structure
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // 3. Construct a standard native framework compatible DragEvent handler
            const dispatchCustomDragEvent = (element, eventType) => {
                const dragEvent = new DragEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    composed: true
                });

                // Overwrite the read-only dataTransfer property natively using descriptor configuration
                Object.defineProperty(dragEvent, 'dataTransfer', {
                    value: dataTransfer,
                    writable: false,
                    configurable: true
                });

                element.dispatchEvent(dragEvent);
            };

            // 4. Fire the complete phase progression to trigger the container state changes
            console.log("Waking up file-drop components...");
            dispatchCustomDragEvent(dropIndicator, 'dragenter');
            dispatchCustomDragEvent(dropIndicator, 'dragover');

            // Re-target the sub-zone directly during the definitive drop execution to ensure inner listeners catch it
            const innerZone = document.querySelector('.xap-uploader-dropzone') || dropIndicator;
            console.log("Executing final payload drop onto target matrix...");
            dispatchCustomDragEvent(innerZone, 'drop');

            console.log("Automation sequence complete! Watch the chat payload space for the manifest file asset. :D");

        } catch (error) {
            console.error("Framework drop simulation execution failed:", error);
        }
    }

    static SUBMIT2(masterListFile) {
        console.log("Attempting direct input injection...");

        try {
            // 1. Grab the giant immersive drop zone container
            const dropZoneContainer = ConvUtils.getFileDropZone();
            if (!dropZoneContainer) {
                console.error("Could not find the immersive drop zone container!");
                return;
            }

            // 2. Find the ACTUAL native hidden file input inside it that Angular uses under the hood
            const fileInput = dropZoneContainer.querySelector('input[type="file"]') || document.querySelector('input[type="file"]');

            if (!fileInput) {
                console.error("Found the container, but couldn't find the hidden native <input type='file'> element inside it!");
                return;
            }

            console.log("Targeted native input element successfully:", fileInput);

            // 3. Package the file into a FileList-compatible format
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // 4. Inject the files directly into the native DOM element
            fileInput.files = dataTransfer.files;

            // 5. Fire BOTH 'input' and 'change' events with bubbling and composition enabled 
            // so Angular's event listeners definitely catch it crossing shadow boundaries.
            const changeEvent = new Event('change', { bubbles: true, composed: true });
            const inputEvent = new Event('input', { bubbles: true, composed: true });

            fileInput.dispatchEvent(inputEvent);
            fileInput.dispatchEvent(changeEvent);

            console.log("Direct injection complete! Watch the chat UI to see if the file card pops up. :D");

        } catch (error) {
            console.error("Failed direct input injection:", error);
        }
    }

    static SUBMIT0(masterListFile) {
        console.log("Attempting direct input injection...");

        try {
            // 1. Look for any file input elements hidden in the chat area
            // Angular dropzones almost always have one hidden with display:none
            const fileInput = ConvUtils.getFileDropZone();

            // If there are multiple inputs on the page, we can scope it to the chat container
            if (!fileInput) {
                const chatContainer = document.querySelector('[xapfileselectordropzone]');
                if (chatContainer) {
                    fileInput = chatContainer.querySelector('input[type="file"]');
                }
            }

            if (!fileInput) {
                console.error("Could not find a hidden file input element!");
                return;
            }

            // 2. Package the file into a FileList-compatible format
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // 3. Inject the files directly into the native DOM element
            fileInput.files = dataTransfer.files;

            // 4. Fire the 'change' event so Angular notices the update
            const changeEvent = new Event('change', { bubbles: true, composed: true });
            fileInput.dispatchEvent(changeEvent);

            console.log("Direct injection complete! Check if the file is attached now. :D");

        } catch (error) {
            console.error("Failed direct input injection:", error);
        }
    }

    static SUBMIT(masterListFile) {
        console.log("Submitting file to chat:", masterListFile);

        try {
            const dropZone = ConvUtils.getFileDropZone();
            if (!dropZone) {
                console.error("Drop zone element not found!");
                return;
            }

            // Package the file into a fresh DataTransfer bundle
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(masterListFile);

            // Helper function to build bulletproof drag events
            const createDragEvent = (type) => {
                const event = new DragEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    composed: true // Allows the event to cross Shadow DOM boundaries if necessary
                });

                // Forcefully inject dataTransfer so Angular's handlers see it natively
                Object.defineProperty(event, 'dataTransfer', {
                    value: dataTransfer,
                    writable: false,
                    configurable: true
                });
                return event;
            };

            // 1. Fire dragenter to wake up the framework's internal drop state
            dropZone.dispatchEvent(createDragEvent('dragenter'));

            // 2. Fire dragover to sustain the drag state
            dropZone.dispatchEvent(createDragEvent('dragover'));

            // 3. Fire the definitive drop event!
            dropZone.dispatchEvent(createDragEvent('drop'));

            console.log("Automation complete! The Palace Master List has dropped into the chat. :D");

        } catch (error) {
            console.error("Failed to simulate file drop:", error);
        }
    }
}
