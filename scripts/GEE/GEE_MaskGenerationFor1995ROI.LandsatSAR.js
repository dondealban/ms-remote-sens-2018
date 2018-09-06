/* 
 * This script creates a mask for delineating mature oil palm and rubber plantations in the 1995 image dataset. The mask
 * was developed through backscatter/reflectance analysis of the image statistics of 2015 ROIs by plotting distributions
 * using ggplot2 package in R software. The analysis led to the selection of image layers that provide areas where oil
 * palm and rubber may be delineated. The thresholds used for each image layer were determined by developing a decision
 * tree using the tree package in R software.
 *
 */


/*******************************
  DEFINE EXTENT AND VIEW
********************************/

// Set center of map view
Map.setCenter(98.64212,12.40975,11); // Zoom in and center display to Taninintharyi Region, Myanmar

// Define and display box extents covering Tanintharyi region
var box = ee.Geometry.Rectangle(97.0,16.0, 100.0,9.0);


/*******************************
  LOAD DATASETS
********************************/

// Note: For this final script, 1995 images were used for the delineation of possible oil palm and rubber plantation
// Regions of Interest.

// Landsat

// Select Landsat bands
var bands1995 = ['B3', 'B4', 'B5'];

// Create median-pixel composites of Landsat images
var landsat1995 = ee.ImageCollection('LANDSAT/LT5_L1T_TOA_FMASK').filterDate('1995-01-01', '1995-04-30').select(bands1995);
var median1995 = landsat1995.median();

// Clip Landsat images within box extents
var clip1995 = median1995.clip(box);

// Select Landsat bands from clipped image
var clippedB3 = clip1995.select('B3');
var clippedB4 = clip1995.select('B4');
var clippedB5 = clip1995.select('B5');

// ALOS/PALSAR

// Load PALSAR image assets
var hh1995s = ee.Image('users/dondealban/Tanintharyi/Tanintharyi_1995_JERS1_HH_Sigma0'); // 1995 HH polarisation Sigma0

// Rename band filenames in metadata
hh1995s = hh1995s.rename('HH');


/*******************************
  RECLASSIFY IMAGES 
********************************/

// Level 1: HH
var rangeL1 = hh1995s.gte(-11.2758).and(hh1995s.lt(-4.13755));
//var imageL1 = hh1995s.where(rangeL1.eq(1), 1).mask(rangeL1);
var imageL1 = hh1995s.where(rangeL1.eq(0), 0).where(rangeL1.eq(1), 1);

// Level 2: B3 (RED)
var rangeL2 = clippedB3.gte(0.0597148).and(clippedB4.lt(0.092273));
//var imageL2 = clippedB3.where(rangeL2.eq(1), 1).mask(rangeL2);
var imageL2 = clippedB3.where(rangeL2.eq(0), 0).where(rangeL2.eq(1), 1);

// Level 3: B4 (NIR)
var rangeL3 = clippedB4.gte(0.273733);
//var imageL3 = clippedB4.where(rangeL3.eq(1), 1).mask(rangeL3);
var imageL3 = clippedB4.where(rangeL3.eq(0), 0).where(rangeL3.eq(1), 1);

// Level 4: B5 (SWIR1)
var rangeL4 = clippedB5.gte(0.167187);
var imageL4o = clippedB5.where(rangeL4.eq(0), 1).where(rangeL4.eq(1), 0);
var imageL4r = clippedB5.where(rangeL4.eq(0), 0).where(rangeL4.eq(1), 1);

// Final mask for oil palm and rubber plantations

// Note: level 2 was excluded from the final mask since all land areas were masked in that level

var finalMaskOPM = imageL1.multiply(imageL3).multiply(imageL4o);
var finalMaskRBM = imageL1.multiply(imageL3).multiply(imageL4r);


/*******************************
  DISPLAY RGB COMPOSITES
********************************/

Map.addLayer(clip1995, {bands: ['B5', 'B4', 'B3'], min: 0, max: 0.3}, 'RGB 1995 Landsat', false);
Map.addLayer(hh1995s, {min: -18.8356, max: -3.64452}, 'HH 1995 JERS1', false);

Map.addLayer(imageL1,  {'palette': '000000, ffffff'}, 'Mask HH',  false);
Map.addLayer(imageL2,  {'palette': '000000, ffffff'}, 'Mask B3',  false);
Map.addLayer(imageL3,  {'palette': '000000, ffffff'}, 'Mask B4',  false);
Map.addLayer(imageL4o, {'palette': '000000, ffffff'}, 'Mask B5o', false);
Map.addLayer(imageL4r, {'palette': '000000, ffffff'}, 'Mask B5r', false);


// Define styled layer descriptors of discrete intervals to apply to final mask
var sld_finalMask =
'<RasterSymbolizer>' +
  '<ColorMap type="intervals" extended="false">' +
    '<ColorMapEntry color="#0000ff" quantity="0"  label="Excluded" />' +
    '<ColorMapEntry color="#00ff00" quantity="1"  label="Included" />' +
  '</ColorMap>' +
'</RasterSymbolizer>';

// Display mask
Map.addLayer(finalMaskOPM.sldStyle(sld_finalMask), {}, 'Final Mask OPM', true);
Map.addLayer(finalMaskRBM.sldStyle(sld_finalMask), {}, 'Final Mask RBM', true);
