// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useEffect, useState } from "react";
import { TopDetectionData, analyzeImage } from "../RDTAnalyzer";

import DetectionBoxOverlay from "../DetectionBoxOverlay";
import StoryWrapper from "utils/StoryWrapper";

export default {
  title: "OpenRDT Detector",
};

export const TestWithRDTImage = () => {
  const [detectionData, setDetectionData] = useState<TopDetectionData>();
  const [isImageLoaded, setImageLoaded] = useState(false);
  const [img] = useState(new Image());
  useEffect(() => {
    if (!isImageLoaded) {
      img.onload = () => {
        setImageLoaded(true);
      };
      img.src = "/assets/model/rdt.jpeg";
      return;
    }
    if (detectionData) {
      return;
    }

    // Resize Image to an acceptable dimension
    const getData = async () => {
      const result = await analyzeImage(img);
      setDetectionData(result);
    };
    getData();
  }, [img, detectionData, isImageLoaded]);

  return (
    <StoryWrapper>
      <div style={{ position: "relative", display: "inline-block" }}>
        <img src={img.src} style={{ maxWidth: "200px" }} alt="test" />
        {detectionData && <DetectionBoxOverlay detectionData={detectionData} />}
      </div>
    </StoryWrapper>
  );
};
