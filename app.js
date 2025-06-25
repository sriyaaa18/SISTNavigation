// Main application logic
let map;
let directionsService;
let directionsRenderer;
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

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: MAP_CONFIG.DEFAULT_LOCATION,
        zoom: MAP_CONFIG.ZOOM_LEVEL,
        mapId: MAP_CONFIG.MAP_ID,
        gestureHandling: "greedy",
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ["roadmap", "satellite", "hybrid"]
        },
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: true,
        tilt: 45,
        heading: 0
    });
    
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#4E0911',
            strokeOpacity: 0.8,
            strokeWeight: 6
        },
        preserveViewport: true
    });
    
    destinationMarker = new google.maps.Marker({
        position: MAP_CONFIG.DEFAULT_LOCATION,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4E0911',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        },
        title: "SIST Campus",
        optimized: false,
        zIndex: 1000
    });
    
    accuracyCircle = new google.maps.Circle({
        strokeColor: '#2c7be5',
        strokeOpacity: 0.4,
        strokeWeight: 1,
        fillColor: '#2c7be5',
        fillOpacity: 0.2,
        map: map,
        center: MAP_CONFIG.DEFAULT_LOCATION,
        radius: 0,
        visible: false,
        zIndex: 999
    });
    
    locateUserWithRetry(3);
    setupEventListeners();
    initDeviceOrientation();
}

function initDeviceOrientation() {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.getElementById("locateBtn").addEventListener('click', async function() {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleDeviceOrientation);
                }
            } catch (e) {
                console.log('Device orientation permission denied');
            }
        });
    } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
}

function handleDeviceOrientation(event) {
    if (event.webkitCompassHeading) {
        headingSource = 'compass';
        updateMarkerHeading(event.webkitCompassHeading);
    } else if (event.absolute && event.alpha !== null) {
        headingSource = 'orientation';
        updateMarkerHeading(360 - event.alpha);
    }
}

