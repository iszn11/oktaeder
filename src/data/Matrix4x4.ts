/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { QuaternionObject, Vector3Object } from ".";

export interface Matrix4x4Object {
	readonly ix: number;
	readonly iy: number;
	readonly iz: number;
	readonly iw: number;
	readonly jx: number;
	readonly jy: number;
	readonly jz: number;
	readonly jw: number;
	readonly kx: number;
	readonly ky: number;
	readonly kz: number;
	readonly kw: number;
	readonly tx: number;
	readonly ty: number;
	readonly tz: number;
	readonly tw: number;
}

export type Matrix4x4Tuple = readonly [
	ix: number, iy: number, iz: number, iw: number,
	jx: number, jy: number, jz: number, jw: number,
	kx: number, ky: number, kz: number, kw: number,
	tx: number, ty: number, tz: number, tw: number,
];

export class Matrix4x4 {

	readonly type!: "Matrix4x4";

	ix: number;
	iy: number;
	iz: number;
	iw: number;
	jx: number;
	jy: number;
	jz: number;
	jw: number;
	kx: number;
	ky: number;
	kz: number;
	kw: number;
	tx: number;
	ty: number;
	tz: number;
	tw: number;

	constructor(
		ix: number, iy: number, iz: number, iw: number,
		jx: number, jy: number, jz: number, jw: number,
		kx: number, ky: number, kz: number, kw: number,
		tx: number, ty: number, tz: number, tw: number
	) {
		this.ix = ix;
		this.iy = iy;
		this.iz = iz;
		this.iw = iw;
		this.jx = jx;
		this.jy = jy;
		this.jz = jz;
		this.jw = jw;
		this.kx = kx;
		this.ky = ky;
		this.kz = kz;
		this.kw = kw;
		this.tx = tx;
		this.ty = ty;
		this.tz = tz;
		this.tw = tw;
	}

	static fromObject(object: Matrix4x4Object): Matrix4x4 {
		return new Matrix4x4(
			object.ix, object.iy, object.iz, object.iw,
			object.jx, object.jy, object.jz, object.jw,
			object.kx, object.ky, object.kz, object.kw,
			object.tx, object.ty, object.tz, object.tw,
		);
	}

	static fromTuple(tuple: Matrix4x4Tuple): Matrix4x4 {
		return new Matrix4x4(...tuple);
	}

