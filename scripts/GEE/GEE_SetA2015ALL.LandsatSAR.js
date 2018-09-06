/* 
 * This script executes an image classification procedure on a 2015 image stack consisting of the following datasets:
 *
 * Landsat-8, comprised of 7 bands and 5 indices (total = 12)
 * ALOS/PALSAR-2, comprised of 1 polarisation and 8 GLCM texture measures (total = 9)
 *
 * Note that the Landsat images consist of a cloud-masked 2015-2016 composite. The PALSAR mosaic tiles were pre-
 * processed using ESA SNAP Toolbox software, which included mosaciking individual tiles into a regional mosaic, speckle
 * filtering, and calculating normalised radar cross-section.
 *
 * The GLCM texture measures were computed from the HH sigma0 channel of the PALSAR images (to match with HH channel
 * of JERS-1 data. For the single polarisation channel, 8 texture measures were computed using a 3x3 kernel (note:
 * kernel size=1 was used to facilitate computation in Google Earth Engine). The list of texture measures that were
 * computed include:
 *
 * ASM: angular second moment
 * CONTRAST: contrast
 * CORR: correlation
 * DISS: dissimilarity
 * ENT: entropy
 * IDM: inverse difference moment (or homogeneity)
 * SAVG: sum average
 * VAR: variance
 *
 * In addition, indices from the raw dual-polarised PALSAR images were computed including: HH/HV ratio, HV/HH ratio,
 * average, difference, normalised difference index, and NL index.
 *
 * A total of 21 layers were classified using Random Forest (RF) algorithm with 9 land cover types found in
 * Tanintharyi, Myanmar. Accuracy assessments were done, of which overall accuracy, the error matrix, Kappa statistic,
 * consumer's and producer's accuracies, and F1 score were computed. 
 *
 */

/*******************************
  DEFINE RANDOM SEED
********************************/

var seed = 2018;


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

// LANDSAT

// Load Landsat image assets
var tni2015top = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_2015_Landsat_TOP'); 
var tni2015mid = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_2015_Landsat_MID'); 
var tni2015low = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_2015_Landsat_LOW'); 

// Mosaic Landsat image assets
var composite2015 = ee.ImageCollection([tni2015top, tni2015mid, tni2015low]).mosaic()
                                      .select([0,1,2,3,4,5,6,7],['B2', 'B3', 'B4', 'B5', 'B6', 'B10', 'B7', 'YR']);

// Calculate indices from Landsat bands
var ndvi2015 = composite2015.normalizedDifference(['B5', 'B4']); // Normalised Difference Vegetation Index (NDVI)
var lswi2015 = composite2015.normalizedDifference(['B5', 'B6']); // Land Surface Water Index (LSWI)
var ndti2015 = composite2015.normalizedDifference(['B6', 'B7']); // Normalised Difference Till Index (NDTI)
var stvi2015 = composite2015.expression('((b("B6") - b("B4")) / (b("B6") + b("B4") + 0.1)) * (1.1 - (b("B7") / 2))'); // Soil-Adjusted Total Vegetation Index (SATVI)
var evi2015  = composite2015.expression('2.5 * ((b("B5") - b("B4")) / (b("B5") + 6 * b("B4") - 7.5 * b("B2") + 1))'); // Enhanced Vegetation Index

// ALOS/PALSAR

// Load PALSAR image assets
var hh2015r = ee.Image('users/dondealban/Tanintharyi/Tanintharyi_2015_PALSAR_HH'); // 2015 HH polarisation Raw
var hh2015s = ee.Image('users/dondealban/Tanintharyi/Tanintharyi_2015_PALSAR_HH_Sigma0'); // 2015 HH polarisation Sigma0

// Rescale floating point to integer
var scaledhh2015 = hh2015s.expression('1000*b("b1")').int32();

// Rename rescaled Sigma0 channels
scaledhh2015 = scaledhh2015.rename('HH');

// Calculate GLCM texture measures
var textureMeasures = ['HH_asm', 'HH_contrast', 'HH_corr', 'HH_var', 'HH_idm', 'HH_savg', 'HH_ent', 'HH_diss'];
var glcm2015 = scaledhh2015.glcmTexture({size: 1, average: true }).select(textureMeasures);  // 3x3 kernel


/*******************************
  CREATE COMPOSITE STACK
********************************/

// Rename band filenames in metadata
ndvi2015 = ndvi2015.rename('NDVI');
lswi2015 = lswi2015.rename('LSWI');
ndti2015 = ndti2015.rename('NDTI');
stvi2015 = stvi2015.rename('SATVI');
evi2015 = evi2015.rename('EVI');
hh2015s = hh2015s.rename('HH');


