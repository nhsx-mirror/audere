//
//  Copyright (C) 2019 University of Washington Ubicomp Lab
//  All rights reserved.
//
//  This software may be modified and distributed under the terms
//  of a BSD-style license that can be found in the LICENSE file.
//

#import "ImageProcessor.h"
#import <opencv2/imgcodecs/ios.h> // For code to convert UIImage to Mat
#import <opencv2/calib3d/calib3d.hpp> // For calib3d
#include <iostream>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/imgcodecs/ios.h>
#include <opencv2/xfeatures2d.hpp>
#include <opencv2/xfeatures2d/nonfree.hpp>
#include <Accelerate/Accelerate.h>

using namespace cv;
using namespace cv::xfeatures2d;
using namespace std;

const float SHARPNESS_THRESHOLD = 0.0;
const float OVER_EXP_THRESHOLD = 255;
const float UNDER_EXP_THRESHOLD = 120;
const float OVER_EXP_WHITE_COUNT = 100;
const double SIZE_THRESHOLD = 0.3;
const double POSITION_THRESHOLD = 0.2;
const double VIEWPORT_SCALE = 0.5;
const int GOOD_MATCH_COUNT = 7;
const double minSharpness = FLT_MIN;
const double maxSharpness = FLT_MAX; //this value is set to min because blur check is not needed.
const int MOVE_CLOSER_COUNT = 5;
const double CROP_RATIO = 0.6;
const double VIEW_FINDER_SCALE_W = 0.15;
const double VIEW_FINDER_SCALE_H = 0.52;
const float INTENSITY_THRESHOLD = 190;
const float CONTROL_INTENSITY_PEAK_THRESHOLD = 150;
const float TEST_INTENSITY_PEAK_THRESHOLD = 50;
const int LINE_SEARCH_WIDTH = 13;
const int CONTROL_LINE_POSITION = 40;
const int TEST_A_LINE_POSITION = 10;
const int TEST_B_LINE_POSITION = 70;
const cv::Rect RESULT_WINDOW_RECT = cv::Rect(590, 15, 110, 20);

NSString *instruction_detected = @"RDT detected at the center!";
NSString *instruction_pos = @"Place RDT at the center.\nFit RDT to the rectangle.";
NSString *instruction_too_small = @"Place RDT at the center.\nFit RDT to the rectangle.\nMove closer.";
NSString *instruction_too_large = @"Place RDT at the center.\nFit RDT to the rectangle.\nMove further away.";
NSString *instruction_focusing = @"Place RDT at the center.\nFit RDT to the rectangle.\nCamera is focusing. \nStay still.";
NSString *instruction_unfocused = @"Place RDT at the center.\n Fit RDT to the rectangle.\nCamera is not focused. \nMove further away.";

Ptr<BRISK> detector;
Ptr<BFMatcher> matcher;
Mat refImg;
Mat refDescriptor;
vector<KeyPoint> refKeypoints;
int mMoveCloserCount;

Ptr<SIFT> siftDetector;
Ptr<BFMatcher> siftMatcher;
vector<KeyPoint> siftRefKeypoints;
Mat siftRefDescriptor;

@implementation ImageProcessor

// Singleton object
+ (ImageProcessor *)sharedProcessor {
    static ImageProcessor *sharedWrapper = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedWrapper = [[self alloc] init];
        detector = BRISK::create(45, 4, 1.0f);
        matcher = BFMatcher::create(cv::NORM_HAMMING); // 4 indicates BF Hamming
        
        siftDetector = SIFT::create();
        siftMatcher = BFMatcher::create(cv::NORM_L2);
        
        UIImage * image = [UIImage imageNamed:@"quickvue_ref_v1.jpg"];
        UIImageToMat(image, refImg);
        NSLog(@"RefImg Size: (%d, %d)", refImg.size().width, refImg.size().height);
        cvtColor(refImg, refImg, CV_BGRA2GRAY); // Dereference the pointer
        detector->detectAndCompute(refImg, noArray(), refKeypoints, refDescriptor);
        siftDetector->detectAndCompute(refImg, noArray(), siftRefKeypoints, siftRefDescriptor);
        NSLog(@"Successfully set up BRISK Detector and BFHamming matcher");
        NSLog(@"Successfully detect and compute reference RDT, currently there are %lu keypoints",refKeypoints.size());
    });
    return sharedWrapper;
}

- (void) releaseProcessor{
    refImg.release();
    refDescriptor.release();
    detector.release();
    matcher.release();
}

// CJ: this is just a util function to convert an image object of iOS to Mat object of OpenCV
// Get Mat from buffer
- (cv::Mat)matFromSampleBuffer:(CMSampleBufferRef)sampleBuffer {
    
    CVImageBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
    CVPixelBufferLockBaseAddress(pixelBuffer, 0);
    size_t bufferWidth = CVPixelBufferGetWidth(pixelBuffer);
    size_t bufferHeight = CVPixelBufferGetHeight(pixelBuffer);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(pixelBuffer);
    unsigned char *pixel = (unsigned char *)CVPixelBufferGetBaseAddress(pixelBuffer);
    Mat mat = Mat((int)bufferHeight,(int)bufferWidth,CV_8UC4, pixel,(int)bytesPerRow); //put buffer in open cv, no memory copied
    CVPixelBufferUnlockBaseAddress(pixelBuffer, 0);
    
    //Mat greyMat;
    //cvtColor(mat, greyMat, CV_BGRA2GRAY);

    //mat.release();
    NSLog(@"Mat size: (%d, %d)", mat.size().width, mat.size().height);
    return mat;
}

