/* eslint-disable prettier/prettier */

// see page 15 @ https://tools.ietf.org/html/rfc6716#section-3.1
export const FRAME_SIZE_MAP = [
  10, 20, 40, 60, // config 0..3
  10, 20, 40, 60, // config 4..7
  10, 20, 40, 60, // config 8..11
  10, 20, // config 12..13
  10, 20, // config 14..15
  2.5, 5, 10, 20, // config 16..19
  2.5, 5, 10, 20, // config 20..23
  2.5, 5, 10, 20, // config 24..27
  2.5, 5, 10, 20, // config 28..31
];
