/*
 * This script executes cloud and shadow masking in Landsat Top-of-Atmosphere images and exports the resulting
 * composite image for subsequent use in image classification.
 *
 * The script is based on the modifications by Mariano Gonzalez Roglich (Conservation International) on the Fine Forest
 * Monitoring Workbench Prototype 0.0.1 by Juan Doblas (Instituto Socioambiental), and mainly the  RSAC Temporal Dark
 * Outlier Mask (TDOM) Compositing Script originally developed by Carson Stam and Ian Housman (Red Castle Resources, Inc.).
 * 
 * Links to scripts: 
 * Modifed script by M. Gonzales Roglich: https://code.earthengine.google.com/c506e197ad85f01d42b22abba9b70ae0 
 * Original codes by C. Stam & I. Housman: https://ee-api.appspot.com/a432bf20510f37ce13e847e4394aee77
 *
 */

/*******************************
  USER DEFINITIONS
********************************/

// Define area of interest
var region_name = "Tanintharyi";
var fc = ee.Geometry.Rectangle(97.0,16.0, 100.0,9.0);

Map.addLayer(fc, {color: '000000'}, 'region', false);   
   var saName = region_name; 
var crs = 'EPSG:4326'; // CRS = WGS84 (or use 'EPSG:32647' for WGS84/UTM Zone 47N)

//Compositing Parameters
var years = [1994];//Specify years
var compositingPeriod = 2;//Number of years to include in the composite
var startJulian = 0;//Start julian date- supports wrapping
var endJulian = 365;//End julian date

var shadowLookBack = 0;//Number of years to look back for cloud shadow masking
var shadowLookForward = 0;//Number of years to look forward for cloud shadow masking

//More user inputs
var cloudThresh = 10;//Specify the cloud threshold- lower number = more clouds are excluded
var cloudExpandIterations = 0;

var possibleSensors = ee.List(['L5']); //Specify which sensors to pull from- supports L5,L7,L8
var reduceOrTakeNewestPixel = 1;   // 1 - Will compute median (or other reducer) of the masked collection 0 - Will take newest pixel (still experimental)
var reducer = ee.Reducer.percentile([50]);//Reducer for compositing

var shadowSumBands = ee.List(['swir1','swir2']);//Bands for shadow masking. Removed NIR to avoid commision on deforested areas

var zShadowThresh = -1; //Z score in which shadows are expected to be below 
var shadowExpandIterations = 0;

//Names of collections to look in //Add _L1T for L1T imagery //TOA is computed on both the L1G or L1T
var collection_dict = {L5: 'LT5_L1T', L7: 'LE7_L1T', L8: 'LC8_L1T'};

//Band combinations for each sensor corresponding to final selected corresponding bands                        
var sensor_band_dict = ee.Dictionary({L5 : ee.List([0,1,2,3,4,5,6]), 
                                      L7 : ee.List([0,1,2,3,4,5,7]), 
                                      L8 : ee.List([1,2,3,4,5,9,6])});
var spacecraft_dict = {'Landsat5': 'L5', 'Landsat7': 'L7', 'Landsat8': 'L8'};

//End user inputs

//////////////////////////////////////////////////////////////////

//Finds the minimum bounding rectangle from the study area
var region = fc.bounds().getInfo().coordinates[0];

var allImages = ee.ImageCollection([ee.Image(1).set('system:time_start',new Date('1/1/1940'))]);
//////////////////////////////////////////////////////////////////
//Choose which visualization parameter to use
var vizParams = {'min': 0.05,'max': [0.3,0.4,0.4],   'bands':'swir1,nir,red', 'gamma':1.6};

///////////////////////////////////////////////////////////////////////////////
var bandNames = ee.List(['blue','green','red','nir','swir1','temp','swir2']);

