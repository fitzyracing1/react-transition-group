/**
 * Transitions used WITHOUT a `nodeRef` prop.
 *
 * Upstream finds the DOM node with `ReactDOM.findDOMNode`, which React 19
 * removed, so every test here crashed on react-transition-group@4.4.5 under
 * React 19 with "findDOMNode is not a function" (issue #918). The same tests
 * run under React 16, 17 and 18 to show the callback arguments, class sequence
 * and timing are unchanged there.
 *
 *   npx jest test/without-nodeRef-test.js                       # React 18
 *   REACT_COMPAT=19 npx jest -c jest.compat.config.js           # React 19
 */
import React from 'react';
import { render, waitFor } from './utils';

import Transition from '../src/Transition';
import CSSTransition from '../src/CSSTransition';
import TransitionGroup from '../src/TransitionGroup';
import SwitchTransition from '../src/SwitchTransition';
import ReplaceTransition from '../src/ReplaceTransition';

const REACT_MAJOR = parseInt(React.version, 10);

function recorder() {
  const calls = [];
  const make = (name) =>
    function (...args) {
      calls.push([name, ...args]);
    };
  return {
    calls,
    names: () => calls.map((c) => c[0]),
    props: {
      onEnter: make('onEnter'),
      onEntering: make('onEntering'),
      onEntered: make('onEntered'),
      onExit: make('onExit'),
      onExiting: make('onExiting'),
      onExited: make('onExited'),
    },
  };
}

const ENTER = ['onEnter', 'onEntering', 'onEntered'];
const EXIT = ['onExit', 'onExiting', 'onExited'];

