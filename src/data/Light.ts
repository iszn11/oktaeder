/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Color, ColorObject, Node } from ".";

export type Light = DirectionalLight | PointLight;

export interface DirectionalLightProps {
	readonly name?: string;

	readonly color: ColorObject;
}

export interface PointLightProps {
	readonly name?: string;

	readonly color: ColorObject;
}

export class DirectionalLight {

	get type(): "DirectionalLight" {};

	_name: string;

	_color: Color;

	/** backreference */
	_node: Node | null;

	constructor({
		name = "",
		color,
	}: DirectionalLightProps) {
		this._name = name;

		this._color = Color.fromObject(color);

		this._node = null;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	setColor(value: ColorObject): DirectionalLight {
		this._color.setObject(value);
		return this;
	}

	getColor(res: Color): Color {
		return res.setObject(this._color);
	}

	attach(node: Node): DirectionalLight {
		if (this._node !== null) {
			this._node._light = null;
		}

		if (node._light !== null) {
			node._light._node = null;
		}

		node._light = this;
		this._node = node;
		return this;
	}

	detach(): DirectionalLight {
		if (this._node === null) {
			return this;
		}

		this._node._light = null;
		this._node = null;
		return this;
	}
}

export class PointLight {

	declare readonly type: "PointLight";

	_name: string;

	_color: Color;

	/** backreference */
	_node: Node | null;

	constructor({
		name = "",
		color,
	}: PointLightProps) {
		this._name = name;

		this._color = Color.fromObject(color);

		this._node = null;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	setColor(value: ColorObject): PointLight {
		this._color.setObject(value);
		return this;
	}

	getColor(res: Color): Color {
		return res.setObject(this._color);
	}

	attach(node: Node): PointLight {
		if (this._node !== null) {
			this._node._light = null;
		}

		if (node._light !== null) {
			node._light._node = null;
		}

		node._light = this;
		this._node = node;
		return this;
	}

	detach(): PointLight {
		if (this._node === null) {
			return this;
		}

		this._node._light = null;
		this._node = null;
		return this;
	}
}

Object.defineProperty(DirectionalLight.prototype, "type", { value: "DirectionalLight" });

Object.defineProperty(PointLight.prototype, "type", { value: "PointLight" });

export function isDirectionalLight(value: unknown): value is DirectionalLight {
	return Boolean(value) && (value as DirectionalLight).type === "DirectionalLight";
}

export function isPointLight(value: unknown): value is PointLight {
	return Boolean(value) && (value as PointLight).type === "PointLight";
}
