import { Matrix4x4Object, Vector2Object, Vector3Object, Vector4Object } from "./data";

export class _BinaryWriter {

	static readonly DEFAULT_CAPACITY = 16;

	_buffer: ArrayBuffer;
	_dataView: DataView;
	_typedArray: Uint8Array;
	_length: number;

	get subarray(): Uint8Array { return new Uint8Array(this._buffer, 0, this._length); }

	constructor(capacity = _BinaryWriter.DEFAULT_CAPACITY) {
		capacity = Math.max(capacity, 1);
		this._buffer = new ArrayBuffer(capacity);
		this._dataView = new DataView(this._buffer);
		this._typedArray = new Uint8Array(this._buffer);
		this._length = 0;
	}

	clear(): _BinaryWriter {
		this._length = 0;
		return this;
	}

	ensureCapacity(desiredCapacity: number): _BinaryWriter {
		if (this._buffer.byteLength >= desiredCapacity) {
			return this;
		}

		let newCapacity = this._buffer.byteLength * 2;
		while (newCapacity < desiredCapacity) {
			newCapacity *= 2;
		}

		const newBuffer = new ArrayBuffer(newCapacity);
		const newDataView = new DataView(newBuffer);
		const newTypedArray = new Uint8Array(newBuffer);

		newTypedArray.set(this.subarray);

		this._buffer = newBuffer;
		this._dataView = newDataView;
		this._typedArray = newTypedArray;
		return this;
	}

	ensureUnusedCapacity(desiredUnusedCapacity: number): _BinaryWriter {
		return this.ensureCapacity(this._buffer.byteLength + desiredUnusedCapacity);
	}

	writeU32(value: number): _BinaryWriter {
		this.ensureUnusedCapacity(4);
		this._dataView.setUint32(this._length, value, true);
		return this;
	}

	writeF32(value: number): _BinaryWriter {
		this.ensureUnusedCapacity(4);
		this._dataView.setFloat32(this._length, value, true);
		return this;
	}

	writeVector2(value: Vector2Object): _BinaryWriter {
		this.writeF32(value.x);
		this.writeF32(value.y);
		return this;
	}

	writeVector3(value: Vector3Object): _BinaryWriter {
		this.writeF32(value.x);
		this.writeF32(value.y);
		this.writeF32(value.z);
		return this;
	}

	writeVector4(value: Vector4Object): _BinaryWriter {
		this.writeF32(value.x);
		this.writeF32(value.y);
		this.writeF32(value.z);
		this.writeF32(value.w);
		return this;
	}

	writeMatrix4x4(value: Matrix4x4Object): _BinaryWriter {
		this.writeF32(value.ix);
		this.writeF32(value.iy);
		this.writeF32(value.iz);
		this.writeF32(value.iw);
		this.writeF32(value.jx);
		this.writeF32(value.jy);
		this.writeF32(value.jz);
		this.writeF32(value.jw);
		this.writeF32(value.kx);
		this.writeF32(value.ky);
		this.writeF32(value.kz);
		this.writeF32(value.kw);
		this.writeF32(value.tx);
		this.writeF32(value.ty);
		this.writeF32(value.tz);
		this.writeF32(value.tw);
		return this;
	}

	alloc(byteLength: number): DataView {
		this.ensureUnusedCapacity(byteLength);
		const dataView = new DataView(this._buffer, this._length, byteLength);
		this._length += byteLength;
		return dataView;
	}
}
