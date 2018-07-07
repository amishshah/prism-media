exports.require = function loader(requireData, objMap = {}) {
  for (const [name, reqFn] of requireData) {
    try {
      const dep = require(name);
      const fn = reqFn ? reqFn(dep) : dep;
      return {
        [objMap.module || 'module']: dep,
        [objMap.name || 'name']: name,
        [objMap.fn || 'fn']: fn,
      };
    } catch (e) { }
  }
  return {};
};
