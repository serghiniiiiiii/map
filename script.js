var activeCoordinates = true;
var drawInteraction;
var drawLayer;


//creat map with sateliite layer 

var map = new ol.Map({ // new map (using open layers)
    target: 'map',// id map in html
    layers: [ // this is an array for control the layers
        
        new ol.layer.Tile({ // add the tile layer
            source: new ol.source.XYZ({// source of the tile layer
                url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}@2x.jpg",
            })
        })
    ],
    view: new ol.View({            // control map view          
        center: ol.proj.fromLonLat([0, 0]), //  ol.proj.fromLonLat ==> control the translite the longtitude and latitude to coorinates ||||  ([0, 0]) ===> control the position                              
        zoom: 1 
    })
});



// Create a vector source
var vectorSource = new ol.source.Vector();  // package to store the geography data






var vectorLayer = new ol.layer.Vector({   //  display the package
    source: vectorSource
});
map.addLayer(vectorLayer); // add the vector layer in map





var coordinateOverlay = new ol.Overlay({ // package to store html element and desplay it in the map
    element: document.getElementById('coordinate-info') // specify the HTML element that will be used as the content of the overlay. 
});
map.addOverlay(coordinateOverlay);  // add the coorniateOverlay in the map( above )

var clickEventListener; // Variable to store the click event listener
var displayingCoordinates = false; // Variable to track if coordinates are currently being displayed





function coordonitedfunction() {
    if (!displayingCoordinates) { // now the displayingCoordinates will be true
        clickEventListener = function(event) { // this it work when i click in map
            if (activeCoordinates) {   
                var storecoordinate = event.coordinate; // when click in the map the coordinate in this point will be stored in storecoordinate

                var lonLat = ol.proj.toLonLat(storecoordinate); // translet the geographiy coordinate to altutide and longtitude coordinate

                var Coordinate = ol.proj.transform(storecoordinate, 'EPSG:3857', 'EPSG:4326'  ); // Web Mercator ||  translet the coordinated from EPSG:3857 to EPSG:4326
                
                var content =  "X: " + lonLat[0].toFixed(6) +  '<br>' +' Y : ' + lonLat[1].toFixed(6) 
               
        
                coordinateOverlay.getElement().innerHTML = content;
                coordinateOverlay.setPosition(storecoordinate); 
                
                
                // Add a point feature at the clicked location
                var point = new ol.Feature({ // add new feature
                    geometry: new ol.geom.Point(storecoordinate) // add the spicify feature
                });
                vectorSource.addFeature(point); // Add feature to the vector source
            }
        };



        map.on('click', clickEventListener);
        document.getElementById('scroll-info1').innerHTML = "back"; // Change button text to "Back"
        displayingCoordinates = true; // Update state to indicate coordinates are being displayed
    } 
    
    else {
        map.un('click', clickEventListener);
        coordinateOverlay.setPosition(undefined); // Remove overlay from the map
        document.getElementById('scroll-info1').innerHTML = "Show Coordinate"; // Change button text to "Show Coordinate"
        displayingCoordinates = false; // Update state to indicate coordinates are not being displayed
    }
}

document.getElementById('scroll-info1').addEventListener('click', coordonitedfunction);


function toggleDrawing() {  
    var toggleButton = document.getElementById('toggleButton');
    if (drawInteraction) { // check  if this variable drawInteraction defined or undifined 
        map.removeInteraction(drawInteraction); // add the  interaction who be removed between () || map.removeInteraction this remove the interaction in map
        drawInteraction = undefined; 
        toggleButton.classList.remove('active'); // Remove 'active' class || it like clicked
        toggleButton.innerHTML = "Toggle Drawing";
        map.getTargetElement().style.cursor = ''; // translet the cursor style to normal state
    } else {
        drawInteraction = new ol.interaction.Draw({ // allowed you to draw the shape you want
            source: drawLayer.getSource(), // source be used to get the data from open layer to show it
            type: 'Polygon', // type the  geography shape 
            style: new ol.style.Style({ // used to specify how to be show the shape in map
                fill: new ol.style.Fill({ // control the style of the shape
                    color: 'rgba(255, 0, 0, 0.5)' 
                }),
                stroke: new ol.style.Stroke({ // To specify the border properties  of the geometry shape 
                    color: 'red', 
                    width: 2
                })
            })
        });

        // when click the toggle button that what will be happen
        drawInteraction.on('drawstart', function(event) {
            toggleButton.innerHTML = "Drawing..."; 
            map.getTargetElement().style.cursor = 'pointer'; 
        });

        // Listen for 'drawend' event to calculate and display the surface area when drawing is finished
        drawInteraction.on('drawend', function(event) {
            var geometry = event.feature.getGeometry(); // get the shape the alreaday drawing 
            var area = geometry.getArea(); // calculate the area in square meters (m²)

            // Display the surface area
            var surfaceAreaInSquareMeters = area.toFixed(2) + ' m²';
            alert('Surface area of the drawn polygon: ' + surfaceAreaInSquareMeters);

            toggleButton.classList.add('active'); // Add 'active' class to button
            toggleButton.innerHTML = "Drawing Finished"; 
            map.getTargetElement().style.cursor = 'pointer'; 
            toggleButton.focus(); // Set focus on the button for accessibility Keyboard like enter
        });

        map.addInteraction(drawInteraction); // add the draw like before
        toggleButton.classList.add('active'); // Add 'active' class
        toggleButton.innerHTML = "Drawing..."; 
        map.getTargetElement().style.cursor = 'pointer'; 
    }
}