- (ExposureResult)checkBrightness:(Mat)inputMat {
    
    // Brightness Calculation
    vector<float> histograms = [self calculateBrightness:inputMat];
    
    int maxWhite = 0;
    float whiteCount = 0;
    
    for (int i = 0; i < histograms.size(); i++) {
        if (histograms[i] > 0) {
            maxWhite = i;
        }
        if (i == histograms.size() - 1) {
            whiteCount = histograms[i];
        }
    }
    
    // Check Brightness starts
    ExposureResult exposureResult;
    if (maxWhite >= OVER_EXP_THRESHOLD && whiteCount > OVER_EXP_WHITE_COUNT) {
        exposureResult = OVER_EXPOSED;
        return exposureResult;
    } else if (maxWhite < UNDER_EXP_THRESHOLD) {
        exposureResult = UNDER_EXPOSED;
        return exposureResult;
    } else {
        exposureResult = NORMAL;
        return exposureResult;
    }
}

- (bool)checkSharpness:(Mat)inputMat {
    
    double sharpness = [self calculateSharpness:inputMat];
    
    //CJ: checkSharpness starts
    bool isSharp = sharpness > (minSharpness * SHARPNESS_THRESHOLD);
    
    return isSharp;
}


//CJ: captureRDT starts
- (void)captureRDT:(CMSampleBufferRef)sampleBuffer withCompletion:(ImageProcessorBlock)completion {
    Mat inputMat = [self matFromSampleBuffer:sampleBuffer];
    Mat greyMat;
    cvtColor(inputMat, greyMat, CV_BGRA2GRAY);
    double matchDistance = 0.0;
    bool passed = false;
    
    //check brightness (refactored)
    ExposureResult exposureResult = [self checkBrightness:greyMat];
    //isRightBrightness = false;
    
    //check sharpness (refactored)
    bool isSharp = [self checkSharpness:greyMat];
    //isSharp = false;
    
    //preform detectRDT only if those two quality checks are passed
    if (exposureResult == NORMAL && isSharp) {
        //CJ: detectRDT starts
        
        //CJ: detectRDT ends inside of "performBRISKSearchOnMat". Check "performBRISKSearchOnMat" for the end of detectRDT.
        vector<Point2f> boundary;
        matchDistance = [self detectRDT:greyMat andReturn: &boundary];
        bool isCentered = false;
        SizeResult sizeResult = INVALID;
        bool isRightOrientation = false;
        
        //[self checkPositionAndSize:boundary isCropped:false inside:greyMat.size()];
        
        if (boundary.size() > 0) {
            isCentered = [self checkIfCentered:boundary inside:greyMat.size()];
            sizeResult = [self checkSize:boundary inside:greyMat.size()];
            isRightOrientation = [self checkOrientation:boundary];
        }
        
        Mat rgbMat = [self cropRDT:inputMat];
        Mat resultWindowMat = Mat();
        bool isControlLine = false;
        if (boundary.size() > 0) {
            resultWindowMat = [self checkControlLine: rgbMat andResult: &isControlLine];
            //if (rgbMat.cols == 110)
            //    isControlLine = true;
            //rgbMat = [self cropResultWindow:inputMat with:boundary];
            //rgbMat = [self interpretResult: inputMat];
        }
        
        passed = sizeResult == RIGHT_SIZE && isCentered && isRightOrientation && isControlLine;
        
        NSLog(@"PASSED: %d", passed);
        
        cvtColor(rgbMat, rgbMat, CV_BGRA2RGBA);
        
        completion(passed, MatToUIImage(rgbMat), matchDistance, exposureResult, sizeResult, isCentered, isRightOrientation, isSharp, false, resultWindowMat);
        //completion(passed, MatToUIImage(inputMat), matchDistance, exposureResult, sizeResult, isCentered, isRightOrientation, isSharp, false);
    } else {
        NSLog(@"Found = ENTERED");
        completion(passed, nil, matchDistance, exposureResult, INVALID, false, false, isSharp, false, Mat());
    }
}
// end of caputureRDT

