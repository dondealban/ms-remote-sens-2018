# This R script generates box-whisker plots using ggplot2 package to visualise the
# distribution of values for each predictor variable across 9 land cover types 
# derived from combined Landsat and L-band SAR data covering Tanintharyi, Myanmar.
# This script plots SetA values consisting of 1995 and 2015 data from Landsat-5
# (7 bands, 5 indices) and JERS-1 or ALOS/PALSAR-2 (1 polarisation and 8 GLCM
# textures).
#
# Land cover types include: forest (FOR); mangrove (MNG); oil palm mature (OPM);
# rubber mature (RBM); shrub/orchard (SHB); rice paddy (RPD); built-up area (BUA);
# bare soil/ground (BSG); and water (WTR).
#
# Script By:      Jose Don T De Alban
# Date Created:   26 Jan 2017
# Last Modified:  17 Apr 2017

# LOAD LIBRARIES AND DATA

# Set working directory
setwd("/Users/dondealban/Dropbox/Research/myanmar/image statistics/distribution/set a/")

# Load the required R libraries
library(ggplot2)

# Read data, define variables, and store data in variables
data <- read.csv(file="Table_SetA_1995_2015_Merge_Rev5_ForR.csv", header=TRUE, sep=",")

# GENERATE PLOTS
# Generate boxplots of land cover types for each predictor variable