function updateMarkerHeading(heading) {
    if (userMarker) {
        userMarker.setIcon({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            rotation: heading,
            fillColor: '#2c7be5',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            anchor: new google.maps.Point(0, 0)
        });
    }
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
        function(position) {
            handleNewPosition(position, true);
            locateBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
            setTimeout(() => {
                if (!isTracking) {
                    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                }
            }, 2000);
        },
        function(error) {
            console.error('Geolocation error:', error);
            if (currentAttempt < retries) {
                const delay = Math.pow(2, currentAttempt) * 500;
                setTimeout(() => {
                    locateUserWithRetry(retries, currentAttempt + 1);
                }, delay);
            } else {
                locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                alert("Unable to get your location. Please ensure location services are enabled.");
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
        function(position) {
            handleTrackingPosition(position);
        },
        function(error) {
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
        function(position) {
            handleTrackingPosition(position);
        },
        function(error) {
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
        function(position) {
            handleTrackingPosition(position);
        },
        function(error) {
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
    accuracyCircle.setVisible(false);
    document.getElementById("accuracyContainer").style.display = "none";
}

function handleNewPosition(position, isSingleUpdate = false) {
    const now = Date.now();
    
    if (lastKnownPosition && now - lastUpdateTime < 1000 && 
        position.coords.accuracy > lastKnownPosition.coords.accuracy) {
        return;
    }
    
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    currentPosition = { lat: userLat, lng: userLng };
    
    accuracyCircle.setCenter(currentPosition);
    accuracyCircle.setRadius(position.coords.accuracy);
    accuracyCircle.setVisible(true);
    
    if (userMarker) {
        userMarker.setPosition(currentPosition);
        
        const heading = position.coords.heading || 
                      (headingSource === 'compass' ? position.coords.heading : null);
        
        if (heading && !isNaN(heading)) {
            userMarker.setIcon({
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                rotation: heading,
                fillColor: '#2c7be5',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                anchor: new google.maps.Point(0, 0)
            });
        }
    } else {
        userMarker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            icon: {
                path: position.coords.heading ? 
                    google.maps.SymbolPath.FORWARD_CLOSED_ARROW : 
                    google.maps.SymbolPath.CIRCLE,
                scale: position.coords.heading ? 6 : 8,
                rotation: position.coords.heading || 0,
                fillColor: '#2c7be5',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            title: "Your Location",
            optimized: false,
            zIndex: 1001
        });
    }
    
    if (lastKnownPosition) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(lastKnownPosition.coords.latitude, lastKnownPosition.coords.longitude),
            new google.maps.LatLng(currentPosition.lat, currentPosition.lng)
        );
        
        if (distance > 2) {
            map.panTo(currentPosition);
        }
    } else {
        map.panTo(currentPosition);
    }
    
    if (directionsRenderer.getDirections()) {
        calculateRoute();
    }
    
    lastKnownPosition = position;
    lastUpdateTime = now;
    
    document.getElementById("locationTitle").textContent = "Your Location";
    document.getElementById("locationSubtitle").textContent = 
        `Accuracy: ±${Math.round(position.coords.accuracy)} meters`;
}

function calculateRoute() {
    const destinationSelect = document.getElementById("destination");
    const end = destinationSelect.value;
    
    if (!currentPosition) {
        alert("Please enable live tracking first for accurate routing");
        return;
    }
    
    if (end === "Select Destination") {
        return;
    }
    
    const coords = end.split(",");
    const destination = new google.maps.LatLng(
        parseFloat(coords[0]), 
        parseFloat(coords[1])
    );
    
    const request = {
        origin: currentPosition,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
        avoidFerries: true,
        avoidHighways: true,
        avoidTolls: true,
        optimizeWaypoints: true
    };
    
    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            showDirectionsSteps(result, destinationSelect.options[destinationSelect.selectedIndex].text);
            
            const endLocation = result.routes[0].legs[0].end_location;
            destinationMarker.setPosition(endLocation);
            
            document.getElementById("locationTitle").textContent = 
                destinationSelect.options[destinationSelect.selectedIndex].text;
            document.getElementById("locationSubtitle").textContent = 
                "Route calculated - " + result.routes[0].legs[0].distance.text + 
                " (" + result.routes[0].legs[0].duration.text + ")";
        } else {
            alert("Could not display directions: " + status);
        }
    });
}

function showDirectionsSteps(directionsResult, destinationName) {
    const stepsContainer = document.getElementById("stepsContainer");
    stepsContainer.innerHTML = "";
    
    const route = directionsResult.routes[0];
    const legs = route.legs;
    
    legs.forEach(function(leg, legIndex) {
        leg.steps.forEach(function(step, stepIndex) {
            const stepElement = document.createElement("div");
            stepElement.className = "step";
            
            const stepText = document.createElement("div");
            stepText.className = "step-text";
            stepText.textContent = stripHtml(step.instructions);
            
            const stepNumber = document.createElement("div");
            stepNumber.className = "step-number";
            stepNumber.textContent = stepIndex + 1;
            
            stepElement.appendChild(stepNumber);
            stepElement.appendChild(stepText);
            
            const stepInfo = document.createElement("div");
            stepInfo.style.fontSize = "0.8rem";
            stepInfo.style.color = "#666";
            stepInfo.style.marginTop = "5px";
            stepInfo.textContent = `${step.distance.text} (${step.duration.text})`;
            
            stepText.appendChild(stepInfo);
            
            stepsContainer.appendChild(stepElement);
        });
    });
    
    if (destinationName === "Startup cell") {
        const floorNote = document.createElement("div");
        floorNote.className = "floor-note";
        floorNote.innerHTML = `
            <strong>Note:</strong> The Startup Cell is located on the <strong>2nd floor</strong> of the Aeronautical Department building. 
            After reaching the building, take the stairs or elevator to the 2nd floor.
        `;
        stepsContainer.appendChild(floorNote);
    }
}

function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
    document.getElementById("backBtn").addEventListener("click", function() {
        alert("Navigating back to selection page");
    });
    
    document.getElementById("destination").addEventListener("change", function() {
        if (this.value !== "Select Destination" && currentPosition) {
            calculateRoute();
        }
    });
}

window.initMap = initMap;