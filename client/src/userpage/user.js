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
    "39": { lat: 12.8730558, lng: 80.2218957, name: "Admin Block" },
    "40": { lat: 12.870717, lng: 80.222929, name: "Sathyabama General Hospital" },
    "41": { lat: 12.871948, lng: 80.220641, name: "Main ground" },
    "42": { lat: 12.872518, lng: 80.217632, name: "law college ground" },
    "43": { lat: 12.871312, lng: 80.219083, name: "Boys hostel" },
    "44": { lat: 12.8739121, lng: 80.2209593, name: "ECE Tower lab" },
    "45": { lat: 12.872402, lng: 80.219474, name: "Main canteen" },
    "46": { lat: 12.872921, lng: 80.226545, name: "Main Arch" },
    "47": { lat: 12.870906, lng: 80.224960, name: "Scas canteen" },
    "48": { lat: 12.870791, lng: 80.223355, name: "Dental block" },
    "49": { lat: 12.870860, lng: 80.222968, name: "General hospital" },
    "50": { lat: 12.8709960, lng: 80.2221800, name: "St.pauls" },
    "51": { lat: 12.871408, lng: 80.222344, name: "Ocean research park" },
    "52": { lat: 12.871151, lng: 80.220771, name: "Open area theatre" },
    "53": { lat: 12.870527, lng: 80.220409, name: "Architecture block" },
    "54": { lat: 12.872794, lng: 80.221247, name: "IRC" },
    "55": { lat: 12.873247, lng: 80.221306, name: "Jeppiaar Memorial" },
    "56": { lat: 12.875086, lng: 80.221949, name: "Girls Main mess" },
    "57": { lat: 12.871892, lng: 80.220650, name: "Main ground" },
    "60": { lat: 12.872678, lng: 80.218808, name: "Boys Main mess" },
    "61": { lat: 12.872977, lng: 80.217516, name: "New CSE Block" },
    "62": { lat: 12.873973, lng: 80.218756, name: "Church" },
    "63": { lat: 12.870557, lng: 80.226297, name: "Dental Gate" }
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
    "Admin Block": {
        lat: 12.8730558, lng: 80.2218957,
        name: "Administration Block"
    },
    "Hospital": {
        lat: 12.870717, lng: 80.222929,
        name: "Sathyabama General Hospital"
    },
    "Main ground": {
        lat: 12.871948, lng: 80.220641,
        name: "Main ground"
    },
    "Law ground": {
        lat: 12.872518, lng: 80.217632,
        name: "law college ground"
    },

    "Ece tower lab": {
        lat: 12.8739121, lng: 80.2209593,
        name: "ECE Tower lab"
    },
    "Main canteen": {
        lat: 12.872402, lng: 80.219474,
        name: "Main canteen"
    },
    "Main Arch": {
        lat: 12.872921, lng: 80.226545,
        name: "Main Arch"
    },
    "Scas canteen": {
        lat: 12.870906, lng: 80.224960,
        name: "Scas canteen"
    },
    "dental block": {
        lat: 12.870791, lng: 80.223355,
        name: "Dental block"
    },
    "General hospital": {
        lat: 12.870860, lng: 80.222968,
        name: "General hospital"
    },
    "St.pauls": {
        lat: 12.8709960, lng: 80.2221800,
        name: "St.pauls"
    },
    "Ocean research park": {
        lat: 12.871408, lng: 80.222344,
        name: "Ocean research park"
    },
    "Open area theatre": {
        lat: 12.871151, lng: 80.220771,
        name: "Open area theatre"
    },
    "Architecture block": {
        lat: 12.870527, lng: 80.220409,
        name: "Architecture block"
    },
    "Jeppiaar Memorial": {
        lat: 12.873247, lng: 80.221306,
        name: "Jeppiaar Memorial"
    },
    "Girls Main mess": {
        lat: 12.875086, lng: 80.221949,
        name: "Girls Main mess"
    },
    "Main ground": {
        lat: 12.871892, lng: 80.220650,
        name: "Main ground"
    },
    "Boys Main mess": {
        lat: 12.872678, lng: 80.218808,
        name: "Boys Main mess"
    },
    "New CSE Block": {
        lat: 12.872977, lng: 80.217516,
        name: "New CSE Block"
    },
    "Church": {
        lat: 12.873973, lng: 80.218756,
        name: "Church"
    },
    "Dental gate": {
        lat: 12.870557, lng: 80.226297,
        name: "Dental Gate"
    }
};

