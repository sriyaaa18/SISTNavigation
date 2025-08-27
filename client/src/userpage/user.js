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
let currentRouteDistance = 0;
let lastCorrectNode = null;
let wrongDirectionCount = 0;
const WRONG_DIRECTION_THRESHOLD = 3;
let lastCorrectPosition = null;
let routeArrows = []; 

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
    "38": { lat: 12.8749894, lng: 80.2216946, name: "Node 38" },
    "39": { lat: 12.8730558, lng:80.2218957, name: "Admin Block" },
    "40": { lat:12.870717,lng:80.222929,name:"Sathyabama General Hospital" },
    "41": {lat:12.871948,lng:80.220641,name:"Main ground"},
    "42": {lat:12.872518,lng:80.217632,name:"law college ground"},
    "43": {lat: 12.871312, lng: 80.219083,name: "Boys hostel"},
    "44": {lat:12.8739121, lng:80.2209593,name:"ECE Tower lab"},
    "45": {lat:12.872402, lng:80.219474,name:"Main canteen"},
    "46": {lat:12.872921, lng:80.226545,name:"Main Arch"},
    "47": {lat:12.870906, lng:80.224960,name:"Scas canteen"},
    "48":{lat:12.870791, lng:80.223355,name:"Dental block"},
    "49":{lat:12.870860, lng:80.222968,name:"General hospital"},
    "50":{lat:12.8709960, lng:80.2221800,name:"St.pauls"},
    "51":{lat:12.871408 ,lng:80.222344,name:"Ocean research park"},
    "52":{lat:12.871151,lng:80.220771,name:"Open area theatre"},
    "53":{lat:12.870527,lng:80.220409,name:"Architecture block"},
    "54":{lat:12.872794,lng:80.221247,name:"IRC"},
    "55":{lat:12.873247,lng:80.221306,name:"Jeppiaar Memorial"},
    "56":{lat:12.875086,lng:80.221949,name:"Girls Main mess"},
    "57":{lat:12.871892,lng:80.220650,name:"Main ground"},
    "60":{lat:12.872678,lng:80.218808,name:"Boys Main mess"},
    "61":{lat:12.872977,lng:80.217516,name:"New CSE Block"},
    "62":{lat:12.873973,lng:80.218756,name:"Church"},
    "63":{lat:12.870557,lng:80.226297,name:"Dental Gate"}
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
    },
    "Admin Block":{
        lat: 12.8730558, lng:80.2218957,
        name:"Administration Block"
    },
    "Hospital":{
        lat:12.870717,lng:80.222929,
        name:"Sathyabama General Hospital"
    },
    "Main ground":{
        lat:12.871948,lng:80.220641,
        name:"Main ground"
    },
    "Law ground":{
        lat:12.872518,lng:80.217632,
        name:"law college ground"
    },
    
    "Ece tower lab":{
        lat:12.8739121, lng:80.2209593,
        name:"ECE Tower lab"
    },
    "Main canteen":{
        lat:12.872402, lng:80.219474,
        name:"Main canteen"
    },
    "Main Arch":{
        lat:12.872921, lng:80.226545,
        name:"Main Arch"
    },
    "Scas canteen":{
        lat:12.870906, lng:80.224960,
        name:"Scas canteen"
    },
    "dental block":{
        lat:12.870791, lng:80.223355,
        name:"Dental block"
    },
    "General hospital":{
        lat:12.870860, lng:80.222968,
        name:"General hospital"
    },
    "St.pauls":{
        lat:12.8709960, lng:80.2221800,
        name:"St.pauls"
    },
    "Ocean research park":{
        lat:12.871408 ,lng:80.222344,
        name:"Ocean research park"
    },
    "Open area theatre":{
        lat:12.871151,lng:80.220771,
        name:"Open area theatre"
    },
    "Architecture block":{
        lat:12.870527,lng:80.220409,
        name:"Architecture block"
    },
    "IRC":{
        lat:12.872794,lng:80.221247,
        name:"IRC"
    },
    "Jeppiaar Memorial":{
        lat:12.873247,lng:80.221306,
        name:"Jeppiaar Memorial"
    },
    "Girls Main mess":{
        lat:12.875086,lng:80.221949,
        name:"Girls Main mess"
    },
    "Main ground":{
        lat:12.871892,lng:80.220650,
        name:"Main ground"
    },
    "Boys Main mess":{
        lat:12.872678,lng:80.218808,
        name:"Boys Main mess"
    },
    "New CSE Block":{
        lat:12.872977,lng:80.217516,
        name:"New CSE Block"
    },
    "Church":{
        lat:12.873973,lng:80.218756,
        name:"Church"
    },
    "Dental gate":{
        lat:12.870557,lng:80.226297,
        name:"Dental Gate"
    }







};

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