///////////////////////////////////////////////////////////////////////////////
var bandNumbers = [0,1,2,3,4,5,6];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Function to mask clouds, ensure data exists in every band
function maskCloudsAndSuch(img){
  //Bust clouds
  var cs = ee.Algorithms.Landsat.simpleCloudScore(img).select(['cloud']).gt(cloudThresh);
  if (cloudExpandIterations>0) {cs = cs.focal_max(1,'circle','pixels',cloudExpandIterations)}
  //Make sure all or no bands have data
  var numberBandsHaveData = img.mask().reduce(ee.Reducer.sum());
  var allOrNoBandsHaveData = numberBandsHaveData.eq(0).or(numberBandsHaveData.gte(7));
  var allBandsHaveData = allOrNoBandsHaveData;
  //Make sure no band is just under zero
  var allBandsGT = img.reduce(ee.Reducer.min()).gt(-0.001);
  return img.mask(img.mask().and(cs.not()).and(allBandsHaveData).and(allBandsGT));
}

//////////////////////////////////////////////////////////////////
function addShadowSum(img){
    return img.addBands(img.select(shadowSumBands).reduce(ee.Reducer.sum()).select([0],['shadowSum']));
}
//////////////////////////////////////////////////////////////////
function zShadowMask(img,meanShadowDark,stdShadowDark){
  var imgDark = img.select(['shadowSum']);
  var shadowZ = imgDark.subtract(meanShadowDark).divide(stdShadowDark);
  var shadows = shadowZ.lt(zShadowThresh);
  if (shadowExpandIterations>0) {shadows = shadows.focal_max(1,'circle','pixels',shadowExpandIterations)}
  return img.mask(img.mask().and(shadows.not()));
}
/////////////////////////////////////////////////////////////////////////////////
//Function to handle empty collections that will cause subsequent processes to fail
//If the collection is empty, will fill it with an empty image
function fillEmptyCollections(inCollection,dummyImage){                       
  var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  var imageCount =  inCollection.toList(1).length();
  return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));
}
//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
//Wrapper function to get composite
var metadataFC = '';
function getImage(year,compositingPeriod, startJulian,endJulian,shadowLookBack,shadowLookForward){
  //Define dates
  var y1Image = year;
  var y2Image = year + compositingPeriod-1;
  
  var startDate = ee.Date.fromYMD(ee.Number(year),1,1).advance(startJulian,'day');
  var endDate = ee.Date.fromYMD(ee.Number(year).add(ee.Number(compositingPeriod)).subtract(ee.Number(1)),1,1).advance(endJulian,'day');
  print(startDate,endDate);
  var shadowStartDate = startDate.advance(ee.Number(-1).multiply(ee.Number(shadowLookBack)),'year');
  var shadowEndDate = endDate.advance(ee.Number(shadowLookForward),'year');

  //Helper function to get images from a specified sensor
  function getCollection(sensor,startDate,endDate,startJulian,endJulian){
  var collectionName = collection_dict[sensor];
  
  //Start with an un-date-confined collection of images
  var WOD = ee.ImageCollection(collectionName)
          .filterBounds(fc)
          .map(ee.Algorithms.Landsat.TOA);
          
  //Pop off an image to serve as a template if there are no images in the date range
  var dummy = ee.Image(WOD.first());
  
  //Filter by the dates
  var ls = WOD
          .filterDate(startDate,endDate)
          .filter(ee.Filter.calendarRange(startJulian,endJulian));
  print(ls);
  
  //Fill the collection if it's empty
  ls = fillEmptyCollections(ls,dummy);
  
  //Clean the collection up- clouds, fringes....
  ls = ls.map(maskCloudsAndSuch)
          .select(sensor_band_dict.get(sensor),bandNames);
    return ls;
 }

  //Get the images for composite and shadow model
  var l5s = ee.ImageCollection(ee.Algorithms.If(possibleSensors.contains('L5'),getCollection('L5',shadowStartDate,shadowEndDate,startJulian,endJulian),getCollection('L5',ee.Date('1000-01-01'),ee.Date('1001-01-01'),0,365)));
  var l7s = ee.ImageCollection(ee.Algorithms.If(possibleSensors.contains('L7'),getCollection('L7',shadowStartDate,shadowEndDate,startJulian,endJulian),getCollection('L7',ee.Date('1000-01-01'),ee.Date('1001-01-01'),0,365)));
  var l8s = ee.ImageCollection(ee.Algorithms.If(possibleSensors.contains('L8'),getCollection('L8',shadowStartDate,shadowEndDate,startJulian,endJulian),getCollection('L8',ee.Date('1000-01-01'),ee.Date('1001-01-01'),0,365)));

  //Merge the collections
  var ls = ee.ImageCollection(l5s.merge(l7s).merge(l8s)).map(addShadowSum);
  print(ls);
  var shadowImageCount = ls.toList(100000,0).length();
  //Pop off an image to fill after date constriction for image range
  var dummy = ee.Image(ls.first());
  
  //Compute stats for dark pixels for shadow masking
  var meanShadowSum = ls.select(['shadowSum']).mean();
  var stdShadowSum = ls.select(['shadowSum']).reduce(ee.Reducer.stdDev());
  
  //Constrain collection to just the image date range
  var ls = ls.filterDate(startDate,endDate);
  var compositeImageCount = ls.toList(100000,0).length();
  //Fill it in case it's null
  ls = fillEmptyCollections(ls,dummy);
 
  //Apply z score shadow method
  ls = ls.map(function(img){return zShadowMask(img,meanShadowSum,stdShadowSum)});
  

  // Flattening of the collection is made by reducing it or by picking the last recorded (and non-masked) pixel
  if (reduceOrTakeNewestPixel){
    var composite = ls.reduce(reducer).select(bandNumbers,bandNames)}
  else {
    var ls_sorted = ls.sort('system:time_start', false);    //Order adquisition by date
    var composite= ls_sorted.mosaic();}

  var sDate = new Date(year,1,1);
  
  composite = composite.set({'system:time_start':sDate.valueOf()});
  composite = composite.addBands(ee.Image(year).select([0],['year']).float());
  
//  allImages = ee.ImageCollection(allImages.merge(ls))
  
  var fullName = saName+'_'+y1Image.toString()+'_' +y2Image.toString()+'_'+startJulian.toString()+'_'+endJulian.toString();
  var toExport = composite.select(['blue','green','red','nir','swir1','swir2']).multiply(10000).int16().clip(fc);
  
   //Set up metadata
   var f = ee.Feature(toExport.geometry())
        .set('bandNames',toExport.bandNames())
        .set('DateStart',startDate)
        .set('DateEnd',endDate)
        .set('JulianStart',startJulian)
        .set('JulianEnd',endJulian)
        .set('CloudThresh',cloudThresh)
        .set('system:index',fullName)
        .set('CompositingMethod','Percentile')
        .set('CompositingParameters', '50')
        .set('Sensors',possibleSensors)
        .set('bufferCloudShadow',true)
        .set('imageCountComposite',compositeImageCount)
        .set('imageCountShadow',shadowImageCount)
        .set('crs',crs)
        .set('CloudShadowStart',shadowStartDate)
        .set('CloudShadowEnd',shadowEndDate)
        .set('Z_ShadowThresh',zShadowThresh);

  //Append the metadata if it already exists
   f = ee.FeatureCollection([f]);
   if(metadataFC === ''){metadataFC = f}
    else{metadataFC = metadataFC.merge(f)};

   //Add to map and export composite 
   Map.addLayer(composite,vizParams,year.toString() + '_composite', false);
   //Export.image(toExport,fullName,{'scale':30,'maxPixels':1e13,'crs':crs,'region': region});
   //Export.image.toAsset(toExport,fullName,{'scale':30,'maxPixels':1e13,'crs':crs,'region': fc});
   return composite;
}