describe('without nodeRef', () => {
  let errorSpy;
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error');
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('Transition', () => {
    it('passes the child DOM node and isAppearing to the enter/exit callbacks', async () => {
      const rec = recorder();
      const { container, setProps } = render(
        <Transition in={false} timeout={10} {...rec.props}>
          <div className="child" />
        </Transition>
      );
      const node = container.querySelector('.child');
      expect(node).toBeTruthy();

      setProps({ in: true });
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      expect(rec.calls).toEqual([
        ['onEnter', node, false],
        ['onEntering', node, false],
        ['onEntered', node, false],
      ]);

      rec.calls.length = 0;
      setProps({ in: false });
      await waitFor(() => expect(rec.names()).toEqual(EXIT));
      expect(rec.calls).toEqual([
        ['onExit', node],
        ['onExiting', node],
        ['onExited', node],
      ]);
    });

    it('passes isAppearing=true on appear', async () => {
      const rec = recorder();
      const { container } = render(
        <Transition in appear timeout={10} {...rec.props}>
          <span className="child" />
        </Transition>
      );
      const node = container.querySelector('.child');
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      expect(rec.calls).toEqual([
        ['onEnter', node, true],
        ['onEntering', node, true],
        ['onEntered', node, true],
      ]);
    });

    it('works with a render-prop child and passes status through', async () => {
      const rec = recorder();
      const statuses = [];
      const { container, setProps } = render(
        <Transition in={false} timeout={10} {...rec.props}>
          {(status) => {
            statuses.push(status);
            return <div className={`child ${status}`} />;
          }}
        </Transition>
      );
      const node = container.querySelector('.child');
      setProps({ in: true });
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      expect(rec.calls[0]).toEqual(['onEnter', node, false]);
      expect(rec.calls[2]).toEqual(['onEntered', node, false]);
      expect(node.className).toBe('child entered');
      expect(statuses).toContain('entering');
    });

    it('waits `timeout` ms between entering and entered', async () => {
      const times = {};
      const { setProps } = render(
        <Transition
          in={false}
          timeout={60}
          onEntering={() => (times.entering = Date.now())}
          onEntered={() => (times.entered = Date.now())}
        >
          <div />
        </Transition>
      );
      setProps({ in: true });
      await waitFor(() => expect(times.entered).toBeDefined());
      expect(times.entered - times.entering).toBeGreaterThanOrEqual(55);
    });

    it('calls addEndListener with (node, done)', async () => {
      let received;
      const onEntered = jest.fn();
      const { container, setProps } = render(
        <Transition
          in={false}
          addEndListener={(node, done) => {
            received = node;
            setTimeout(done, 5);
          }}
          onEntered={onEntered}
        >
          <div className="child" />
        </Transition>
      );
      setProps({ in: true });
      await waitFor(() => expect(onEntered).toHaveBeenCalled());
      expect(received).toBe(container.querySelector('.child'));
    });

    it('supports mountOnEnter / unmountOnExit', async () => {
      const rec = recorder();
      const { container, setProps } = render(
        <Transition
          in={false}
          mountOnEnter
          unmountOnExit
          timeout={10}
          {...rec.props}
        >
          <div className="child" />
        </Transition>
      );
      expect(container.querySelector('.child')).toBeNull();

      setProps({ in: true });
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      const node = container.querySelector('.child');
      expect(rec.calls[0]).toEqual(['onEnter', node, false]);

      rec.calls.length = 0;
      setProps({ in: false });
      await waitFor(() => expect(rec.names()).toEqual(EXIT));
      expect(rec.calls[2]).toEqual(['onExited', node]);
      await waitFor(() => expect(container.querySelector('.child')).toBeNull());
    });

    it('keeps the child’s own object ref and callback ref working', async () => {
      const objectRef = React.createRef();
      const callbackRef = jest.fn();
      const onEntered = jest.fn();
      const { container, setProps, unmount } = render(
        <div>
          <Transition in={false} timeout={0} onEntered={onEntered}>
            <div className="a" ref={objectRef} />
          </Transition>
          <Transition in={false} timeout={0}>
            <div className="b" ref={callbackRef} />
          </Transition>
        </div>
      );
      const a = container.querySelector('.a');
      const b = container.querySelector('.b');
      expect(objectRef.current).toBe(a);
      expect(callbackRef).toHaveBeenLastCalledWith(b);

      // re-render with a new prop and run a transition; refs must stay intact
      setProps({ className: 'x' });
      expect(objectRef.current).toBe(a);
      expect(callbackRef).toHaveBeenLastCalledWith(b);

      unmount();
      expect(objectRef.current).toBeNull();
      expect(callbackRef).toHaveBeenLastCalledWith(null);
    });

    it('does not detach/re-attach the child’s ref while transitioning', async () => {
      const callbackRef = jest.fn();
      const onEntered = jest.fn();
      const onExited = jest.fn();
      const { container, setProps } = render(
        <Transition
          in={false}
          timeout={0}
          onEntered={onEntered}
          onExited={onExited}
        >
          <div className="child" ref={callbackRef} />
        </Transition>
      );
      setProps({ in: true });
      await waitFor(() => expect(onEntered).toHaveBeenCalled());
      setProps({ in: false });
      await waitFor(() => expect(onExited).toHaveBeenCalled());
      expect(callbackRef).toHaveBeenCalledTimes(1);
      expect(callbackRef).toHaveBeenCalledWith(
        container.querySelector('.child')
      );
    });

    (REACT_MAJOR >= 19 ? it : it.skip)(
      'React 19: supports callback refs that return a cleanup function',
      async () => {
        const events = [];
        const ref = (node) => {
          events.push(['attach', node]);
          return () => events.push(['cleanup']);
        };
        const onEntered = jest.fn();
        const { container, setProps, unmount } = render(
          <Transition in={false} timeout={0} onEntered={onEntered}>
            <div className="child" ref={ref} />
          </Transition>
        );
        const node = container.querySelector('.child');
        setProps({ in: true });
        await waitFor(() =>
          expect(onEntered).toHaveBeenCalledWith(node, false)
        );
        unmount();
        expect(events).toEqual([['attach', node], ['cleanup']]);
      }
    );

    it('finds the DOM node of a forwardRef component child', async () => {
      const Box = React.forwardRef((props, ref) => (
        <section ref={ref} {...props} />
      ));
      const rec = recorder();
      const { container, setProps } = render(
        <Transition in={false} timeout={0} {...rec.props}>
          <Box className="box" />
        </Transition>
      );
      setProps({ in: true });
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      expect(rec.calls[0][1]).toBe(container.querySelector('.box'));
    });

    it('works inside StrictMode', async () => {
      const rec = recorder();
      const { container, rerender } = render(
        <React.StrictMode>
          <Transition in={false} timeout={10} {...rec.props}>
            <div className="child" />
          </Transition>
        </React.StrictMode>
      );
      rerender(
        <React.StrictMode>
          <Transition in timeout={10} {...rec.props}>
            <div className="child" />
          </Transition>
        </React.StrictMode>
      );
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      const node = container.querySelector('.child');
      expect(rec.calls[0]).toEqual(['onEnter', node, false]);
      expect(rec.calls[2]).toEqual(['onEntered', node, false]);
    });
  });

  describe('CSSTransition', () => {
    it('applies the enter and exit classes in order and passes the node', async () => {
      const seen = [];
      const log = (name) => (node, isAppearing) =>
        seen.push([name, node && node.className, isAppearing]);
      const { container, setProps } = render(
        <CSSTransition
          in={false}
          timeout={10}
          classNames="fade"
          onEnter={log('onEnter')}
          onEntering={log('onEntering')}
          onEntered={log('onEntered')}
          onExit={log('onExit')}
          onExiting={log('onExiting')}
          onExited={log('onExited')}
        >
          <div />
        </CSSTransition>
      );
      const node = container.firstChild;

      setProps({ in: true });
      await waitFor(() => expect(seen.length).toBe(3));
      expect(seen).toEqual([
        ['onEnter', 'fade-enter', false],
        ['onEntering', 'fade-enter fade-enter-active', false],
        ['onEntered', 'fade-enter-done', false],
      ]);
      expect(node.className).toBe('fade-enter-done');

      seen.length = 0;
      setProps({ in: false });
      await waitFor(() => expect(seen.length).toBe(3));
      expect(seen).toEqual([
        ['onExit', 'fade-exit', undefined],
        ['onExiting', 'fade-exit fade-exit-active', undefined],
        ['onExited', 'fade-exit-done', undefined],
      ]);
      expect(node.className).toBe('fade-exit-done');
    });

    it('applies the appear classes on mount', async () => {
      const seen = [];
      const log = (name) => (node, isAppearing) =>
        seen.push([name, node.className, isAppearing]);
      render(
        <CSSTransition
          in
          appear
          timeout={10}
          classNames="fade"
          onEnter={log('onEnter')}
          onEntering={log('onEntering')}
          onEntered={log('onEntered')}
        >
          <div />
        </CSSTransition>
      );
      await waitFor(() => expect(seen.length).toBe(3));
      expect(seen).toEqual([
        ['onEnter', 'fade-appear', true],
        ['onEntering', 'fade-appear fade-appear-active', true],
        ['onEntered', 'fade-appear-done fade-enter-done', true],
      ]);
    });

    it('works with unmountOnExit', async () => {
      const onExited = jest.fn();
      const { container, setProps } = render(
        <CSSTransition
          in
          timeout={10}
          classNames="fade"
          unmountOnExit
          onExited={onExited}
        >
          <p className="msg">hi</p>
        </CSSTransition>
      );
      const node = container.querySelector('.msg');
      setProps({ in: false });
      await waitFor(() => expect(onExited).toHaveBeenCalledWith(node));
      await waitFor(() => expect(container.querySelector('.msg')).toBeNull());
    });
  });

  describe('TransitionGroup', () => {
    function List({ items }) {
      return (
        <TransitionGroup component="ul">
          {items.map((item) => (
            <CSSTransition key={item} timeout={10} classNames="item">
              <li id={item}>{item}</li>
            </CSSTransition>
          ))}
        </TransitionGroup>
      );
    }

    it('animates items in and out without nodeRef', async () => {
      const { container, rerender } = render(<List items={['a']} />);
      expect(container.querySelector('#a').className).toBe('');

      rerender(<List items={['a', 'b']} />);
      const b = container.querySelector('#b');
      expect(b.className).toBe('item-enter item-enter-active');
      await waitFor(() => expect(b.className).toBe('item-enter-done'));

      rerender(<List items={['b']} />);
      const a = container.querySelector('#a');
      expect(a.className).toBe('item-exit item-exit-active');
      await waitFor(() => expect(container.querySelector('#a')).toBeNull());
      expect(container.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('SwitchTransition', () => {
    function Switcher({ on, mode }) {
      return (
        <SwitchTransition mode={mode}>
          <CSSTransition key={on ? 'on' : 'off'} timeout={10} classNames="sw">
            <button>{on ? 'on' : 'off'}</button>
          </CSSTransition>
        </SwitchTransition>
      );
    }

    it('switches out-in without nodeRef', async () => {
      const { container, rerender } = render(<Switcher on={false} />);
      rerender(<Switcher on />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent).toBe('off');
      expect(buttons[0].className).toBe('sw-exit sw-exit-active');

      await waitFor(() =>
        expect(container.querySelector('button').textContent).toBe('on')
      );
      await waitFor(() =>
        expect(container.querySelector('button').className).toBe(
          'sw-enter-done'
        )
      );
    });

    it('switches in-out without nodeRef', async () => {
      const { container, rerender } = render(
        <Switcher on={false} mode="in-out" />
      );
      rerender(<Switcher on mode="in-out" />);
      await waitFor(() =>
        expect(container.querySelectorAll('button').length).toBe(2)
      );
      await waitFor(() =>
        expect(container.querySelectorAll('button').length).toBe(1)
      );
      expect(container.querySelector('button').textContent).toBe('on');
    });
  });

  describe('ReplaceTransition', () => {
    it('calls its own lifecycle handlers without crashing', async () => {
      const onEnter = jest.fn();
      const onExit = jest.fn();
      const { container, setProps } = render(
        <ReplaceTransition in onEnter={onEnter} onExit={onExit}>
          <Transition timeout={0}>
            <div className="first" />
          </Transition>
          <Transition timeout={0}>
            <div className="second" />
          </Transition>
        </ReplaceTransition>
      );
      setProps({ in: false });
      await waitFor(() => expect(onExit).toHaveBeenCalledTimes(1));
      // Same as findDOMNode(this) on React <= 18: the TransitionGroup wrapper <div>.
      expect(onExit.mock.calls[0][0]).toBe(container.firstChild);
    });
  });

  describe('children that cannot take a ref', () => {
    function Plain(props) {
      // ignores `ref` and does not spread props onto a DOM element
      return <div className={props.className}>plain</div>;
    }
    class Klass extends React.Component {
      render() {
        return <div className={this.props.className}>klass</div>;
      }
    }

    [
      ['a function component without forwardRef', Plain],
      ['a class component', Klass],
    ].forEach(([label, Comp]) => {
      it(`does not crash and keeps the timing for ${label}`, async () => {
        const warnSpy = jest
          .spyOn(console, 'warn')
          .mockImplementation(() => {});
        errorSpy.mockImplementation(() => {});
        const times = {};
        const rec = recorder();
        const { container, setProps } = render(
          <CSSTransition
            in={false}
            timeout={40}
            classNames="fade"
            {...rec.props}
            onEntering={(...args) => {
              times.entering = Date.now();
              rec.props.onEntering(...args);
            }}
            onEntered={(...args) => {
              times.entered = Date.now();
              rec.props.onEntered(...args);
            }}
          >
            <Comp className="c" />
          </CSSTransition>
        );
        setProps({ in: true });
        await waitFor(() => expect(rec.names()).toEqual(ENTER));
        expect(times.entered - times.entering).toBeGreaterThanOrEqual(35);

        const node = container.querySelector('div');
        if (REACT_MAJOR < 19) {
          // findDOMNode still exists: identical to upstream
          expect(rec.calls[0][1]).toBe(node);
          expect(node.className).toBe('c fade-enter-done');
        } else {
          // React 19 has no way to reach this node without a ref.
          expect(rec.calls[0][1]).toBeNull();
          expect(node.className).toBe('c');
          expect(warnSpy).toHaveBeenCalledTimes(1);
          expect(warnSpy.mock.calls[0][0]).toMatch(/nodeRef/);
        }
        warnSpy.mockRestore();
      });
    });

    it('React 19: a function component that passes `ref` through props works', async () => {
      // In React 19 `ref` is a normal prop, so a component that spreads its
      // props onto a DOM element receives the internal ref.
      const Spread = (props) => <article {...props} />;
      const rec = recorder();
      const { container, setProps } = render(
        <Transition in={false} timeout={0} {...rec.props}>
          <Spread className="s" />
        </Transition>
      );
      setProps({ in: true });
      await waitFor(() => expect(rec.names()).toEqual(ENTER));
      // React <= 18: findDOMNode; React 19: the forwarded ref prop
      expect(rec.calls[0][1]).toBe(container.querySelector('article'));
    });
  });
});