- (double)detectRDT:(Mat)inputMat andReturn: (vector<Point2f> *) boundary{
    double currentTime = CACurrentMediaTime();
    Mat inDescriptor;
    vector<KeyPoint> inKeypoints;
    UIImage *resultImg;
    //vector<cv::Point2f> boundary;
    double avgDist = 0.0;
    
//    InputArray mask;
    
    Mat mask = Mat(inputMat.size().width, inputMat.size().height, CV_8U, Scalar(0));
    
    cv::Point p1 = cv::Point(0, inputMat.size().height*(1-VIEW_FINDER_SCALE_W)/2);
    cv::Point p2 = cv::Point(inputMat.size().width-p1.x, inputMat.size().height-p1.y);
    rectangle(mask, p1, p2, Scalar(255), -1);
    
    detector->detectAndCompute(inputMat, mask, inKeypoints, inDescriptor);
    
    if (inDescriptor.cols < 1 || inDescriptor.rows < 1) { // No features found!
        NSLog(@"Found no features!");
        NSLog(@"Time taken to detect: %f -- fail -- BRISK", CACurrentMediaTime() - currentTime);
        return 0.0;
    }
    NSLog(@"Found %lu keypoints from input image", inKeypoints.size());
    
    // Matching
    vector<DMatch> matches;
    matcher->match(refDescriptor, inDescriptor, matches);
    
    double maxDist = FLT_MIN;
    double minDist = FLT_MAX;
    
    for (int i = 0; i < matches.size(); i++) {
        double dist = matches[i].distance;
        maxDist = MAX(maxDist, dist);
        minDist = MIN(minDist, dist);
    }
    
    double sum = 0;
    int count = 0;
    vector<DMatch> goodMatches = matches;
    sort(goodMatches.begin(), goodMatches.end(), [](DMatch a, DMatch b) {return a.distance < b.distance; });
    
    vector<Point2f> srcPoints; // Works without allocating space?
    vector<Point2f> dstPoints;
    
    for (int i = 0; i < goodMatches.size(); i++) {
        DMatch currentMatch = goodMatches[i];
        srcPoints.push_back(refKeypoints[currentMatch.queryIdx].pt);
        dstPoints.push_back(inKeypoints[currentMatch.trainIdx].pt);
    }
    
    bool found = false;
    NSMutableArray *posSizeArr  = nil;
    // HOMOGRAPHY!
    NSLog(@"GoodMatches size %lu", goodMatches.size());
    if (goodMatches.size() > GOOD_MATCH_COUNT) {
        Mat H = findHomography(srcPoints, dstPoints, CV_RANSAC, 5);
        
        if (H.cols >= 3 && H.rows >= 3) {
            Mat objCorners = Mat(4, 1, CV_32FC2);
            Mat sceneCorners = Mat(4, 1, CV_32FC2);
            
            objCorners.at<Vec2f>(0, 0)[0] = 0;
            objCorners.at<Vec2f>(0, 0)[1] = 0;
            
            objCorners.at<Vec2f>(1, 0)[0] = refImg.cols - 1;
            objCorners.at<Vec2f>(1, 0)[1] = 0;
            
            objCorners.at<Vec2f>(2, 0)[0] = refImg.cols - 1;
            objCorners.at<Vec2f>(2, 0)[1] = refImg.rows - 1;
            
            objCorners.at<Vec2f>(3, 0)[0] = 0;
            objCorners.at<Vec2f>(3, 0)[1] = refImg.rows - 1;
            
            perspectiveTransform(objCorners, sceneCorners, H); // Not sure! if I'm suppose to dereference
            
            NSLog(@"Transformed-BRISK: %.2f (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f)",
                  sceneCorners.at<Vec2f>(1, 0)[0]-sceneCorners.at<Vec2f>(0, 0)[0],
                  sceneCorners.at<Vec2f>(0, 0)[0], sceneCorners.at<Vec2f>(0, 0)[1],
                  sceneCorners.at<Vec2f>(1, 0)[0], sceneCorners.at<Vec2f>(1, 0)[1],
                  sceneCorners.at<Vec2f>(2, 0)[0], sceneCorners.at<Vec2f>(2, 0)[1],
                  sceneCorners.at<Vec2f>(3, 0)[0], sceneCorners.at<Vec2f>(3, 0)[1]);
            
            
            (*boundary).push_back(Point2f(sceneCorners.at<Vec2f>(0,0)[0], sceneCorners.at<Vec2f>(0,0)[1]));
            (*boundary).push_back(Point2f(sceneCorners.at<Vec2f>(1,0)[0], sceneCorners.at<Vec2f>(1,0)[1]));
            (*boundary).push_back(Point2f(sceneCorners.at<Vec2f>(2,0)[0], sceneCorners.at<Vec2f>(2,0)[1]));
            (*boundary).push_back(Point2f(sceneCorners.at<Vec2f>(3,0)[0], sceneCorners.at<Vec2f>(3,0)[1]));
            
            objCorners.release();
            sceneCorners.release();
            
            avgDist = sum/count;
            NSLog(@"Average distance: %.2f", sum/count);

        }
    }
    NSLog(@"Time taken to detect: %f - success - BRISK", CACurrentMediaTime() - currentTime);
    return avgDist;
}

- (double) measureOrientation:(vector<Point2f>) boundary {
    RotatedRect rotatedRect = minAreaRect(boundary);
    
    bool isUpright = rotatedRect.size.height > rotatedRect.size.width;
    double angle = 0;
    double height = 0;
    
    if (isUpright) {
        angle = 90 - abs(rotatedRect.angle);
    } else {
        angle = abs(rotatedRect.angle);
    }
    
    return angle;
}

- (bool) checkOrientation:(vector<Point2f>) boundary {
    double angle = [self measureOrientation:boundary];
    
    bool isOriented = angle < 90.0*POSITION_THRESHOLD;
    
    return isOriented;
}

- (double) measureSize:(vector<Point2f>) boundary {
    RotatedRect rotatedRect = minAreaRect(boundary);
    
    bool isUpright = rotatedRect.size.height > rotatedRect.size.width;
    double angle = 0;
    double height = 0;
    
    if (isUpright) {
        angle = 90 - abs(rotatedRect.angle);
        height = rotatedRect.size.height;
    } else {
        angle = abs(rotatedRect.angle);
        height = rotatedRect.size.width;
    }
    
    return height;
}

// Check Size Function need to fill in return values
- (SizeResult) checkSize:(vector<Point2f>) boundary inside:(cv::Size) size {
    double height = [self measureSize:boundary];
    //bool isRightSize = height < size.width*VIEWPORT_SCALE+VIEWPORT_SCALE*SIZE_THRESHOLD) && height > size.width*VIEWPORT_SCALE*(1-SIZE_THRESHOLD);
    bool isRightSize = height < size.width*VIEWPORT_SCALE+100 && height > size.width*VIEWPORT_SCALE-100;
    
    bool invalid = true;
    for(int i = 0; i < boundary.size(); i++) {
        if (boundary.at(i).x < 0 || boundary.at(i).y)
            invalid = false;
    }
    
    SizeResult sizeResult = INVALID;
    
    if (!invalid) {
        if (isRightSize) {
            sizeResult = RIGHT_SIZE;
        } else {
            if (height > size.width*VIEWPORT_SCALE+100) {
                sizeResult = LARGE;
            } else if (height < size.width*VIEWPORT_SCALE-100) {
                sizeResult = SMALL;
            } else {
                sizeResult = INVALID;
            }
        }
    }
    
    return sizeResult;
}

