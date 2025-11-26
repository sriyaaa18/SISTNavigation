let map;
let userMarker;
let accuracyCircle;
let destinationMarker;
let currentPosition = null;
let watchId = null;
let isTracking = false;
let lastKnownPosition = null;
let lastUpdateTime = 0;
let bestAccuracy = Number.MAX_VALUE;
let accuracyTimeout;
let headingSource = null;
let currentThemeLayer;
let destinationCheckInterval;
let destinationReachedAlertShown = false;
let routePolyline = null;
let trackedUserMarkers = {};

const campusNodes = {
    "1": { lat: 12.872958, lng: 80.225815, name: "Node 1" },
    "2": { lat: 12.870649, lng: 80.225418, name: "Node 2" },
    "3": { lat: 12.871037, lng: 80.222877, name: "Node 3" },
    "4": { lat: 12.871343, lng: 80.222943, name: "Node 4" },
    "5": { lat: 12.871536, lng: 80.221940, name: "Node 5" },
    "6": { lat: 12.871203, lng: 80.221860, name: "Node 6" },
    "7": { lat: 12.872888, lng: 80.226469, name: "Node 7" },
    "8": { lat: 12.873260, lng: 80.222278, name: "Node 8" },
    "9": { lat: 12.872148, lng: 80.222040, name: "Node 9" },
    "10": { lat: 12.872250, lng: 80.221425, name: "Node 10" },
    "11": { lat: 12.871329, lng: 80.221065, name: "Node 11" },
    "12": { lat: 12.871640, lng: 80.225520, name: "Sathyabama Centre for Advanced Studies" },
    "13": { lat: 12.871021, lng: 80.225088, name: "Node 13" },
    "14": { lat: 12.870956, lng: 80.225451, name: "Node 14" },
    "15": { lat: 12.870748, lng: 80.225029, name: "Node 15" },
    "16": { lat: 12.873959, lng: 80.219224, name: "Startup cell" },
    "17": { lat: 12.873543, lng: 80.219277, name: "Central Library" },
    "18": { lat: 12.872815, lng: 80.221325, name: "International Research Centre" },
    "19": { lat: 12.873758, lng: 80.218891, name: "Ocean Research Park" },
    "20": { lat: 12.873886, lng: 80.221469, name: "Block 1" },
    "21": { lat: 12.874384, lng: 80.219016, name: "Remibai Auditorium" },
    "22": { lat: 12.871401, lng: 80.220580, name: "Indoor Stadium" },
    "23": { lat: 12.871159, lng: 80.219749, name: "Boys Hostel" },
    "24": { lat: 12.874591, lng: 80.217833, name: "Girls Hostel" },
    "25": { lat: 12.8708525, lng: 80.2238500, name: "Node 25" },
    "26": { lat: 12.8705946, lng: 80.2208339, name: "Node 26" },
    "27": { lat: 12.8715846, lng: 80.2199032, name: "Node 27" },
    "28": { lat: 12.8725371, lng: 80.2201037, name: "Node 28" },
    "29": { lat: 12.8727672, lng: 80.2191200, name: "Node 29" },
    "30": { lat: 12.8728897, lng: 80.2190368, name: "Node 30" },
    "31": { lat: 12.8732058, lng: 80.2175532, name: "Node 31" },
    "32": { lat: 12.8742837, lng: 80.2177594, name: "Node 32" },
    "33": { lat: 12.8743942, lng: 80.2178919, name: "Node 33" },
    "34": { lat: 12.8741321, lng: 80.2189889, name: "Node 34" },
    "35": { lat: 12.8738889, lng: 80.2192336, name: "Node 35" },
    "36": { lat: 12.8733712, lng: 80.2216667, name: "Node 36" },
    "37": { lat: 12.8734738, lng: 80.2217670, name: "Node 37" },
    "38": { lat: 12.8749894, lng: 80.2216946, name: "Node 38" }
};
const buildingLabels = {
    "centralLibrary": {
        lat: 12.873236621715348, lng: 80.2189667038578,
        name: "Central library"
    },
    "advancedStudies": {
        lat: 12.871640, lng: 80.225520,
        name: "Sathyabama Centre for Advanced Studies"
    },
    "startupCell": {
        lat: 12.873959, lng: 80.219224,
        name: "Startup cell"
    },
    "irc": {
        lat: 12.872815, lng: 80.221325,
        name: "International Research Centre"
    },
    "orp": {
        lat: 12.873758, lng: 80.218891,
        name: "Ocean Research Park"
    },
    "block1": {
        lat: 12.873886, lng: 80.221469,
        name: "Block 1"
    },
    "remibai": {
        lat: 12.874384, lng: 80.219016,
        name: "Remibai Auditorium"
    },
    "indoorStadium": {
        lat: 12.871401, lng: 80.220580,
        name: "Indoor Stadium"
    },
    "boysHostel": {
        lat: 12.871159, lng: 80.219749,
        name: "Boys Hostel"
    },
    "girlsHostel": {
        lat: 12.874591, lng: 80.217833,
        name: "Girls Hostel"
    }
};

