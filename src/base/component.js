function notImplementedHandler() {
  throw new Error('not implemented');
}

export default class Component {
  setProperty(name, value) {
    this[name] = value;
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