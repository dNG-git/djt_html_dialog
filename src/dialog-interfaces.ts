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


import { ComponentProps, ComponentState } from '@dng-git/djt-html-component';
import { Instance as PopperInstance } from '@dng-git/djt-html-popper';

/**
 * "Dialog" properties interface
 *
 * @since v1.0.0
 */
export interface DialogProps extends ComponentProps {
    closedClass?: string,
    content?: string,
    modal?: string | boolean,
    modalDialogOpenedBodyClass?: string,
    nativeImplementation?: string | boolean,
    nonNativeDialogClass?: string,
    nonNativeDialogOverlayClass?: string,
    open?: string | boolean,
    openedClass?: string
}

/**
 * "Dialog" state interface
 *
 * @since v1.0.0
 */
export interface DialogState extends ComponentState {
    content: string,
    cssClosedClass: string,
    cssModalDialogOpenedBodyClass: string,
    cssNonNativeDialogClass: string,
    cssNonNativeDialogOverlayClass: string,
    cssOpenedClass: string,
    nonNativePopperInstance: PopperInstance,
    isModal: boolean,
    isNativeImplementation: boolean,
    isOpen: boolean,
    isOpenedOnInitialization: boolean,
    _lastOpeningEvent?: Event
}
