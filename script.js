/* =====================================================
   RESQLINK MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const REQUEST_KEY =
    "resqlink_round2_requests";

const VOLUNTEER_KEY =
    "resqlink_round2_volunteers";


let requests =
    loadData(REQUEST_KEY);

let volunteers =
    loadData(VOLUNTEER_KEY);


let selectedRequestForAssignment = null;


/* =====================================================
   LOAD / SAVE
===================================================== */

function loadData(key) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        return [];

    }

}


function saveRequests() {

    localStorage.setItem(
        REQUEST_KEY,
        JSON.stringify(requests)
    );

}


function saveVolunteers() {

    localStorage.setItem(
        VOLUNTEER_KEY,
        JSON.stringify(volunteers)
    );

}


/* =====================================================
   ID
===================================================== */

function createId(prefix) {

    return (
        prefix +
        "-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message, icon = "✓") {

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");

    const toastIcon =
        document.getElementById("toastIcon");


    toastText.textContent = message;

    toastIcon.textContent = icon;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const active =
        requests.filter(
            request =>
                request.status !== "Resolved"
        ).length;


    const resolved =
        requests.filter(
            request =>
                request.status === "Resolved"
        ).length;


    const volunteerTotal =
        volunteers.length;


    const resourceTotal =
        window.RESOURCES
            ? window.RESOURCES.length
            : 0;


    document.getElementById(
        "activeCount"
    ).textContent = active;


    document.getElementById(
        "resolvedCount"
    ).textContent = resolved;


    document.getElementById(
        "volunteerCount"
    ).textContent = volunteerTotal;


    document.getElementById(
        "resourceCount"
    ).textContent = resourceTotal;


    document.getElementById(
        "heroRequests"
    ).textContent = requests.length;


    document.getElementById(
        "heroVolunteers"
    ).textContent = volunteerTotal;


    document.getElementById(
        "heroResources"
    ).textContent = resourceTotal;


    document.getElementById(
        "volunteerBadge"
    ).textContent =
        `${volunteerTotal} Volunteer${volunteerTotal === 1 ? "" : "s"}`;

}


/* =====================================================
   RENDER REQUESTS
===================================================== */

function renderRequests() {

    const container =
        document.getElementById(
            "requestsList"
        );


    if (!requests.length) {

        container.innerHTML = `
            <div class="empty-box">

                <div>📭</div>

                <h3>No requests yet</h3>

                <p>
                    Emergency requests will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        requests
            .slice()
            .reverse()
            .map(request => {

                const statusClass =
                    request.status
                        .toLowerCase()
                        .replace(/\s/g, "-");


                return `

                    <article
                        class="request-card"
                        data-id="${request.id}"
                    >

                        <div class="request-top">

                            <span class="request-id">
                                ${escapeHTML(request.id)}
                            </span>

                            <span
                                class="status ${statusClass}"
                            >
                                ${escapeHTML(request.status)}
                            </span>

                        </div>


                        <h3>
                            ${escapeHTML(request.type)}
                        </h3>


                        <div class="request-meta">

                            <span class="meta">
                                👤 ${escapeHTML(request.name)}
                            </span>

                            <span class="meta">
                                📍 ${escapeHTML(request.location)}
                            </span>

                            <span class="meta">
                                👥 ${request.people}
                            </span>

                            <span class="meta">
                                ${priorityIcon(request.priority)}
                                ${escapeHTML(request.priority)}
                            </span>

                        </div>


                        ${
                            request.assignedVolunteer
                            ?
                            `
                            <div class="request-description">
                                🤝 Assigned to:
                                <strong>
                                    ${escapeHTML(
                                        request.assignedVolunteer
                                    )}
                                </strong>
                            </div>
                            `
                            :
                            ""
                        }


                        ${
                            request.details
                            ?
                            `
                            <div class="request-description">
                                ${escapeHTML(request.details)}
                            </div>
                            `
                            :
                            ""
                        }


                        <div class="request-actions">

                            ${
                                request.status === "Pending"
                                ?
                                `
                                <button
                                    class="action-btn accept"
                                    data-action="accept"
                                >
                                    ✓ Accept
                                </button>
                                `
                                :
                                ""
                            }


                            <button
                                class="action-btn assign"
                                data-action="assign"
                            >
                                🤝 Assign
                            </button>


                            ${
                                request.status !== "Resolved"
                                ?
                                `
                                <button
                                    class="action-btn resolve"
                                    data-action="resolve"
                                >
                                    ✓ Resolve
                                </button>
                                `
                                :
                                ""
                            }


                            ${
                                request.latitude &&
                                request.longitude
                                ?
                                `
                                <button
                                    class="action-btn"
                                    data-action="map"
                                >
                                    📍 Map
                                </button>
                                `
                                :
                                ""
                            }

                        </div>

                    </article>

                `;

            })
            .join("");


    renderEmergencyMarkers();

}


/* =====================================================
   PRIORITY ICON
===================================================== */

function priorityIcon(priority) {

    if (priority === "High") {
        return "🔴";
    }

    if (priority === "Low") {
        return "🟢";
    }

    return "🟠";

}


/* =====================================================
   RENDER MAP MARKERS
===================================================== */

function renderEmergencyMarkers() {

    if (
        typeof window.clearEmergencyMarkers !==
        "function"
    ) {
        return;
    }


    window.clearEmergencyMarkers();


    requests.forEach(request => {

        if (
            request.latitude &&
            request.longitude
        ) {

            window.addEmergencyMarker(
                request
            );

        }

    });

}


/* =====================================================
   EMERGENCY FORM
===================================================== */

function setupEmergencyForm() {

    const form =
        document.getElementById(
            "emergencyForm"
        );


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("emergencyName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("emergencyPhone")
                    .value
                    .trim();


            const type =
                document
                    .getElementById("emergencyType")
                    .value;


            const people =
                Number(
                    document
                        .getElementById("peopleCount")
                        .value
                );


            const location =
                document
                    .getElementById("emergencyLocation")
                    .value
                    .trim();


            const priority =
                document
                    .getElementById("priority")
                    .value;


            const peopleType =
                document
                    .getElementById("peopleType")
                    .value;


            const details =
                document
                    .getElementById("emergencyDetails")
                    .value
                    .trim();


            const latitude =
                document
                    .getElementById("latitude")
                    .value;


            const longitude =
                document
                    .getElementById("longitude")
                    .value;


            if (!name || !type || !location) {

                showToast(
                    "Please fill all required fields.",
                    "!"
                );

                return;
            }


            const newRequest = {

                id: createId("REQ"),

                name,

                phone,

                type,

                people:

                    people > 0
                        ? people
                        : 1,

                location,

                priority,

                peopleType,

                details,

                latitude,

                longitude,

                status: "Pending",

                assignedVolunteer: "",

                createdAt:
                    new Date().toLocaleString()

            };


            requests.push(newRequest);

            saveRequests();


            renderRequests();

            updateDashboard();


            form.reset();


            document.getElementById(
                "peopleCount"
            ).value = 1;


            document.getElementById(
                "priority"
            ).value = "Medium";


            document.getElementById(
                "locationStatus"
            ).textContent =
                "No map location selected";


            showToast(
                "Emergency request submitted successfully!",
                "🚨"
            );


            document
                .getElementById("requests")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


/* =====================================================
   VOLUNTEER FORM
===================================================== */

function setupVolunteerForm() {

    const form =
        document.getElementById(
            "volunteerForm"
        );


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("volunteerName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("volunteerPhone")
                    .value
                    .trim();


            const skill =
                document
                    .getElementById("volunteerSkill")
                    .value;


            const availability =
                document
                    .getElementById(
                        "volunteerAvailability"
                    )
                    .value;


            const area =
                document
                    .getElementById("volunteerArea")
                    .value
                    .trim();


            if (!name || !phone || !skill) {

                showToast(
                    "Please complete the required fields.",
                    "!"
                );

                return;
            }


            const volunteer = {

                id: createId("VOL"),

                name,

                phone,

                skill,

                availability,

                area,

                status: "Available",

                createdAt:
                    new Date().toLocaleString()

            };


            volunteers.push(volunteer);

            saveVolunteers();


            renderVolunteers();

            updateDashboard();


            form.reset();


            showToast(
                "Volunteer registered successfully!",
                "🤝"
            );

        }
    );

}


/* =====================================================
   RENDER VOLUNTEERS
===================================================== */

function renderVolunteers() {

    const container =
        document.getElementById(
            "volunteersList"
        );


    if (!volunteers.length) {

        container.innerHTML = `
            <div class="empty-box">

                <div>👥</div>

                <h3>No volunteers yet</h3>

                <p>
                    Registered volunteers will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        volunteers
            .slice()
            .reverse()
            .map(volunteer => {

                return `

                    <article class="volunteer-card">

                        <div class="volunteer-avatar">
                            🤝
                        </div>

                        <h3>
                            ${escapeHTML(volunteer.name)}
                        </h3>

                        <p>
                            📞 ${escapeHTML(volunteer.phone)}
                        </p>

                        <p>
                            📍 ${
                                escapeHTML(
                                    volunteer.area ||
                                    "Area not specified"
                                )
                            }
                        </p>

                        <span class="skill">
                            ${escapeHTML(volunteer.skill)}
                        </span>

                        <span class="skill">
                            ${escapeHTML(volunteer.availability)}
                        </span>

                    </article>

                `;

            })
            .join("");

}


/* =====================================================
   REQUEST ACTIONS
===================================================== */

function setupRequestActions() {

    const container =
        document.getElementById(
            "requestsList"
        );


    container.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const card =
                button.closest(
                    ".request-card"
                );


            if (!card) {
                return;
            }


            const requestId =
                card.dataset.id;


            const request =
                requests.find(
                    item =>
                        item.id === requestId
                );


            if (!request) {
                return;
            }


            const action =
                button.dataset.action;


            if (action === "accept") {

                request.status =
                    "Accepted";

                saveRequests();

                renderRequests();

                updateDashboard();

                showToast(
                    "Emergency request accepted.",
                    "✓"
                );

            }


            if (action === "resolve") {

                request.status =
                    "Resolved";

                saveRequests();

                renderRequests();

                updateDashboard();

                showToast(
                    "Emergency request resolved.",
                    "✓"
                );

            }


            if (action === "assign") {

                openAssignModal(
                    request.id
                );

            }


            if (action === "map") {

                if (
                    typeof window.focusMapRequest ===
                    "function"
                ) {

                    window.focusMapRequest(
                        request
                    );

                }

            }

        }
    );

}


