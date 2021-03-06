/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { validateJsonFieldName } from "../../internal";

/**
 * @hidden
 * Reads the value at the path in the src object and writes it to the dst object.
 */
export function readPath(src: any, dst: any, ...path: string[]) {
	let field;
	while (path.length) {
		field = path.shift();
		validateJsonFieldName(field);
		if (path.length) {
			if (!Object.prototype.hasOwnProperty.call(dst, field)) {
				dst[field] = {};
			}
			dst = dst[field];
		}
		if (typeof src[field] === 'undefined') {
			return;
		}
		src = src[field];
	}
	dst[field] = (src && src.toJSON) ? src.toJSON() : src;
}
