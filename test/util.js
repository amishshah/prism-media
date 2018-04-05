// The output is slightly different on travis because of ffmpeg version, should account for it
exports.roughlyEquals = function roughlyEquals(x, y) {
  if (x.length !== y.length) return false;
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i] - y[i]) > 1) {
      return false;
    }
  }
  return true;
};

exports.streamToBuffer = function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
