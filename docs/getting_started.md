# Getting Started

The important things you should take from this:

1. You install the modules you need to get the features you want - you can't use Opus if you don't have an Opus module installed.
2. The interface is stream-based, which should make developing with it more intuitive.

-----

## Installation

You'll need to first install Node.js, and then you can install `prism-media` like so:

```bash
$ npm install prism-media # latest stable release
$ npm install hydrabolt/prism-media # development
```

## Functionality

By default, no extra packages come with prism, so you're limited to just volume transformers and demuxers. This is so you can pick and choose which parts of prism you require.

|                                          | Volume Transform | Demuxing | Opus | FFmpeg |
|------------------------------------------|------------------|----------|------|--------|
| no extras                                | yes              | yes      |      |        |
| [krypton](https://github.com/Hackzzila/krypton)                                  | yes              |          | yes  |        |
| [node-opus](https://github.com/Rantanen/node-opus)                                |                  |          | yes  |        |
| [opusscript](https://github.com/abalabahaha/opusscript)                               |                  |          | yes  |        |
| FFmpeg ([directly](http://ffmpeg.org/) or via [ffmpeg-binaries](https://github.com/Hackzzila/node-ffmpeg-binaries)) |                  |          |      | yes    |

### Opus
The 3 supported Opus libraries are `krypton`, `node-opus`, and `opusscript` (as shown above). They are also preferred by prism in this order; `krypton` is more performant, whereas `opusscript` is less so but doesn't require building upon installation.

### FFmpeg
If you would like to use FFmpeg with prism, you can either install directly from FFmpeg.org, or through ffmpeg-binaries (links in the table above).

If you're installing directly, you'll need to ensure `ffmpeg` is in your path, or that the executable file is placed in the root of your project's directory (with the package.json file)