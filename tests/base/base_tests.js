import { assertDomStructure, runDomTest, CallbackTester, assertEqual } from '../testing.js';
import DomComponent from '../../src/base/dom_component.js';

runDomTest('DomComponent nodeName', () => {
  const component = new DomComponent('div');
  const componentDom = component.$render();
  assertDomStructure(componentDom, {
    nodeName: 'div',
  });
});

runDomTest('DomComponent children assigned before rendering', () => {
  const component = new DomComponent('div');
  component.children = [
    new DomComponent('h1'),
    new DomComponent('h2'),
  ];
  const componentDom = component.$render();
  assertDomStructure(componentDom, {
    nodeName: 'div',
    children: [{
      nodeName: 'h1',
    }, {
      nodeName: 'h2',
    }]
  });
});

runDomTest('DomComponent children assigned after rendering', () => {
  const component = new DomComponent('div');
  const componentDom = component.$render();
  component.children = [
    new DomComponent('h1'),
    new DomComponent('h2'),
  ];
  assertDomStructure(componentDom, {
    nodeName: 'div',
    children: [{
      nodeName: 'h1',
    }, {
      nodeName: 'h2',
    }],
  });
});

runDomTest('DomComponent style assigned before rendering', () => {
  const component = new DomComponent('div');
  component.style.display = 'grid';
  component.style.padding = '1em';
  const componentDom = component.$render();
  assertDomStructure(componentDom, {
    nodeName: 'div',
    style: {
      display: 'grid',
      padding: '1em',
    },
  });
});

runDomTest('DomComponent style assigned after rendering', () => {
  const component = new DomComponent('div');
  const componentDom = component.$render();
  component.style.display = 'grid';
  component.style.padding = '1em';
  assertDomStructure(componentDom, {
    nodeName: 'div',
    style: {
      display: 'grid',
      padding: '1em',
    },
  });
});

runDomTest('DomComponent event listener', () => {
  const component = new DomComponent('button');
  const callbackTester = new CallbackTester();
  component.addEventListener('click', callbackTester.callback);
  const componentDom = component.$render();
  assertDomStructure(componentDom, {
    nodeName: 'button',
  });
  componentDom.click();
  assertEqual(callbackTester.calls.length, 1, 'wrong call count of event listener');
});