const roadNames = {
    "1-7": "Sathyabama College Rd",
    "1-8": "Sathyabama College Rd",
    "1-12": "Sathyabama Centre for Advanced Studies Rd",
    "1-14": "Sathyabama Centre for Advanced Studies Rd",
    "14-13": "SCAS Canteen Rd",
    "13-15": "SCAS Canteen Rd",
    "15-25": "Dental College Rd",
    "25-3": "Dental College Rd",
    "3-4": "Sathyabama Research Park Rd",
    "4-5": "Sathyabama Research Park Rd",
    "3-6": "St Pauls Rd",
    "8-37": "Sathyabama Admin Rd",
    "37-10": "Sathyabama Admin Rd",
    "10-11": "Bus Rd",
    "10-28": "Sathyabama Campus Rd",
    "6-11": "Indoor Stadium Rd",
    "11-27": "Sathyabama Campus Rd",
    "27-28": "Boys Hostel Rd",
    "28-29": "Main Canteen Rd",
    "11-26": "Architecture Dept Rd",
    "29-30": "Mess Rd",
    "30-31": "Mess Rd",
    "31-32": "Girls Hostel Rd",
    "32-33": "Girls Hostel Rd",
    "5-6": "Library Lane",
    "16-17": "Startup Street",
    "20-36": "Block 1 Way",
    "_default": "Sathyabama Campus Rd"
};

function addBuildingLabels() {
    for (const key in buildingLabels) {
        const label = buildingLabels[key];

        L.marker([label.lat, label.lng], {
            icon: L.divIcon({
                className: 'building-label',
                html: `<div class="building-label-text">${label.name}</div>`,
                iconSize: [150, 40],
                iconAnchor: [75, 20],
                popupAnchor: [0, -20]
            }),
            zIndexOffset: 500,
            interactive: false
        }).addTo(map);
    }
}

const campusConnections = [
    ["1", "7"], ["1", "12"], ["1", "8"],
    ["2", "15"], ["2", "14"],
    ["3", "4"], ["3", "6"], ["3", "25"],
    ["4", "5"],
    ["5", "6"], ["5", "9"],
    ["6", "11"],
    ["8", "9"], ["8", "37"],
    ["9", "10"],
    ["10", "11"], ["10", "36"], ["10", "28"],
    ["11", "26"], ["11", "22"],
    ["12", "14"],
    ["13", "14"], ["13", "15"],
    ["15", "25"],
    ["20", "36"], ["20", "38"],
    ["22", "27"],
    ["23", "27"],
    ["24", "33"],
    ["27", "28"],
    ["28", "29"],
    ["29", "30"],
    ["30", "31"],
    ["31", "32"],
    ["32", "33"],
    ["36", "37"],
];


function showAlert(title, message, type = 'info', callback = null) {
    const overlay = document.getElementById('alertOverlay');
    const box = document.getElementById('alertBox');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');
    const alertButton = document.getElementById('alertButton');
    const alertClose = document.getElementById('alertClose');

    alertTitle.textContent = title;
    alertMessage.textContent = message;

    box.className = 'alert-box';
    box.classList.add(`alert-${type}`);

    let iconClass;
    switch (type) {
        case 'success':
            iconClass = 'fa-check-circle';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            break;
        default:
            iconClass = 'fa-info-circle';
    }
    alertIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;

    overlay.classList.add('active');

    function closeAlert() {
        overlay.classList.remove('active');
        if (callback) callback();
    }

    alertButton.onclick = closeAlert;
    alertClose.onclick = closeAlert;

    overlay.onclick = function (e) {
        if (e.target === overlay) {
            closeAlert();
        }
    };
}

let socket = io('https://sistnavigation.onrender.com');
let trackedUserMarker = null;

