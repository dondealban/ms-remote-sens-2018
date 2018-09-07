# This script assesses the variable importance of a Random Forest classification using
# the randomForest package. The objective is to determine the importance of predictor
# variables.
#
# Script By:      Jose Don T De Alban
# Date Created:   03 Mar 2017
# Last Modified:  23 Jan 2017


# LOAD LIBRARIES AND DATA

# Set working directory
setwd("/Users/dondealban/Dropbox/Research/myanmar/variable importance/rf randomforest/new/")

# Load the required R libraries
library(randomForest)

# Read data, define variables, and store data in variables
dataSetA1995 <- read.csv(file="Training_SetA_1995_LJ_30m_RF.csv", header=TRUE, sep=",")
dataSetA2015 <- read.csv(file="Training_SetA_2015_LP_30m_RF.csv", header=TRUE, sep=",")
dataSetB2015 <- read.csv(file="Training_SetB_2015_LP_30m_RF.csv", header=TRUE, sep=",")

# PREPARE DATA

# Create year (YEAR) column
dataSetA1995$YEAR <- rep(1995,nrow(dataSetA1995))
dataSetA2015$YEAR <- rep(2015,nrow(dataSetA2015))
dataSetB2015$YEAR <- rep(2015,nrow(dataSetB2015))

# Create land cover type (LC_TYPE) column 
dataSetA1995$LC_TYPE <- ifelse(dataSetA1995$ClassID==0,"FOR",
                               ifelse(dataSetA1995$ClassID==1,"MNG",
                                      ifelse(dataSetA1995$ClassID==2,"OPM",
                                             ifelse(dataSetA1995$ClassID==3,"RBM",
                                                    ifelse(dataSetA1995$ClassID==4,"SHB",
                                                           ifelse(dataSetA1995$ClassID==5,"RPD",
                                                                  ifelse(dataSetA1995$ClassID==6,"BUA",
                                                                         ifelse(dataSetA1995$ClassID==7,"BSG","WTR"))))))))

dataSetA2015$LC_TYPE <- ifelse(dataSetA2015$ClassID==0,"FOR",
                               ifelse(dataSetA2015$ClassID==1,"MNG",
                                      ifelse(dataSetA2015$ClassID==2,"OPM",
                                             ifelse(dataSetA2015$ClassID==3,"RBM",
                                                    ifelse(dataSetA2015$ClassID==4,"SHB",
                                                           ifelse(dataSetA2015$ClassID==5,"RPD",
                                                                  ifelse(dataSetA2015$ClassID==6,"BUA",
                                                                         ifelse(dataSetA2015$ClassID==7,"BSG","WTR"))))))))

dataSetB2015$LC_TYPE <- ifelse(dataSetB2015$ClassID==0,"FOR",
                               ifelse(dataSetB2015$ClassID==1,"MNG",
                                      ifelse(dataSetB2015$ClassID==2,"OPM",
                                             ifelse(dataSetB2015$ClassID==3,"RBM",
                                                    ifelse(dataSetB2015$ClassID==4,"SHB",
                                                           ifelse(dataSetB2015$ClassID==5,"RPD",
                                                                  ifelse(dataSetB2015$ClassID==6,"BUA",
                                                                         ifelse(dataSetB2015$ClassID==7,"BSG","WTR"))))))))

# Rename column names
names(dataSetA1995)[12:19] <- c("HH_ASM","HH_CON","HH_COR","HH_DIS","HH_ENT","HH_IDM","HH_SAVG","HH_VAR")
names(dataSetA2015)[12:19] <- c("HH_ASM","HH_CON","HH_COR","HH_DIS","HH_ENT","HH_IDM","HH_SAVG","HH_VAR")
names(dataSetB2015)[14:21] <- c("HH_ASM","HH_CON","HH_COR","HH_DIS","HH_ENT","HH_IDM","HH_SAVG","HH_VAR")
names(dataSetB2015)[23:30] <- c("HV_ASM","HV_CON","HV_COR","HV_DIS","HV_ENT","HV_IDM","HV_SAVG","HV_VAR")

# Subset data by year
SetA1995 <- subset(dataSetA1995, dataSetA1995$YEAR=="1995")
SetA2015 <- subset(dataSetA2015, dataSetA2015$YEAR=="2015")
SetB2015 <- subset(dataSetB2015, dataSetB2015$YEAR=="2015")

