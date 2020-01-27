import Component from './component.js';
import Variable from './variable.js';

export default class DomComponent extends Component {
  constructor(type) {
    super();
    this._domNode = document.createElement(type);
    this._children = [];
    this._rendered = false;
  }

  get style() {
    return this._domNode.style;
  }

  set style(value) {
    this._domNode.style.cssText = '';
    // Object.assign(this._domNode.style, value);
    const style = this._domNode.style;
    for (const attribute in value) {
      const attributeValue = value[attribute];
      if (attributeValue instanceof Variable) {
        style[attribute] = attributeValue.value;
        attributeValue.onChange((newValue) => {
          style[attribute] = newValue;
        });
      } else {
        style[attribute] = attributeValue;
      }
    }
  }

  get children() {
    return this._children;
  }

  set children(value) {
    if (this._rendered) {
      this._removeDomChildren();
    }
    this._children = value;
    if (this._rendered) {
      this._renderChildren();
    }
  }

  setProperty(name, value) {
    if (name in this) {
      this[name] = value;
    } else if (name in this._domNode) {
      this._domNode[name] = value;
    } else {
      throw new TypeError(`cannot assign non-existing property: ${name}`);
    }
  }

  addEventListener(...args) {
    return this._domNode.addEventListener(...args);
  }

  removeEventListener(...args) {
    return this._domNode.removeEventListener(...args);
  }

  $render() {
    this._renderChildren();
    this._rendered = true;
    return this._domNode;
  }

  _renderChildren() {
    for (const child of this._children) {
      this._domNode.appendChild(child.$render());
    }
  }

  _removeDomChildren() {
    while (this._domNode.firstChild !== null) {
      this._domNode.removeChild(this._domNode.firstChild);
    }
  }
}