function initMap() {
    const location = [12.871362698167239, 80.225260518718];

    map = L.map('map', {
        center: location,
        zoom: 19,
        zoomControl: false,
        preferCanvas: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        scrollWheelZoom: true,
        dragging: true,
        keyboard: true,
        tap: true,
        attributionControl: false
    });

    changeTheme('satellite');
    drawCampusGraph();
    addBuildingLabels();

    socket.on('locationUpdate', ({ phoneNumber, name, location }) => {
        console.log("📡 Received location update on client:", phoneNumber, name, location);

        const { lat, lng } = location;

        if (!trackedUserMarkers[phoneNumber]) {
            trackedUserMarkers[phoneNumber] = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'tracked-user-marker',
                    html: `<div style="background-color: #${getColor(phoneNumber)}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
                    iconSize: [20, 20]
                })
            }).addTo(map).bindPopup(`👤 <b>${name}</b><br>📞 ${phoneNumber}`);
        } else {
            trackedUserMarkers[phoneNumber].setLatLng([lat, lng]);
        }

        map.panTo([lat, lng]);
    });
}

function getColor(phoneNumber) {
    const colors = ['FF5733', '4CAF50', '2196F3', 'FFC107', '9C27B0', 'E91E63'];
    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
        hash = phoneNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Nodes and the directions
function drawCampusGraph() {
    for (const nodeId in campusNodes) {
        const node = campusNodes[nodeId];
        L.marker([node.lat, node.lng], {
            icon: L.divIcon({
                className: 'graph-node',
                html: `<div style="background-color: #4E0911; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [16, 16]
            })
        }).addTo(map).bindPopup(node.name);
    }

    for (const [fromId, toId] of campusConnections) {
        const fromNode = campusNodes[fromId];
        const toNode = campusNodes[toId];
        const distance = Math.round(map.distance(
            [fromNode.lat, fromNode.lng],
            [toNode.lat, toNode.lng]
        ));

        L.polyline([
            [fromNode.lat, fromNode.lng],
            [toNode.lat, toNode.lng]
        ], {
            color: '#905F66',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
        }).addTo(map).bindPopup(`Path: ${fromId} ↔ ${toId}<br>Distance: ${distance}m`);
    }
}

// Map theme
function changeTheme(themeKey) {
    const theme = {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        previewColor: '#333333'
    };

    if (currentThemeLayer) {
        map.removeLayer(currentThemeLayer);
    }

    currentThemeLayer = L.tileLayer(theme.url, {
        attribution: theme.attribution,
        maxZoom: 19
    }).addTo(map);
}


// Toggle live tracking
function toggleLiveTracking() {
    const locateBtn = document.getElementById("locateBtn");

    if (isTracking) {
        stopTracking();
        locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    } else {
        startPrecisionTracking();
        locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
}

// Start precision tracking
function startPrecisionTracking() {
    isTracking = true;
    bestAccuracy = Number.MAX_VALUE;
    document.getElementById("accuracyContainer").style.display = "block";

    const highAccuracyOptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    };

    watchId = navigator.geolocation.watchPosition(
        function (position) {
            handleTrackingPosition(position);
        },
        function (error) {
            handleTrackingError(error);
        },
        highAccuracyOptions
    );
}

// Handle tracking position
function handleTrackingPosition(position) {
    const now = Date.now();

    if (!lastKnownPosition ||
        position.coords.accuracy < bestAccuracy ||
        now - lastUpdateTime > 5000) {

        bestAccuracy = Math.min(bestAccuracy, position.coords.accuracy);
        handleNewPosition(position);

        document.getElementById("locateBtn").innerHTML = '<i class="fas fa-location-crosshairs"></i>';
        updateAccuracyDisplay(position.coords.accuracy);

        if (position.coords.accuracy > 20) {
            if (accuracyTimeout) clearTimeout(accuracyTimeout);
            accuracyTimeout = setTimeout(tryEnhancedTracking, 3000);
        }
    }
}

// Update accuracy display
function updateAccuracyDisplay(accuracy) {
    const accuracyText = document.getElementById("accuracyText");
    const accuracyBar = document.getElementById("accuracyBar");

    const accuracyMeters = Math.round(accuracy);
    accuracyText.textContent = `Accuracy: ±${accuracyMeters}m`;

    const accuracyPercent = Math.min(100, Math.max(0, 100 - (accuracyMeters / 50 * 100)));
    accuracyBar.style.transform = `scaleX(${accuracyPercent / 100})`;

    if (accuracyMeters < 5) {
        accuracyBar.style.background = '#4CAF50';
    } else if (accuracyMeters < 15) {
        accuracyBar.style.background = '#8BC34A';
    } else if (accuracyMeters < 30) {
        accuracyBar.style.background = '#FFC107';
    } else {
        accuracyBar.style.background = '#F44336';
    }
}

function handleTrackingError(error) {
    console.error('Tracking error:', error);

    if (watchId) navigator.geolocation.clearWatch(watchId);

    watchId = navigator.geolocation.watchPosition(
        function (position) {
            handleTrackingPosition(position);
        },
        function (error) {
            console.error('Fallback tracking failed:', error);
            stopTracking();
        },
        {
            enableHighAccuracy: false,
            maximumAge: 3000,
            timeout: 10000
        }
    );
}

function stopTracking() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    isTracking = false;
    accuracyCircle.setRadius(0);
    document.getElementById("accuracyContainer").style.display = "none";
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById("fullscreenBtn").innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        document.getElementById("fullscreenBtn").innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function toggleDirections() {
    document.getElementById("directionsPanel").classList.toggle("active");
}

function setupEventListeners() {
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
}

document.addEventListener('DOMContentLoaded', initMap);