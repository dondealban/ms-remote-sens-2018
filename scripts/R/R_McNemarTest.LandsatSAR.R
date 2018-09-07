# This script calculates the McNemar's test statistic to evaluate the statistical
# significance of the differences between the classification results.  
#
# Script By:      Jose Don T De Alban
# Date Created:   20 Mar 2017
# Last Modified:  23 Jan 2018


# LOAD LIBRARIES AND DATA

# Set working directory
setwd("/Users/dondealban/Dropbox/Research/myanmar/mcnemar test/")

# Load the required R libraries
library(exact2x2)


# CREATE 2x2 CONTINGENCY MATRICES
# Note: value taken from separate spreadsheets

# Compare using all predictor variables
mat01 = matrix(c(571,20,12,29), ncol=2, byrow=TRUE) # SetA 1995: Landsat+SAR vs. Landsat
mat02 = matrix(c(526,37, 3,40), ncol=2, byrow=TRUE) # SetA 2015: Landsat+SAR vs. Landsat
mat03 = matrix(c(526,43, 3,34), ncol=2, byrow=TRUE) # SetB 2015: Landsat+SAR vs. Landsat
mat04 = matrix(c(560, 3, 9,34), ncol=2, byrow=TRUE) # SetA 2015 vs. SetB 2015: Landsat+SAR


# CALCULATE McNEMAR's TEST STATISTIC (WITHOUT CONTINUITY CORRECTION)

# Compare using all predictor variables
mco01 <- mcnemar.test(mat01, correct=FALSE)
mco02 <- mcnemar.test(mat02, correct=FALSE)
mco03 <- mcnemar.test(mat03, correct=FALSE)
mco04 <- mcnemar.test(mat04, correct=FALSE)


# SAVE OUTPUT FILES

sink("output-summary-mcnemar-test-new.txt", append=FALSE, split=TRUE)
cat("MCNEMAR'S TESTS: CONSOLIDATED RESULTS")
cat("\n")
cat("\n")
cat("USING ALL PREDICTOR VARIABLES", sep="\n")
cat("SET A 1995: LANDSAT+SAR vs. LANDSAT", sep="\n")
print(mco01)
cat("USING ALL PREDICTOR VARIABLES", sep="\n")
cat("SET A 2015: LANDSAT+SAR vs. LANDSAT", sep="\n")
print(mco02)
cat("USING ALL PREDICTOR VARIABLES", sep="\n")
cat("SET B 2015: LANDSAT+SAR vs. LANDSAT", sep="\n")
print(mco03)
cat("USING ALL PREDICTOR VARIABLES", sep="\n")
cat("SET A 2015 vs SET B 2015: LANDSAT+SAR", sep="\n")
print(mco04)
sink()