function dijkstra(startNodeId, endNodeId) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = new Set();

    for (const nodeId in campusNodes) {
        distances[nodeId] = Infinity;
        previous[nodeId] = null;
        queue.add(nodeId);
    }
    distances[startNodeId] = 0;

    while (queue.size > 0) {
        let current = null;
        let smallestDistance = Infinity;

        for (const nodeId of queue) {
            if (distances[nodeId] < smallestDistance) {
                smallestDistance = distances[nodeId];
                current = nodeId;
            }
        }

        if (current === endNodeId || current === null) {
            break;
        }

        queue.delete(current);
        visited.add(current);

        const neighbors = [];
        for (const [from, to] of campusConnections) {
            if (from === current && !visited.has(to)) neighbors.push(to);
            if (to === current && !visited.has(from)) neighbors.push(from);
        }

        for (const neighbor of neighbors) {
            const fromNode = campusNodes[current];
            const toNode = campusNodes[neighbor];
            const weight = map.distance(
                [fromNode.lat, fromNode.lng],
                [toNode.lat, toNode.lng]
            );

            const alt = distances[current] + weight;

            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = current;
            }
        }
    }

    const path = [];
    let current = endNodeId;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    console.log("Start node:", startNodeId);
    console.log("End node:", endNodeId);
    console.log("Calculated path:", path);

    return {
        path: path,
        distance: distances[endNodeId]
    };
}

function showWrongDirectionAlert() {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    const alertHTML = `
        <div class="alert-overlay" id="wrongDirectionAlert">
            <div class="alert-box">
                <div class="alert-header">
                    <div class="alert-title">Wrong Direction</div>
                    <button class="alert-close" id="closeWrongDirectionAlert">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="alert-content">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>You're going the wrong way! Please check your route.</div>
                </div>
                <div class="alert-footer">
                    <button class="alert-button" id="confirmWrongDirectionAlert">OK</button>
                </div>
            </div>
        </div>
        `;

    document.body.insertAdjacentHTML('beforeend', alertHTML);

    const alertOverlay = document.getElementById('wrongDirectionAlert');
    const closeBtn = document.getElementById('closeWrongDirectionAlert');
    const okBtn = document.getElementById('confirmWrongDirectionAlert');

    function removeAlert() {
        alertOverlay.remove();
    }

    closeBtn.addEventListener('click', removeAlert);
    okBtn.addEventListener('click', removeAlert);
    alertOverlay.addEventListener('click', (e) => {
        if (e.target === alertOverlay) {
            removeAlert();
        }
    });

    if (routePolyline) {
        routePolyline.setStyle({
            color: '#FF5722',
            opacity: 1,
            weight: 8
        });

        setTimeout(() => {
            routePolyline.setStyle({
                color: '#4E0911',
                opacity: 0.8,
                weight: 6
            });
        }, 2000);
    }
}

function findClosestNode(position) {
    let closestNodeId = null;
    let minDistance = Infinity;

    for (const nodeId in campusNodes) {
        const node = campusNodes[nodeId];
        const distance = map.distance(
            [position.lat, position.lng],
            [node.lat, node.lng]
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestNodeId = nodeId;
        }
    }

    return closestNodeId;
}

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


function updateArrowVisibility() {
    const zoom = map.getZoom();
    const showArrows = zoom >= 17; // Show arrows only at higher zoom levels
    
    routeArrows.forEach(arrow => {
        if (showArrows) {
            if (!map.hasLayer(arrow)) {
                map.addLayer(arrow);
            }
        } else {
            if (map.hasLayer(arrow)) {
                map.removeLayer(arrow);
            }
        }
    });
}

// Update the initMap function to include arrow visibility handling
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

    destinationMarker = L.marker(location, {
        icon: L.divIcon({
            className: 'destination-marker',
            html: '<div style="background-color: #4E0911; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [24, 24]
        }),
        zIndexOffset: 1000
    }).addTo(map).bindPopup("SIST Campus");

    accuracyCircle = L.circle(location, {
        radius: 0,
        stroke: true,
        color: '#2c7be5',
        weight: 1,
        opacity: 0.4,
        fill: true,
        fillColor: '#2c7be5',
        fillOpacity: 0.2,
        zIndex: 999
    }).addTo(map);

    // Add event listeners AFTER the map is created
    map.on('zoomend', function() {
        updateRoadNameVisibility();
        updateArrowVisibility();
    });

    locateUserWithRetry(3);
    setupEventListeners();
}

