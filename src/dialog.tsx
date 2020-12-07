/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;html;dialog
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

import {
    Component,
    ComponentContext,
    createElement,
    createRef,
    DomUtilities,
    DynamicHtmlContent
} from '@dng-git/djt-html-component';

import { createPopper, PositioningStrategy, VirtualEventElement, VirtualViewportElement } from '@dng-git/djt-html-popper';
import { DialogProps, DialogState } from './dialog-interfaces';

/**
 * "Dialog" provides a backward-compatible variant of the (X)HTML5 "dialog"
 * element.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-html-dialog
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export default class Dialog<
    P extends DialogProps = DialogProps,
    S extends DialogState = DialogState,
    C = ComponentContext
> extends Component<P, S, C> {
    /**
     * Flag indicating that "dialog" is supported natively.
     */
    protected static nativeDialogSupported: boolean | void = undefined;
    /**
     * React reference to the dialog DOM node
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected dialogNode = createRef<any>();

    /**
     * Constructor (Dialog)
     *
     * @param props Dialog props
     * @param args Additional arguments given
     *
     * @since v1.0.0
     */
    constructor(props?: P, ...args: unknown[]) {
        super(props, ...args);

        this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
    }

    /**
     * Returns true if the original element DOM node is of type "HTMLDialogElement".
     *
     * @return Native details DOM node
     * @since  v1.0.0
     */
    public get isOriginalDialogElement() {
        return (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.instanceClass.nativeDialogSupported
            && this.originalElement
            && this.originalElement.nodeName.toLowerCase() === 'dialog'
        );
    }

    /**
     * Returns the native dialog DOM node.
     *
     * @return Native dialog DOM node
     * @since  v1.0.0
     */
    protected get nativeDialogNode() {
        let _return;

        if (this.state.isNativeImplementation) {
            _return = (
                this.isOriginalDialogElement
                ? this.originalElement
                : Dialog.getDomElement(this.dialogNode.current)
            ) as HTMLDialogElement;
        }

        return _return;
    }

    /**
     * Closes the underlying dialog.
     *
     * @since v1.0.0
     */
    protected close() {
        const stateChanges = { isOpen: false } as S;

        if (this.state.isNativeImplementation) {
            this.nativeDialogNode.close();
        } else if (this.state.nonNativePopperInstance) {
            this.state.nonNativePopperInstance.destroy();
            stateChanges['nonNativePopperInstance'] = null;
        }

        if (this.state.isModal) {
            const bodyNode = DomUtilities.$('body') as HTMLBodyElement;

            bodyNode.className = DomUtilities.getFilteredAndPrependedString(
                bodyNode.className,
                [ this.state.cssModalDialogOpenedBodyClass ],
                undefined
            );
        }

        this.setState(stateChanges);
    }

    /**
     * reactjs.org: It is invoked immediately after a component is mounted
     * (inserted into the tree).
     *
     * @since v1.0.0
     */
    public componentDidMount() {
        super.componentDidMount();

        if (this.isOriginalDialogElement) {
            this.originalElement.setAttribute('id', this.state.id);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const instanceClass = this.instanceClass;
        const nativeDialogNode = this.nativeDialogNode;

        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        if (instanceClass.nativeDialogSupported === undefined && nativeDialogNode) {
            instanceClass.nativeDialogSupported = (typeof nativeDialogNode.showModal != 'undefined');

            if (!instanceClass.nativeDialogSupported) {
                if (typeof nativeDialogNode.open != 'undefined') {
                    nativeDialogNode.open = true;
                }

                this.setState({ isElementSizeRelevant: true, isNativeImplementation: false, isWindowResizeRelevant: true });
                this.fireXElementResizeEvent();
            }
        }

        if (instanceClass.nativeDialogSupported && this.state.isOpenedOnInitialization) {
            this.setState({ isOpen: true });
        }
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rootNode = Dialog.getDomElement(this);

        /* eslint-disable @typescript-eslint/unbound-method */
        DomUtilities.addEventListener(rootNode, 'x-dialog-close', this.onClose);
        DomUtilities.addEventListener(rootNode, 'x-dialog-open', this.onOpen);
        /* eslint-enable @typescript-eslint/unbound-method */
    }

    /**
     * reactjs.org: It is invoked immediately before a component is unmounted
     * and destroyed.
     *
     * @since v1.0.0
     */
    public componentWillUnmount() {
        this.close();
    }

    /**
     * Called for DOM event "x-dialog-close".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onClose(_?: Event) {
        this.setState({ isOpen: false });
    }

    /**
     * Called for DOM event "x-dialog-open".
     *
     * @param _ Event object
     *
     * @since v1.0.0
     */
    public onOpen(event?: Event) {
        const stateChanges = { isOpen: true } as S;

        if (event) {
            stateChanges['_lastOpeningEvent'] = event;
        }

        this.setState(stateChanges);
    }

    /**
     * This method is called after the instance state changed.

     * @param oldProps Old props
     * @param oldState Old state
     *
     * @since v1.0.0
     */
    public onStateChanged(oldProps: P, oldState: S) {
        super.onStateChanged(oldProps, oldState);

        if (this.state.isOpen !== oldState.isOpen) {
            if (this.state.isOpen) {
                this.open();
            } else {
                this.close();
            }
        }

        if (
            this.state.nonNativePopperInstance
            && (this.state.width !== oldState.width || this.state.height !== oldState.height)
        ) {
            this.fireXElementResizeEvent();
            void this.state.nonNativePopperInstance.update();
        }
    }

    /**
     * Opens the underlying dialog.
     *
     * @since v1.0.0
     */
    protected open() {
        const stateChanges = { _lastOpeningEvent: undefined } as S;

        if (!this.state.isOpen) {
            stateChanges['isOpen'] = true;
        }

        if (this.state.isModal) {
            document.body.className = DomUtilities.getFilteredAndPrependedString(
                document.body.className,
                [ this.state.cssModalDialogOpenedBodyClass ],
                this.state.cssModalDialogOpenedBodyClass
            );
        }

        if (this.state.isNativeImplementation && this.state.isModal) {
            this.nativeDialogNode.showModal();
        } else {
            if (this.state.isNativeImplementation) {
                this.nativeDialogNode.show();
            }

            let popperElement = this.nativeDialogNode;
            let referenceElement;
            let popperStrategy: PositioningStrategy = 'absolute';

            if (!popperElement) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                popperElement = Dialog.getDomElement(this);
            }

            if (this.state.isModal) {
                popperStrategy = 'fixed';
                referenceElement = new VirtualViewportElement();
            } else if (this.state._lastOpeningEvent) {
                referenceElement = new VirtualEventElement(this.state._lastOpeningEvent);
             } else {
                referenceElement = this.originalElement;

                if (!referenceElement) {
                    referenceElement = popperElement.parentElement;
                }

                referenceElement = (referenceElement.previousElementSibling ? referenceElement.previousElementSibling : referenceElement.parentElement);
            }

            stateChanges['nonNativePopperInstance'] = createPopper(
                referenceElement,
                popperElement,
                {
                    modifiers: [
                        { name: 'preventOverflow', options: { padding: 0, rootBoundary: 'viewport' } },
                        { name: 'arrow', enabled: false },
                        { name: 'hide', enabled: false },
                        { name: 'offset', enabled: false }
                    ],
                    placement: 'bottom',
                    strategy: popperStrategy
                }
            );
        }

        this.setState(stateChanges);
    }

    /**
     * Returns the React component content to be rendered.

     * @return React component content to be rendered
     * @since  v1.0.0
     */
    public render() {
        let _return = <DynamicHtmlContent content={ this.state.content } />;

        const cssClass = (this.state.isOpen ? this.state.cssOpenedClass : this.state.cssClosedClass);

        if (!this.state.isNativeImplementation) {
            _return = <div className={ `${cssClass} ${this.state.cssNonNativeDialogClass}` } id={ this.state.id }>{ _return }</div>;

            if (this.state.isModal) {
                const cssStyle = { display: (this.state.isOpen ? undefined : 'none' ) } as CSSProperties;

                if (this.state.width) {
                    cssStyle['width'] = this.state.width;
                }

                if (this.state.height) {
                    cssStyle['height'] = this.state.height;
                }

                _return = (
<div className={ `${this.state.cssNonNativeDialogOverlayClass}` } style={ cssStyle }>{ _return }</div>
                );
            }
        } else if (this.isOriginalDialogElement) {
            this.nativeDialogNode.className = DomUtilities.getFilteredAndPrependedString(
                this.nativeDialogNode.className,
                [ this.state.cssOpenedClass, this.state.cssClosedClass ],
                cssClass
            );
        } else {
            _return = (
                <dialog
                    ref={ this.dialogNode }
                    id={ this.state.id }
                    className={ cssClass }
                >{ _return }</dialog>
            );
        }

        return _return;
    }

    /**
     * Updates the underlying component DOM size.
     *
     * @since v1.0.0
     */
    protected updateDomSize() {
        const metrics = {
            width: document.body.clientWidth,
            height: (this.state.isModal ? document.body.clientHeight : undefined)
        };

        if (this.state.width !== metrics.width || this.state.height !== metrics.height) {
            this.setState( { width: metrics.width, height: metrics.height });
        }
    }

    /**
     * Returns the static component name.
     *
     * @return Static component name
     * @since  v1.0.0
     */
    public static get componentName() {
        return 'djt-dialog';
    }

    /**
     * Returns a list of node names "originalElementData" should provide the
     * inner HTML content instead of being parsed.
     *
     * @return List of node names
     * @since  v1.0.0
     */
    protected static get originalElementNodeNamesWithHtml() {
        return [ '*' ];
    }

    /**
     * reactjs.org: It is invoked right before calling the render method, both on
     * the initial mount and on subsequent updates.
     *
     * @param props Current props
     * @param state Current state
     *
     * @return Updated state values object; null otherwise
     * @since  v1.0.0
     */
    public static getDerivedStateFromProps(props: DialogProps, state: DialogState): DialogState {
        let _return = super.getDerivedStateFromProps(props, state) as DialogState;

        if (state === null) {
            if (!_return) {
                _return = { } as DialogState;
            }

            _return['content'] = (props.content ? props.content : '');
            _return['cssClosedClass'] = (props.closedClass ? props.closedClass : 'djt-dialog-closed');

            _return['cssModalDialogOpenedBodyClass'] = (
                props.modalDialogOpenedBodyClass
                ? props.modalDialogOpenedBodyClass : 'djt-dialog-modal-opened'
            );

            _return['cssNonNativeDialogClass'] = (
                props.nonNativeDialogClass
                ? props.nonNativeDialogClass : 'djt-dialog-non-native'
            );

            _return['cssNonNativeDialogOverlayClass'] = (
                props.nonNativeDialogOverlayClass
                ? props.nonNativeDialogOverlayClass : 'djt-dialog-non-native-overlay'
            );

            _return['cssOpenedClass'] = (props.openedClass ? props.openedClass : 'djt-dialog-opened');
            _return['isModal'] = !([ '0', false, undefined ].includes(props.modal));

            _return['isNativeImplementation'] = (
                this.nativeDialogSupported !== false
                && (!([ '0', false ].includes(props.nativeImplementation)))
            );

            _return['isOpenedOnInitialization'] = !([ '0', false, undefined ].includes(props.open));

            if (props.originalElementData && [ 'dialog', 'djt-dialog' ].includes(props.originalElementData.name)) {
                _return = Object.assign(_return, { content: props.originalElementData.html });
            }
        }

        return _return;
    }
}
