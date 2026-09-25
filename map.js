/* =====================================================
   RESQLINK MAP
===================================================== */

let map = null;

let emergencyMarkers = {};

let resourceMarkers = {};

let selectedMarker = null;

let mapPicking = false;


/* =====================================================
   RESOURCE DATA
===================================================== */

const RESOURCES = [

    {
        id: "shelter-1",
        name: "Community Relief Shelter",
        type: "Shelter",
        icon: "🏠",
        lat: 31.6340,
        lng: 74.8723,
        description: "Temporary shelter and basic support."
    },

    {
        id: "medical-1",
        name: "City Medical Support Centre",
        type: "Medical",
        icon: "🏥",
        lat: 31.6305,
        lng: 74.8750,
        description: "Emergency medical assistance."
    },

    {
        id: "food-1",
        name: "Community Food Centre",
        type: "Food",
        icon: "🍱",
        lat: 31.6370,
        lng: 74.8650,
        description: "Food distribution for affected people."
    },

    {
        id: "shelter-2",
        name: "Central Relief Camp",
        type: "Shelter",
        icon: "⛺",
        lat: 31.6200,
        lng: 74.8800,
        description: "Temporary relief camp."
    },

    {
        id: "medical-2",
        name: "Emergency Health Point",
        type: "Medical",
        icon: "⚕️",
        lat: 31.6420,
        lng: 74.8600,
        description: "First-aid and emergency medical support."
    },

    {
        id: "food-2",
        name: "Relief Food Distribution",
        type: "Food",
        icon: "🍲",
        lat: 31.6250,
        lng: 74.8550,
        description: "Food and drinking water."
    }

];


window.RESOURCES = RESOURCES;


/* =====================================================
   INITIALIZE MAP
===================================================== */

function initializeMap() {

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        return;
    }

    if (typeof L === "undefined") {

        mapElement.innerHTML = `
            <div style="
                height:100%;
                display:grid;
                place-items:center;
                background:#eef1f6;
                color:#6b7280;
                text-align:center;
                padding:30px;
            ">
                <div>
                    <strong>Map could not load.</strong>
                    <br>
                    Please check your internet connection.
                </div>
            </div>
        `;

        return;
    }


    /*
       Amritsar demo location.
       You can change these coordinates later.
    */

    map = L.map("map").setView(
        [31.6340, 74.8723],
        13
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    addResourceMarkers();


    map.on("click", function(event) {

        if (!mapPicking) {
            return;
        }

        selectMapLocation(
            event.latlng.lat,
            event.latlng.lng
        );

    });

}


/* =====================================================
   RESOURCE MARKERS
===================================================== */

function getResourceColor(type) {

    if (type === "Medical") {
        return "#16a36a";
    }

    if (type === "Shelter") {
        return "#304ffe";
    }

    return "#f59e0b";
}


function addResourceMarkers() {

    RESOURCES.forEach(resource => {

        const color =
            getResourceColor(resource.type);


        const marker =
            L.circleMarker(
                [resource.lat, resource.lng],
                {
                    radius: 9,
                    fillColor: color,
                    color: "#ffffff",
                    weight: 3,
                    opacity: 1,
                    fillOpacity: .9
                }
            );


        marker.bindPopup(`
            <div style="min-width:180px">
                <strong>${resource.icon} ${resource.name}</strong>

                <br><br>

                <span>
                    ${resource.description}
                </span>

                <br><br>

                <small>
                    ${resource.type}
                </small>
            </div>
        `);


        marker.addTo(map);

        resourceMarkers[resource.id] = marker;

    });

}


/* =====================================================
   MAP PICKING
===================================================== */

function startMapPicking() {

    if (!map) {
        showMapError();
        return;
    }

    mapPicking = true;

    const banner =
        document.getElementById("mapPickBanner");

    if (banner) {
        banner.classList.remove("hidden");
    }

    document
        .getElementById("mapSection")
        ?.scrollIntoView({
            behavior: "smooth"
        });


    setTimeout(() => {

        map.invalidateSize();

    }, 500);

}


function stopMapPicking() {

    mapPicking = false;

    const banner =
        document.getElementById("mapPickBanner");

    if (banner) {
        banner.classList.add("hidden");
    }

}


function selectMapLocation(lat, lng) {

    if (!map) {
        return;
    }


    if (selectedMarker) {

        map.removeLayer(selectedMarker);

    }


    selectedMarker =
        L.marker([lat, lng])
            .addTo(map);


    selectedMarker.bindPopup(
        "📍 Selected Emergency Location"
    ).openPopup();


    map.setView(
        [lat, lng],
        15
    );


    stopMapPicking();


    window.dispatchEvent(
        new CustomEvent(
            "mapLocationSelected",
            {
                detail: {
                    lat: lat,
                    lng: lng
                }
            }
        )
    );

}


/* =====================================================
   ADD EMERGENCY MARKER
===================================================== */

function addEmergencyMarker(request) {

    if (!map) {
        return;
    }

    if (
        !request.latitude ||
        !request.longitude
    ) {
        return;
    }


    const lat =
        Number(request.latitude);

    const lng =
        Number(request.longitude);


    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {
        return;
    }


    const marker =
        L.circleMarker(
            [lat, lng],
            {
                radius: 11,
                fillColor: "#e63946",
                color: "#ffffff",
                weight: 3,
                fillOpacity: .95
            }
        );


    marker.bindPopup(`
        <div style="min-width:190px">

            <strong>
                🚨 ${escapeMapText(request.type)}
            </strong>

            <br><br>

            <b>
                ${escapeMapText(request.name)}
            </b>

            <br>

            ${escapeMapText(request.location)}

            <br><br>

            <small>
                Status: ${escapeMapText(request.status)}
            </small>

        </div>
    `);


    marker.addTo(map);

    emergencyMarkers[request.id] = marker;

}


/* =====================================================
   REMOVE EMERGENCY MARKERS
===================================================== */

function clearEmergencyMarkers() {

    if (!map) {
        return;
    }


    Object.values(emergencyMarkers)
        .forEach(marker => {

            map.removeLayer(marker);

        });


    emergencyMarkers = {};

}


/* =====================================================
   SHOW RESOURCE
===================================================== */

function focusResource(resourceId) {

    const resource =
        RESOURCES.find(
            item => item.id === resourceId
        );


    if (!resource || !map) {
        return;
    }


    map.setView(
        [resource.lat, resource.lng],
        16
    );


    const marker =
        resourceMarkers[resourceId];


    if (marker) {
        marker.openPopup();
    }


    document
        .getElementById("mapSection")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   ERROR
===================================================== */

function showMapError() {

    alert(
        "The map is not ready yet. Please check your internet connection."
    );

}


/* =====================================================
   ESCAPE TEXT
===================================================== */

function escapeMapText(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.initializeMap = initializeMap;

window.startMapPicking = startMapPicking;

window.stopMapPicking = stopMapPicking;

window.addEmergencyMarker = addEmergencyMarker;

window.clearEmergencyMarkers = clearEmergencyMarkers;

window.focusResource = focusResource;


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeMap
);