import DomComponent from './dom_component.js';
import Variable from './variable.js';
import Component from './component.js';

function createComponentInstance(type) {
  if (typeof type === 'string') {
    return new DomComponent(type);
  } else {
    return new type();
  }
}

function mapVariableOrValue(value, operation) {
  let currentValue = value;
  if (value instanceof Variable) {
    currentValue = value.value;
    value.onChange((newValue) => {
      operation(newValue);
    });
  }
  operation(currentValue);
}

function initializeComponentProperty(component, name, value) {
  mapVariableOrValue(value, (actualValue) => {
    component.setProperty(name, actualValue);
  });
}

export default function render(tree) {
  if (tree instanceof Component) {
    return tree.$render()
  }

  const instance = createComponentInstance(tree.type);
  Object.keys(tree).forEach((propertyName) => {
    if (propertyName !== 'type' && propertyName !== 'children') {
      initializeComponentProperty(instance, propertyName, tree[propertyName]);
    }
  });
  const domNode = instance.$render();
  if (tree.children !== undefined) {
    mapVariableOrValue(tree.children, (actualValue) => {
      while (domNode.firstChild !== null) {
        domNode.removeChild(domNode.firstChild);
      }
      actualValue.forEach((subtree) => {
        domNode.appendChild(render(subtree));
      });
    });
  }
  return domNode;
}