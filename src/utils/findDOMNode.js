import React from 'react';
import ReactDOM from 'react-dom';

/**
 * `ReactDOM.findDOMNode` exists up to React 18 and was removed in React 19
 * (https://github.com/reactjs/react-transition-group/issues/918).
 *
 * Where it exists we keep using it, so React 16.6 - 18 behave exactly like
 * react-transition-group@4.4.5. Where it doesn't, `Transition` captures the
 * child's DOM node with an internal ref instead (see `Transition#render`).
 */
export function canUseFindDOMNode() {
  return typeof ReactDOM.findDOMNode === 'function';
}

export function findDOMNode(instance) {
  return ReactDOM.findDOMNode(instance);
}

export function isDOMNode(value) {
  return value != null && typeof value.nodeType === 'number';
}

const REACT_MAJOR = parseInt(React.version, 10);

/**
 * The `ref` the user put on an element. React 19 moved it to `props.ref` and
 * warns when `element.ref` is read.
 */
export function getElementRef(element) {
  return REACT_MAJOR >= 19 || isNaN(REACT_MAJOR)
    ? element.props.ref
    : element.ref;
}
