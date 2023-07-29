/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Node } from ".";

export type Camera = CameraOrthographic | CameraPerspective;

export interface CameraOrthographicProps {
	readonly name?: string;

	readonly verticalSize: number;
	readonly nearPlane: number;
	readonly farPlane: number;
}

export interface CameraPerspectiveProps {
	readonly name?: string;

	readonly verticalFovRad: number;
	readonly nearPlane: number;
	readonly farPlane: number;
}

export class CameraOrthographic {

	readonly type!: "CameraOrthographic";

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
	}: CameraOrthographicProps) {
		this._name = name;

		this._verticalSize = verticalSize;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = null;
	}

	detach(): Camera {
		if (this._node === null) {
			return this;
		}

		this._node._camera = null;
		this._node = null;
		return this;
	}
}

Object.defineProperty(CameraOrthographic.prototype, "type", { value: "CameraOrthographic" });

export class CameraPerspective {

	readonly type!: "CameraPerspective";

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
	}: CameraPerspectiveProps) {
		this._name = name;

		this._verticalFovRad = verticalFovRad;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = null;
	}

	detach(): Camera {
		if (this._node === null) {
			return this;
		}

		this._node._camera = null;
		this._node = null;
		return this;
	}
}

Object.defineProperty(CameraPerspective.prototype, "type", { value: "CameraPerspective" });

export function isCameraOrthographic(value: unknown): value is CameraOrthographic {
	return Boolean(value) && (value as CameraOrthographic).type === "CameraOrthographic";
}

export function isCameraPerspective(value: unknown): value is CameraPerspective {
	return Boolean(value) && (value as CameraPerspective).type === "CameraPerspective";
}