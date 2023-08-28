/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Matrix4x4, Node } from ".";

export type Camera = OrthographicCamera | PerspectiveCamera;

export interface OrthographicCameraProps {
	readonly name?: string;

	readonly halfVerticalSize: number;
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

	declare readonly type: "OrthographicCamera";

	_name: string;

	_halfVerticalSize: number;
	_nearPlane: number;
	_farPlane: number;

	/** backreference */
	_node: Node | null;

	constructor({
		name = "",
		halfVerticalSize,
		nearPlane,
		farPlane,
	}: OrthographicCameraProps) {
		this._name = name;

		this._halfVerticalSize = halfVerticalSize;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = null;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	set halfVerticalSize(value: number) { this._halfVerticalSize = value; }
	get halfVerticalSize(): number { return this._halfVerticalSize; }

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

	computeProjectionMatrix(aspectRatio: number, res: Matrix4x4): Matrix4x4 {
		const halfHorizontalSize = this._halfVerticalSize / aspectRatio;
		return res.set(
			1 / halfHorizontalSize, 0, 0, 0,
			0, 1 / this._halfVerticalSize, 0, 0,
			0, 0, 1 / (this._nearPlane - this._farPlane), 0,
			0, 0, this._farPlane / (this._farPlane - this._nearPlane), 1,
		);
	}
}

export class PerspectiveCamera {

	declare readonly type: "PerspectiveCamera";

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

	computeProjectionMatrix(aspectRatio: number, res: Matrix4x4): Matrix4x4 {
		const halfVerticalCotangent = 1 / Math.tan(0.5 * this._verticalFovRad);
		if (this._farPlane === Infinity) {
			return res.set(
				halfVerticalCotangent / aspectRatio, 0, 0, 0,
				0, halfVerticalCotangent, 0, 0,
				0, 0, 0, 1,
				0, 0, this._nearPlane, 0,
			);
		} else {
			return res.set(
				halfVerticalCotangent / aspectRatio, 0, 0, 0,
				0, halfVerticalCotangent, 0, 0,
				0, 0, this._nearPlane / (this._nearPlane - this._farPlane), 1,
				0, 0, this._nearPlane * this._farPlane / (this._farPlane - this._nearPlane), 0,
			);
		}
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
