function notImplementedHandler(aspect) {
  throw new Error(`not implemented: ${aspect}`);
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}; expected: ${expected}; actual: ${actual}`);
  }
}

function assertDomElementStructure(actualElement, expectedStructure) {
  for (const key in expectedStructure) {
    const value = expectedStructure[key];
    switch (key) {
      case 'nodeName':
        assertEqual(actualElement.nodeName.toLowerCase(), value, 'wrong node type');
        break;
      case 'style':
        for (const styleKey in value) {
          const actualStyleValue = actualElement.style[styleKey];
          const expectedStyleValue = value[styleKey];
          assertEqual(actualStyleValue, expectedStyleValue, `wrong style property (${styleKey})`);
        }
        break;
      case 'children':
        assertEqual(actualElement.children.length, value.length, 'wrong child count');
        let childIndex = 0;
        for (const actualChild of actualElement.children) {
          assertDomElementStructure(actualChild, value[childIndex]);
          ++childIndex;
        }
        break;
      default:
        assertEqual(actualElement[key], value, `wrong node property (${key})`);
    }
  }
}

export function assertDomStructure(actualRoot, expectedStructure) {
  assertDomElementStructure(actualRoot, expectedStructure);
}

export function runDomTest(name, test) {
  try {
    test();
    console.log(`[SUCCESS] ${name}`);
  } catch (error) {
    console.error(`[FAILED]  ${name}: ${error.message}`);
  }
}

export class CallbackTester {
  constructor() {
    this._calls = [];
  }

  get calls() {
    return this._calls;
  }

  get callback() {
    return (...args) => this.calls.push(args);
  }
};