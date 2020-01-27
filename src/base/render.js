import DomComponent from './dom_component.js';
import Variable from './variable.js';
import Component from './component.js';

export default function render(tree) {
  const instance = (tree instanceof Component ? tree : renderToComponent(tree));
  return instance.$render();
}

function renderToComponent(tree) {
  if (tree instanceof Component) {
    return tree;
  }

  const instance = createComponentInstance(tree.type);
  for (const propertyName in tree) {
    if (propertyName === 'children') {
      mapVariableOrValue(tree.children, actualValue => {
        instance.children = actualValue.map(subtree => renderToComponent(subtree));
      });
    } else if (propertyName !== 'type') {
      initializeComponentProperty(instance, propertyName, tree[propertyName]);
    }
  }
  return instance;
}

function createComponentInstance(type) {
  if (typeof type === 'string') {
    return new DomComponent(type);
  } else {
    return new type();
  }
}

function initializeComponentProperty(component, name, value) {
  mapVariableOrValue(value, actualValue => {
    component.setProperty(name, actualValue);
  });
}

function mapVariableOrValue(value, operation) {
  let currentValue = value;
  if (value instanceof Variable) {
    currentValue = value.value;
    value.onChange(newValue => operation(newValue));
  }
  operation(currentValue);
}