# Define factor predictor variables
# LC_TYPE
SetA1995$LC_TYPE <- factor(SetA1995$LC_TYPE)
SetA2015$LC_TYPE <- factor(SetA2015$LC_TYPE)
SetB2015$LC_TYPE <- factor(SetB2015$LC_TYPE)
# Year
SetA1995$YEAR <- factor(SetA1995$YEAR)
SetA2015$YEAR <- factor(SetA2015$YEAR)
SetB2015$YEAR <- factor(SetB2015$YEAR)


# SET RANDOM SEED
set.seed(2018)


# RUN RANDOM FOREST IMPLEMENTATION

# randomForest package implementation
# Note: mtry uses default value which is sqrt of number of predictor variables

# Set A 1995

# Landsat only (n=12)
rfSetA1995l <- randomForest(LC_TYPE ~ B1 + B2 + B3 + B4 + B5 + B6 + B7 + EVI +
              LSWI + NDTI + NDVI + SATVI, data=SetA1995,
              ntree=100, importance=TRUE)
# SAR only (n=9)
rfSetA1995s <- randomForest(LC_TYPE ~ HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + 
              HH_IDM + HH_SAVG + HH_VAR, data=SetA1995,
              ntree=100, importance=TRUE)
# Landsat+SAR (n=21)
rfSetA1995ls <- randomForest(LC_TYPE ~ B1 + B2 + B3 + B4 + B5 + B6 + B7 + EVI +
              HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + HH_IDM + HH_SAVG + HH_VAR +
              LSWI + NDTI + NDVI + SATVI, data=SetA1995, 
              ntree=100, importance=TRUE)

# Set A 2015

# Landsat only (n=12)
rfSetA2015l <- randomForest(LC_TYPE ~ B10 + B2 + B3 + B4 + B5 + B6 + B7 + EVI +
               LSWI + NDTI + NDVI + SATVI, data=SetA2015,
               ntree=100, importance=TRUE)
# SAR only (n=9)
rfSetA2015s <- randomForest(LC_TYPE ~ HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + 
               HH_IDM + HH_SAVG + HH_VAR, data=SetA2015,
               ntree=100, importance=TRUE)
# Landsat+SAR (n=21)
rfSetA2015ls <- randomForest(LC_TYPE ~ B10 + B2 + B3 + B4 + B5 + B6 + B7 + EVI +
                HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + HH_IDM + HH_SAVG + HH_VAR +
                LSWI + NDTI + NDVI + SATVI, data=SetA2015, 
                ntree=100, importance=TRUE)

# Set B 2015

# Landsat only (n=12)
rfSetB2015l <- randomForest(LC_TYPE ~ B2 + B3 + B4 + B5 + B6 + B7 + B10 + EVI +
               LSWI + NDTI + NDVI + SATVI, data=SetB2015,
               ntree=100, importance=TRUE)
# SAR only (n=24)
rfSetB2015s <- randomForest(LC_TYPE ~ AVE + DIF +
               HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + HH_IDM + HH_SAVG + HH_VAR +
               HV + HV_ASM + HV_CON + HV_COR + HV_DIS + HV_ENT + HV_IDM + HV_SAVG + HV_VAR +
               NDI + NLI + RT1 + RT2, data=SetB2015,
               ntree=100, importance=TRUE)
# Landsat+SAR (n=36)
rfSetB2015ls <- randomForest(LC_TYPE ~ AVE + B2 + B3 + B4 + B5 + B6 + B7 + B10 + DIF + EVI +
                HH + HH_ASM + HH_CON + HH_COR + HH_DIS + HH_ENT + HH_IDM + HH_SAVG + HH_VAR +
                HV + HV_ASM + HV_CON + HV_COR + HV_DIS + HV_ENT + HV_IDM + HV_SAVG + HV_VAR +
                LSWI + NDI + NDTI + NDVI + NLI + RT1 + RT2 + SATVI, data=SetB2015, 
                ntree=100, importance=TRUE)


# RANDOM FOREST VARIABLE IMPORTANCE

# Variable importance based on permutation importance (mean decrease in accuracy)

