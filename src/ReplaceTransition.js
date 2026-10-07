import PropTypes from 'prop-types';
import React from 'react';
import { canUseFindDOMNode, findDOMNode, isDOMNode } from './utils/findDOMNode';
import TransitionGroup from './TransitionGroup';

/**
 * The `<ReplaceTransition>` component is a specialized `Transition` component
 * that animates between two children.
 *
 * ```jsx
 * <ReplaceTransition in>
 *   <Fade><div>I appear first</div></Fade>
 *   <Fade><div>I replace the above</div></Fade>
 * </ReplaceTransition>
 * ```
 */
class ReplaceTransition extends React.Component {
  handleEnter = (...args) => this.handleLifecycle('onEnter', 0, args);
  handleEntering = (...args) => this.handleLifecycle('onEntering', 0, args);
  handleEntered = (...args) => this.handleLifecycle('onEntered', 0, args);

  handleExit = (...args) => this.handleLifecycle('onExit', 1, args);
  handleExiting = (...args) => this.handleLifecycle('onExiting', 1, args);
  handleExited = (...args) => this.handleLifecycle('onExited', 1, args);

  handleLifecycle(handler, idx, originalArgs) {
    const { children } = this.props;
    const child = React.Children.toArray(children)[idx];

    if (child.props[handler]) child.props[handler](...originalArgs);
    if (this.props[handler]) {
      let maybeNode;
      if (child.props.nodeRef) {
        maybeNode = undefined;
      } else if (canUseFindDOMNode()) {
        maybeNode = findDOMNode(this);
      } else {
        maybeNode = this.findHostNode(originalArgs[0]);
      }

      this.props[handler](maybeNode);
    }
  }

  // React 19+ stand-in for `findDOMNode(this)`, built from the node the child
  // `Transition` passed to its callback. That node sits directly inside the
  // element `TransitionGroup` renders (a <div> by default), which is what
  // `findDOMNode(this)` returns; with `component={null}` it is the node itself.
  findHostNode(childNode) {
    if (!isDOMNode(childNode)) return null;
    if (this.props.component === null) return childNode;
    return childNode.parentNode;
  }

  render() {
    const { children, in: inProp, ...props } = this.props;
    const [first, second] = React.Children.toArray(children);

    delete props.onEnter;
    delete props.onEntering;
    delete props.onEntered;
    delete props.onExit;
    delete props.onExiting;
    delete props.onExited;

    return (
      <TransitionGroup {...props}>
        {inProp
          ? React.cloneElement(first, {
              key: 'first',
              onEnter: this.handleEnter,
              onEntering: this.handleEntering,
              onEntered: this.handleEntered,
            })
          : React.cloneElement(second, {
              key: 'second',
              onEnter: this.handleExit,
              onEntering: this.handleExiting,
              onEntered: this.handleExited,
            })}
      </TransitionGroup>
    );
  }
}

ReplaceTransition.propTypes = {
  in: PropTypes.bool.isRequired,
  children(props, propName) {
    if (React.Children.count(props[propName]) !== 2)
      return new Error(
        `"${propName}" must be exactly two transition components.`
      );

    return null;
  },
};

export default ReplaceTransition;
