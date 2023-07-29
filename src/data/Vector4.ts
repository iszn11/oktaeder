/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Vector4Object {
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly w: number;
}

export type Vector4Tuple = readonly [x: number, y: number, z: number, w: number];

export class Vector4 {

	readonly type!: "Vector4";

	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number, y: number, z: number, w: number) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	static fromObject(object: Vector4Object): Vector4 {
		return new Vector4(object.x, object.y, object.z, object.w);
	}

	static fromTuple(tuple: Vector4Tuple): Vector4 {
		return new Vector4(...tuple);
	}

	static zero(): Vector4 {
		return new Vector4(0, 0, 0, 0);
	}

	static one(): Vector4 {
		return new Vector4(1, 1, 1, 1);
	}

	set(x: number, y: number, z: number, w: number): Vector4 {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}

	setObject(object: Vector4Object): Vector4 {
		this.x = object.x;
		this.y = object.y;
		this.z = object.z;
		this.w = object.w;
		return this;
	}

	setTuple(tuple: Vector4Tuple): Vector4 {
		this.x = tuple[0];
		this.y = tuple[1];
		this.z = tuple[2];
		this.w = tuple[3];
		return this;
	}

	setZero(): Vector4 {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
		return this;
	}

	setOne(): Vector4 {
		this.x = 1;
		this.y = 1;
		this.z = 1;
		this.w = 1;
		return this;
	}

	setX(x: number): Vector4 {
		this.x = x;
		return this;
	}

	setY(y: number): Vector4 {
		this.y = y;
		return this;
	}

	setZ(z: number): Vector4 {
		this.z = z;
		return this;
	}

	setW(w: number): Vector4 {
		this.w = w;
		return this;
	}
}

Object.defineProperty(Vector4.prototype, "type", { value: "Vector4" });

export function isVector4(value: unknown): value is Vector4 {
	return Boolean(value) && (value as Vector4).type === "Vector4";
}
