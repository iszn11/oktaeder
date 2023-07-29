/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Renderer } from "../oktaeder";

export interface IndexBufferProps {
	readonly name?: string;

	readonly indexFormat: "uint16" | "uint32";
	readonly indexCount: number;
}

export interface IndexBufferResizeProps {
	readonly indexFormat?: "uint16" | "uint32";
	readonly indexCount?: number;
}

export class IndexBuffer {

	readonly type!: "IndexBuffer";
	_renderer: Renderer;

	_name: string;

	_buffer: GPUBuffer;
	_indexFormat: "uint16" | "uint32";

	constructor(renderer: Renderer, {
		name = "",
		indexFormat,
		indexCount,
	}: IndexBufferProps) {
		this._renderer = renderer;

		this._name = name;

		this._buffer = renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
			size: indexCount * indexSize(indexFormat),
			label: name,
		});
		this._indexFormat = indexFormat;
	}

	/**
	 * Destroys owned GPU resources. The index buffer should not be used after
	 * calling this method.
	 * @returns `this` for chaining
	 */
	dispose(): IndexBuffer {
		this._buffer.destroy();
		return this;
	}

	get indexCount(): number {
		return this._buffer.size / indexSize(this._indexFormat) | 0;
	}

	writeArray(offset: number, indices: readonly number[]): IndexBuffer {
		const array = this._indexFormat === "uint16" ? new Uint16Array(indices) : new Uint32Array(indices);
		return this.writeTypedArray(offset, array);
	}

	writeTypedArray(offset: number, indices: Uint16Array | Uint32Array): IndexBuffer {
		if (
			this._indexFormat === "uint16" && !(indices instanceof Uint16Array)
			|| this._indexFormat === "uint32" && !(indices instanceof Uint32Array)
		) {
			throw new Error(`Cannot write typed array to a mismatched index type. Typed array is of type ${indices.constructor.name}. Index buffer [${this._name}] uses format ${this._indexFormat}`);
		}
		this._renderer._device.queue.writeBuffer(this._buffer, offset * indexSize(this._indexFormat) | 0, indices);
		return this;
	}

	/**
	 * Resize the index buffer, discarding currently stored data.
	 * @param props Desired buffer properties. Any unspecified property will
	 * stay unchanged.
	 * @returns `this` for chaining
	 */
	resizeDiscard({
		indexFormat = this._indexFormat,
		indexCount = this.indexCount,
	}: IndexBufferResizeProps): IndexBuffer {
		this._buffer.destroy();

		this._buffer = this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
			size: indexCount * indexSize(indexFormat),
			label: this._name,
		});
		this._indexFormat = indexFormat;
		return this;
	}

	/**
	 * Resize the index buffer if it can't hold provided number of indices or
	 * its index format is smaller than provided, potentially discarding
	 * currently stored data.
	 * @param props Desired buffer properties. Any unspecified property will
	 * be ignored.
	 * @returns `this` for chaining
	 */
	ensureSizeDiscard({
		indexFormat = this._indexFormat,
		indexCount = this.indexCount,
	}): IndexBuffer {
		if (this.indexCount >= indexCount && indexSize(this._indexFormat) >= indexSize(indexFormat)) {
			return this;
		}
		return this.resizeDiscard({
			indexFormat,
			indexCount,
		});
	}
}

Object.defineProperty(IndexBuffer.prototype, "type", { value: "IndexBuffer" });

export function isIndexBuffer(value: unknown): value is IndexBuffer {
	return Boolean(value) && (value as IndexBuffer).type === "IndexBuffer";
}

function indexSize(indexFormat: "uint16" | "uint32"): number {
	switch (indexFormat) {
		case "uint16": return 2;
		case "uint32": return 4;
	}
}