let roadNameMarkers = [];

function drawCampusGraph() {
    // Clear existing road name markers
    roadNameMarkers.forEach(marker => map.removeLayer(marker));
    roadNameMarkers = [];

    for (const [fromId, toId] of campusConnections) {
        const fromNode = campusNodes[fromId];
        const toNode = campusNodes[toId];

        const fromLatLng = [fromNode.lat, fromNode.lng];
        const toLatLng = [toNode.lat, toNode.lng];
        const midLat = (fromNode.lat + toNode.lat) / 2;
        const midLng = (fromNode.lng + toNode.lng) / 2;

        const key = [fromId, toId].sort().join("-");
        const customName = roadNames[key] || roadNames["_default"];

        L.polyline([fromLatLng, toLatLng], {
            color: '#905F66',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
        }).addTo(map);

        // Create the road name marker but don't add it to map yet
        const roadNameMarker = L.marker([midLat, midLng], {
            icon: L.divIcon({
                className: 'path-label',
                html: `<div class="path-label-text">${customName}</div>`,
                iconSize: [200, 20],
                iconAnchor: [100, 10]
            }),
            interactive: false
        });

        // Store the marker reference
        roadNameMarkers.push(roadNameMarker);
    }

    updateRoadNameVisibility();
}

function updateRoadNameVisibility() {
    const currentZoom = map.getZoom();
    const showRoadNames = currentZoom >= 19;

    roadNameMarkers.forEach(marker => {
        if (showRoadNames) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}

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

function tryEnhancedTracking() {
    if (watchId) navigator.geolocation.clearWatch(watchId);

    watchId = navigator.geolocation.watchPosition(
        function (position) {
            handleTrackingPosition(position);
        },
        function (error) {
            handleTrackingError(error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000
        }
    );
}

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

let socket = io('http://localhost:5000');

function handleNewPosition(position, isSingleUpdate = false) {
    const now = Date.now();

    if (lastKnownPosition && now - lastUpdateTime < 1000 &&
        position.coords.accuracy > lastKnownPosition.coords.accuracy) {
        return;
    }

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    currentPosition = [userLat, userLng];
    const userPhone = localStorage.getItem('userPhone');
    const userName = localStorage.getItem('userName');

    socket.emit('updateLocation', {
        phoneNumber: userPhone,
        name: userName,
        location: {
            lat: userLat,
            lng: userLng,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
        }
    });

    console.log('📡 Sending location to server:', {
        userId: userPhone,
        name: userName,
        lat: userLat,
        lng: userLng,
        accuracy: position.coords.accuracy
    });


    accuracyCircle.setLatLng(currentPosition);
    accuracyCircle.setRadius(position.coords.accuracy);

    if (userMarker) {
        userMarker.setLatLng(currentPosition);

        const heading = position.coords.heading;
        if (heading && !isNaN(heading)) {
            userMarker.setRotationAngle(heading);
        }
    } else {
        userMarker = L.marker(currentPosition, {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<div style="background-color: #2c7be5; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; transform: rotate(' + (position.coords.heading || 0) + 'deg);"></div>',
                iconSize: [20, 20]
            }),
            rotationAngle: position.coords.heading || 0,
            zIndexOffset: 1001
        }).addTo(map).bindPopup("Your Location");
    }

    if (lastKnownPosition) {
        const distance = map.distance(
            [lastKnownPosition.coords.latitude, lastKnownPosition.coords.longitude],
            currentPosition
        );

        if (distance > 2) {
            map.panTo(currentPosition);
        }
    } else {
        map.panTo(currentPosition);
    }

    if (document.getElementById("destination").value !== "Select Destination") {
        calculateRoute();
        checkIfReachedDestination();
    }

    lastKnownPosition = position;
    lastUpdateTime = now;

    if (document.getElementById("destination").value !== "Select Destination") {
        calculateRoute();
        checkIfReachedDestination();
        checkUserDirection(position);
    }

    document.getElementById("locationTitle").textContent = "Your Location";
    document.getElementById("locationSubtitle").textContent =
        `Accuracy: ±${Math.round(position.coords.accuracy)} meters`;
}

function checkIfReachedDestination() {
    const destinationSelect = document.getElementById("destination");
    if (destinationSelect.value === "Select Destination" || !currentPosition) return;

    if (destinationCheckInterval) {
        clearInterval(destinationCheckInterval);
    }

    const coords = destinationSelect.value.split(",");
    const destination = [parseFloat(coords[0]), parseFloat(coords[1])];

    const distance = map.distance(currentPosition, destination);

    if (distance <= 20 && !destinationReachedAlertShown) {
        destinationReachedAlertShown = true;
        destinationMarker.setIcon(L.divIcon({
            className: 'destination-marker-reached',
            html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; animation: pulse 1s infinite;"></div>',
            iconSize: [24, 24]
        }));

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        showAlert(
            "Destination Reached",
            `You have reached ${destinationSelect.options[destinationSelect.selectedIndex].text}!`,
            'success'
        );

        clearInterval(destinationCheckInterval);
    } else if (distance > 20) {
        destinationReachedAlertShown = false;
    }
}

function calculateRoute() {
    const destinationSelect = document.getElementById("destination");
    const end = destinationSelect.value;
    destinationReachedAlertShown = false;
    wrongDirectionCount = 0;
    lastCorrectPosition = currentPosition;

    // Clear existing arrows and route
    clearRouteArrows();
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }

    if (!currentPosition) {
        showAlert(
            "Tracking Required",
            "Please enable live tracking first for accurate routing",
            'warning'
        );
        return;
    }

    if (end === "Select Destination") {
        document.getElementById("distanceDisplay").style.display = "none";
        document.getElementById("stepsContainer").innerHTML = "";
        return;
    }

    const coords = end.split(",");
    const destination = [parseFloat(coords[0]), parseFloat(coords[1])];

    destinationMarker.setLatLng(destination);
    destinationMarker.setPopupContent(destinationSelect.options[destinationSelect.selectedIndex].text);

    // Find closest nodes
    const startNodeId = findClosestNode({ lat: currentPosition[0], lng: currentPosition[1] });
    const endNodeId = findClosestNode({ lat: destination[0], lng: destination[1] });

    if (!startNodeId || !endNodeId) {
        showAlert("Routing Error", "Could not find path nodes", "error");
        return;
    }

    // Calculate path using Dijkstra
    const result = dijkstra(startNodeId, endNodeId);

    if (result.path.length === 0) {
        showAlert("Routing Error", "No path found to destination", "error");
        return;
    }

    currentRouteDistance = result.distance;

    // Build the path coordinates
    const pathCoords = [];

    // 1. Start with current position
    pathCoords.push(currentPosition);

    // 2. Connect to the first node in path
    const firstNode = campusNodes[result.path[0]];
    pathCoords.push([firstNode.lat, firstNode.lng]);

    // 3. Add all intermediate nodes in the calculated path
    for (let i = 1; i < result.path.length; i++) {
        const node = campusNodes[result.path[i]];
        pathCoords.push([node.lat, node.lng]);
    }

    // 4. Connect to the destination
    pathCoords.push(destination);

    // Draw new route following node connections
    routePolyline = L.polyline(pathCoords, {
        color: '#4E0911',
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round',
        smoothFactor: 1.0
    }).addTo(map);

    // Add arrows along the route
    addRouteArrows(pathCoords);

    // Update UI
    document.getElementById("distanceDisplay").textContent =
        `Distance to destination: ${Math.round(currentRouteDistance)} meters`;
    document.getElementById("distanceDisplay").style.display = "block";

    // Generate directions
    generateDirections(result, pathCoords);
    updateRoadNameVisibility();
    
    // Fit map to show the entire route with some padding
    const bounds = routePolyline.getBounds();
    map.fitBounds(bounds, {
        padding: [50, 50]
    });
}