// If Centered function, need to fill in return values
- (bool) checkIfCentered:(vector<Point2f>) boundary inside:(cv::Size)size{
    cv::Point center = [self measureCentering:boundary];
    cv::Point trueCenter = cv::Point(size.width/2, size.height/2);
    bool isCentered = center.x < trueCenter.x + (size.width*POSITION_THRESHOLD) && center.x > trueCenter.x-(size.width*POSITION_THRESHOLD)
    && center.y < trueCenter.y+(size.height*POSITION_THRESHOLD) && center.y > trueCenter.y-(size.height*POSITION_THRESHOLD);
    
    return isCentered;
}

- (cv::Point) measureCentering:(vector<Point2f>) boundary {
    RotatedRect rotatedRect = minAreaRect(boundary);
    return rotatedRect.center;
}

-(NSMutableArray *) checkPositionAndSize:(vector<Point2f>) boundary isCropped:(bool) cropped inside:(cv::Size) size {
    //CJ: checkSize starts
    //CJ: checkIfCentered starts
    //CJ: checkOrientation starts
    NSMutableArray *result = [[NSMutableArray alloc] init];
    for (int i = 0; i < 5; i++) {
        [result addObject:[NSNumber numberWithBool:false]];
    }
    if (boundary.size() < 1) {
        return result;
    }

    RotatedRect rotatedRect = minAreaRect(boundary);
    if (cropped) {
        rotatedRect.center = cv::Point(rotatedRect.center.x + size.width/4, rotatedRect.center.y + size.height/4);
    }

    //CJ: checkIfCentered continues
    cv::Point center = rotatedRect.center;
    cv::Point trueCenter = cv::Point(size.width/2, size.height/2);
    bool isCentered = center.x < trueCenter.x *(1+ POSITION_THRESHOLD) && center.x > trueCenter.x*(1- POSITION_THRESHOLD)
    && center.y < trueCenter.y *(1+ POSITION_THRESHOLD) && center.y > trueCenter.y*(1- POSITION_THRESHOLD);
    //CJ: checkIfCentered ends

    //CJ: checkOrientation and checkSize continues. variable "height" is used for checkSize,
    //and variable "isUpright" and "angle" are used for checkOrientation
    bool isUpright = rotatedRect.size.height > rotatedRect.size.width;
    double angle = 0;
    double height = 0;

    if (isUpright) {
        angle = 90 - abs(rotatedRect.angle);
        height = rotatedRect.size.height;
    } else {
        angle = abs(rotatedRect.angle);
        height = rotatedRect.size.width;
    }
    bool isOriented = angle < 90.0*POSITION_THRESHOLD;
    //CJ: checkOrientation ends

    bool isRightSize = height < size.height*VIEWPORT_SCALE*(1+SIZE_THRESHOLD) && height > size.height*VIEWPORT_SCALE*(1-SIZE_THRESHOLD);
    //CJ: checkSize ends

    result[0] = [NSNumber numberWithBool:isCentered];
    result[1] = [NSNumber numberWithBool:isRightSize];
    result[2] = [NSNumber numberWithBool:isOriented];

    //CJ: for size, we have to return whether the image is large or small to provide instruction.
    result[3] = [NSNumber numberWithBool:(height > size.height*VIEWPORT_SCALE*(1+SIZE_THRESHOLD))]; // large
    result[4] = [NSNumber numberWithBool:(height < size.height*VIEWPORT_SCALE*(1-SIZE_THRESHOLD))];// small

    //if (((NSNumber*)result[0]).boolValue && ((NSNumber *)result[1]).boolValue ) {
        NSLog(@"POS: %.2d, %.2d, Angle: %.2f, Height: %.2f", center.x, center.y, angle, height);
    //}

    return result;
}

-(Mat) cropRDT:(Mat) inputMat {
    int width = (int)(inputMat.cols * CROP_RATIO);
    int height = (int)(inputMat.rows * CROP_RATIO);
    int x = (int)(inputMat.cols*(1.0-CROP_RATIO)/2);
    int y = (int)(inputMat.rows*(1.0-CROP_RATIO)/2);
    
    cv::Rect roi = cv::Rect(x, y, width, height);
    Mat cropped = Mat(inputMat, roi);

    return cropped;
}

-(double) calculateSharpness:(Mat) input {
    Mat des = Mat();
    Laplacian(input, des, CV_64F);

    vector<double> median;
    vector<double> std;

    meanStdDev(des, median, std);


    double sharpness = pow(std[0],2);
    des.release();
    return sharpness;
}


-(vector<float>) calculateBrightness:(Mat) input {
    int mHistSizeNum =256;
    vector<int> mHistSize;
    mHistSize.push_back(mHistSizeNum);
    Mat hist = Mat();
    vector<float> mBuff;
    vector<float> histogramRanges;
    histogramRanges.push_back(0.0);
    histogramRanges.push_back(256.0);
    cv::Size sizeRgba = input.size();
    vector<int> channel = {0};
    vector<Mat> allMat = {input};
    calcHist(allMat, channel, Mat(), hist, mHistSize, histogramRanges);
    normalize(hist, hist, sizeRgba.height/2, 0, NORM_INF);
    mBuff.assign((float*)hist.datastart, (float*)hist.dataend);
    return mBuff;
}