/* =====================================================
   ASSIGN MODAL
===================================================== */

function openAssignModal(requestId) {

    selectedRequestForAssignment =
        requestId;


    const modal =
        document.getElementById(
            "assignModal"
        );


    const select =
        document.getElementById(
            "assignSelect"
        );


    const available =
        volunteers.filter(
            volunteer =>
                volunteer.status === "Available"
        );


    if (!available.length) {

        showToast(
            "Register a volunteer first.",
            "!"
        );

        return;
    }


    select.innerHTML = `

        <option value="">
            Select volunteer
        </option>

        ${
            available
                .map(
                    volunteer =>
                        `
                        <option value="${volunteer.id}">
                            ${escapeHTML(
                                volunteer.name
                            )}
                            -
                            ${escapeHTML(
                                volunteer.skill
                            )}
                        </option>
                        `
                )
                .join("")
        }

    `;


    modal.classList.remove("hidden");

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeAssignModal() {

    document
        .getElementById("assignModal")
        .classList.add("hidden");


    selectedRequestForAssignment =
        null;

}


/* =====================================================
   CONFIRM ASSIGNMENT
===================================================== */

function confirmAssignment() {

    if (!selectedRequestForAssignment) {
        return;
    }


    const volunteerId =
        document
            .getElementById("assignSelect")
            .value;


    if (!volunteerId) {

        showToast(
            "Please select a volunteer.",
            "!"
        );

        return;
    }


    const request =
        requests.find(
            item =>
                item.id ===
                selectedRequestForAssignment
        );


    const volunteer =
        volunteers.find(
            item =>
                item.id === volunteerId
        );


    if (!request || !volunteer) {
        return;
    }


    request.assignedVolunteer =
        volunteer.name;


    request.status =
        "Accepted";


    volunteer.status =
        "Assigned";


    saveRequests();

    saveVolunteers();


    renderRequests();

    renderVolunteers();

    updateDashboard();


    closeAssignModal();


    showToast(
        `${volunteer.name} assigned successfully!`,
        "🤝"
    );

}


/* =====================================================
   MAP LOCATION
===================================================== */

function setupMapLocation() {

    const pickButton =
        document.getElementById(
            "pickLocation"
        );


    pickButton.addEventListener(
        "click",
        function() {

            if (
                typeof window.startMapPicking ===
                "function"
            ) {

                window.startMapPicking();

            }

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelMapPick"
        );


    cancelButton.addEventListener(
        "click",
        function() {

            if (
                typeof window.stopMapPicking ===
                "function"
            ) {

                window.stopMapPicking();

            }

        }
    );


    window.addEventListener(
        "mapLocationSelected",
        function(event) {

            const lat =
                event.detail.lat;

            const lng =
                event.detail.lng;


            document.getElementById(
                "latitude"
            ).value =
                lat.toFixed(6);


            document.getElementById(
                "longitude"
            ).value =
                lng.toFixed(6);


            document.getElementById(
                "locationStatus"
            ).textContent =
                `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;


            showToast(
                "Emergency location selected.",
                "📍"
            );

        }
    );

}


/* =====================================================
   RESOURCE RENDER
===================================================== */

function renderResources() {

    const container =
        document.getElementById(
            "resourcesList"
        );


    if (!window.RESOURCES) {
        return;
    }


    container.innerHTML =
        window.RESOURCES
            .map(resource => {

                return `

                    <article class="resource-card">

                        <div class="resource-icon">
                            ${resource.icon}
                        </div>

                        <h3>
                            ${escapeHTML(resource.name)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                resource.description
                            )}
                        </p>

                        <span class="resource-type">
                            ${escapeHTML(resource.type)}
                        </span>

                        <button
                            data-resource="${resource.id}"
                        >
                            📍 View on Map
                        </button>

                    </article>

                `;

            })
            .join("");

}


/* =====================================================
   RESOURCE BUTTONS
===================================================== */

function setupResourceActions() {

    document
        .getElementById("resourcesList")
        .addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-resource]"
                    );


                if (!button) {
                    return;
                }


                const resourceId =
                    button.dataset.resource;


                if (
                    typeof window.focusResource ===
                    "function"
                ) {

                    window.focusResource(
                        resourceId
                    );

                }

            }
        );

}


/* =====================================================
   MAP REQUEST FOCUS
===================================================== */

window.focusMapRequest =
    function(request) {

        if (
            !request.latitude ||
            !request.longitude
        ) {

            showToast(
                "This request has no map location.",
                "!"
            );

            return;
        }


        document
            .getElementById("mapSection")
            ?.scrollIntoView({
                behavior: "smooth"
            });


        setTimeout(() => {

            if (
                window.map &&
                typeof window.map.setView ===
                "function"
            ) {

                window.map.setView(
                    [
                        Number(request.latitude),
                        Number(request.longitude)
                    ],
                    16
                );

            }

        }, 600);

    };


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const menuButton =
        document.getElementById(
            "menuBtn"
        );


    const nav =
        document.getElementById(
            "navMenu"
        );


    menuButton.addEventListener(
        "click",
        function() {

            nav.classList.toggle("open");

        }
    );


    nav.addEventListener(
        "click",
        function() {

            nav.classList.remove("open");

        }
    );


    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-scroll]"
                );


            if (!button) {
                return;
            }


            const selector =
                button.dataset.scroll;


            const target =
                document.querySelector(
                    selector
                );


            if (!target) {
                return;
            }


            target.scrollIntoView({
                behavior: "smooth"
            });

        }
    );

}


/* =====================================================
   MODAL EVENTS
===================================================== */

function setupModal() {

    document
        .getElementById("closeModal")
        .addEventListener(
            "click",
            closeAssignModal
        );


    document
        .querySelector(".modal-overlay")
        .addEventListener(
            "click",
            closeAssignModal
        );


    document
        .getElementById("confirmAssign")
        .addEventListener(
            "click",
            confirmAssignment
        );

}


/* =====================================================
   CLEAR DATA
===================================================== */

function setupClearButton() {

    document
        .getElementById("clearRequests")
        .addEventListener(
            "click",
            function() {

                if (!requests.length) {

                    showToast(
                        "There is no request data.",
                        "!"
                    );

                    return;
                }


                const confirmed =
                    confirm(
                        "Clear all emergency requests?"
                    );


                if (!confirmed) {
                    return;
                }


                requests = [];

                saveRequests();

                renderRequests();

                updateDashboard();


                showToast(
                    "Emergency requests cleared.",
                    "✓"
                );

            }
        );

}


/* =====================================================
   INITIALIZE APP
===================================================== */

function initializeApp() {

    setupEmergencyForm();

    setupVolunteerForm();

    setupRequestActions();

    setupMapLocation();

    setupResourceActions();

    setupNavigation();

    setupModal();

    setupClearButton();


    renderRequests();

    renderVolunteers();

    renderResources();

    updateDashboard();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);