function addRouteArrows(pathCoords) {
    // Clear any existing arrows
    clearRouteArrows();
    
    const arrowSpacing = 30; // Reduced spacing for more frequent arrows
    let accumulatedDistance = 0;
    
    for (let i = 0; i < pathCoords.length - 1; i++) {
        const start = pathCoords[i];
        const end = pathCoords[i + 1];
        const segmentDistance = map.distance(start, end);
        const segmentBearing = calculateBearing(start[0], start[1], end[0], end[1]);
        
        // Calculate how many arrows to place on this segment
        const numArrows = Math.max(1, Math.floor(segmentDistance / arrowSpacing));
        
        for (let j = 1; j <= numArrows; j++) {
            const ratio = j / (numArrows + 1);
            const arrowLat = start[0] + (end[0] - start[0]) * ratio;
            const arrowLng = start[1] + (end[1] - start[1]) * ratio;
            
            // Get the appropriate arrow icon based on bearing
            const arrowIcon = getDirectionArrow(segmentBearing);
            
            // Create arrow marker with proper rotation
            const arrowMarker = L.marker([arrowLat, arrowLng], {
                icon: L.divIcon({
                    className: 'route-arrow',
                    html: `<div style="transform: rotate(${segmentBearing}deg);">
                             <i class="fas ${arrowIcon}"></i>
                           </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                }),
                interactive: false,
                zIndexOffset: 1000
            }).addTo(map);
            
            routeArrows.push(arrowMarker);
        }
        
        accumulatedDistance += segmentDistance;
    }
    
    // Add a special arrow near the destination
    if (pathCoords.length > 1) {
        const lastSegmentStart = pathCoords[pathCoords.length - 2];
        const destination = pathCoords[pathCoords.length - 1];
        const destBearing = calculateBearing(lastSegmentStart[0], lastSegmentStart[1], destination[0], destination[1]);
        
        // Get the appropriate arrow icon for destination
        const destArrowIcon = getDirectionArrow(destBearing);
        
        // Position arrow closer to destination
        const ratio = 0.8; // 80% towards destination from last point
        const arrowLat = lastSegmentStart[0] + (destination[0] - lastSegmentStart[0]) * ratio;
        const arrowLng = lastSegmentStart[1] + (destination[1] - lastSegmentStart[1]) * ratio;
        
        const finalArrow = L.marker([arrowLat, arrowLng], {
            icon: L.divIcon({
                className: 'route-arrow final-arrow',
                html: `<div style="transform: rotate(${destBearing}deg);">
                         <i class="fas ${destArrowIcon}" style="color: #4E0911; font-size: 24px;"></i>
                       </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            }),
            interactive: false,
            zIndexOffset: 1001
        }).addTo(map);
        
        routeArrows.push(finalArrow);
    }
}

function clearRouteArrows() {
    routeArrows.forEach(arrow => {
        if (map.hasLayer(arrow)) {
            map.removeLayer(arrow);
        }
    });
    routeArrows = [];
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    
    return (toDeg(θ) + 360) % 360;
}

// Helper function to find where to connect to a path
function findConnectionPoint(point, pathEnd) {
    // Simple implementation - find perpendicular point on path
    // For more accuracy, you might want to:
    // 1. Find the actual campus path segment
    // 2. Calculate proper connection point
    // This is a simplified version

    const pathAngle = Math.atan2(pathEnd[1] - point[1], pathEnd[0] - point[0]);
    const distance = map.distance(point, pathEnd);
    const connectDistance = Math.min(10, distance / 2); // Don't connect too far

    return [
        point[0] + connectDistance / 111320 * Math.cos(pathAngle),
        point[1] + connectDistance / 111320 * Math.cos(pathAngle) / Math.cos(point[0] * Math.PI / 180)
    ];
}

function generateDirections(result, pathCoords) {
    const stepsContainer = document.getElementById("stepsContainer");
    stepsContainer.innerHTML = "";

    if (result.path.length === 0) return;

    let stepNumber = 1;
    let totalDistance = 0;

    // Create start step
    const startStep = document.createElement("div");
    startStep.className = "step";

    const startNumber = document.createElement("div");
    startNumber.className = "step-number";
    startNumber.textContent = stepNumber++;

    const startText = document.createElement("div");
    startText.className = "step-text";

    // Add arrow icon for start
    const startArrow = document.createElement("div");
    startArrow.className = "step-arrow";
    startArrow.innerHTML = '<i class="fas fa-play"></i>'; // Start arrow

    const firstNode = campusNodes[result.path[0]];
    const distanceToFirstNode = map.distance(currentPosition, [firstNode.lat, firstNode.lng]);
    totalDistance += distanceToFirstNode;

    startText.textContent = `Walk to ${firstNode.name}`;

    const startInfo = document.createElement("div");
    startInfo.className = "step-distance";
    startInfo.textContent = `${Math.round(distanceToFirstNode)}m`;
    startText.appendChild(startInfo);

    startStep.appendChild(startNumber);
    startStep.appendChild(startArrow); // Add arrow
    startStep.appendChild(startText);
    stepsContainer.appendChild(startStep);

    // Generate steps for each segment of the path
    for (let i = 0; i < result.path.length - 1; i++) {
        const fromNodeId = result.path[i];
        const toNodeId = result.path[i + 1];

        const fromNode = campusNodes[fromNodeId];
        const toNode = campusNodes[toNodeId];

        // Calculate bearing/direction between nodes
        const bearing = calculateBearing(
            fromNode.lat, fromNode.lng,
            toNode.lat, toNode.lng
        );
        
        // Get the appropriate arrow based on bearing
        const arrowIcon = getDirectionArrow(bearing);

        // Get the road name for this segment
        const key = [fromNodeId, toNodeId].sort().join("-");
        const roadName = roadNames[key] || roadNames["_default"];

        const distance = map.distance(
            [fromNode.lat, fromNode.lng],
            [toNode.lat, toNode.lng]
        );
        totalDistance += distance;

        // Create step for this road segment
        const step = document.createElement("div");
        step.className = "step";

        const stepNum = document.createElement("div");
        stepNum.className = "step-number";
        stepNum.textContent = stepNumber++;

        // Add direction arrow
        const stepArrow = document.createElement("div");
        stepArrow.className = "step-arrow";
        stepArrow.innerHTML = `<i class="fas ${arrowIcon}"></i>`;

        const stepText = document.createElement("div");
        stepText.className = "step-text";
        stepText.textContent = `Follow ${roadName}`;

        const stepInfo = document.createElement("div");
        stepInfo.className = "step-distance";
        stepInfo.textContent = `${Math.round(distance)}m`;

        stepText.appendChild(stepInfo);
        step.appendChild(stepNum);
        step.appendChild(stepArrow); // Add arrow
        step.appendChild(stepText);
        stepsContainer.appendChild(step);
    }

    // Create destination step
    const destStep = document.createElement("div");
    destStep.className = "step";

    const destNumber = document.createElement("div");
    destNumber.className = "step-number";
    destNumber.textContent = stepNumber;

    // Add destination icon
    const destArrow = document.createElement("div");
    destArrow.className = "step-arrow";
    destArrow.innerHTML = '<i class="fas fa-flag-checkered"></i>';

    const destText = document.createElement("div");
    destText.className = "step-text";

    const lastNodeId = result.path[result.path.length - 1];
    const lastNode = campusNodes[lastNodeId];
    const finalDistance = map.distance(
        [lastNode.lat, lastNode.lng],
        pathCoords[pathCoords.length - 1]
    );
    totalDistance += finalDistance;

    destText.textContent = "Walk to your destination";

    const destInfo = document.createElement("div");
    destInfo.className = "step-distance";
    destInfo.textContent = `${Math.round(finalDistance)}m`;
    destText.appendChild(destInfo);

    destStep.appendChild(destNumber);
    destStep.appendChild(destArrow);
    destStep.appendChild(destText);
    stepsContainer.appendChild(destStep);

    // Add total distance at the bottom
    const totalDistanceElement = document.createElement("div");
    totalDistanceElement.className = "total-distance";
    totalDistanceElement.textContent = `Total distance: ${Math.round(totalDistance)} meters`;
    stepsContainer.appendChild(totalDistanceElement);
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = deg => deg * Math.PI / 180;
    const toDeg = rad => rad * 180 / Math.PI;
    
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    
    return (toDeg(θ) + 360) % 360;
}

// Helper function to get appropriate arrow based on bearing
function getDirectionArrow(bearing) {
    // Map bearing to arrow icons
    if (bearing >= 337.5 || bearing < 22.5) return 'fa-arrow-up';         // North
    if (bearing >= 22.5 && bearing < 67.5) return 'fa-arrow-up-right';    // Northeast
    if (bearing >= 67.5 && bearing < 112.5) return 'fa-arrow-right';      // East
    if (bearing >= 112.5 && bearing < 157.5) return 'fa-arrow-down-right'; // Southeast
    if (bearing >= 157.5 && bearing < 202.5) return 'fa-arrow-down';      // South
    if (bearing >= 202.5 && bearing < 247.5) return 'fa-arrow-down-left'; // Southwest
    if (bearing >= 247.5 && bearing < 292.5) return 'fa-arrow-left';      // West
    if (bearing >= 292.5 && bearing < 337.5) return 'fa-arrow-up-left';   // Northwest
    
    return 'fa-arrow-right'; // Default
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
            document.getElementById("distanceDisplay").style.display = "none";
        }
    });
}

document.addEventListener('DOMContentLoaded', initMap);