# Set A 1995
rfSetA1995lt1  <- importance(rfSetA1995l,  type=1)
rfSetA1995st1  <- importance(rfSetA1995s,  type=1)
rfSetA1995lst1 <- importance(rfSetA1995ls, type=1)
# Set A 2015
rfSetA2015lt1  <- importance(rfSetA2015l,  type=1)
rfSetA2015st1  <- importance(rfSetA2015s,  type=1)
rfSetA2015lst1 <- importance(rfSetA2015ls, type=1)
# Set B 2015
rfSetB2015lt1  <- importance(rfSetB2015l,  type=1)
rfSetB2015st1  <- importance(rfSetB2015s,  type=1)
rfSetB2015lst1 <- importance(rfSetB2015ls, type=1)

# Variable importance based on Gini importance (mean decrease in impurity)

# Set A 1995
rfSetA1995lt2  <- importance(rfSetA1995l,  type=2)
rfSetA1995st2  <- importance(rfSetA1995s,  type=2)
rfSetA1995lst2 <- importance(rfSetA1995ls, type=2)
# Set A 2015
rfSetA2015lt2  <- importance(rfSetA2015l,  type=2)
rfSetA2015st2  <- importance(rfSetA2015s,  type=2)
rfSetA2015lst2 <- importance(rfSetA2015ls, type=2)
# Set B 2015
rfSetB2015lt2  <- importance(rfSetB2015l,  type=2)
rfSetB2015st2  <- importance(rfSetB2015s,  type=2)
rfSetB2015lst2 <- importance(rfSetB2015ls, type=2)


# SAVE OUTPUTS TO FILE

# Save random forest package results as txt file

sink("output-rf-randomforest-SetA1995.txt", append=FALSE, split=TRUE)
print(rfSetA1995l)
print(rfSetA1995lt1)
print(rfSetA1995lt2)
print(rfSetA1995s)
print(rfSetA1995st1)
print(rfSetA1995st2)
print(rfSetA1995ls)
print(rfSetA1995lst1)
print(rfSetA1995lst2)
sink()
sink("output-rf-randomforest-SetA2015.txt", append=FALSE, split=TRUE)
print(rfSetA2015l)
print(rfSetA2015lt1)
print(rfSetA2015lt2)
print(rfSetA2015s)
print(rfSetA2015st1)
print(rfSetA2015st2)
print(rfSetA2015ls)
print(rfSetA2015lst1)
print(rfSetA2015lst2)
sink()
sink("output-rf-randomforest-SetB2015.txt", append=FALSE, split=TRUE)
print(rfSetB2015l)
print(rfSetB2015lt1)
print(rfSetB2015lt2)
print(rfSetB2015s)
print(rfSetB2015st1)
print(rfSetB2015st2)
print(rfSetB2015ls)
print(rfSetB2015lst1)
print(rfSetB2015lst2)
sink()

# Save graph of random forest variable importance as pdf file

# Set A 1995
pdf("output-rf-varimp-graph-SetA1995-landsat.pdf", width=7, height=5.5)
varImpPlot(rfSetA1995l)
dev.off()
pdf("output-rf-varimp-graph-SetA1995-sar.pdf", width=7, height=5.5)
varImpPlot(rfSetA1995s)
dev.off()
pdf("output-rf-varimp-graph-SetA1995-landsat-sar.pdf", width=7, height=5.5)
varImpPlot(rfSetA1995ls)
dev.off()

# Set A 2015
pdf("output-rf-varimp-graph-SetA2015-landsat.pdf", width=7, height=5.5)
varImpPlot(rfSetA2015l)
dev.off()
pdf("output-rf-varimp-graph-SetA2015-sar.pdf", width=7, height=5.5)
varImpPlot(rfSetA2015s)
dev.off()
pdf("output-rf-varimp-graph-SetA2015-landsat-sar.pdf", width=7, height=5.5)
varImpPlot(rfSetA2015ls)
dev.off()

# Set B 2015
pdf("output-rf-varimp-graph-SetB2015-landsat.pdf", width=7, height=5.5)
varImpPlot(rfSetB2015l)
dev.off()
pdf("output-rf-varimp-graph-SetB2015-sar.pdf", width=7, height=5.5)
varImpPlot(rfSetB2015s)
dev.off()
pdf("output-rf-varimp-graph-SetB2015-landsat-sar.pdf", width=9, height=7.5)
varImpPlot(rfSetB2015ls)
dev.off()
