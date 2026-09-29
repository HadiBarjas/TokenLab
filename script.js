// ========================================================
// 1. THEME CONTROLLER & PERSISTENCE
// ========================================================
const themeSwitch = document.getElementById("switch");
const htmlDoc = document.documentElement;
const savedTheme = localStorage.getItem("theme");

// Restore cached user preference
if (savedTheme === "light") {
    htmlDoc.setAttribute("data-theme", "light");
    themeSwitch.checked = true; 
}

// Event listener for theme toggling
themeSwitch.addEventListener("change", (e) => {
    if (e.target.checked) {
        htmlDoc.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    } else {
        htmlDoc.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
    }
});

// ========================================================
// 2. TOAST NOTIFICATION DISPATCHER
// ========================================================
const toastContainer = document.createElement('div');
toastContainer.className = 'ToastContainer';
document.body.appendChild(toastContainer);

function showToast(message, type = 'Success') {
    const toast = document.createElement('div');
    toast.className = `ToastMessage ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    // Trigger transition entry
    setTimeout(() => {
        toast.classList.add('Active');
    }, 10);
    
    // Self-destruct after display interval
    setTimeout(() => {
        toast.classList.remove('Active');
        setTimeout(() => {
            toast.remove();
        }, 400); 
    }, 3000);
}

// ========================================================
// 3. SYNTAX HIGHLIGHTING PARSER
// ========================================================
function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'JsonValue';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'JsonKey';
            } else {
                cls = 'JsonString';
            }
        } else if (/true|false/.test(match)) {
            cls = 'JsonBoolean';
        } else if (/null/.test(match)) {
            cls = 'JsonNull';
        } else {
            cls = 'JsonNumber';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

// ========================================================
// 4. CORE JWT DECODER & DOM NODES
// ========================================================
const tokenInput = document.getElementById("tokenInput");
const clearBtn = document.getElementById("clearBtn");
const headerOutput = document.getElementById("headerOutput");
const payloadOutput = document.getElementById("payloadOutput");
const signatureOutput = document.getElementById("signatureOutput");

// Clear all inputs and reset outputs
clearBtn.addEventListener("click", () => {
    tokenInput.value = "";
    headerOutput.textContent = "{}";
    payloadOutput.textContent = "{}";
    signatureOutput.textContent = "your-signature-will-appear-here";
});

// Real-time decoding pipeline on input change
tokenInput.addEventListener("input", () => {
    const token = tokenInput.value.trim();

    if (!token) {
        headerOutput.textContent = "{}";
        payloadOutput.textContent = "{}";
        signatureOutput.textContent = "your-signature-will-appear-here";
        return; 
    }

    try {
        const parts = token.split('.');
        
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format.");
        }

        // Base64URL parsing with standard decoding
        const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        headerOutput.innerHTML = syntaxHighlight(decodedHeader);
        payloadOutput.innerHTML = syntaxHighlight(decodedPayload);
        signatureOutput.textContent = parts[2];

    } catch (error) {
        headerOutput.textContent = "Invalid Header";
        payloadOutput.textContent = "Invalid Payload";
        signatureOutput.textContent = "Invalid Signature";
    }
});

// ========================================================
// 5. CLIPBOARD COPY HANDLER
// ========================================================
const copyButtons = document.querySelectorAll(".CopyBtn");

copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        try {
            const targetId = button.dataset.target;
            const targetElement = document.getElementById(targetId);
            
            await navigator.clipboard.writeText(targetElement.textContent.trim());
            
            button.textContent = "Copied!";
            button.style.color = "var(--accent)"; 
            
            setTimeout(() => {
                button.textContent = "Copy";
                button.style.color = ""; 
            }, 1500);

        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast("Clipboard access denied or failed.", "Error");
        }
    });
});