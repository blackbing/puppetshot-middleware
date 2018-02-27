
function makeKey(path) {
  return `${encodeURIComponent(path)}.png`;
}

module.exports = makeKey;
