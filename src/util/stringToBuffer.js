module.exports = str => Buffer.from([...str].map(x => x.charCodeAt(0)));
