/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Node } from ".";

export type Camera = OrthographicCamera | PerspectiveCamera;

export interface OrthographicCameraProps {
	readonly name?: string;

	readonly verticalSize: number;
	readonly nearPlane: number;
	readonly farPlane: number;
}

export interface PerspectiveCameraProps {
	readonly name?: string;

	readonly verticalFovRad: number;
	readonly nearPlane: number;
	readonly farPlane: number;
}

export class OrthographicCamera {

	readonly type!: "OrthographicCamera";

	_name: string;

	_verticalSize: number;
	_nearPlane: number;
	_farPlane: number;

	/** backreference */
	_node: Node | null;

	constructor({
		name = "",
		verticalSize,
		nearPlane,
		farPlane,
	}: OrthographicCameraProps) {
		this._name = name;

		this._verticalSize = verticalSize;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = null;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	set verticalSize(value: number) { this._verticalSize = value; }
	get verticalSize(): number { return this._verticalSize; }

	set nearPlane(value: number) { this._nearPlane = value; }
	get nearPlane(): number { return this._nearPlane; }

	set farPlane(value: number) { this._farPlane = value; }
	get farPlane(): number { return this._farPlane; }

	attach(node: Node): OrthographicCamera {
		if (this._node !== null) {
			this._node._camera = null;
		}

		if (node._camera !== null) {
			node._camera._node = null;
		}

		node._camera = this;
		this._node = node;
		return this;
	}

	detach(): OrthographicCamera {
		if (this._node === null) {
			return this;
		}

		this._node._camera = null;
		this._node = null;
		return this;
	}
}

export class PerspectiveCamera {

	readonly type!: "PerspectiveCamera";

	_name: string;

	_verticalFovRad: number;
	_nearPlane: number;
	_farPlane: number;

	/** backreference */
	_node: Node | null;

	constructor({
		name = "",
		verticalFovRad,
		nearPlane,
		farPlane,
	}: PerspectiveCameraProps) {
		this._name = name;

		this._verticalFovRad = verticalFovRad;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = null;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	set nearPlane(value: number) { this._nearPlane = value; }
	get nearPlane(): number { return this._nearPlane; }

	set farPlane(value: number) { this._farPlane = value; }
	get farPlane(): number { return this._farPlane; }

	attach(node: Node): PerspectiveCamera {
		if (this._node !== null) {
			this._node._camera = null;
		}

		if (node._camera !== null) {
			node._camera._node = null;
		}

		node._camera = this;
		this._node = node;
		return this;
	}

	detach(): PerspectiveCamera {
		if (this._node === null) {
			return this;
		}

		this._node._camera = null;
		this._node = null;
		return this;
	}
}

Object.defineProperty(OrthographicCamera.prototype, "type", { value: "OrthographicCamera" });

Object.defineProperty(PerspectiveCamera.prototype, "type", { value: "PerspectiveCamera" });

export function isOrthographicCamera(value: unknown): value is OrthographicCamera {
	return Boolean(value) && (value as OrthographicCamera).type === "OrthographicCamera";
}

export function isPerspectiveCamera(value: unknown): value is PerspectiveCamera {
	return Boolean(value) && (value as PerspectiveCamera).type === "PerspectiveCamera";
}