//Compositing function call
var composites = ee.ImageCollection(years.map(function(yr){return getImage(yr,compositingPeriod,startJulian,endJulian,shadowLookBack,shadowLookForward)}));
Export.table(metadataFC, saName+'_Composites_Metadata');

print('Old Composite:', composites);

Map.addLayer(ee.Image().paint(fc,1,1), {'palette': '00FFFF'},'Study Area', false);
//Map.centerObject(fc,8);


/*******************************
  DEFINE EXTENT AND VIEW
********************************/

// Set center of map view
Map.setCenter(98.64212,12.40975, 7); // Zoom in and center display to Tanintharyi Region, Myanmar

// Define and display box extents covering Tanintharyi region
var box = fc; // Complete region

// Split box extents into regions for exporting 
var boxTOP = ee.Geometry.Rectangle(97.0,16.0, 100.0,13.0); // Top region for export
var boxMID = ee.Geometry.Rectangle(97.0,13.0, 100.0,11.0); // Middle region for export
var boxLOW = ee.Geometry.Rectangle(97.0,11.0, 100.0, 9.0); // Lower region for export


/*******************************
  LOAD DATASETS
********************************/

// Rename band filenames in metadata from the output composite
var composites = ee.ImageCollection(composites).select([0,1,2,3,4,5,6,7],['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'YR']);

// Mosaic the old composite (as image collection) into a new composite (as image)
var landsat1995 = composites.mosaic();
print('New Full Composite:', landsat1995);


/*******************************
  CLIP DATASETS
********************************/

// Clip Landsat image composite within box extents
var clip1995 = landsat1995.clip(box);

// Split/clip image composite into regions for exporting
var clip1995top = landsat1995.clip(boxTOP); // Top region for export
var clip1995mid = landsat1995.clip(boxMID); // Middle region for export
var clip1995low = landsat1995.clip(boxLOW); // Lower region for export


/*******************************
  DISPLAY RGB COMPOSITES
********************************/

// Display full image composite
Map.addLayer(clip1995, {bands: ['B5', 'B4', 'B3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Landsat', false);

// Display split image composites
Map.addLayer(clip1995top, {bands: ['B5', 'B4', 'B3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Top', true);
Map.addLayer(clip1995mid, {bands: ['B5', 'B4', 'B3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Mid', true);
Map.addLayer(clip1995low, {bands: ['B5', 'B4', 'B3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Low', true);


/*******************************
  PROCESS IMAGE ASSET
********************************/

// Export full image composite to drive
// Export.image(clip1995, 'Tanintharyi_1995_Landsat', {'scale':30, 'maxPixels':1e13, 'crs':crs, 'region': box}); // OK
// NOTE: image exports are split automatically due to cap on file size on export

// Export split image composite to drive 
Export.image(clip1995top, 'TNI_1995_Landsat_TOP', {'scale':30, 'maxPixels':1e13, 'crs':crs, 'region': boxTOP});
Export.image(clip1995mid, 'TNI_1995_Landsat_MID', {'scale':30, 'maxPixels':1e13, 'crs':crs, 'region': boxMID});
Export.image(clip1995low, 'TNI_1995_Landsat_LOW', {'scale':30, 'maxPixels':1e13, 'crs':crs, 'region': boxLOW});

// Display image assets
/*
var tni1995top = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_1995_Landsat_TOP'); 
var tni1995mid = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_1995_Landsat_MID'); 
var tni1995low = ee.Image('users/dondealban/Tanintharyi/Landsat_Composite_2/TNI_1995_Landsat_LOW'); 

Map.addLayer(tni1995top, {bands: ['b5', 'b4', 'b3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Top Asset', true);
Map.addLayer(tni1995mid, {bands: ['b5', 'b4', 'b3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Mid Asset', true);
Map.addLayer(tni1995low, {bands: ['b5', 'b4', 'b3'], min: 0.05, max: [0.3,0.4,0.4], gamma: 1.6}, 'RGB 1995 Low Asset', true);

print('Top Composite:', tni1995top);
print('Mid Composite:', tni1995mid);
print('Low Composite:', tni1995low);
*/