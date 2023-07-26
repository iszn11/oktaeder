/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Vector3Object } from "./Vector3";

export const VERTEX_SIZE = 12;

export class VertexBuffer {

	readonly type!: "VertexBuffer";

	_device: GPUDevice;
	_buffer: GPUBuffer;

	constructor(device: GPUDevice, vertexCount: number) {
		Object.defineProperty(this, "type", { value: "VertexBuffer" });

		this._device = device;
		this._buffer = device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * VERTEX_SIZE,
		});
	}

	dispose(): VertexBuffer {
		this._buffer.destroy();
		return this;
	}

	get vertexCount(): number {
		return this._buffer.size / VERTEX_SIZE | 0;
	}

	writeArray(offset: number, vertices: readonly Vector3Object[]): VertexBuffer {
		const array = new Float32Array(vertices.length * 3);
		for (let vi = 0, ptr = 0; vi < vertices.length; ++vi) {
			const vertex = vertices[vi]!;
			array[ptr++] = vertex.x;
			array[ptr++] = vertex.y;
			array[ptr++] = vertex.z;
		}
		this._device.queue.writeBuffer(this._buffer, offset * VERTEX_SIZE | 0, array);
		return this;
	}

	writeTypedArray(offset: number, vertices: Float32Array): VertexBuffer {
		this._device.queue.writeBuffer(this._buffer, offset * VERTEX_SIZE | 0, vertices);
		return this;
	}
}

export function isVertexBuffer(value: unknown): value is VertexBuffer {
	return Boolean(value) && (value as VertexBuffer).type === "VertexBuffer";
}
