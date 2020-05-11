// Copyright (c) 2019 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

import React, { RefObject } from "react";

interface InnerProps {
  customRef: RefObject<any>;
}

export function customRef<P>(WrappedComponent: React.ComponentType<P>) {
  class CustomRef extends React.Component<InnerProps & P> {
    render() {
      // @ts-ignore
      return <WrappedComponent ref={this.props.customRef} {...this.props} />;
    }
  }

  return CustomRef;
}