const campusConnections = [
    // Main pathways and core connections
    ["1", "7"], ["1", "12"], ["1", "8"], ["1", "46"], // Main Arch connections
    ["2", "15"], ["2", "14"], ["2", "63"], // Dental Gate connections
    ["3", "4"], ["3", "6"], ["3", "25"], ["3", "48"], // Dental Block connections
    ["4", "5"], ["4", "40"], ["4", "49"], // Hospital connections
    ["5", "6"], ["5", "9"], ["5", "51"], // Ocean Research Park connections
    ["6", "11"], ["6", "50"], // St. Paul's connections
    ["7", "46"], // Main Arch to Node 7
    ["8", "9"], ["8", "37"], ["8", "55"], // Jeppiaar Memorial connections
    ["9", "10"],
    ["10", "11"], ["10", "36"], ["10", "28"], ["10", "18"], ["10", "54"], // IRC connections
    ["11", "26"], ["11", "22"], ["11", "52"], // Open Area Theatre connections
    ["12", "13"], ["12", "14"], ["12", "47"], // SCAS Canteen connections
    ["13", "14"], ["13", "15"],
    ["14", "15"],
    ["15", "25"],
    ["16", "17"], ["16", "62"], // Startup Cell to Church
    ["17", "35"], ["17", "62"], // Central Library connections
    ["18", "10"], ["18", "36"], ["18", "54"], // IRC connections
    ["19", "51"], ["19", "34"], // Ocean Research Park building
    ["20", "36"], ["20", "38"], ["20", "44"], // Block 1 & ECE Tower Lab
    ["21", "34"], // Remibai Auditorium
    ["22", "27"], ["22", "41"], ["22", "57"], // Indoor Stadium & Main Ground
    ["23", "27"], ["23", "43"], // Boys Hostel connections
    ["24", "33"], ["24", "56"], // Girls Hostel to Girls Main Mess
    ["25", "48"], // Dental Block
    ["26", "53"], // Architecture Block
    ["27", "28"], ["27", "43"], // Boys Hostel to Nodes
    ["28", "29"], ["28", "45"], // Main Canteen connection
    ["29", "30"],
    ["30", "31"], ["30", "60"], // Boys Main Mess
    ["31", "32"], ["31", "61"], // New CSE Block
    ["32", "33"],
    ["33", "24"], ["33", "56"], // Girls Hostel area
    ["34", "17"], ["34", "21"], ["34", "35"], // Library and Auditorium area
    ["35", "17"], // Central Library to Node 35
    ["36", "37"], ["36", "20"], ["36", "39"], ["36", "55"], // Admin Block & Jeppiaar Memorial
    ["37", "8"], ["37", "36"], ["37", "39"], // Admin Block connections
    ["38", "20"], ["38", "56"], // Girls Main Mess to Block 1
    ["39", "36"], ["39", "37"], ["39", "55"], // Admin Block core connections
    ["40", "4"], ["40", "49"], // Hospital buildings
    ["41", "22"], ["41", "57"], // Main Ground
    ["42", "61"], // Law College Ground to New CSE Block
    ["43", "23"], ["43", "27"], // Boys Hostel
    ["44", "20"], // ECE Tower Lab to Block 1
    ["45", "28"], // Main Canteen to Node 28
    ["46", "1"], ["46", "7"], // Main Arch
    ["47", "12"], // SCAS Canteen to Node 12
    ["48", "3"], ["48", "25"], // Dental Block to nodes
    ["49", "4"], ["49", "40"], // General Hospital
    ["50", "6"], // St. Paul's to Node 6
    ["51", "5"], ["51", "19"], // Ocean Research Park
    ["52", "11"], // Open Area Theatre to Node 11
    ["53", "26"], // Architecture Block to Node 26
    ["54", "10"], ["54", "18"], // IRC building
    ["55", "8"], ["55", "36"], ["55", "39"], // Jeppiaar Memorial
    ["56", "24"], ["56", "33"], ["56", "38"], // Girls Main Mess
    ["57", "22"], ["57", "41"], // Main Ground (duplicate)
    ["60", "30"], // Boys Main Mess to Node 30
    ["61", "31"], ["61", "42"], // New CSE Block
    ["62", "16"], ["62", "17"], // Church to Startup Cell & Library
    ["63", "2"], // Dental Gate to Node 2

    // Additional cross-campus connections for better routing
    ["7", "46"], // Strengthen Main Arch area
    ["13", "47"], // Connect SCAS Canteen to Node 13
    ["17", "35"], // Central Library to Node 35
    ["22", "52"], // Indoor Stadium to Open Area Theatre
    ["28", "45"], // Node 28 to Main Canteen
    ["34", "19"], // Node 34 to Ocean Research Park
    ["35", "62"], // Node 35 to Church
    ["41", "57"], // Main Ground reinforcement
    ["43", "60"], // Boys Hostel to Boys Main Mess
    ["45", "29"], // Main Canteen to Node 29
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
    // Check if nodes exist
    if (!campusNodes[startNodeId] || !campusNodes[endNodeId]) {
        console.error("Invalid start or end node");
        return { path: [], distance: Infinity };
    }

    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = new Set(); // Use a Set instead of PriorityQueue

    // Initialize distances
    for (const nodeId in campusNodes) {
        distances[nodeId] = Infinity;
        previous[nodeId] = null;
        queue.add(nodeId);
    }
    distances[startNodeId] = 0;

    while (queue.size > 0) {
        // Find node with smallest distance in the queue
        let current = null;
        let smallestDistance = Infinity;

        for (const nodeId of queue) {
            if (distances[nodeId] < smallestDistance) {
                smallestDistance = distances[nodeId];
                current = nodeId;
            }
        }

        if (current === null || current === endNodeId) {
            break;
        }

        queue.delete(current);
        visited.add(current);

        // Find all neighbors of current node
        const neighbors = [];
        for (const [from, to] of campusConnections) {
            if (from === current && !visited.has(to)) neighbors.push(to);
            if (to === current && !visited.has(from)) neighbors.push(from);
        }

        for (const neighbor of neighbors) {
            if (!queue.has(neighbor)) continue;

            const fromNode = campusNodes[current];
            const toNode = campusNodes[neighbor];

            // Calculate distance between nodes
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

    // Reconstruct path
    const path = [];
    let current = endNodeId;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];

        // Prevent infinite loops
        if (path.length > Object.keys(campusNodes).length) {
            console.error("Path reconstruction loop detected");
            return { path: [], distance: Infinity };
        }
    }

    // Check if we found a valid path
    if (path.length === 1 && path[0] === endNodeId && startNodeId !== endNodeId) {
        console.error("No path found from", startNodeId, "to", endNodeId);
        return { path: [], distance: Infinity };
    }

    console.log("Start node:", startNodeId);
    console.log("End node:", endNodeId);
    console.log("Calculated path:", path);
    console.log("Path distance:", distances[endNodeId]);

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

    console.log("Closest node found:", closestNodeId, "Distance:", minDistance, "meters");

    // If no node found or distance is too large, return null
    if (minDistance > 1000) { // If more than 1km away, probably not on campus
        console.warn("User is too far from any known node");
        return null;
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
    map.on('zoomend', function () {
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

function smoothRotateMarker(marker, newAngle) {
    const element = marker.getElement();
    if (!element) return;

    // Get current rotation
    const currentRotation = marker.options.rotationAngle || 0;

    // Calculate shortest rotation path
    let rotationDiff = newAngle - currentRotation;
    if (rotationDiff > 180) rotationDiff -= 360;
    if (rotationDiff < -180) rotationDiff += 360;

    // Apply smooth transition
    element.style.transition = 'transform 0.3s ease';
    marker.setRotationAngle(newAngle);
    element.style.transform = `rotate(${newAngle}deg)`;

    // Remove transition after animation completes
    setTimeout(() => {
        if (element) {
            element.style.transition = '';
        }
    }, 300);
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

    accuracyCircle.setLatLng(currentPosition);
    accuracyCircle.setRadius(position.coords.accuracy);

    if (userMarker) {
        userMarker.setLatLng(currentPosition);

        const heading = position.coords.heading;
        if (heading && !isNaN(heading)) {
            smoothRotateMarker(userMarker, heading);
        }
    } else {
        // Create Google Maps style arrow marker
        userMarker = L.marker(currentPosition, {
            icon: L.divIcon({
                className: 'user-arrow-marker',
                html: `
                        <div class="arrow-container">
                            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="8" class="simple-arrow"/>
                                <path d="M10 4 L14 12 L10 10 L6 12 Z" class="simple-arrow-arrow"/>
                            </svg>
                        </div>
                    `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }),
            rotationAngle: position.coords.heading || 0,
            zIndexOffset: 1001
        }).addTo(map).bindPopup("Your Location");

        // Set initial rotation
        if (position.coords.heading) {
            const element = userMarker.getElement();
            if (element) {
                element.style.transform = `rotate(${position.coords.heading}deg)`;
            }
        }
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

function updateUserArrowStyle(accuracy) {
    if (!userMarker) return;

    const markerElement = userMarker.getElement();
    if (!markerElement) return;

    // Remove previous accuracy classes
    markerElement.classList.remove('high-accuracy', 'medium-accuracy', 'low-accuracy');

    // Add appropriate class based on accuracy
    if (accuracy < 10) {
        markerElement.classList.add('high-accuracy');
    } else if (accuracy < 25) {
        markerElement.classList.add('medium-accuracy');
    } else {
        markerElement.classList.add('low-accuracy');
    }
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

function checkUserDirection(position) {
    if (!routePolyline || !currentPosition || !lastCorrectPosition) return;
    
    // Get the user's current heading
    const userHeading = position.coords.heading;
    if (!userHeading || isNaN(userHeading)) return;
    
    // Find the closest point on the route to the user
    const routePoints = routePolyline.getLatLngs();
    let closestPoint = null;
    let minDistance = Infinity;
    
    for (const point of routePoints) {
        const distance = map.distance(
            [currentPosition[0], currentPosition[1]],
            [point.lat, point.lng]
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    }
    
    if (!closestPoint) return;
    
    // Find the next point on the route after the closest point
    const closestIndex = routePoints.findIndex(point => 
        point.lat === closestPoint.lat && point.lng === closestPoint.lng
    );
    
    if (closestIndex === -1 || closestIndex >= routePoints.length - 1) return;
    
    const nextPoint = routePoints[closestIndex + 1];
    
    // Calculate the intended direction (bearing to next point)
    const intendedBearing = calculateBearing(
        currentPosition[0], currentPosition[1],
        nextPoint.lat, nextPoint.lng
    );
    
    // Calculate the difference between user heading and intended bearing
    let directionDiff = Math.abs(userHeading - intendedBearing);
    if (directionDiff > 180) {
        directionDiff = 360 - directionDiff;
    }
    
    // Check if user is going in the wrong direction
    if (directionDiff > 90) { // More than 90 degrees off course
        wrongDirectionCount++;
        
        if (wrongDirectionCount >= WRONG_DIRECTION_THRESHOLD) {
            showWrongDirectionAlert();
            wrongDirectionCount = 0; // Reset counter after alert
        }
    } else {
        // Reset counter if going in right direction
        wrongDirectionCount = Math.max(0, wrongDirectionCount - 1);
        lastCorrectPosition = currentPosition;
    }
}

// Function to update the entire route and arrows
function calculateRoute() {
    const destinationSelect = document.getElementById("destination");
    const end = destinationSelect.value;
    destinationReachedAlertShown = false;
    wrongDirectionCount = 0;
    lastCorrectPosition = currentPosition;

    // Remove existing route
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

    // Find closest nodes to current position and destination
    const startNodeId = findClosestNode({ lat: currentPosition[0], lng: currentPosition[1] });
    const endNodeId = findClosestNode({ lat: destination[0], lng: destination[1] });

    console.log("Routing from node", startNodeId, "to node", endNodeId);

    // Handle case where user is not near any campus node
    if (!startNodeId) {
        // User is not on campus, use direct route
        console.warn("User not on campus, using direct route");
        
        currentRouteDistance = map.distance(currentPosition, destination);

        // Draw direct route
        routePolyline = L.polyline([currentPosition, destination], {
            color: '#4E0911',
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round',
            dashArray: '5, 5'
        }).addTo(map);

        // Update UI
        document.getElementById("distanceDisplay").textContent =
            `Distance to destination: ${Math.round(currentRouteDistance)} meters (direct path)`;
        document.getElementById("distanceDisplay").style.display = "block";

        // Show warning
        document.getElementById("stepsContainer").innerHTML = `
                <div class="step">
                    <div class="step-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>You appear to be off-campus. Following direct route to destination.</div>
                    </div>
                </div>
            `;

        return;
    }

    if (!endNodeId) {
        showAlert("Routing Error", "Could not find destination on campus", "error");
        return;
    }

    // Calculate path using Dijkstra through all nodes
    const result = dijkstra(startNodeId, endNodeId);

    if (result.path.length === 0 || result.distance === Infinity) {
        // Fallback: Direct connection if no path found
        console.warn("No path found through nodes, using direct connection");

        currentRouteDistance = map.distance(currentPosition, destination);

        // Draw direct route
        routePolyline = L.polyline([currentPosition, destination], {
            color: '#4E0911',
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round',
            dashArray: '5, 5'
        }).addTo(map);

        // Update UI
        document.getElementById("distanceDisplay").textContent =
            `Distance to destination: ${Math.round(currentRouteDistance)} meters (direct path)`;
        document.getElementById("distanceDisplay").style.display = "block";

        // Show warning
        document.getElementById("stepsContainer").innerHTML = `
                <div class="step">
                    <div class="step-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>No detailed path found. Following direct route to destination.</div>
                    </div>
                </div>
            `;

        return;
    }

    currentRouteDistance = result.distance;

    // Build the path coordinates through all nodes
    const pathCoords = [];

    // 1. Start with current position
    pathCoords.push(currentPosition);

    // 2. Add all nodes in the calculated path
    for (let i = 0; i < result.path.length; i++) {
        const node = campusNodes[result.path[i]];
        pathCoords.push([node.lat, node.lng]);
    }

    // 3. End with destination
    pathCoords.push(destination);

    // Draw the complete route following node connections
    routePolyline = L.polyline(pathCoords, {
        color: '#4E0911',
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round',
        smoothFactor: 1.0
    }).addTo(map);

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



function visualizeAllNodes() {
    // Clear existing debug markers
    const debugMarkers = [];

    // Add markers for all nodes
    for (const nodeId in campusNodes) {
        const node = campusNodes[nodeId];
        const marker = L.marker([node.lat, node.lng], {
            icon: L.divIcon({
                className: 'debug-marker',
                html: `<div style="background-color: red; width: 8px; height: 8px; border-radius: 50%;"></div>`,
                iconSize: [8, 8]
            })
        }).addTo(map);

        // Add popup with node ID
        marker.bindPopup(`Node ${nodeId}: ${node.name}`);
        debugMarkers.push(marker);
    }

    // Return function to remove debug markers
    return function () {
        debugMarkers.forEach(marker => map.removeLayer(marker));
    };
}

// Add to your initMap function for debugging:
// const removeDebugMarkers = visualizeAllNodes();
// setTimeout(removeDebugMarkers, 5000); // Remove after 5 seconds

// Update the initMap function to remove arrow-related event listeners
function initMap() {
    const location = [12.872890526536645, 80.22607288181399];

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
    }).addTo(map).bindPopup("Sathyabama University");

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

    // Remove arrow visibility update from zoomend event
    map.on('zoomend', function () {
        updateRoadNameVisibility();
    });

    locateUserWithRetry(3);
    setupEventListeners();
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

    // Create start step - from current position to first node
    const startStep = document.createElement("div");
    startStep.className = "step";

    const startNumber = document.createElement("div");
    startNumber.className = "step-number";
    startNumber.textContent = stepNumber++;

    const startText = document.createElement("div");
    startText.className = "step-text";

    const startArrow = document.createElement("div");
    startArrow.className = "step-arrow";
    startArrow.innerHTML = '<i class="fas fa-play"></i>';

    const firstNode = campusNodes[result.path[0]];
    const distanceToFirstNode = map.distance(currentPosition, [firstNode.lat, firstNode.lng]);
    totalDistance += distanceToFirstNode;

    startText.textContent = `Head to ${firstNode.name}`;

    const startInfo = document.createElement("div");
    startInfo.className = "step-distance";
    startInfo.textContent = `${Math.round(distanceToFirstNode)}m`;
    startText.appendChild(startInfo);

    startStep.appendChild(startNumber);
    startStep.appendChild(startArrow);
    startStep.appendChild(startText);
    stepsContainer.appendChild(startStep);

    // Generate steps for each road segment between nodes
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

        const stepArrow = document.createElement("div");
        stepArrow.className = "step-arrow";
        stepArrow.innerHTML = `<i class="fas ${arrowIcon}"></i>`;

        const stepText = document.createElement("div");
        stepText.className = "step-text";

        if (i === 0) {
            stepText.textContent = `Continue on ${roadName}`;
        } else {
            stepText.textContent = `Follow ${roadName}`;
        }

        const stepInfo = document.createElement("div");
        stepInfo.className = "step-distance";
        stepInfo.textContent = `${Math.round(distance)}m`;

        stepText.appendChild(stepInfo);
        step.appendChild(stepNum);
        step.appendChild(stepArrow);
        step.appendChild(stepText);
        stepsContainer.appendChild(step);
    }

    // Create destination step - from last node to final destination
    const destStep = document.createElement("div");
    destStep.className = "step";

    const destNumber = document.createElement("div");
    destNumber.className = "step-number";
    destNumber.textContent = stepNumber;

    const destArrow = document.createElement("div");
    destArrow.className = "step-arrow";
    destArrow.innerHTML = '<i class="fas fa-flag-checkered"></i>';

    const destText = document.createElement("div");
    destText.className = "step-text";

    const lastNodeId = result.path[result.path.length - 1];
    const lastNode = campusNodes[lastNodeId];
    const finalDistance = map.distance(
        [lastNode.lat, lastNode.lng],
        destination
    );
    totalDistance += finalDistance;

    destText.textContent = "Arrive at your destination";

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
    // This is only used for the directions panel, not for map arrows
    if (bearing >= 337.5 || bearing < 22.5) return 'fa-arrow-up';
    if (bearing >= 22.5 && bearing < 67.5) return 'fa-arrow-up-right';
    if (bearing >= 67.5 && bearing < 112.5) return 'fa-arrow-right';
    if (bearing >= 112.5 && bearing < 157.5) return 'fa-arrow-down-right';
    if (bearing >= 157.5 && bearing < 202.5) return 'fa-arrow-down';
    if (bearing >= 202.5 && bearing < 247.5) return 'fa-arrow-down-left';
    if (bearing >= 247.5 && bearing < 292.5) return 'fa-arrow-left';
    if (bearing >= 292.5 && bearing < 337.5) return 'fa-arrow-up-left';

    return 'fa-arrow-right';
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