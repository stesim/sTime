function notImplementedHandler() {
  throw new Error('not implemented');
}

export default class Component {
  setProperty(name, value) {
    if (name in this) {
      this[name] = value;
    } else {
      throw new TypeError(`cannot assign non-existing property: ${name}`);
    }
  }

  $render() {
    notImplementedHandler();
  }

  $attach() {
    notImplementedHandler();
  }

  $detach() {
    notImplementedHandler();
  }
}