// Create image collection from images
var stackCombined2015 = composite2015.addBands(ndvi2015).addBands(lswi2015).addBands(ndti2015).addBands(stvi2015).addBands(evi2015)
                                     .addBands(hh2015s).addBands(glcm2015);
var bandsCombined = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'NDVI', 'LSWI', 'NDTI', 'SATVI', 'EVI',
                     'HH', 'HH_asm', 'HH_contrast', 'HH_corr', 'HH_var', 'HH_idm', 'HH_savg', 'HH_ent', 'HH_diss'];

var stackLandsat2015 = composite2015.addBands(ndvi2015).addBands(lswi2015).addBands(ndti2015).addBands(stvi2015).addBands(evi2015);
var bandsLandsat = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'NDVI', 'LSWI', 'NDTI', 'SATVI', 'EVI'];

var stackSAR2015 = hh2015s.addBands(glcm2015);
var bandsSAR = ['HH', 'HH_asm', 'HH_contrast', 'HH_corr', 'HH_var', 'HH_idm', 'HH_savg', 'HH_ent', 'HH_diss'];


/*******************************
  DEFINE REGIONS OF INTEREST
********************************/

// Merge regions of interest
var tanintharyiROI = Forest.merge(Mangrove).merge(PalmOilMature).merge(RubberMature).merge(ShrubOrchard)
                           .merge(RicePaddy).merge(BuiltUp).merge(BareSoil).merge(Water);

// Initialise random column and values for ROI feature collection 
tanintharyiROI = tanintharyiROI.randomColumn('random1', seed);

var train = tanintharyiROI.filter(ee.Filter.lte('random1', 0.7));
var test  = tanintharyiROI.filter(ee.Filter.gt('random1', 0.7));

Map.addLayer(train, {'color': '000000'}, 'ROI Train', true); 
Map.addLayer(test,  {'color': 'FF0000'}, 'ROI Test', true); 

// Initialise random column and values for ROI feature collection 
train = train.randomColumn('random', seed);
test  = test.randomColumn('random', seed);

// Create training ROIs from the image dataset
var roiTrainCombined = stackCombined2015.select(bandsCombined).sampleRegions({
	collection: train,
	properties: ['ClassID', 'random'],
	scale: 30
});
var roiTrainLandsat = stackLandsat2015.select(bandsLandsat).sampleRegions({
	collection: train,
	properties: ['ClassID', 'random'],
	scale: 30
});
var roiTrainSAR = stackSAR2015.select(bandsSAR).sampleRegions({
	collection: train,
	properties: ['ClassID', 'random'],
	scale: 25
});

// Create testing ROIs from the image dataset
var roiTestCombined = stackCombined2015.select(bandsCombined).sampleRegions({
	collection: test,
	properties: ['ClassID', 'random'],
	scale: 30
});
var roiTestLandsat = stackLandsat2015.select(bandsLandsat).sampleRegions({
	collection: test,
	properties: ['ClassID', 'random'],
	scale: 30
});
var roiTestSAR = stackSAR2015.select(bandsSAR).sampleRegions({
	collection: test,
	properties: ['ClassID', 'random'],
	scale: 25
});

// Partition the regions of interest into training and testing areas
var trainingCombined = roiTrainCombined.filter(ee.Filter.lte('random', 0.7));
var trainingLandsat = roiTrainLandsat.filter(ee.Filter.lte('random', 0.7));
var trainingSAR = roiTrainSAR.filter(ee.Filter.lte('random', 0.7));
var testingCombined = roiTestCombined.filter(ee.Filter.lte('random', 0.7));
var testingLandsat = roiTestLandsat.filter(ee.Filter.lte('random', 0.7));
var testingSAR = roiTestSAR.filter(ee.Filter.lte('random', 0.7));

// Print number of regions of interest for training and testing at the console 
print('Training, Combined, n =', trainingCombined.aggregate_count('.all'));
print('Testing, Combined, n =', testingCombined.aggregate_count('.all'));
print('Training, Landsat, n =', trainingLandsat.aggregate_count('.all'));
print('Testing, Landsat, n =', testingLandsat.aggregate_count('.all'));
print('Training, SAR, n =', trainingSAR.aggregate_count('.all'));
print('Testing, SAR, n =', testingSAR.aggregate_count('.all'));


/*******************************
  EXECUTE CLASSIFICATION
********************************/

// COMBINED LANDSAT+SAR 

