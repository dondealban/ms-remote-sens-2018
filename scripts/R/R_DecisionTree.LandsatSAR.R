# This R script implements a decision tree classification using the tree package. The
# objective is to generate a tree based on specified predictor variables and to determine
# the variables and thresholds used for splitting classes.
#
# Script By:      Jose Don T De Alban
# Date Created:   17 Feb 2017
# Last Modified:  17 Apr 2017


# LOAD LIBRARIES AND DATA

# Set working directory
setwd("/Users/dondealban/Dropbox/Research/myanmar/decision tree/")

# Load the required R libraries
library(tree)

# Read data, define variables, and store data in variables
data <- read.csv(file="Table_SetB_2015_LP_30m_RF_ForR.csv", header=TRUE, sep=",")


# CREATE SUBSETS TO DEFINE CLASSES IN MULTI-LEVEL CLASSIFICATION

# Notation: INC = include class; EXC = exclude class

# Level 1: vegetation | non-vegetation
data$LC1[data$LC_TYPE=="FOR" | data$LC_TYPE=="MNG" | data$LC_TYPE=="OPM" | data$LC_TYPE=="RBM" | data$LC_TYPE=="SHB"] <- "INC"
data$LC1[data$LC_TYPE!="FOR" & data$LC_TYPE!="MNG" & data$LC_TYPE!="OPM" & data$LC_TYPE!="RBM" & data$LC_TYPE!="SHB"] <- "EXC"

# Level 2: forest | shrubs/orchards | mangrove/oil palm/rubber
data$LC2[data$LC1=="EXC"] <- "EXC"
data$LC2[data$LC1=="INC" & data$LC_TYPE=="FOR"] <- "EXC"
data$LC2[data$LC1=="INC" & data$LC_TYPE=="SHB"] <- "EXC"
data$LC2[data$LC1=="INC" & data$LC_TYPE=="MNG"] <- "INC"
data$LC2[data$LC1=="INC" & data$LC_TYPE=="OPM"] <- "INC"
data$LC2[data$LC1=="INC" & data$LC_TYPE=="RBM"] <- "INC"

# Level 3: mangrove | oil palm/rubber
data$LC3[data$LC2=="EXC"] <- "EXC"
data$LC3[data$LC2=="INC" & data$LC_TYPE=="MNG"] <- "EXC"
data$LC3[data$LC2=="INC" & data$LC_TYPE=="OPM"] <- "INC"
data$LC3[data$LC2=="INC" & data$LC_TYPE=="RBM"] <- "INC"

# Level 4: oil palm | rubber
data$LC4[data$LC3=="EXC"] <- "EXC"
data$LC4[data$LC3=="INC" & data$LC_TYPE=="OPM"] <- "OPM"
data$LC4[data$LC3=="INC" & data$LC_TYPE=="RBM"] <- "RBM"

# Select observations per classification level and store selected data in variables

data.lc1  <- data
data.lc2  <- subset(data, subset=(LC1=="INC"))
data.lc3  <- subset(data, subset=(LC2=="INC"))
data.lc4  <- subset(data, subset=(LC3=="INC"))

# EXECUTE DECISION TREE CLASSIFICATION

# Execute tree function using specified classification level and predictor variables

tree.lc1  <- tree(factor(LC1) ~ HH, data.lc1)
tree.lc2  <- tree(factor(LC2) ~ B4, data.lc2)
tree.lc3  <- tree(factor(LC3) ~ B5, data.lc3)
tree.lc4  <- tree(factor(LC4) ~ HH + B6, data.lc4)
tree.lc4a <- tree(factor(LC4) ~ B6, data.lc4) # B6 only

# SAVE OUTPUTS TO FILE

# Generate tree summary and misclassification statistics and save as TXT file

sink("output-tree-summary-lc1.txt", append=FALSE, split=TRUE)
print(tree.lc1)
print(summary(tree.lc1))
print(misclass.tree(tree.lc1, detail=TRUE))
sink()
sink("output-tree-summary-lc2.txt", append=FALSE, split=TRUE)
print(tree.lc2)
print(summary(tree.lc2))
print(misclass.tree(tree.lc2, detail=TRUE))
sink()
sink("output-tree-summary-lc3.txt", append=FALSE, split=TRUE)
print(tree.lc3)
print(summary(tree.lc3))
print(misclass.tree(tree.lc3, detail=TRUE))
sink()
sink("output-tree-summary-lc4.txt", append=FALSE, split=TRUE)
print(tree.lc4)
print(summary(tree.lc4))
print(misclass.tree(tree.lc4, detail=TRUE))
sink()
sink("output-tree-summary-lc4a.txt", append=FALSE, split=TRUE)
print(tree.lc4a)
print(summary(tree.lc4a))
print(misclass.tree(tree.lc4a, detail=TRUE))
sink()

# Plot tree object/dendrogram and save as PDF file

pdf("output-dendrogram-lc1.pdf", width=7, height=5.5)
plot(tree.lc1)
text(tree.lc1, cex=0.70)
dev.off()
pdf("output-dendrogram-lc2.pdf", width=7, height=5.5)
plot(tree.lc2)
text(tree.lc2, cex=0.70)
dev.off()
pdf("output-dendrogram-lc3.pdf", width=7, height=5.5)
plot(tree.lc3)
text(tree.lc3, cex=0.70)
dev.off()
pdf("output-dendrogram-lc4.pdf", width=7, height=5.5)
plot(tree.lc4)
text(tree.lc4, cex=0.70)
dev.off()
pdf("output-dendrogram-lc4a.pdf", width=7, height=5.5)
plot(tree.lc4a)
text(tree.lc4a, cex=0.70)
dev.off()
