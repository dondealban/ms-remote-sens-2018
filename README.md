# 2018 Remote Sensing paper
Combined Landsat and L-band SAR data improves land cover classification and change detection in dynamic tropical landscapes.

[![DOI](https://img.shields.io/badge/DOI-10.3390%2Frs10020306-blue.svg)](https://doi.org/10.3390/rs10020306)


## Table of Contents
- [Overview](#overview)
- [Abstract](#abstract)
- [Scripts](#scripts)
- [Outputs](#outputs)
- [Citation](#citation)
- [License](#license)


<a name="overview"></a>
## Overview
This repository contains the materials used for my land cover change analysis paper published in [Remote Sensing](http://www.mdpi.com/journal/remotesensing) journal on February 2018. The paper, both the [main paper](http://www.mdpi.com/2072-4292/10/2/306/pdf) and [supplementary material](http://www.mdpi.com/2072-4292/10/2/306#supplementary), is published open-access and can be downloaded for free under a [CC BY 4.0 license](#license). The materials provided in this repository serve to supplement the published paper by creating a backup of the materials used in and developed through the study, to encourage doing better science by fostering reproducibility and transparency, and to improve the overall impact of the research.

<a name="abstract"></a>
## Abstract
Robust quantitative estimates of land use and land cover change are necessary to develop policy solutions and interventions aimed towards sustainable land management. Here, we evaluated the combination of Landsat and L-band Synthetic Aperture Radar (SAR) data to estimate land use/cover change in the dynamic tropical landscape of Tanintharyi, southern Myanmar. We classified Landsat and L-band SAR data, specifically Japan Earth Resources Satellite (JERS-1) and Advanced Land Observing Satellite-2 Phased Array L-band Synthetic Aperture Radar-2 (ALOS-2/PALSAR-2), using Random Forests classifier to map and quantify land use/cover change transitions between 1995 and 2015 in the Tanintharyi Region. We compared the classification accuracies of single versus combined sensor data, and assessed contributions of optical and radar layers to classification accuracy. Combined Landsat and L-band SAR data produced the best overall classification accuracies (92.96% to 93.83%), outperforming individual sensor data (91.20% to 91.93% for Landsat-only; 56.01% to 71.43% for SAR-only). Radar layers, particularly SAR-derived textures, were influential predictors for land cover classification, together with optical layers. Landscape change was extensive (16,490 km<sup>2</sup>; 39% of total area), as well as total forest conversion into agricultural plantations (3,214 km<sup>2</sup>). Gross forest loss (5,133 km<sup>2</sup>) in 1995 was largely from conversion to shrubs/orchards and tree (oil palm, rubber) plantations, and gross gains in oil palm (5,471 km<sup>2</sup>) and rubber (4,025 km<sup>2</sup>) plantations by 2015 were mainly from conversion of shrubs/orchards and forests. Analysis of combined Landsat and L-band SAR data provides an improved understanding of the associated drivers of agricultural plantation expansion and the dynamics of land use/cover change in tropical forest landscapes.

<a name="scripts"></a>
## Scripts
The following scripts were used for implementing image processing, classification, and accuracy assessment processes; for executing functions and statistical tests; and generating figures.

#### Overall Workflow
The overall workflow figure (Fig.2 in the paper) was designed using the [yEd Graph Editor](https://www.yworks.com/products/yed) software, which uses an XML-based GraphML file format for graphs. The GraphML file used for generating the overall workflow figure is provided.

#### Extraction of Image Statistics
Once the image stacks of the combined Landsat and L-band SAR data and the regions-of-interest (ROI) polygons of land cover types were completed, the image values of all predictor variables (all data layers from the image stacks) within the delineated ROI polygons were extracted for backscatter/reflectance analysis. The image statistics were extracted using the [Google Earth Engine](https://earthengine.google.com) (Gorelick et al. 2017) platform and exported as csv files. The csv files were subsequently used as input data to generate box-whisker plots using [`ggplot2` package](https://ggplot2.tidyverse.org) (Wickham 2016) in [R software](https://www.r-project.org) (R Core Team 2016) for the purpose visualising and analysing the distribution of SAR backscatter and Landsat TOA reflectance values for each predictor variable consisting of the image channels/bands, derived indices, and texture measures. Each boxplot showed land cover types (x-axis) against backscatter/reflectance/index values (y-axis) for each predictor variable.

	- Scripts: export csv files with image statistics (GEE)

#### Decision Tree and Mask Generation
To aid in the delineation of ROIs to classify the 1995 image stack, binary mask layers were needed for two land cover types: oil palm and rubber. The mask layers for these two land cover types were generated--first through a visual evaluation of the boxplots to select predictor variables in which the two land cover types could be discriminated, and second by implementing a decision tree algorithm using the selected predictors and the 2015 ROI polygons to determine the threshold values for each predictor. The specific predictors (channels/bands) selected through visual assessment of boxplots from the 2015 image statistics of Landsat-8/PALSAR-2 were as follows (Figs.S1-S4 in the paper):
    + HH: vegetation; non-vegetation
    + B4: shrubs/orchards; mangroves/rubber/oil palm; forest
    + B5: oil palm/rubber; mangroves
    + B6: rubber; oil palm

The following scripts were used for the decision tree and mask generation process. First, an R script was developed to generate the decision tree using the [`tree` package](https://cran.r-project.org/web/packages/tree/index.html) (Ripley 2017) in R software. The R script used the csv file containing the extracted 2015 image values of predictor variable layers for all ROI polygons as input data to produce tree dendrogram images and summary text files as outputs. Second, based on the tree dendrograms and summary text files, a simplified decision tree flowchart (Fig.S5 in the paper) was designed again using the yEd Graph Editor for easily depicting the decision tree with the predictor variable and corresponding thresholds for discriminating selected land cover types. Third, the binary mask layers were generated through a Google Earth Engine script using the information from the decision tree flowchart. Once the mask layers were produced, ROIs for the selected land cover types were delineated for classifying the 1995 image stack.

	- Scripts: decision tree (R); decision tree flowchart (yEd); mask generation (GEE)






#### Image Classification

#### Sankey Diagram



<a name="outputs"></a>
## Outputs

Extraction of Image Statistics
1. csv files (note: extraction of image statistics done in GEE)
2. boxplots showing distribution of backscatter/reflectance values per land cover type for each predictor variable

Decision Tree and Mask Generation
1. tree dendrogram images and summary text files
2. decision tree flowchart



<a name="citation"></a>
## Citation
De Alban, J.D.T., G.M. Connette, P. Oswald, E.L. Webb (2018). Combined Landsat and L-band SAR data improves land cover classification and change detection in dynamic tropical landscapes. *Remote Sens.* 10(2), 306. [doi:10.3390/rs10020306](https://doi.org/10.3390/rs10020306)

**BibTeX entry:**
```
@article{de_alban_combined_2018,
	title = {Combined {Landsat} and {L}-{Band} {SAR} data improves land cover classification and change detection in dynamic tropical landscapes},
	volume = {10},
	copyright = {http://creativecommons.org/licenses/by/4.0/},
	url = {http://www.mdpi.com/2072-4292/10/2/306},
	doi = {10.3390/rs10020306},
	language = {en},
	number = {2},
	urldate = {2018-02-16},
	journal = {Remote Sensing},
	author = {De Alban, Jose Don T. and Connette, Grant M. and Oswald, Patrick and Webb, Edward L.},
	month = feb,
	year = {2018},
	keywords = {Landsat, tropical forest, rubber, JERS-1 SAR, Google Earth Engine, oil palm, land change, agricultural plantation, ALOS-2 PALSAR-2},
	pages = {306}
}
```

<a name="license"></a>
## License
Creative Commons Attribution 4.0 International [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
