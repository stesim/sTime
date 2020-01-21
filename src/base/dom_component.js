import Component from './component.js';

export default class DomComponent extends Component {
  constructor(type) {
    super();
    this._domNode = document.createElement(type);
    this._children = new Set();
  }

  setProperty(name, value) {
    if (name === 'style') {
      Object.assign(this._domNode.style, value);
    } else {
      this._domNode[name] = value;
    }
  }

  $render() {
    return this._domNode;
  }
}