# B1
optB1 <- ggplot() + geom_boxplot(aes(y = B1, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB1 <- optB1 + labs(title="B1 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB1 <- optB1 + ylim(0,0.65)

# B2
optB2 <- ggplot() + geom_boxplot(aes(y = B2, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB2 <- optB2 + labs(title="B2 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB2 <- optB2 + ylim(0,0.65)

# B3
optB3 <- ggplot() + geom_boxplot(aes(y = B3, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB3 <- optB3 + labs(title="B3 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB3 <- optB3 + ylim(0,0.65)

# B4
optB4 <- ggplot() + geom_boxplot(aes(y = B4, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB4 <- optB4 + labs(title="B4 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB4 <- optB4 + ylim(0,0.65)

# B5
optB5 <- ggplot() + geom_boxplot(aes(y = B5, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB5 <- optB5 + labs(title="B5 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB5 <- optB5 + ylim(0,0.65)

# B7
optB7 <- ggplot() + geom_boxplot(aes(y = B7, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB7 <- optB7 + labs(title="B7 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB7 <- optB7 + ylim(0,0.65)

# B6-B10
optB6_B10 <- ggplot() + geom_boxplot(aes(y = B6, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optB6_B10 <- optB6_B10 + labs(title="B6/B10 Reflectance of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Reflectance", fill="Year")
optB6_B10 <- optB6_B10 + ylim(280,310)

# EVI
optEVI <- ggplot() + geom_boxplot(aes(y = EVI, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optEVI <- optEVI + labs(title="Enhanced Vegetation Index (EVI) of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
optEVI <- optEVI + ylim(-0.6,1.1)

# LSWI
optLSWI <- ggplot() + geom_boxplot(aes(y = LSWI, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optLSWI <- optLSWI + labs(title="Land Surface Water Index (LSWI) of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
optLSWI <- optLSWI + ylim(-0.6,1.1)

# NDTI
optNDTI <- ggplot() + geom_boxplot(aes(y = NDTI, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optNDTI <- optNDTI + labs(title="Normalised Difference Till Index (NDTI) of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
optNDTI <- optNDTI + ylim(-0.6,1.1)

# NDVI
optNDVI <- ggplot() + geom_boxplot(aes(y = NDVI, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optNDVI <- optNDVI + labs(title="Normalised Difference Vegetation Index (NDVI) of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
optNDVI <- optNDVI + ylim(-0.6,1.1)

# SATVI
optSATVI <- ggplot() + geom_boxplot(aes(y = SATVI, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
optSATVI <- optSATVI + labs(title="Soil-Adjusted Total Vegetation Index (SATVI) of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
optSATVI <- optSATVI + ylim(-0.6,1.1)

# HH
sarHH <- ggplot() + geom_boxplot(aes(y = HH, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH <- sarHH + labs(title="HH Sigma0 Backscatter of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value (dB)", fill="Year")
sarHH <- sarHH + ylim(-32,10)

# HH ASM
sarHH_ASM <- ggplot() + geom_boxplot(aes(y = HH_ASM, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_ASM <- sarHH_ASM + labs(title="HH Angular Second Moment Texture Backscatter of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_ASM <- sarHH_ASM + ylim(0.1,0.15)

# HH CON
sarHH_CON <- ggplot() + geom_boxplot(aes(y = HH_CON, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_CON <- sarHH_CON + labs(title="HH Contrast Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_CON <- sarHH_CON + ylim(0,80000000)

# HH COR
sarHH_COR <- ggplot() + geom_boxplot(aes(y = HH_COR, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_COR <- sarHH_COR + labs(title="HH Correlation Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_COR <- sarHH_COR + ylim(-0.5,0.5)

# HH DIS
sarHH_DIS <- ggplot() + geom_boxplot(aes(y = HH_DIS, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_DIS <- sarHH_DIS + labs(title="HH Dissimilarity Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_DIS <- sarHH_DIS + ylim(0,7000)

# HH ENT
sarHH_ENT <- ggplot() + geom_boxplot(aes(y = HH_ENT, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_ENT <- sarHH_ENT + labs(title="HH Entropy Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_ENT <- sarHH_ENT + ylim(2.1,2.4)

# HH IDM
sarHH_IDM <- ggplot() + geom_boxplot(aes(y = HH_IDM, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_IDM <- sarHH_IDM + labs(title="HH Homogeneity Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_IDM <- sarHH_IDM + ylim(0,0.1)

# HH SAVG
sarHH_SAVG <- ggplot() + geom_boxplot(aes(y = HH_SAVG, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_SAVG <- sarHH_SAVG + labs(title="HH Mean Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_SAVG <- sarHH_SAVG + ylim(-60000,20000)

# HH VAR
sarHH_VAR <- ggplot() + geom_boxplot(aes(y = HH_VAR, x = LC_TYPE, fill=factor(YEAR)), data=data, outlier.shape = 1, outlier.size = 1)
sarHH_VAR <- sarHH_VAR + labs(title="HH Variance Texture of Land Cover Types in Tanintharyi", x="Land Cover Type", y="Value", fill="Year")
sarHH_VAR <- sarHH_VAR + ylim(0,50000000)

# OUTPUT PLOTS
# Output boxplots to a PNG file

ggsave(optB1, file="Boxplot-B1.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB2, file="Boxplot-B2.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB3, file="Boxplot-B3.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB4, file="Boxplot-B4.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB5, file="Boxplot-B5.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB7, file="Boxplot-B7.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optB6_B10, file="Boxplot-B6B10.png", width=19.89, height=15, units="cm", dpi=300)

ggsave(optEVI, file="Boxplot-EVI.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optLSWI, file="Boxplot-LSWI.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optNDTI, file="Boxplot-NDTI.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optNDVI, file="Boxplot-NDVI.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(optSATVI, file="Boxplot-SATVI.png", width=19.89, height=15, units="cm", dpi=300)

ggsave(sarHH, file="Boxplot-HH.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_ASM, file="Boxplot-ASM.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_CON, file="Boxplot-CON.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_COR, file="Boxplot-COR.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_DIS, file="Boxplot-DIS.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_ENT, file="Boxplot-ENT.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_IDM, file="Boxplot-IDM.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_SAVG, file="Boxplot-SAVG.png", width=19.89, height=15, units="cm", dpi=300)
ggsave(sarHH_VAR, file="Boxplot-VAR.png", width=19.89, height=15, units="cm", dpi=300)
