// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import React, { useRef } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { Button } from "../ui/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = makeStyles((theme: Theme) =>
  createStyles({
    // Style to hide the <input /> element while keeping
    // accessibility
    imageUploadInput: {
      border: "0",
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
    },
  })
);

interface ImageSelectorInputProps {
  onImageSelected: (image: File) => void;
  disabled: boolean;
}

export default (props: ImageSelectorInputProps) => {
  const style = styles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (target && target.files && target.files[0]) {
      props.onImageSelected(target.files[0]);
    }
  };

  return (
    <div>
      <input
        id="fileInput"
        ref={inputRef}
        className={style.imageUploadInput}
        type="file"
        onChange={handleChange}
      />
      <Button
        disabled={props.disabled}
        onClick={() => {
          if (!inputRef || !inputRef.current) {
            return;
          } else {
            inputRef.current.click();
          }
        }}
        size="large"
      >
        <span className="icon is-medium">
          <FontAwesomeIcon icon="file-image" />
        </span>
        <span>Upload a Photo</span>
      </Button>
    </div>
  );
};
