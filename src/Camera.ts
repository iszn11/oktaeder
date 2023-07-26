/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Node } from "./Node";

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
	_node: Node | undefined;

	constructor({
		name = "",
		verticalSize,
		nearPlane,
		farPlane,
	}: CameraOrthographicProps) {
		Object.defineProperty(this, "type", { value: "CameraOrthographic" });

		this._name = name;

		this._verticalSize = verticalSize;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = undefined;
	}

	detach(): Camera {
		if (this._node === undefined) {
			return this;
		}

		this._node._camera = undefined;
		this._node = undefined;
		return this;
	}
}

export class CameraPerspective {

	readonly type!: "CameraPerspective";

	_name: string;

	_verticalFovRad: number;
	_nearPlane: number;
	_farPlane: number;

	/** backreference */
	_node: Node | undefined;

	constructor({
		name = "",
		verticalFovRad,
		nearPlane,
		farPlane,
	}: CameraPerspectiveProps) {
		Object.defineProperty(this, "type", { value: "CameraPerspective" });

		this._name = name;

		this._verticalFovRad = verticalFovRad;
		this._nearPlane = nearPlane;
		this._farPlane = farPlane;

		this._node = undefined;
	}

	detach(): Camera {
		if (this._node === undefined) {
			return this;
		}

		this._node._camera = undefined;
		this._node = undefined;
		return this;
	}
}

export function isCameraOrthographic(value: unknown): value is CameraOrthographic {
	return Boolean(value) && (value as CameraOrthographic).type === "CameraOrthographic";
}

export function isCameraPerspective(value: unknown): value is CameraPerspective {
	return Boolean(value) && (value as CameraPerspective).type === "CameraPerspective";
}
