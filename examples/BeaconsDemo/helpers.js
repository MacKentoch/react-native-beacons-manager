// @flow

/* eslint-disable no-bitwise */

// #region flow types
type Beacon = {
  identifier: string,
  uuid?: string,
  major?: number,
  minor?: number,
  proximity?: string,
  rssi?: string,
  distance?: number,
};
// #endregion

export const hashCode = (str: string): string => {
  return str
    .split('')
    .reduce(
      (prevHash, currVal) =>
        ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
      0,
    );
};

export const deepCopyBeaconsLists = (
  beaconsLists: Array<Beacon>,
): Array<Beacon> => {
  const initial = {};
  return Object.keys(beaconsLists)
    .map(key => ({ [key]: [...beaconsLists[key]] }))
    .reduce((prev, next) => {
      return { ...prev, ...next };
    }, initial);
};
