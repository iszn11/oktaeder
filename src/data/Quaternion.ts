/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface QuaternionObject {
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly w: number;
}

export type QuaternionTuple = readonly [x: number, y: number, z: number, w: number];

export class Quaternion {

	declare readonly type: "Quaternion";

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

	static fromObject(object: QuaternionObject): Quaternion {
		return new Quaternion(object.x, object.y, object.z, object.w);
	}

	static fromTuple(tuple: QuaternionTuple): Quaternion {
		return new Quaternion(...tuple);
	}

	static identity(): Quaternion {
		return new Quaternion(0, 0, 0, 1);
	}

	static fromRotationXY(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		const c = Math.cos(halfAngleRad);
		const s = Math.sin(halfAngleRad);
		return new Quaternion(0, 0, s, c);
	}

	static fromRotationYZ(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		const c = Math.cos(halfAngleRad);
		const s = Math.sin(halfAngleRad);
		return new Quaternion(s, 0, 0, c);
	}

	static fromRotationZX(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		const c = Math.cos(halfAngleRad);
		const s = Math.sin(halfAngleRad);
		return new Quaternion(0, s, 0, c);
	}

	setObject(object: QuaternionObject): Quaternion {
		this.x = object.x;
		this.y = object.y;
		this.z = object.z;
		this.w = object.w;
		return this;
	}

	setTuple(tuple: QuaternionTuple): Quaternion {
		this.x = tuple[0];
		this.y = tuple[1];
		this.z = tuple[2];
		this.w = tuple[3];
		return this;
	}

	setIdentity(): Quaternion {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 1;
		return this;
	}

	setRotationXY(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		this.x = 0;
		this.y = 0;
		this.z = Math.sin(halfAngleRad);
		this.w = Math.cos(halfAngleRad);
		return this;
	}

	setRotationYZ(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		this.x = Math.sin(halfAngleRad);
		this.y = 0;
		this.z = 0;
		this.w = Math.cos(halfAngleRad);
		return this;
	}

	setRotationZX(angleRad: number): Quaternion {
		const halfAngleRad = 0.5 * angleRad;
		this.x = 0;
		this.y = Math.sin(halfAngleRad);
		this.z = 0;
		this.w = Math.cos(halfAngleRad);
		return this;
	}
}

Object.defineProperty(Quaternion.prototype, "type", { value: "Quaternion" });

export function isQuaternion(value: unknown): value is Quaternion {
	return Boolean(value) && (value as Quaternion).type === "Quaternion";
}
