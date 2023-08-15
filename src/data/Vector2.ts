/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Vector2Object {
	readonly x: number;
	readonly y: number;
}

export type Vector2Tuple = readonly [x: number, y: number];

export class Vector2 {

	declare readonly type: "Vector2";

	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	static fromObject(object: Vector2Object): Vector2 {
		return new Vector2(object.x, object.y);
	}

	static fromTuple(tuple: Vector2Tuple): Vector2 {
		return new Vector2(...tuple);
	}

	static zero(): Vector2 {
		return new Vector2(0, 0);
	}

	static one(): Vector2 {
		return new Vector2(1, 1);
	}

	set(x: number, y: number): Vector2 {
		this.x = x;
		this.y = y;
		return this;
	}

	setObject(object: Vector2Object): Vector2 {
		this.x = object.x;
		this.y = object.y;
		return this;
	}

	setTuple(tuple: Vector2Tuple): Vector2 {
		this.x = tuple[0];
		this.y = tuple[1];
		return this;
	}

	setZero(): Vector2 {
		this.x = 0;
		this.y = 0;
		return this;
	}

	setOne(): Vector2 {
		this.x = 1;
		this.y = 1;
		return this;
	}

	setX(x: number): Vector2 {
		this.x = x;
		return this;
	}

	setY(y: number): Vector2 {
		this.y = y;
		return this;
	}

	normalize(): Vector2 {
		const l = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x /= l;
		this.y /= l;
		return this;
	}
}

Object.defineProperty(Vector2.prototype, "type", { value: "Vector2" });

export function isVector2(value: unknown): value is Vector2 {
	return Boolean(value) && (value as Vector2).type === "Vector2";
}
