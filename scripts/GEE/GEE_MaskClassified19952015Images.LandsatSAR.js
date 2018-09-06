/* 
 * This script overlays masks over the classified 1995 and 2015 images to extract the Tanintharyi Region, Myanmar only.
 * The classified images used are the mode filtered images (kernel size=1 or 3x3 window size).
 *
 */

/******************************* 
  DEFINE EXTENT AND VIEW
********************************/

// Set center of map view
Map.setCenter(98.64212,12.40975, 11); // Zoom in and center display to Tanintharyi Region, Myanmar

// Define and display box extents covering Tanintharyi region
var box = ee.Geometry.Rectangle(97.0,16.0, 100.0,9.0);


/*******************************
  LOAD DATASETS
********************************/

// Load classified images of Tanintharyi Region, Myanmar
var classified1995 = ee.Image('users/dondealban/Classification/Tanintharyi/Classification_Mode_SetA_1995_LJ_30m_RF_9CL'); // 1995
var classified2015 = ee.Image('users/dondealban/Classification/Tanintharyi/Classification_Mode_SetA_2015_LP_30m_RF_9CL'); // 2015

// Change land cover class values
var filtered1995 = classified1995.add(1);
var filtered2015 = classified2015.add(1);

// Load the Hansen et al. global forest cover change dataset
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015').clip(box);

// Select the land/water mask
var datamask = gfcImage.select('datamask');

// Create a binary mask
var maskWater = datamask.eq(1);

// Mask out water areas from the classified mode images with the mask layer
var masked1995 = filtered1995.updateMask(maskWater);
var masked2015 = filtered2015.updateMask(maskWater);

// Load GADM administrative boundary data
var boundaryMMR = ee.FeatureCollection('ft:1fduZV31IxXJUzdFpbJQR6LLYNR9yZ5_GjlSdjwUD'); // Fusion table: tanintharyi_gadm_adm2_rev2.shp
var boundaryTNI = boundaryMMR.filter(ee.Filter.eq('NAME_1', 'Tanintharyi')); // Define Tanintharyi boundary layer

// Create a mask using administrative boundary layer
var maskBoundary = ee.Image.constant(0).uint8();
maskBoundary = maskBoundary.paint(boundaryTNI, 1);

// Mask areas outside Taninintharyi Region
var masked1995tni = filtered1995.updateMask(maskBoundary);
var masked2015tni = filtered2015.updateMask(maskBoundary);


/*******************************
  DISPLAY LAYERS
********************************/

Map.addLayer(boundaryTNI,  {'color': '000000'}, 'Tanintharyi', true); // Black color boundary 


// Create a palette for displaying the classified images
var palette = ['000000', '246a24', '6666ff', 'ff8000', 'ff00ff', 'ccff66', 'a65400', 'ff0000', 'ffff66', '66ccff'];

// Display classified mode image (no masks applied)
Map.addLayer(filtered1995,  {min: 0, max: 9, palette: palette}, '1995 Classified Mode', false);
Map.addLayer(filtered2015,  {min: 0, max: 9, palette: palette}, '2015 Classified Mode', false);

// Display classified mode image (water areas masked)
Map.addLayer(masked1995,  {min: 0, max: 9, palette: palette}, '1995 Masked', false);
Map.addLayer(masked2015,  {min: 0, max: 9, palette: palette}, '2015 Masked', false);

// Display classified mode image (water areas and areas outside of Tanintharyi masked)
Map.addLayer(masked1995tni,  {min: 0, max: 9, palette: palette}, '1995 TNI Masked', false);
Map.addLayer(masked2015tni,  {min: 0, max: 9, palette: palette}, '2015 TNI Masked', false);

// Define classification legend
var colors = ['000000', '246a24', '6666ff', 'ff8000', 'ff00ff', 'ccff66', 'a65400', 'ff0000', 'ffff66', '66ccff'];
var names = ["No data",
             "Forest",
             "Mangrove",
             "Oil palm (mature)",
             "Rubber (mature)",
             "Shrub/orchard",
             "Rice paddy",
             "Built-up area",
             "Bare soil/ground",
             "Water"];
var legend = ui.Panel({style: {position: 'bottom-left'}});
legend.add(ui.Label({
  value: "Land Cover Classification",
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 4px 0',
    padding: '0px'
  }
}));

// Iterate classification legend entries
var entry;
for (var x = 0; x<10; x++){
  entry = [
    ui.Label({style:{color:colors[x],margin: '0 0 4px 0'}, value: '██'}),
    ui.Label({
      value: names[x],
      style: {
        margin: '0 0 4px 4px'
      }
    })
  ];
  legend.add(ui.Panel(entry, ui.Panel.Layout.Flow('horizontal')));
}

// Display classification legend
Map.add(legend);


/*******************************
  EXPORT CLASSIFIED IMAGES
********************************/

// Masked classified mode images for combined Landsat+SAR (water areas masked)

Export.image(masked1995.uint8(), 'Masked_Classified_SetA_1995_LJ_30m_RF_9CL', {
  region: masked1995.geometry(),
  scale: 30,
  maxPixels: 300000000,
  });
Export.image(masked2015.uint8(), 'Masked_Classified_SetA_2015_LP_30m_RF_9CL', {
  region: masked2015.geometry(),
  scale: 30,
  maxPixels: 300000000,
  });
  
// Masked classified mode images for combined Landsat+SAR (water and areas outside Tanintharyi masked)

Export.image(masked1995tni.uint8(), 'TNI_Masked_Classified_SetA_1995_LJ_30m_RF_9CL', {
  region: masked1995tni.geometry(),
  scale: 30,
  maxPixels: 300000000,
  });
Export.image(masked2015tni.uint8(), 'TNI_Masked_Classified_SetA_2015_LP_30m_RF_9CL', {
  region: masked2015tni.geometry(),
  scale: 30,
  maxPixels: 300000000,
  });