// Classification using Random Forest algorithm
var classifierCombined = ee.Classifier.randomForest(100,0,10,0.5,false,seed).train({
  features: trainingCombined.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'NDVI', 'LSWI', 'NDTI', 'SATVI', 'EVI',
                                     'HH', 'HH_asm', 'HH_contrast', 'HH_corr', 'HH_var', 'HH_idm', 'HH_savg', 'HH_ent', 'HH_diss',
                                     'ClassID']),
  classProperty: 'ClassID', 
  inputProperties: bandsCombined
});

// Classify the validation data
var validationCombined = testingCombined.classify(classifierCombined);

// Calculate accuracy metrics
var emC = validationCombined.errorMatrix('ClassID', 'classification'); // Error matrix
var oaC = emC.accuracy(); // Overall accuracy
var ksC = emC.kappa(); // Kappa statistic
var uaC = emC.consumersAccuracy().project([1]); // Consumer's accuracy
var paC = emC.producersAccuracy().project([0]); // Producer's accuracy
var f1C = (uaC.multiply(paC).multiply(2.0)).divide(uaC.add(paC)); // F1-statistic

print('Error Matrix, Combined: ', emC);
print('Overall Accuracy, Combined: ', oaC);
print('Kappa Statistic, Combined: ', ksC);
print('User\'s Accuracy (rows), Combined:', uaC);
print('Producer\'s Accuracy (cols), Combined:', paC);
print('F1 Score, Combined: ', f1C);

// Classify the image Random Forest algorithm
var classifiedCombined = stackCombined2015.select(bandsCombined).classify(classifierCombined);


// LANDSAT ONLY

// Classification using Random Forest algorithm
var classifierLandsat = ee.Classifier.randomForest(100,0,10,0.5,false,seed).train({
  features: trainingLandsat.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'NDVI', 'LSWI', 'NDTI', 'SATVI', 'EVI',
                                    'ClassID']),
  classProperty: 'ClassID', 
  inputProperties: bandsLandsat
});

// Classify the validation data
var validationLandsat = testingLandsat.classify(classifierLandsat);

// Calculate accuracy metrics
var emL = validationLandsat.errorMatrix('ClassID', 'classification'); // Error matrix
var oaL = emL.accuracy(); // Overall accuracy
var ksL = emL.kappa(); // Kappa statistic
var uaL = emL.consumersAccuracy().project([1]); // Consumer's accuracy
var paL = emL.producersAccuracy().project([0]); // Producer's accuracy
var f1L = (uaL.multiply(paL).multiply(2.0)).divide(uaL.add(paL)); // F1-statistic

print('Error Matrix, Landsat: ', emL);
print('Overall Accuracy, Landsat: ', oaL);
print('Kappa Statistic, Landsat: ', ksL);
print('User\'s Accuracy (rows), Landsat:', uaL);
print('Producer\'s Accuracy (cols), Landsat:', paL);
print('F1 Score, Landsat: ', f1L);

// Classify the image Random Forest algorithm
var classifiedLandsat = stackLandsat2015.select(bandsLandsat).classify(classifierLandsat);


// SAR ONLY

// Classification using Random Forest algorithm
var classifierSAR = ee.Classifier.randomForest(100,0,10,0.5,false,seed).train({
  features: trainingSAR.select(['HH', 'HH_asm', 'HH_contrast', 'HH_corr', 'HH_var', 'HH_idm', 'HH_savg', 'HH_ent', 'HH_diss',
                                'ClassID']),
  classProperty: 'ClassID', 
  inputProperties: bandsSAR
});

// Classify the validation data
var validationSAR = testingSAR.classify(classifierSAR);

// Calculate accuracy metrics
var emS = validationSAR.errorMatrix('ClassID', 'classification'); // Error matrix
var oaS = emS.accuracy(); // Overall accuracy
var ksS = emS.kappa(); // Kappa statistic
var uaS = emS.consumersAccuracy().project([1]); // Consumer's accuracy
var paS = emS.producersAccuracy().project([0]); // Producer's accuracy
var f1S = (uaS.multiply(paS).multiply(2.0)).divide(uaS.add(paS)); // F1-statistic

print('Error Matrix, SAR: ', emS);
print('Overall Accuracy, SAR: ', oaS);
print('Kappa Statistic, SAR: ', ksS);
print('User\'s Accuracy (rows), SAR:', uaS);
print('Producer\'s Accuracy (cols), SAR:', paS);
print('F1 Score, SAR: ', f1S);

// Classify the image Random Forest algorithm
var classifiedSAR = stackSAR2015.select(bandsSAR).classify(classifierSAR);


/*******************************
  FILTER CLASSIFICATION
********************************/