-(NSString *) getInstruction: (SizeResult) sizeResult andFor: (bool) isCentered andFor: (bool) isRightOrientation {
//-(NSString *) getInstruction: (NSMutableArray *) isCorrectPosSize {
    NSString *instructions = instruction_pos;
    
    if (sizeResult == RIGHT_SIZE && isCentered && isRightOrientation){
        instructions = instruction_detected;
        mMoveCloserCount = 0;
    } else if (mMoveCloserCount > MOVE_CLOSER_COUNT) {
        if (sizeResult != INVALID && sizeResult == SMALL) {
            instructions = instruction_too_small;
            mMoveCloserCount = 0;
        }
    } else {
        instructions = instruction_too_small;
        mMoveCloserCount++;
    }
    
    return instructions;
    
//    if (isCorrectPosSize != nil) {
//        if (isCorrectPosSize[1] && isCorrectPosSize[0] && isCorrectPosSize[2]) {
//            instructions = instruction_detected;
//
//        } else if (mMoveCloserCount > MOVE_CLOSER_COUNT) {
//            if (!isCorrectPosSize[5]) {
//                if (!isCorrectPosSize[0] || (!isCorrectPosSize[1] && isCorrectPosSize[3])) {
//                    instructions = instruction_pos;
//                } else if (!isCorrectPosSize[1] && isCorrectPosSize[4]) {
//                    instructions = instruction_too_small;
//                    mMoveCloserCount = 0;
//                }
//            } else {
//                instructions = instruction_pos;
//            }
//        } else {
//            instructions = instruction_too_small;
//            mMoveCloserCount++;
//        }
//    }
//
//    return instructions;
}

//needs to change isBright to incorporate both too dark and too bright
-(NSMutableArray *) getQualityCheckTexts: (SizeResult) sizeResult andFor: (bool) isCentered andFor: (bool) isRightOrientation andFor: (bool) isSharp andFor:(ExposureResult) exposureResult {
//-(NSMutableArray *) getQualityCheckTextsFor: (bool) isSharp andFor:(bool) isBright andFor:(bool) isSizeble andFor:(bool) isCentered {
    NSMutableArray *texts = [[NSMutableArray alloc] init];
    
    texts[0] = isSharp ? @"Sharpness: PASSED": @"Sharpness: FAILED";
    if (exposureResult == NORMAL) {
        texts[1] = @"Brightness: PASSED";
    } else if (exposureResult == OVER_EXPOSED) {
        texts[1] = @"Brightness: TOO BRIGHT";
    } else if (exposureResult == UNDER_EXPOSED) {
        texts[1] = @"Brightness: TOO DARK";
    }
    
    texts[2] = sizeResult==RIGHT_SIZE && isCentered && isRightOrientation ? @"POSITION/SIZE: PASSED": @"POSITION/SIZE: FAILED";
    texts[3] = @"Shadow: PASSED";
    
    return texts;
}

-(void) configureCamera: (AVCaptureDevice *) device with: (dispatch_queue_t) sessionQueue {
    dispatch_async( sessionQueue, ^{
        CGFloat X = 0.5;
        CGFloat Y = 0.5;
        
        AVCaptureExposureMode EXPOSURE_MODE = AVCaptureExposureModeContinuousAutoExposure;
        AVCaptureFocusMode FOCUS_MODE = AVCaptureFocusModeContinuousAutoFocus;
        
        //Setting Autofocus and exposure
        NSError *error = nil;
        if ( [device lockForConfiguration:&error] ) {
            /*
             Setting (focus/exposure)PointOfInterest alone does not initiate a (focus/exposure) operation.
             Call set(Focus/Exposure)Mode() to apply the new point of interest.
             */
            //            if ([device hasTorch] && [device isTorchAvailable]) {
            //                [device setTorchMode:AVCaptureTorchModeOn];
            //            }
            
            CGPoint focusPoint = CGPointMake(X, Y);
            NSLog(@"%f, %f",focusPoint.x,focusPoint.y);
            if (device.isFocusPointOfInterestSupported && [device isFocusModeSupported:FOCUS_MODE] ) {
                device.focusPointOfInterest = focusPoint;
                device.focusMode = FOCUS_MODE;
            }
            
            if (device.isExposurePointOfInterestSupported && [device isExposureModeSupported:EXPOSURE_MODE] ) {
                device.exposurePointOfInterest = focusPoint;
                device.exposureMode = EXPOSURE_MODE;
            }
            
            if ([device isWhiteBalanceModeSupported:AVCaptureWhiteBalanceModeContinuousAutoWhiteBalance]) {
                device.whiteBalanceMode = AVCaptureWhiteBalanceModeContinuousAutoWhiteBalance;
            }
            
            if ([device isTorchAvailable] && [device isTorchModeSupported:AVCaptureTorchModeOn]) {
                [device setTorchMode:AVCaptureTorchModeOn];
                [device setTorchModeOnWithLevel:1.0 error:nil];
                [device setExposureTargetBias:0 completionHandler:nil];
            }
            
            device.subjectAreaChangeMonitoringEnabled = YES;
            
            [device unlockForConfiguration];
        }
        else {
            NSLog( @"Could not lock device for configuration: %@", error );
        }
    });
}

