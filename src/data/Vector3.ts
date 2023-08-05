/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Vector3Object {
	readonly x: number;
	readonly y: number;
	readonly z: number;
}

export type Vector3Tuple = readonly [x: number, y: number, z: number];

export class Vector3 {

	readonly type!: "Vector3";

	x: number;
	y: number;
	z: number;

	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static fromObject(object: Vector3Object): Vector3 {
		return new Vector3(object.x, object.y, object.z);
	}

	static fromTuple(tuple: Vector3Tuple): Vector3 {
		return new Vector3(...tuple);
	}

	static zero(): Vector3 {
		return new Vector3(0, 0, 0);
	}

	static one(): Vector3 {
		return new Vector3(1, 1, 1);
	}

	set(x: number, y: number, z: number): Vector3 {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}

	setObject(object: Vector3Object): Vector3 {
		this.x = object.x;
		this.y = object.y;
		this.z = object.z;
		return this;
	}

	setTuple(tuple: Vector3Tuple): Vector3 {
		this.x = tuple[0];
		this.y = tuple[1];
		this.z = tuple[2];
		return this;
	}

	setZero(): Vector3 {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	}

	setOne(): Vector3 {
		this.x = 1;
		this.y = 1;
		this.z = 1;
		return this;
	}

	setX(x: number): Vector3 {
		this.x = x;
		return this;
	}

	setY(y: number): Vector3 {
		this.y = y;
		return this;
	}

	setZ(z: number): Vector3 {
		this.z = z;
		return this;
	}

	normalize(): Vector3 {
		const l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		this.x /= l;
		this.y /= l;
		this.z /= l;
		return this;
	}
}

Object.defineProperty(Vector3.prototype, "type", { value: "Vector3" });

export function isVector3(value: unknown): value is Vector3 {
	return Boolean(value) && (value as Vector3).type === "Vector3";
}
