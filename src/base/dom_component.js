import Component from './component.js';
import Variable from './variable.js';

export default class DomComponent extends Component {
  constructor(type) {
    super();
    this._domNode = document.createElement(type);
    this._children = new Set();
  }

  setProperty(name, value) {
    if (name === 'style') {
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
    } else {
      this._domNode[name] = value;
    }
  }

  $render() {
    return this._domNode;
  }
}