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
        "38": { lat: 12.8749894, lng: 80.2216946, name: "Node 38" }
    };

    const buildingLabels = {
        "centralLibrary": { 
            lat: 12.873236621715348, lng: 80.2189667038578, 
            name: "Central library"
        },
        "advancedStudies":{
            lat: 12.871640, lng: 80.225520, 
            name: "Sathyabama Centre for Advanced Studies"
        },
        "startupCell":{
            lat: 12.873959, lng: 80.219224, 
            name: "Startup cell"
        },
        "irc":{
            lat: 12.872815, lng: 80.221325, 
            name: "International Research Centre"
        },
        "orp":{
            lat: 12.873758, lng: 80.218891, 
            name: "Ocean Research Park"
        },
        "block1":{
            lat: 12.873886, lng: 80.221469,
             name: "Block 1"
        },
        "remibai":{
            lat: 12.874384, lng: 80.219016,
            name: "Remibai Auditorium"
        },
        "indoorStadium":{
            lat: 12.871401, lng: 80.220580, 
            name: "Indoor Stadium"
        },
        "boysHostel":{
            lat: 12.871159, lng: 80.219749, 
            name: "Boys Hostel"
        },
        "girlsHostel":{
            lat: 12.874591, lng: 80.217833,
            name: "Girls Hostel"
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
            
            // Create a custom label marker
            L.marker([label.lat, label.lng], {
                icon: L.divIcon({
                    className: 'building-label',
                    html: `<div class="building-label-text">${label.name}</div>`,
                    iconSize: [150, 40], // Adjust based on text length
                    iconAnchor: [75, 20], // Center the label
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

        return {
            path: path,
            distance: distances[endNodeId]
        };
    }

    function checkUserDirection(position) {
        if (!routePolyline || !currentPosition) return;

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const currentUserPos = [userLat, userLng];

        // Get the route coordinates
        const routeCoords = routePolyline.getLatLngs();
        
        // Find the closest point on the route to the user
        let minDistance = Infinity;
        
        routeCoords.forEach((point) => {
            const distance = map.distance(currentUserPos, [point.lat, point.lng]);
            if (distance < minDistance) {
                minDistance = distance;
            }
        });

        // Check if user is moving away from the route
        if (lastCorrectPosition) {
            const distanceFromLast = map.distance(lastCorrectPosition, currentUserPos);
            
            if (minDistance > 15 && distanceFromLast > 10) {
                wrongDirectionCount++;
                
                if (wrongDirectionCount >= WRONG_DIRECTION_THRESHOLD) {
                    showWrongDirectionAlert();
                    wrongDirectionCount = 0;
                }
            } else if (minDistance <= 15) {
                lastCorrectPosition = currentUserPos;
                wrongDirectionCount = 0;
            }
        } else if (minDistance <= 15) {
            lastCorrectPosition = currentUserPos;
        }
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

    // Find the closest node to a given position
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

    // Custom Alert System
    function showAlert(title, message, type = 'info', callback = null) {
        const overlay = document.getElementById('alertOverlay');
        const box = document.getElementById('alertBox');
        const alertTitle = document.getElementById('alertTitle');
        const alertMessage = document.getElementById('alertMessage');
        const alertIcon = document.getElementById('alertIcon');
        const alertButton = document.getElementById('alertButton');
        const alertClose = document.getElementById('alertClose');

        // Set content
        alertTitle.textContent = title;
        alertMessage.textContent = message;

        // Set type (changes colors and icon)
        box.className = 'alert-box';
        box.classList.add(`alert-${type}`);

        // Set icon based on type
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

        // Show the alert
        overlay.classList.add('active');

        // Close handlers
        function closeAlert() {
            overlay.classList.remove('active');
            if (callback) callback();
        }

        alertButton.onclick = closeAlert;
        alertClose.onclick = closeAlert;

        // Also close when clicking outside the box
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

        locateUserWithRetry(3);

        setupEventListeners();
    }

    function drawCampusGraph() {
        for (const nodeId in campusNodes) {
            const node = campusNodes[nodeId];
            L.marker([node.lat, node.lng], {
                icon: L.divIcon({
                    className: 'graph-node',
                    html: '<div style="background-color: #4E0911; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
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

    // Change map theme
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

    // Handle new position
    function handleNewPosition(position, isSingleUpdate = false) {
        const now = Date.now();

        if (lastKnownPosition && now - lastUpdateTime < 1000 &&
            position.coords.accuracy > lastKnownPosition.coords.accuracy) {
            return;
        }

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        currentPosition = [userLat, userLng];

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

        if (!currentPosition) {
            showAlert(
                "Tracking Required",
                "Please enable live tracking first for accurate routing",
                'warning'
            );
            return;
        }

        if (end === "Select Destination") {
            if (routePolyline) {
                map.removeLayer(routePolyline);
                routePolyline = null;
            }
            document.getElementById("distanceDisplay").style.display = "none";
            return;
        }

        const coords = end.split(",");
        const destination = [parseFloat(coords[0]), parseFloat(coords[1])];

        destinationMarker.setLatLng(destination);
        destinationMarker.setPopupContent(destinationSelect.options[destinationSelect.selectedIndex].text);

        const startNodeId = findClosestNode({ lat: currentPosition[0], lng: currentPosition[1] });
        const endNodeId = findClosestNode({ lat: destination[0], lng: destination[1] });

        const result = dijkstra(startNodeId, endNodeId);

        if (result.path.length === 0) {
            showAlert("Routing Error", "No path found to destination", "error");
            return;
        }

        currentRouteDistance = result.distance;

        const distanceDisplay = document.getElementById("distanceDisplay");
        distanceDisplay.textContent = `Distance to destination: ${Math.round(currentRouteDistance)} meters`;
        distanceDisplay.style.display = "block";

        const pathCoords = [];

        pathCoords.push(currentPosition);

        for (const nodeId of result.path) {
            const node = campusNodes[nodeId];
            pathCoords.push([node.lat, node.lng]);
        }

        pathCoords.push(destination);

        if (routePolyline) {
            map.removeLayer(routePolyline);
        }

        routePolyline = L.polyline(pathCoords, {
            color: '#4E0911',
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round'
        }).addTo(map);

        map.fitBounds(routePolyline.getBounds());

        generateDirections(result, pathCoords);

        document.getElementById("locationTitle").textContent =
            destinationSelect.options[destinationSelect.selectedIndex].text;
        document.getElementById("locationSubtitle").textContent =
            `Route calculated - ${Math.round(result.distance)}m`;
    }

    function generateDirections(result, pathCoords) {
        const stepsContainer = document.getElementById("stepsContainer");
        stepsContainer.innerHTML = "";

        if (result.path.length === 0) return;

        const startStep = document.createElement("div");
        startStep.className = "step";

        const startNumber = document.createElement("div");
        startNumber.className = "step-number";
        startNumber.textContent = "1";

        const startText = document.createElement("div");
        startText.className = "step-text";
        startText.textContent = "Start from your current location";

        startStep.appendChild(startNumber);
        startStep.appendChild(startText);
        stepsContainer.appendChild(startStep);

        for (let i = 0; i < result.path.length; i++) {
            const nodeId = result.path[i];
            const node = campusNodes[nodeId];

            const step = document.createElement("div");
            step.className = "step";

            const stepNumber = document.createElement("div");
            stepNumber.className = "step-number";
            stepNumber.textContent = i + 2;

            const stepText = document.createElement("div");
            stepText.className = "step-text";

            let distance = 0;
            if (i > 0) {
                const prevNodeId = result.path[i - 1];
                const prevNode = campusNodes[prevNodeId];
                distance = Math.round(map.distance(
                    [prevNode.lat, prevNode.lng],
                    [node.lat, node.lng]
                ));
            } else {
                distance = Math.round(map.distance(
                    currentPosition,
                    [node.lat, node.lng]
                ));
            }

            stepText.textContent = `Proceed to ${node.name}`;

            const stepInfo = document.createElement("div");
            stepInfo.style.fontSize = "0.8rem";
            stepInfo.style.color = "#666";
            stepInfo.style.marginTop = "5px";
            stepInfo.textContent = `${distance}m`;

            stepText.appendChild(stepInfo);
            step.appendChild(stepNumber);
            step.appendChild(stepText);
            stepsContainer.appendChild(step);
        }

        const destStep = document.createElement("div");
        destStep.className = "step";

        const destNumber = document.createElement("div");
        destNumber.className = "step-number";
        destNumber.textContent = result.path.length + 2;

        const destText = document.createElement("div");
        destText.className = "step-text";

        const lastNodeId = result.path[result.path.length - 1];
        const lastNode = campusNodes[lastNodeId];
        const finalDistance = Math.round(map.distance(
            [lastNode.lat, lastNode.lng],
            pathCoords[pathCoords.length - 1]
        ));

        destText.textContent = "You have reached your destination";

        const destInfo = document.createElement("div");
        destInfo.style.fontSize = "0.8rem";
        destInfo.style.color = "#666";
        destInfo.style.marginTop = "5px";
        destInfo.textContent = `${finalDistance}m`;

        destText.appendChild(destInfo);
        destStep.appendChild(destNumber);
        destStep.appendChild(destText);
        stepsContainer.appendChild(destStep);
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