// Perform a mode filter on the classified image
var filteredCombined = classifiedCombined.reduceNeighborhood({
  reducer: ee.Reducer.mode(),
  kernel: ee.Kernel.square(1),
});
var filteredLandsat = classifiedLandsat.reduceNeighborhood({
  reducer: ee.Reducer.mode(),
  kernel: ee.Kernel.square(1),
});
var filteredSAR = classifiedSAR.reduceNeighborhood({
  reducer: ee.Reducer.mode(),
  kernel: ee.Kernel.square(1),
});


/*******************************
  DISPLAY RGB COMPOSITES
********************************/

Map.addLayer(composite2015, {bands: ['B5', 'B4', 'B3'], min: 0, max: 0.3}, 'RGB 2015 Landsat', false);
Map.addLayer(hh2015s, {min: -26.0033, max: -4.57395}, 'HH 2015 PALSAR', false);

/*******************************
  DISPLAY CLASSIFICATION 
********************************/

// Create a palette for displaying the classified images
var palette = ['246a24', '6666ff', 'ff8000', 'ff00ff', 'ccff66', 'a65400', 'ff0000', 'ffff66', '66ccff'];

// Display classified image
Map.addLayer(classifiedCombined, {min: 0, max: 8, palette: palette}, '2015 Classification, Combined', true);
Map.addLayer(classifiedLandsat,  {min: 0, max: 8, palette: palette}, '2015 Classification, Landsat',  true);
Map.addLayer(classifiedSAR,      {min: 0, max: 8, palette: palette}, '2015 Classification, PALSAR',  true);

// Display classified mode image
Map.addLayer(filteredCombined,  {min: 0, max: 8, palette: palette}, '2015 Mode, Combined', false);
Map.addLayer(filteredLandsat,   {min: 0, max: 8, palette: palette}, '2015 Mode, Landsat', false);
Map.addLayer(filteredSAR,       {min: 0, max: 8, palette: palette}, '2015 Mode, PALSAR', false);

// Define classification legend
var colors = ['246a24', '6666ff', 'ff8000', 'ff00ff', 'ccff66', 'a65400', 'ff0000', 'ffff66', '66ccff'];
var names = ["Forest",
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
for (var x = 0; x<9; x++){
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

// Classified images for Combined Landsat+SAR

Export.image.toDrive({
  image: classifiedCombined.uint8(), 
  description: 'Classification_SetA_2015_LP_30m_RF_9CL',
  folder:  'Google Earth Engine',
  region: box,
  scale: 30,
  maxPixels: 300000000,
});

Export.image.toDrive({
  image: filteredCombined.uint8(), 
  description: 'Classification_Mode_SetA_2015_LP_30m_RF_9CL',
  folder:  'Google Earth Engine',
  region: box,
  scale: 30,
  maxPixels: 300000000,
});

// Classified images for Landsat only

Export.image.toDrive({
  image: classifiedLandsat.uint8(), 
  description: 'Classification_SetA_2015_L_30m_RF_9CL', 
  folder: 'Google Earth Engine',
  region: box,
  scale: 30,
  maxPixels: 300000000,
});

Export.image.toDrive({
  image: filteredLandsat.uint8(), 
  description: 'Classification_Mode_SetA_2015_L_30m_RF_9CL', 
  folder: 'Google Earth Engine',
  region: box,
  scale: 30,
  maxPixels: 300000000,
});

// Classified images for SAR only

Export.image.toDrive({
  image: classifiedSAR.uint8(), 
  description: 'Classification_SetA_2015_P_25m_RF_9CL',
  folder: 'Google Earth Engine',
  region: box,
  scale: 25,
  maxPixels: 500000000,
});

Export.image.toDrive({
  image: filteredSAR.uint8(), 
  description: 'Classification_Mode_SetA_2015_P_25m_RF_9CL', 
  folder: 'Google Earth Engine',
  region: box,
  scale: 25,
  maxPixels: 500000000,
  });


/*******************************
  EXPORT TABLES
********************************/

// Export computed statistics for all regions of interest as a csv file

// For combined Landsat+SAR
Export.table.toDrive(trainingCombined, 'Training_SetA_2015_LP_30m_RF', 'Google Earth Engine');
Export.table.toDrive(validationCombined, 'Validation_SetA_2015_LP_30m_RF', 'Google Earth Engine');

// For Landsat only
Export.table.toDrive(trainingLandsat, 'Training_SetA_2015_L_30m_RF', 'Google Earth Engine');
Export.table.toDrive(validationLandsat, 'Validation_SetA_2015_L_30m_RF', 'Google Earth Engine');

// For SAR only
Export.table.toDrive(trainingSAR, 'Training_SetA_2015_P_25m_RF', 'Google Earth Engine');
Export.table.toDrive(validationSAR, 'Validation_SetA_2015_P_25m_RF', 'Google Earth Engine');