- (void) generateViewFinder: (UIView *) view forPreview:(UIView *)previewView{
    double width = previewView.frame.size.width * VIEW_FINDER_SCALE_W;
    double height = previewView.frame.size.height * VIEW_FINDER_SCALE_H;
    
    double xPos = (view.frame.size.width - width)/2;
    double yPos = (view.frame.size.height - height)/2;
    UIBezierPath *insideBox = [UIBezierPath bezierPathWithRect:CGRectMake(xPos, yPos, width, height)];
    UIBezierPath *outerBox = [UIBezierPath bezierPathWithRect:view.frame];
    [insideBox appendPath:outerBox];
    insideBox.usesEvenOddFillRule = YES;
    
    NSLog(@"View size: (%.2f,%.2f), Preview size: (%.2f, %.2f)", view.frame.size.width, view.frame.size.height,
          previewView.frame.size.width, previewView.frame.size.height);
    NSLog(@"View size: (%.2f,%.2f), Preview size: (%.2f, %.2f)", view.frame.origin.x, view.frame.origin.y,
          previewView.frame.origin.x, previewView.frame.origin.y);
    
    
    CAShapeLayer *fillLayer = [CAShapeLayer layer];
    fillLayer.path = insideBox.CGPath;
    fillLayer.fillRule = kCAFillRuleEvenOdd;
    fillLayer.fillColor = [UIColor redColor].CGColor;
    fillLayer.opacity = 0.5;
    fillLayer.strokeColor = [UIColor whiteColor].CGColor;
    fillLayer.lineWidth = 5.0;
    [view.layer insertSublayer:fillLayer above:view.layer.sublayers[0]];
}

-(UIImage *) interpretResult:(Mat) inputMat {
    
    vector<Point2f> boundary = [self detectRDTWithSIFT:inputMat];
    if (boundary.size() <= 0)
        return MatToUIImage(inputMat);
    
    Mat resultMat = [self cropResultWindow:inputMat with:boundary];
    resultMat = [self enhanceResultWindow:resultMat withTile:cv::Size(5, resultMat.cols)];
    //resultMat = [self correctGamma:resultMat withGamma:0.75];
    
    bool control = [self readControlLine:resultMat at:cv::Point(CONTROL_LINE_POSITION,0)];
    bool testA = [self readTestLine:resultMat at:cv::Point(TEST_A_LINE_POSITION,0)];
    bool testB = [self readTestLine:resultMat at:cv::Point(TEST_B_LINE_POSITION,0)];
    
    NSLog(@"Control: %d, TestA: %d, TestB: %d", control, testA, testB);
    
    return MatToUIImage(resultMat);
}

-(UIImage *) interpretResultWithResultWindow:(Mat) inputMat andControlLine: (bool*) control andTestA: (bool*) testA andTestB: (bool*) testB {
    NSLog(@"Result Mat size: (%d, %d) -- interpretation", inputMat.size().width, inputMat.size().height);
    *control = [self readControlLine:inputMat at:cv::Point(CONTROL_LINE_POSITION,0)];
    *testA = [self readTestLine:inputMat at:cv::Point(TEST_A_LINE_POSITION,0)];
    *testB = [self readTestLine:inputMat at:cv::Point(TEST_B_LINE_POSITION,0)];
    
    NSLog(@"Control: %d, TestA: %d, TestB: %d", *control, *testA, *testB);
    
    cvtColor(inputMat, inputMat, CV_BGR2RGBA);
    
    return MatToUIImage(inputMat);
}

-(Mat) checkControlLine:(Mat) inputMat andResult:(bool *) result {
    vector<Point2f> boundary = [self detectRDTWithSIFT:inputMat];
    if (boundary.size() <= 0)
        return inputMat;
        //return inputMat;
    
    Mat resultMat = [self cropResultWindow:inputMat with:boundary];
    resultMat = [self enhanceResultWindow:resultMat withTile:cv::Size(5, resultMat.cols)];
    NSLog(@"Result Mat size -- check control line: (%d, %d)", resultMat.size().width, resultMat.size().height);
    bool control = [self readControlLine:resultMat at:cv::Point(CONTROL_LINE_POSITION,0)];
    
    NSLog(@"Control: %d", control);
    
    *result = control;
    
    return resultMat;
    //return control;// ? resultMat : inputMat;
}

-(bool) readLine:(Mat) inputMat at: (cv::Point) position for: (bool) isControlLine {
    Mat hls = Mat();
    cvtColor(inputMat, hls, COLOR_BGRA2BGR);
    cvtColor(hls, hls, COLOR_BGR2HLS);
    
    vector<Mat> channels;
    cv::split(hls, channels);
    
    int lower_bound = (position.x-LINE_SEARCH_WIDTH < 0 ? 0 : position.x-LINE_SEARCH_WIDTH);
    int upper_bound = position.x+LINE_SEARCH_WIDTH;
    
    float *avgIntensities = (float *) malloc((upper_bound-lower_bound)*sizeof(float));
    float *avgHues = (float *) malloc((upper_bound-lower_bound)*sizeof(float));
    float *avgSats = (float *) malloc((upper_bound-lower_bound)*sizeof(float));
    
    for (int i = lower_bound; i < upper_bound; i++) {
        float sumIntensity=0;
        float sumHue=0;
        float sumSat=0;
        for (int j = 0; j < channels[1].rows; j++) {
            sumIntensity+=channels[1].at<uchar>(j, i);
            sumHue+=channels[0].at<uchar>(j, i);
            sumSat+=channels[2].at<uchar>(j, i);
        }
        avgIntensities[i-lower_bound] = sumIntensity/channels[1].rows;
        avgHues[i-lower_bound] = sumHue/channels[0].rows;
        avgSats[i-lower_bound] = sumSat/channels[2].rows;
        //NSLog(@"Avg HLS: %.2f, %.2f, %.2f", avgHues[i-lower_bound]*2, avgIntensities[i-lower_bound]/255*100, avgSats[i-lower_bound]/255*100);
    }
    
    float min, max;
    vDSP_Length min_index, max_index;
    vDSP_minvi(avgIntensities, 1, &min, &min_index, upper_bound-lower_bound);
    vDSP_maxvi(avgIntensities, 1, &max, &max_index, upper_bound-lower_bound);
    
    NSLog(@"Intensity Minimum HLS (%.2f, %.2f, %.2f) at %lu/%d", avgHues[min_index]*2, min/255*100, avgSats[min_index]/255*100, min_index, upper_bound-lower_bound);
    NSLog(@"Intensity Maximum HLS (%.2f, %.2f, %.2f) at %lu/%d", avgHues[max_index]*2, max/255*100, avgSats[max_index]/255*100, max_index, upper_bound-lower_bound);
    NSLog(@"Intensity diff %.3f",abs(min-max));
    
    //cv::line(inputMat, cv::Point(lower_bound+(int)min_index,0), cv::Point(lower_bound+(int)min_index, inputMat.rows), cv::Scalar(0), 1);
    //cv::line(inputMat, cv::Point(lower_bound+(int)max_index,0), cv::Point(lower_bound+(int)max_index, inputMat.rows), cv::Scalar(255), 1);
    //cv::rectangle(inputMat, cv::Point(lower_bound, 0), cv::Point(upper_bound, inputMat.rows), cv::Scalar(0), 0.1);
    if (isControlLine) {
        return min < INTENSITY_THRESHOLD && abs(min-max) > CONTROL_INTENSITY_PEAK_THRESHOLD;
    } else {
        return min < INTENSITY_THRESHOLD && abs(min-max) > TEST_INTENSITY_PEAK_THRESHOLD;
    }
}

