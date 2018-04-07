# Volume Transformers

```js
const volume = new prism.VolumeTransformer16LE({
  volume: 0.5, // 50% of the original volume
});

// the input is a 16-bit little-endian stream of PCM
const halfVolume = input.pipe(volume);
```

There are 4 available transformers, all 16-bit/32-bit and little-endian/big-endian:

- `prism.VolumeTransformer16LE`
- `prism.VolumeTransformer32LE`
- `prism.VolumeTransformer16BE`
- `prism.VolumeTransformer32BE`

---

## Constructor
### `new prism.VolumeTransformerXXYY(options)`

- `options`: `Object` (optional)
  - `volume`: `Number`, the volume relative to the input (1 is 100%, 0.5 is 50% etc.)

---

## Properties
### `transformer.volume`
`Number` - 1 represents 100% of the original input. This shouldn't be set directly, use the methods listed below.

---

## Methods
### `transformer.setVolume(volume)`
`volume`: `Number`, the volume

Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.

**Returns**: `void`

### `transformer.setVolumeDecibels(volume)`
`volume`: `Number`, the volume in decibels

Sets the volume in decibels.

**Returns**: `void`

### `transformer.setVolumeLogarithmic(volume)`
`volume`: `Number`, a value for the perceived volume

Sets the volume so that a perceived value of 0.5 is half the perceived volume etc.

**Returns**: `void`