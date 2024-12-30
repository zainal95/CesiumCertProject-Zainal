 
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YTU2OTcxMC0wNzdmLTQyZDItOWVkNy0xZjU4NTgzYTVjNTUiLCJpZCI6NzI3Miwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0ODg2ODEwM30.Lc-IQBDSPyhqgPR2v-Ejcb34ksKJLr23mXsOhszBcHI';

viewer = new Cesium.Viewer('RIContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    baseLayerPicker: false,
    timeline: false,
    contextOptions: {
        webgl: { preserveDrawingBuffer: true }
    }, 
    animation: false,
    geocoder: true,
    homeButton: true,
    sceneModePicker: false, 
    navigationHelpButton: false, 
    fullscreenButton: false,
    mapProjection: new Cesium.GeographicProjection(Cesium.Ellipsoid.WGS84),
    selectionIndicator: false
});
 

$(document).ready(function() {
    var delayInMilliseconds = 500;  

    setTimeout(function() {
        var options = {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
            clampToGround: true
        };

        viewer.dataSources.add(Cesium.KmlDataSource.load('Data/Div_Culvert_Kuching.kml', options))
            .then(function(dataSource) { 
                const entities = dataSource.entities.values;
 
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];

                    if (entity.billboard) {  
                        entity.billboard.image = 'image/culvert.png'; // Set the new icon path
                        entity.billboard.scale = 1.5; // Adjust the scale (make it bigger)
                        entity.billboard.color = Cesium.Color.GRAY; //set color of the asset
                    }
                }

                viewer.flyTo(dataSource);
            }) 
    }, delayInMilliseconds);
 
});


viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (Cesium.defined(entity)) {
        
        console.log('selectedEntityChanged')   
        
        const descriptionHtml = entity._description._value;

        
        const $doc = $('<div>').html(descriptionHtml);

        
        const culvertNaValue = $doc.find('th:contains("Culvert_Na")').next('td').text().trim();

        if (culvertNaValue) {
            console.log('Culvert_Na:', culvertNaValue);
        } else {
            console.log('Culvert_Na not found.');
        }
        
        var data = fetchAssetData(entity,culvertNaValue) 
    }
});

function fetchAssetData(entity,assetId){
    event.preventDefault();
    $.ajax({
        url: "php/fetchData.php",
        type: "POST",
        dataType: "JSON",
        data: {
            functionName: "fetchAssetData", 
            assetId: assetId
        },
        success: (data) => {
            if (data.status === 'Success') { 
                
                showCustomPopup(entity, data.asset_data)
                
            } else {
                window.alert("Record not available.")
            }
        },

    });
    
}

function showCustomPopup(entity, data) { 
    var amendRow = `<tr><th>Condition</th><td> ${data.asset_condition || 'No data available.'}</td></tr></tbody>`

    let updated_Infobox_Detail = entity._description._value.replace('</tbody></table></div>', amendRow+'</tbody></table></div>');
    $('.cesium-infoBox-description-lighter').find('table tbody').append(amendRow)
    
    entity._description._value = updated_Infobox_Detail
}
 
$(document).ready(function () {
    const $modal = $('#modal');
    
    $('#closeModal').on('click', function () {
      $modal.fadeOut();  
    });
   
    $(window).on('click', function (e) {
      if ($(e.target).is($modal)) {
        $modal.fadeOut();
      }
    });
});

function  openModalAssetList(){
 
    $.ajax({
        url: "php/fetchData.php",
        type: "POST",
        dataType: "JSON",
        data: {
            functionName: "fetchAssetDataList" 
        },
        success: (data) => {
            if (data.status === 'Success') {
                const $modal = $('#modal');
                const $tableBody = $('#dataTable tbody');
        
                 
                $tableBody.empty();
          
                data.data.forEach(row => {
                    const tableRow = `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.Culvert_Na}</td>
                            <td>${row.layer}</td>
                            <td>${row.path}</td>
                            <td>${row.coordinates}</td>
                            <td>${row.asset_condition}</td>
                            <td><button class="fly-button" onClick="flyTo(this)" data-coordinates="${row.coordinates}">Fly To</button></td>
                            <td><button class="edit-button" onClick="editAsset(this)" data-id="${row.Culvert_Na}">Edit</button></td>
                        </tr>
                    `;
                    $tableBody.append(tableRow);
                });
        
                // Show the modal
                $modal.fadeIn();
            } else {
                window.alert("Record not available.");
            }
        },

    });
    
 
}

function flyTo(button) {
    
    const coordinates = button.getAttribute('data-coordinates');
    if (!coordinates) {
        console.error('Coordinates are missing');
        return;
    }

    const [longitude, latitude, height = 0] = coordinates.split(',').map(Number);

    if (typeof viewer === 'undefined') {
        console.error('Cesium viewer is not defined');
        return;
    }

    // Slightly increase the height to zoom out a bit
    const zoomedOutHeight = height + 500; // Adjust this value as needed

    // Fly to the specified coordinates
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, zoomedOutHeight)
    });
}



function receiveDataFromPopup(data) {
    console.log("Data received from popup:", data); 
    openModalAssetList()
}

function editAsset(button){ 
    event.preventDefault();
 
    const assetId = button.dataset.id;
 
    const url = `editAsset.html?asset_id=${assetId}`;
     
    window.open(url, '_blank', 'width=800,height=600');
}

$(document).ready(function () {
    $('#searchField').on('keyup', function () {
        const value = $(this).val().toLowerCase();
        $('#dataTable tbody tr').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
});