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
    "12": { lat: 12.871640, lng: 80.225520, name: "Advanced Block" },
    "13": { lat: 12.871021, lng: 80.225088, name: "Node 13" },
    "14": { lat: 12.870956, lng: 80.225451, name: "Node 14" },
    "15": { lat: 12.870748, lng: 80.225029, name: "Node 15" },
};

const campusConnections = [
    ["1", "7"], ["1", "12"],
    ["2", "15"], ["2", "14"],
    ["3", "4"], ["3", "6"], ["3", "15"],
    ["4", "5"],
    ["5", "6"], ["5", "9"],
    ["6", "11"],
    ["7", "8"],
    ["8", "9"],
    ["9", "10"],
    ["10", "11"],
    ["12", "14"],
    ["13", "14"], ["13", "15"],
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

const labelLocations = [
        { coords: [12.873219073653498, 80.21891050189049], label: "Central Library" }
    ];

    labelLocations.forEach(loc => {
        L.marker(loc.coords, {
            icon: L.divIcon({
                className: 'text-label',
                html: `<div class="label-text">${loc.label}</div>`,
                iconSize: [100, 30],
                iconAnchor: [50, 15]
            }),
            interactive: false
        }).addTo(map);
    });

    locateUserWithRetry(3);
    setupEventListeners();
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

// Locate user with retry logic
function locateUserWithRetry(retries, currentAttempt = 1) {
    const locateBtn = document.getElementById("locateBtn");

    locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const options = {
        enableHighAccuracy: true,
        timeout: 5000 + (currentAttempt * 2000),
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        function (position) {
            handleNewPosition(position, true);
            locateBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
            setTimeout(() => {
                if (!isTracking) {
                    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                }
            }, 2000);
        },
        function (error) {
            console.error('Geolocation error:', error);
            if (currentAttempt < retries) {
                const delay = Math.pow(2, currentAttempt) * 500;
                setTimeout(() => {
                    locateUserWithRetry(retries, currentAttempt + 1);
                }, delay);
            } else {
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                showAlert(
                    "Location Error",
                    "Unable to get your location. Please ensure location services are enabled.",
                    'error'
                );
            }
        },
        options
    );
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
    document.getElementById("locateBtn").addEventListener("click", toggleLiveTracking);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
    document.getElementById("directionsBtn").addEventListener("click", toggleDirections);
    document.getElementById("closeDirections").addEventListener("click", toggleDirections);
    document.getElementById("backBtn").addEventListener("click", function () {
        showAlert(
            "Navigation",
            "Navigating back to selection page",
            'info'
        );
    });

    document.getElementById("destination").addEventListener("change", function () {
        destinationReachedAlertShown = false;
        if (this.value !== "Select Destination" && currentPosition) {
            calculateRoute();
        } else {
            if (routePolyline) {
                map.removeLayer(routePolyline);
                routePolyline = null;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initMap);