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
    const propertyValue = tree[propertyName];
    if (propertyName === 'children') {
      mapVariableOrValue(instance, propertyValue, actualValue => {
        instance.children = actualValue.map(subtree => renderToComponent(subtree));
      });
    } else if (propertyName !== 'type') {
      mapVariableOrValue(instance, propertyValue, actualValue => {
        instance.setProperty(propertyName, actualValue);
      });
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

function mapVariableOrValue(component, value, operation) {
  if (value instanceof Variable) {
    operation(value.value);
    component.addVariableListener(value, operation);
  } else {
    operation(value);
  }
}