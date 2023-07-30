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

	static identity(): Matrix4x4 {
		return new Matrix4x4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		)
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

	static fromTranslationRotationScale(translation: Vector3Object, rotation: QuaternionObject, scale: Vector3Object): Matrix4x4 {
		const xx = rotation.x * rotation.x;
		const xy = rotation.x * rotation.y;
		const xz = rotation.x * rotation.z;
		const xw = rotation.x * rotation.w;
		const yy = rotation.y * rotation.y;
		const yz = rotation.y * rotation.z;
		const yw = rotation.y * rotation.w;
		const zz = rotation.z * rotation.z;
		const zw = rotation.z * rotation.w;

		return new Matrix4x4(
			scale.x * (1 - 2 * (yy + zz)), scale.x * 2 * (xy + zw), scale.x * 2 * (xz - yw), 0,
			scale.y * 2 * (xy - zw), scale.y * (1 - 2 * (xx + zz)), scale.y * 2 * (yz + xw), 0,
			scale.z * 2 * (xz + yw), scale.z * 2 * (yz - xw), scale.z * (1 - 2 * (xx + yy)), 0,
			translation.x, translation.y, translation.z, 1,
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

	setIdentity(): Matrix4x4 {
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
		this.tx = 0;
		this.ty = 0;
		this.tz = 0;
		this.tw = 1;
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

	setTranslationRotationScale(translation: Vector3Object, rotation: QuaternionObject, scale: Vector3Object): Matrix4x4 {
		const xx = rotation.x * rotation.x;
		const xy = rotation.x * rotation.y;
		const xz = rotation.x * rotation.z;
		const xw = rotation.x * rotation.w;
		const yy = rotation.y * rotation.y;
		const yz = rotation.y * rotation.z;
		const yw = rotation.y * rotation.w;
		const zz = rotation.z * rotation.z;
		const zw = rotation.z * rotation.w;

		this.ix = scale.x * (1 - 2 * (yy + zz));
		this.iy = scale.x * 2 * (xy + zw);
		this.iz = scale.x * 2 * (xz - yw);
		this.iw = 0;
		this.jx = scale.y * 2 * (xy - zw);
		this.jy = scale.y * (1 - 2 * (xx + zz));
		this.jz = scale.y * 2 * (yz + xw);
		this.jw = 0;
		this.kx = scale.z * 2 * (xz + yw);
		this.ky = scale.z * 2 * (yz - xw);
		this.kz = scale.z * (1 - 2 * (xx + yy));
		this.kw = 0;
		this.tx = translation.x;
		this.ty = translation.y;
		this.tz = translation.z;
		this.tw = 1;
		return this;
	}

	addMatrix(m: Matrix4x4): Matrix4x4 {
		this.ix += m.ix;
		this.iy += m.iy;
		this.iz += m.iz;
		this.iw += m.iw;
		this.jx += m.jx;
		this.jy += m.jy;
		this.jz += m.jz;
		this.jw += m.jw;
		this.kx += m.kx;
		this.ky += m.ky;
		this.kz += m.kz;
		this.kw += m.kw;
		this.tx += m.tx;
		this.ty += m.ty;
		this.tz += m.tz;
		this.tw += m.tw;
		return this;
	}

	addMatrices(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
		this.ix = a.ix + b.ix;
		this.iy = a.iy + b.iy;
		this.iz = a.iz + b.iz;
		this.iw = a.iw + b.iw;
		this.jx = a.jx + b.jx;
		this.jy = a.jy + b.jy;
		this.jz = a.jz + b.jz;
		this.jw = a.jw + b.jw;
		this.kx = a.kx + b.kx;
		this.ky = a.ky + b.ky;
		this.kz = a.kz + b.kz;
		this.kw = a.kw + b.kw;
		this.tx = a.tx + b.tx;
		this.ty = a.ty + b.ty;
		this.tz = a.tz + b.tz;
		this.tw = a.tw + b.tw;
		return this;
	}

	subMatrix(m: Matrix4x4): Matrix4x4 {
		this.ix -= m.ix;
		this.iy -= m.iy;
		this.iz -= m.iz;
		this.iw -= m.iw;
		this.jx -= m.jx;
		this.jy -= m.jy;
		this.jz -= m.jz;
		this.jw -= m.jw;
		this.kx -= m.kx;
		this.ky -= m.ky;
		this.kz -= m.kz;
		this.kw -= m.kw;
		this.tx -= m.tx;
		this.ty -= m.ty;
		this.tz -= m.tz;
		this.tw -= m.tw;
		return this;
	}

	subMatrices(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
		this.ix = a.ix - b.ix;
		this.iy = a.iy - b.iy;
		this.iz = a.iz - b.iz;
		this.iw = a.iw - b.iw;
		this.jx = a.jx - b.jx;
		this.jy = a.jy - b.jy;
		this.jz = a.jz - b.jz;
		this.jw = a.jw - b.jw;
		this.kx = a.kx - b.kx;
		this.ky = a.ky - b.ky;
		this.kz = a.kz - b.kz;
		this.kw = a.kw - b.kw;
		this.tx = a.tx - b.tx;
		this.ty = a.ty - b.ty;
		this.tz = a.tz - b.tz;
		this.tw = a.tw - b.tw;
		return this;
	}

	negate(): Matrix4x4 {
		this.ix = -this.ix;
		this.iy = -this.iy;
		this.iz = -this.iz;
		this.iw = -this.iw;
		this.jx = -this.jx;
		this.jy = -this.jy;
		this.jz = -this.jz;
		this.jw = -this.jw;
		this.kx = -this.kx;
		this.ky = -this.ky;
		this.kz = -this.kz;
		this.kw = -this.kw;
		this.tx = -this.tx;
		this.ty = -this.ty;
		this.tz = -this.tz;
		this.tw = -this.tw;
		return this;
	}

	mulScalar(k: number): Matrix4x4 {
		this.ix *= k;
		this.iy *= k;
		this.iz *= k;
		this.iw *= k;
		this.jx *= k;
		this.jy *= k;
		this.jz *= k;
		this.jw *= k;
		this.kx *= k;
		this.ky *= k;
		this.kz *= k;
		this.kw *= k;
		this.tx *= k;
		this.ty *= k;
		this.tz *= k;
		this.tw *= k;
		return this;
	}

	mulMatrix(m: Matrix4x4): Matrix4x4 {
		const ix = this.ix * m.ix + this.jx * m.iy + this.kx * m.iz + this.tx * m.iw;
		const iy = this.iy * m.ix + this.jy * m.iy + this.ky * m.iz + this.ty * m.iw;
		const iz = this.iz * m.ix + this.jz * m.iy + this.kz * m.iz + this.tz * m.iw;
		const iw = this.iw * m.ix + this.jw * m.iy + this.kw * m.iz + this.tw * m.iw;
		const jx = this.ix * m.jx + this.jx * m.jy + this.kx * m.jz + this.tx * m.jw;
		const jy = this.iy * m.jx + this.jy * m.jy + this.ky * m.jz + this.ty * m.jw;
		const jz = this.iz * m.jx + this.jz * m.jy + this.kz * m.jz + this.tz * m.jw;
		const jw = this.iw * m.jx + this.jw * m.jy + this.kw * m.jz + this.tw * m.jw;
		const kx = this.ix * m.kx + this.jx * m.ky + this.kx * m.kz + this.tx * m.kw;
		const ky = this.iy * m.kx + this.jy * m.ky + this.ky * m.kz + this.ty * m.kw;
		const kz = this.iz * m.kx + this.jz * m.ky + this.kz * m.kz + this.tz * m.kw;
		const kw = this.iw * m.kx + this.jw * m.ky + this.kw * m.kz + this.tw * m.kw;
		const tx = this.ix * m.tx + this.jx * m.ty + this.kx * m.tz + this.tx * m.tw;
		const ty = this.iy * m.tx + this.jy * m.ty + this.ky * m.tz + this.ty * m.tw;
		const tz = this.iz * m.tx + this.jz * m.ty + this.kz * m.tz + this.tz * m.tw;
		const tw = this.iw * m.tx + this.jw * m.ty + this.kw * m.tz + this.tw * m.tw;
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
		return this;
	}

	premulMatrix(m: Matrix4x4): Matrix4x4 {
		const ix = m.ix * this.ix + m.jx * this.iy + m.kx * this.iz + m.tx * this.iw;
		const iy = m.iy * this.ix + m.jy * this.iy + m.ky * this.iz + m.ty * this.iw;
		const iz = m.iz * this.ix + m.jz * this.iy + m.kz * this.iz + m.tz * this.iw;
		const iw = m.iw * this.ix + m.jw * this.iy + m.kw * this.iz + m.tw * this.iw;
		const jx = m.ix * this.jx + m.jx * this.jy + m.kx * this.jz + m.tx * this.jw;
		const jy = m.iy * this.jx + m.jy * this.jy + m.ky * this.jz + m.ty * this.jw;
		const jz = m.iz * this.jx + m.jz * this.jy + m.kz * this.jz + m.tz * this.jw;
		const jw = m.iw * this.jx + m.jw * this.jy + m.kw * this.jz + m.tw * this.jw;
		const kx = m.ix * this.kx + m.jx * this.ky + m.kx * this.kz + m.tx * this.kw;
		const ky = m.iy * this.kx + m.jy * this.ky + m.ky * this.kz + m.ty * this.kw;
		const kz = m.iz * this.kx + m.jz * this.ky + m.kz * this.kz + m.tz * this.kw;
		const kw = m.iw * this.kx + m.jw * this.ky + m.kw * this.kz + m.tw * this.kw;
		const tx = m.ix * this.tx + m.jx * this.ty + m.kx * this.tz + m.tx * this.tw;
		const ty = m.iy * this.tx + m.jy * this.ty + m.ky * this.tz + m.ty * this.tw;
		const tz = m.iz * this.tx + m.jz * this.ty + m.kz * this.tz + m.tz * this.tw;
		const tw = m.iw * this.tx + m.jw * this.ty + m.kw * this.tz + m.tw * this.tw;
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
		return this;
	}
}

Object.defineProperty(Matrix4x4.prototype, "type", { value: "Matrix4x4" });

export function isMatrix4x4(value: unknown): value is Matrix4x4 {
	return Boolean(value) && (value as Matrix4x4).type === "Matrix4x4";
}
