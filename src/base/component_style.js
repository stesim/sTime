const usedIds = new Set();

function generateId() {
  const generate = () => Math.floor(Math.random() * 65536);
  let id = generate();
  while (usedIds.has(id)) {
    id = generate();
  }
  usedIds.add(id);
  return id;
}

export default class ComponentStyle {
  constructor(styleName = undefined) {
    this._id = generateId();
    this._styleElement = document.createElement('style');
    if (styleName) {
      this._styleElement.title = styleName;
    }
    // FIXME(stesim): move to proper place
    document.head.appendChild(this._styleElement);
    this._stylesheet = this._styleElement.sheet;
  }

  get enabled() {
    return !this._stylesheet.disabled;
  }

  set enabled(value) {
    this._stylesheet.disabled = !value;
  }

  className(name) {
    return `${name}-${this._id}`;
  }

  classNames(...names) {
    return names.map(name => this.className(name));
  }

  addRule(rule) {
    const bodyPosition = rule.indexOf('{');
    const selector = rule.substr(0, bodyPosition);
    const body = rule.substr(bodyPosition);
    const classNameRegex = /\.[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
    const escapedSelector = selector.replace(classNameRegex, `$&-${this._id}`);
    this._stylesheet.insertRule(
      `${escapedSelector} ${body}`,
      this._stylesheet.cssRules.length,
    );
  }

  addRules(...rules) {
    rules.forEach(rule => this.addRule(rule));
  }
}