document.getElementById('toggleButton').addEventListener('click', toggleDrawing);
// stored the shapes in layer and add it in map and show it
drawLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});
map.addLayer(drawLayer);

function removeDrawing() {
     // delete any shapes in the  source of the vector
     vectorSource.clear();

     
     drawLayer.getSource().clear(); // delete any shapes in source of drawLayer
     coordinateOverlay.setPosition(undefined); // unabel the  coordinate in the map

     // Update state variables
     isLocating = false; // unable the place it serach of coordinate inpute
     displayingCoordinates = false; // unable the coordinate on showing
  
}

document.getElementById('removeDrawingButton').addEventListener('click', removeDrawing);

// Function to reset map to initial view 
function resetMap() {
    map.getView().animate({ center: ol.proj.fromLonLat([0, 0]), zoom: 2 }); // getView() control the  move of the map
}

// Event listener for input changes
document.getElementById('searchInput').addEventListener('input', function(event) {
    var searchQuery = event.target.value.trim(); // get the value from searchInput 
    if (searchQuery === '') {
        resetMap(); // Reset map if search input is empty
    }
});





// Function to handle search
function search() {
    var query = document.getElementById('searchInput').value;
    var url = 'https://nominatim.openstreetmap.org/search?q=' + query + '&format=json'; // search about the value and translet to forme json 
    

  
    
    fetch(url) // get the url
        .then(response => response.json()) // when promise done translet the fetch response to  json response and translet it to js
        .then(data => { // the data become the store of the js response
            if (data.length > 0) {
                var result = data[0]; // show the index 0
                var lon = parseFloat(result.lon); // get longtutide to index 0
                var lat = parseFloat(result.lat); // get latutide to index 0

                map.getView().animate({ center: ol.proj.fromLonLat([lon, lat]), zoom: 10}); 
                

            } else {
                alert('No results found');
            }
        }) 
}




document.getElementById('toggleButton').addEventListener('click', function() {
    
    this.classList.toggle('clicked');
});

document.getElementById('scroll-info1').addEventListener('click', function() {
   
    this.classList.toggle('clicked');
});









// tracking user location 

var geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true
    },
    projection: map.getView().getProjection()
});

var positionFeature = new ol.Feature();

var positionLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [positionFeature]
    }),
    style: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
    })
});

map.addLayer(positionLayer);

var isLocating = false; // Variable to track if user location is being tracked

document.getElementById('locate').onclick = function() {
    if (!isLocating) {
        geolocation.setTracking(true); // Start tracking user location
        geolocation.once('change:position', function() {
            var pos = geolocation.getPosition();
            positionFeature.setGeometry(new ol.geom.Point(pos));
            map.getView().animate({
                center: pos,
                zoom: 17,
                duration: 3000
            });
        });
        isLocating = true; // Update state to indicate tracking is on
        this.classList.add('clicked'); // Add 'clicked' class to button
    } else {
        geolocation.setTracking(false); // Stop tracking user location
        positionFeature.setGeometry(null); // Clear user location feature
        isLocating = false; // Update state to indicate tracking is off
        this.classList.remove('clicked'); // Remove 'clicked' class from button
    }
};
// Function to handle showing the location on the map based on user input coordinates
function showLocation() {
    var xCoordinate = parseFloat(document.getElementById('xCoordinateInput').value);
    var yCoordinate = parseFloat(document.getElementById('yCoordinateInput').value);

    if (!isNaN(xCoordinate) && !isNaN(yCoordinate)) {
        var coordinates = ol.proj.fromLonLat([xCoordinate, yCoordinate]);
        map.getView().animate({ center: coordinates, zoom: 12 });
        
        // Add a marker at the entered coordinates
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(coordinates)
        });

        var markerStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/latest/examples/data/icon.png' // Icon URL
            })
        });

        marker.setStyle(markerStyle);

        // Clear existing markers
        vectorSource.clear();

        // Add the new marker to the vector source
        vectorSource.addFeature(marker);
    } else {
        alert("Please enter valid coordinates.");
    }
}

// Add event listener to the "Show" button
document.getElementById('showLocationButton').addEventListener('click', showLocation);