	static fromTranslation(translation: Vector3Object): Matrix4x4 {
		return new Matrix4x4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			translation.x, translation.y, translation.z, 1,
		);
	}

	static fromQuaternion(quaternion: QuaternionObject): Matrix4x4 {
		const xx = quaternion.x * quaternion.x;
		const xy = quaternion.x * quaternion.y;
		const xz = quaternion.x * quaternion.z;
		const xw = quaternion.x * quaternion.w;
		const yy = quaternion.y * quaternion.y;
		const yz = quaternion.y * quaternion.z;
		const yw = quaternion.y * quaternion.w;
		const zz = quaternion.z * quaternion.z;
		const zw = quaternion.z * quaternion.w;

		return new Matrix4x4(
			1 - 2 * (yy + zz), 2 * (xy + zw), 2 * (xz - yw), 0,
			2 * (xy - zw), 1 - 2 * (xx + zz), 2 * (yz + xw), 0,
			2 * (xz + yw), 2 * (yz - xw), 1 - 2 * (xx + yy), 0,
			0, 0, 0, 1,
		);
	}

	static fromScale(scale: Vector3Object): Matrix4x4 {
		return new Matrix4x4(
			scale.x, 0, 0, 0,
			0, scale.y, 0, 0,
			0, 0, scale.z, 0,
			0, 0, 0, 1
		);
	}

	static fromTRS(t: Vector3Object, r: QuaternionObject, s: Vector3Object): Matrix4x4 {
		const xx = r.x * r.x;
		const xy = r.x * r.y;
		const xz = r.x * r.z;
		const xw = r.x * r.w;
		const yy = r.y * r.y;
		const yz = r.y * r.z;
		const yw = r.y * r.w;
		const zz = r.z * r.z;
		const zw = r.z * r.w;

		return new Matrix4x4(
			s.x * (1 - 2 * (yy + zz)), s.x * 2 * (xy + zw), s.x * 2 * (xz - yw), 0,
			s.y * 2 * (xy - zw), s.y * (1 - 2 * (xx + zz)), s.y * 2 * (yz + xw), 0,
			s.z * 2 * (xz + yw), s.z * 2 * (yz - xw), s.z * (1 - 2 * (xx + yy)), 0,
			t.x, t.y, t.z, 1,
		);
	}

	setObject(object: Matrix4x4Object): Matrix4x4 {
		this.ix = object.ix;
		this.iy = object.iy;
		this.iz = object.iz;
		this.iw = object.iw;
		this.jx = object.jx;
		this.jy = object.jy;
		this.jz = object.jz;
		this.jw = object.jw;
		this.kx = object.kx;
		this.ky = object.ky;
		this.kz = object.kz;
		this.kw = object.kw;
		this.tx = object.tx;
		this.ty = object.ty;
		this.tz = object.tz;
		this.tw = object.tw;
		return this;
	}

	setTuple(tuple: Matrix4x4Tuple): Matrix4x4 {
		this.ix = tuple[0];
		this.iy = tuple[1];
		this.iz = tuple[2];
		this.iw = tuple[3];
		this.jx = tuple[4];
		this.jy = tuple[5];
		this.jz = tuple[6];
		this.jw = tuple[7];
		this.kx = tuple[8];
		this.ky = tuple[9];
		this.kz = tuple[10];
		this.kw = tuple[11];
		this.tx = tuple[12];
		this.ty = tuple[13];
		this.tz = tuple[14];
		this.tw = tuple[15];
		return this;
	}

	setTranslation(translation: Vector3Object): Matrix4x4 {
		this.ix = 1;
		this.iy = 0;
		this.iz = 0;
		this.iw = 0;
		this.jx = 0;
		this.jy = 1;
		this.jz = 0;
		this.jw = 0;
		this.kx = 0;
		this.ky = 0;
		this.kz = 1;
		this.kw = 0;
		this.tx = translation.x;
		this.ty = translation.y;
		this.tz = translation.z;
		this.tw = 1;
		return this;
	}

	setQuaternion(quaternion: QuaternionObject): Matrix4x4 {
		const xx = quaternion.x * quaternion.x;
		const xy = quaternion.x * quaternion.y;
		const xz = quaternion.x * quaternion.z;
		const xw = quaternion.x * quaternion.w;
		const yy = quaternion.y * quaternion.y;
		const yz = quaternion.y * quaternion.z;
		const yw = quaternion.y * quaternion.w;
		const zz = quaternion.z * quaternion.z;
		const zw = quaternion.z * quaternion.w;

		this.ix = 1 - 2 * (yy + zz);
		this.iy = 2 * (xy + zw);
		this.iz = 2 * (xz - yw);
		this.iw = 0;
		this.jx = 2 * (xy - zw);
		this.jy = 1 - 2 * (xx + zz);
		this.jz = 2 * (yz + xw);
		this.jw = 0;
		this.kx = 2 * (xz + yw);
		this.ky = 2 * (yz - xw);
		this.kz = 1 - 2 * (xx + yy);
		this.kw = 0;
		this.tx = 0;
		this.ty = 0;
		this.tz = 0;
		this.tw = 1;
		return this;
	}

	setScale(scale: Vector3Object): Matrix4x4 {
		this.ix = scale.x;
		this.iy = 0;
		this.iz = 0;
		this.iw = 0;
		this.jx = 0;
		this.jy = scale.y;
		this.jz = 0;
		this.jw = 0;
		this.kx = 0;
		this.ky = 0;
		this.kz = scale.z;
		this.kw = 0;
		this.tx = 0;
		this.ty = 0;
		this.tz = 0;
		this.tw = 1;
		return this;
	}

	setTRS(t: Vector3Object, r: QuaternionObject, s: Vector3Object): Matrix4x4 {
		const xx = r.x * r.x;
		const xy = r.x * r.y;
		const xz = r.x * r.z;
		const xw = r.x * r.w;
		const yy = r.y * r.y;
		const yz = r.y * r.z;
		const yw = r.y * r.w;
		const zz = r.z * r.z;
		const zw = r.z * r.w;

		this.ix = s.x * (1 - 2 * (yy + zz));
		this.iy = s.x * 2 * (xy + zw);
		this.iz = s.x * 2 * (xz - yw);
		this.iw = 0;
		this.jx = s.y * 2 * (xy - zw);
		this.jy = s.y * (1 - 2 * (xx + zz));
		this.jz = s.y * 2 * (yz + xw);
		this.jw = 0;
		this.kx = s.z * 2 * (xz + yw);
		this.ky = s.z * 2 * (yz - xw);
		this.kz = s.z * (1 - 2 * (xx + yy));
		this.kw = 0;
		this.tx = t.x;
		this.ty = t.y;
		this.tz = t.z;
		this.tw = 1;
		return this;
	}

	add(m: Matrix4x4): Matrix4x4 {
		throw new Error("TODO");
		return this;
	}

	sub(m: Matrix4x4): Matrix4x4 {
		throw new Error("TODO");
		return this;
	}

	mulScalar(k: number): Matrix4x4 {
		throw new Error("TODO");
		return this;
	}

	mulMatrix(m: Matrix4x4): Matrix4x4 {
		throw new Error("TODO");
		return this;
	}

	premulMatrix(m: Matrix4x4): Matrix4x4 {
		throw new Error("TODO");
		return this;
	}
}

Object.defineProperty(Matrix4x4.prototype, "type", { value: "Matrix4x4" });

export function isMatrix4x4(value: unknown): value is Matrix4x4 {
	return Boolean(value) && (value as Matrix4x4).type === "Matrix4x4";
}
