/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export const INDEX_SIZE = 2;

export class IndexBuffer {

	readonly type!: "IndexBuffer";

	_device: GPUDevice;
	_buffer: GPUBuffer;

	constructor(device: GPUDevice, indexCount: number) {
		Object.defineProperty(this, "type", { value: "IndexBuffer" });

		this._device = device;
		this._buffer = device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
			size: indexCount * INDEX_SIZE,
		});
	}

	dispose(): IndexBuffer {
		this._buffer.destroy();
		return this;
	}

	get vertexCount(): number {
		return this._buffer.size / INDEX_SIZE | 0;
	}

	writeArray(offset: number, indices: readonly number[]): IndexBuffer {
		const array = new Uint16Array(indices);
		this._device.queue.writeBuffer(this._buffer, offset * INDEX_SIZE | 0, array);
		return this;
	}

	writeTypedArray(offset: number, indices: Uint16Array): IndexBuffer {
		this._device.queue.writeBuffer(this._buffer, offset * INDEX_SIZE | 0, indices);
		return this;
	}
}

export function isIndexBuffer(value: unknown): value is IndexBuffer {
	return Boolean(value) && (value as IndexBuffer).type === "IndexBuffer";
}
