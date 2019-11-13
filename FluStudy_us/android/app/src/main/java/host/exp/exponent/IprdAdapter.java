// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

package host.exp.exponent;

import android.graphics.Bitmap;

import com.iprd.rdtcamera.AcceptanceStatus;
import com.iprd.rdtcamera.RdtAPI;

import java.nio.MappedByteBuffer;

public class IprdAdapter {

  public static class RdtApi {
    private RdtAPI iprdApi;

    private RdtApi(RdtAPI iprdApi) {
      this.iprdApi = iprdApi;
    }

    public FrameResult checkFrame(Bitmap frame) {
      AcceptanceStatus status = this.iprdApi.checkFrame(frame);
      return new FrameResult(status);
    }

    public static Builder builder() {
      return new Builder();
    }

    public static class Builder {
      private RdtAPI.RdtAPIBuilder iprdBuilder = new RdtAPI.RdtAPIBuilder();

      private Builder() {}

      public RdtApi build() {
        return new RdtApi(this.iprdBuilder.build());
      }

      public Builder setModel(MappedByteBuffer model) {
        this.iprdBuilder.setModel(model);
        return this;
      }
    }
  }

  public static class FrameResult {
    public static final int NOT_COMPUTED = AcceptanceStatus.NOT_COMPUTED;
    public static final int TOO_HIGH = AcceptanceStatus.TOO_HIGH;
    public static final int TOO_LOW = AcceptanceStatus.TOO_LOW;
    public static final int GOOD = AcceptanceStatus.GOOD;

    private FrameResult(AcceptanceStatus status) {
      this.sharpness = status.mSharpness;
      this.scale = status.mScale;
      this.brightness = status.mBrightness;
      this.perspectiveDistortion = status.mPerspectiveDistortion;
      this.xOffset = status.mDisplacementX;
      this.yOffset = status.mDisplacementY;
      this.foundRDT = status.mRDTFound;
      this.left = status.mBoundingBoxX;
      this.top = status.mBoundingBoxY;
      this.right = this.left + status.mBoundingBoxWidth;
      this.bottom = this.top + status.mBoundingBoxHeight;
    }

    public final int sharpness;
    public final int scale;
    public final int brightness;
    public final int perspectiveDistortion;
    public final int xOffset;
    public final int yOffset;
    public final boolean foundRDT;
    public final int left;
    public final int top;
    public final int right;
    public final int bottom;

    public boolean isAccepted() {
      return this.foundRDT &&
          this.sharpness == GOOD &&
          this.scale == GOOD &&
          this.brightness == GOOD &&
          this.perspectiveDistortion == GOOD;
    }
  }
}
