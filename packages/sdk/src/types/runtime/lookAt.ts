/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LookAtMode } from "../..";
import { Guid, ZeroGuid } from "../..";

export interface LookAtLike {
	actorId: Guid;
	mode: LookAtMode;
	backward: boolean;
}

export class LookAt implements LookAtLike {
	private _actorId = ZeroGuid;
	private _mode = LookAtMode.None;
	private _backward = false;

	public get actorId() { return this._actorId; }
	public set actorId(value) { value ? this._actorId = value : this._actorId = ZeroGuid; }
	public get mode() { return this._mode; }
	public set mode(value) { value ? this._mode = value : this._mode = LookAtMode.None; }
	public get backward() { return this._backward; }
	public set backward(value) { this._backward = !!value; }

	/** @hidden */
	public toJSON(): LookAtLike {
		return {
			actorId: this.actorId,
			mode: this.mode,
			backward: this.backward
		} as LookAtLike;
	}

	public copy(from: Partial<LookAtLike>): this {
		if (!from) { return this; }
		if (from.actorId !== undefined) { this.actorId = from.actorId; }
		if (from.mode !== undefined) { this.mode = from.mode; }
		if (from.backward !== undefined) { this.backward = from.backward; }
		return this;
	}
}