-(bool) readControlLine:(Mat) inputMat at: (cv::Point) position {
    return [self readLine:inputMat at:position for: true];
}

-(bool) readTestLine:(Mat) inputMat at: (cv::Point) position {
    return [self readLine:inputMat at:position for: false];
}


-(Mat) enhanceResultWindow:(Mat) inputMat withTile: (cv::Size) tile{
    Mat result = Mat();
    NSLog(@"Enhance Result Mat Type: %d", inputMat.type());
    cvtColor(inputMat, result, COLOR_BGRA2BGR);
    cvtColor(result, result, COLOR_BGR2HLS);
    
    Ptr<CLAHE> clahe = createCLAHE(10, tile);
    
    vector<Mat> channels;
    cv::split(result, channels);
    
    Mat newChannel = Mat();
    
    cv::normalize(channels[1], channels[1], 0, 255, cv::NORM_MINMAX);
    
    clahe->apply(channels[1], newChannel);
    
    channels[1] = newChannel;
    
    merge(channels, result);
    
    cvtColor(result, result, COLOR_HLS2BGR);
    cvtColor(result, result, COLOR_BGR2BGRA);
    
    return result;
}

- (Mat) correctGamma:(Mat) enhancedImg withGamma: (float) gamma {
    Mat lutMat = Mat(1, 256, CV_8UC1);
    for (int i = 0; i < 256; i ++) {
        float g = pow((float)i/255.0, gamma)*255.0;
        g = g > 255.0 ? 255.0 : g < 0 ? 0 : g;
        lutMat.at<uchar>(0, i) = g;
    }
    Mat result = Mat();
    LUT(enhancedImg, lutMat, result);
    return result;
}

-(Mat) cropResultWindow:(Mat) inputMat with:(vector<Point2f>) boundary {
    Mat ref_boundary = Mat(4, 1, CV_32FC2);
    
    ref_boundary.at<Vec2f>(0, 0)[0] = 0;
    ref_boundary.at<Vec2f>(0, 0)[1] = 0;

    ref_boundary.at<Vec2f>(1, 0)[0] = refImg.cols - 1;
    ref_boundary.at<Vec2f>(1, 0)[1] = 0;

    ref_boundary.at<Vec2f>(2, 0)[0] = refImg.cols - 1;
    ref_boundary.at<Vec2f>(2, 0)[1] = refImg.rows - 1;

    ref_boundary.at<Vec2f>(3, 0)[0] = 0;
    ref_boundary.at<Vec2f>(3, 0)[1] = refImg.rows - 1;
    
    NSLog(@"ref_boundary:  (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f)",
          ref_boundary.at<Vec2f>(0, 0)[0], ref_boundary.at<Vec2f>(0, 0)[1],
          ref_boundary.at<Vec2f>(1, 0)[0], ref_boundary.at<Vec2f>(1, 0)[1],
          ref_boundary.at<Vec2f>(2, 0)[0], ref_boundary.at<Vec2f>(2, 0)[1],
          ref_boundary.at<Vec2f>(3, 0)[0], ref_boundary.at<Vec2f>(3, 0)[1]);
    
    Mat boundaryMat = Mat(boundary);
    
    NSLog(@"boundaryMat:  (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f)",
          boundaryMat.at<Vec2f>(0, 0)[0], boundaryMat.at<Vec2f>(0, 0)[1],
          boundaryMat.at<Vec2f>(1, 0)[0], boundaryMat.at<Vec2f>(1, 0)[1],
          boundaryMat.at<Vec2f>(2, 0)[0], boundaryMat.at<Vec2f>(2, 0)[1],
          boundaryMat.at<Vec2f>(3, 0)[0], boundaryMat.at<Vec2f>(3, 0)[1]);
    
    Mat M = getPerspectiveTransform(boundaryMat, ref_boundary);
    Mat correctedMat = Mat(refImg.rows, refImg.cols, refImg.type());
    cv::warpPerspective(inputMat, correctedMat, M, cv::Size(refImg.cols, refImg.rows));
    
    correctedMat = Mat(correctedMat, RESULT_WINDOW_RECT);
    
    return correctedMat;
}

