// Copyright (c) 2018 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.

export function checkNotNull<T>(item: T | null | undefined): T {
  if (item == null) {
    if (item === null) {
      throw new Error("item is null");
    } else {
      throw new Error("item is undefined");
    }
  }
  return item;
}

export function isNotNull<T>(item: T | null | undefined): item is T {
  return item != null;
}