-(vector<Point2f>) detectRDTWithSIFT: (Mat) inputMat{
    double currentTime = CACurrentMediaTime();
    Mat inDescriptor;
    vector<KeyPoint> inKeypoints;
    vector<cv::Point2f> boundary;
    double avgDist = 0.0;
    
    //    InputArray mask;
    
    Mat mask = Mat(inputMat.size().width, inputMat.size().height, CV_8U, Scalar(0));
    
    cv::Point p1 = cv::Point(0, inputMat.size().height*(1-VIEW_FINDER_SCALE_W/CROP_RATIO)/2);
    cv::Point p2 = cv::Point(inputMat.size().width-p1.x, inputMat.size().height-p1.y);
    rectangle(mask, p1, p2, Scalar(255), -1);
    
    siftDetector->detectAndCompute(inputMat, mask, inKeypoints, inDescriptor);
    
    if (inDescriptor.cols < 1 || inDescriptor.rows < 1) { // No features found!
        NSLog(@"Found no features!");
        NSLog(@"Time taken to detect: %f -- fail -- SIFT", CACurrentMediaTime() - currentTime);
        return inputMat;
    }
    NSLog(@"Found %lu keypoints from input image", inKeypoints.size());
    
    // Matching
    vector<vector<DMatch>> matches;
    siftMatcher->knnMatch(siftRefDescriptor, inDescriptor, matches, 2, noArray(), false);
    //NSLog(@"Time taken to match: %f", CACurrentMediaTime() - currentTime);
    
    double maxDist = FLT_MIN;
    double minDist = FLT_MAX;
    
    double sum = 0;
    int count = 0;
    vector<DMatch> goodMatches;
    for (int i = 0; i < matches.size(); i++) {
        //NSLog(@"matches distance: %.2f", matches[i].distance);
        if (matches[i][0].distance <= 0.80 * matches[i][1].distance) {
            goodMatches.push_back(matches[i][0]);
            sum += matches[i][0].distance;
            count++;
        }
    }
    
    vector<Point2f> srcPoints; // Works without allocating space?
    vector<Point2f> dstPoints;
    
    for (int i = 0; i < goodMatches.size(); i++) {
        DMatch currentMatch = goodMatches[i];
        srcPoints.push_back(siftRefKeypoints[currentMatch.queryIdx].pt);
        dstPoints.push_back(inKeypoints[currentMatch.trainIdx].pt);
    }
    
    // HOMOGRAPHY!
    NSLog(@"GoodMatches size %lu", goodMatches.size());
    if (goodMatches.size() > GOOD_MATCH_COUNT) {
        Mat H = findHomography(srcPoints, dstPoints, CV_RANSAC, 5);
        
        if (H.cols >= 3 && H.rows >= 3) {
            Mat objCorners = Mat(4, 1, CV_32FC2);
            Mat sceneCorners = Mat(4, 1, CV_32FC2);
            
            objCorners.at<Vec2f>(0, 0)[0] = 0;
            objCorners.at<Vec2f>(0, 0)[1] = 0;
            
            objCorners.at<Vec2f>(1, 0)[0] = refImg.cols - 1;
            objCorners.at<Vec2f>(1, 0)[1] = 0;
            
            objCorners.at<Vec2f>(2, 0)[0] = refImg.cols - 1;
            objCorners.at<Vec2f>(2, 0)[1] = refImg.rows - 1;
            
            objCorners.at<Vec2f>(3, 0)[0] = 0;
            objCorners.at<Vec2f>(3, 0)[1] = refImg.rows - 1;
            
            perspectiveTransform(objCorners, sceneCorners, H); // Not sure! if I'm suppose to dereference
            //Mat matchMat = inputMat.clone();
            //polylines(inputMat, sceneCorners, true, Scalar(255), 5);
            NSLog(@"DstPts-SIFT:  (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f)",
                  dstPoints[0].x, dstPoints[0].y,
                  dstPoints[1].x, dstPoints[1].y,
                  dstPoints[2].x, dstPoints[2].y,
                  dstPoints[3].x, dstPoints[3].y);
            NSLog(@"Transformed-SIFT: %.2f (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f) (%.2f, %.2f)",
                  sceneCorners.at<Vec2f>(1, 0)[0]-sceneCorners.at<Vec2f>(0, 0)[0],
                  sceneCorners.at<Vec2f>(0, 0)[0], sceneCorners.at<Vec2f>(0, 0)[1],
                  sceneCorners.at<Vec2f>(1, 0)[0], sceneCorners.at<Vec2f>(1, 0)[1],
                  sceneCorners.at<Vec2f>(2, 0)[0], sceneCorners.at<Vec2f>(2, 0)[1],
                  sceneCorners.at<Vec2f>(3, 0)[0], sceneCorners.at<Vec2f>(3, 0)[1]);
            
            
            (boundary).push_back(Point2f(sceneCorners.at<Vec2f>(0,0)[0], sceneCorners.at<Vec2f>(0,0)[1]));
            (boundary).push_back(Point2f(sceneCorners.at<Vec2f>(1,0)[0], sceneCorners.at<Vec2f>(1,0)[1]));
            (boundary).push_back(Point2f(sceneCorners.at<Vec2f>(2,0)[0], sceneCorners.at<Vec2f>(2,0)[1]));
            (boundary).push_back(Point2f(sceneCorners.at<Vec2f>(3,0)[0], sceneCorners.at<Vec2f>(3,0)[1]));
            
            objCorners.release();
            sceneCorners.release();
            
            avgDist = sum/count;
            //NSLog(@"Average distance: %.2f", sum/count);
            //Mat resultMat = Mat();
            //drawMatches(refImg, siftRefKeypoints, inputMat, inKeypoints, goodMatches, resultMat);
            //return resultMat;
            //inputMat = [self cropResultWindow:inputMat with:boundary];
            
            //return boundary;
        }
    }
    NSLog(@"Time taken to detect: %f -- success -- SIFT", CACurrentMediaTime() - currentTime);
    return boundary;
    //return inputMat;
}

@end