/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Vector2Object, Vector3Object, Vector4Object } from "../data";
import { Renderer } from "../oktaeder";

export const POSITION_SIZE = 12;
export const TEX_COORD_SIZE = 8;
export const LIGHT_TEX_COORD_SIZE = 8;
export const NORMAL_SIZE = 12;
export const TANGENT_SIZE = 16;

export interface VertexBufferProps {
	readonly name?: string;

	readonly vertexCount: number;

	readonly texCoord?: boolean;
	readonly lightTexCoord?: boolean;
	readonly normal?: boolean;
	readonly tangent?: boolean;
}

export interface VertexBufferResizeProps {
	readonly vertexCount?: number;

	readonly texCoord?: boolean;
	readonly lightTexCoord?: boolean;
	readonly normal?: boolean;
	readonly tangent?: boolean;
}

export interface VertexBufferWriteArrayProps {
	readonly position?: readonly Vector3Object[];
	readonly texCoord?: readonly Vector2Object[];
	readonly lightTexCoord?: readonly Vector2Object[];
	readonly normal?: readonly Vector3Object[];
	readonly tangent?: readonly Vector4Object[];
}

export interface VertexBufferWriteTypedArrayProps {
	readonly position?: Float32Array;
	readonly texCoord?: Float32Array;
	readonly lightTexCoord?: Float32Array;
	readonly normal?: Float32Array;
	readonly tangent?: Float32Array;
}

export class VertexBuffer {

	declare readonly type: "VertexBuffer";
	_renderer: Renderer;

	_name: string;

	_positionBuffer: GPUBuffer;
	_texCoordBuffer: GPUBuffer | null;
	_lightTexCoordBuffer: GPUBuffer | null;
	_normalBuffer: GPUBuffer | null;
	_tangentBuffer: GPUBuffer | null;

	constructor(renderer: Renderer, {
		name = "",
		vertexCount,
		texCoord = false,
		lightTexCoord = false,
		normal = false,
		tangent = false,
	}: VertexBufferProps) {
		this._renderer = renderer;

		this._name = name;

		this._positionBuffer = renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * POSITION_SIZE,
			label: `${this._name}.position`,
		});

		this._texCoordBuffer = texCoord ? renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * TEX_COORD_SIZE,
			label: `${this._name}.texCoord`,
		}) : null;

		this._lightTexCoordBuffer = lightTexCoord ? renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * LIGHT_TEX_COORD_SIZE,
			label: `${this._name}.lightTexCoord`,
		}) : null;

		this._normalBuffer = normal ? renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * NORMAL_SIZE,
			label: `${this._name}.normal`,
		}) : null;

		this._tangentBuffer = tangent ? renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * TANGENT_SIZE,
			label: `${this._name}.tangent`,
		}) : null;
	}

	/**
	 * Destroys owned GPU resources. The vertex buffer should not be used after
	 * calling this method.
	 * @returns `this` for chaining
	 */
	dispose(): VertexBuffer {
		this._positionBuffer.destroy();
		this._texCoordBuffer?.destroy();
		this._lightTexCoordBuffer?.destroy();
		this._normalBuffer?.destroy();
		this._tangentBuffer?.destroy();
		return this;
	}

	get vertexCount(): number {
		return this._positionBuffer.size / POSITION_SIZE | 0;
	}

	get hasTexCoord(): boolean {
		return this._texCoordBuffer !== null;
	}

	get hasLightTexCoord(): boolean {
		return this._lightTexCoordBuffer !== null;
	}

	get hasNormal(): boolean {
		return this._normalBuffer !== null;
	}

	get hasTangent(): boolean {
		return this._tangentBuffer !== null;
	}

	writeArray(offset: number, {
		position,
		texCoord,
		lightTexCoord,
		normal,
		tangent,
	}: VertexBufferWriteArrayProps): VertexBuffer {

		if (position !== undefined) {
			const array = new Float32Array(position.length * 3);
			for (let vi = 0, ptr = 0; vi < position.length; ++vi) {
				const vertex = position[vi]!;
				array[ptr++] = vertex.x;
				array[ptr++] = vertex.y;
				array[ptr++] = vertex.z;
			}
			this._renderer._device.queue.writeBuffer(this._positionBuffer, offset * POSITION_SIZE | 0, array);
		}

		if (texCoord !== undefined) {
			if (this._texCoordBuffer === null) {
				throw new Error(`Cannot write array to a missing vertex attribute. Tried writing texture coordinates and vertex buffer [${this._name}] does not have texture coordinates.`);
			}
			const array = new Float32Array(texCoord.length * 2);
			for (let vi = 0, ptr = 0; vi < texCoord.length; ++vi) {
				const vertex = texCoord[vi]!;
				array[ptr++] = vertex.x;
				array[ptr++] = vertex.y;
			}
			this._renderer._device.queue.writeBuffer(this._texCoordBuffer, offset * TEX_COORD_SIZE | 0, array);
		}

		if (lightTexCoord !== undefined) {
			if (this._lightTexCoordBuffer === null) {
				throw new Error(`Cannot write array to a missing vertex attribute. Tried writing light texture coordinates and vertex buffer [${this._name}] does not have light texture coordinates.`);
			}
			const array = new Float32Array(lightTexCoord.length * 2);
			for (let vi = 0, ptr = 0; vi < lightTexCoord.length; ++vi) {
				const vertex = lightTexCoord[vi]!;
				array[ptr++] = vertex.x;
				array[ptr++] = vertex.y;
			}
			this._renderer._device.queue.writeBuffer(this._lightTexCoordBuffer, offset * LIGHT_TEX_COORD_SIZE | 0, array);
		}

		if (normal !== undefined) {
			if (this._normalBuffer === null) {
				throw new Error(`Cannot write array to a missing vertex attribute. Tried writing normals and vertex buffer [${this._name}] does not have normals.`);
			}
			const array = new Float32Array(normal.length * 3);
			for (let vi = 0, ptr = 0; vi < normal.length; ++vi) {
				const vertex = normal[vi]!;
				array[ptr++] = vertex.x;
				array[ptr++] = vertex.y;
				array[ptr++] = vertex.z;
			}
			this._renderer._device.queue.writeBuffer(this._normalBuffer, offset * NORMAL_SIZE | 0, array);
		}

		if (tangent !== undefined) {
			if (this._tangentBuffer === null) {
				throw new Error(`Cannot write array to a missing vertex attribute. Tried writing tangents and vertex buffer [${this._name}] does not have tangents.`);
			}
			const array = new Float32Array(tangent.length * 4);
			for (let vi = 0, ptr = 0; vi < tangent.length; ++vi) {
				const vertex = tangent[vi]!;
				array[ptr++] = vertex.x;
				array[ptr++] = vertex.y;
				array[ptr++] = vertex.z;
				array[ptr++] = vertex.w;
			}
			this._renderer._device.queue.writeBuffer(this._tangentBuffer, offset * TANGENT_SIZE | 0, array);
		}

		return this;
	}

	writeTypedArray(offset: number, {
		position,
		texCoord,
		lightTexCoord,
		normal,
		tangent,
	}: VertexBufferWriteTypedArrayProps): VertexBuffer {

		if (position !== undefined) {
			this._renderer._device.queue.writeBuffer(this._positionBuffer, offset * POSITION_SIZE | 0, position);
		}

		if (texCoord !== undefined) {
			if (this._texCoordBuffer === null) {
				throw new Error(`Cannot write typed array to a missing vertex attribute. Tried writing texture coordinates and vertex buffer [${this._name}] does not have texture coordinates.`);
			}
			this._renderer._device.queue.writeBuffer(this._texCoordBuffer, offset * TEX_COORD_SIZE | 0, texCoord);
		}

		if (lightTexCoord !== undefined) {
			if (this._lightTexCoordBuffer === null) {
				throw new Error(`Cannot write typed array to a missing vertex attribute. Tried writing light texture coordinates and vertex buffer [${this._name}] does not have light texture coordinates.`);
			}
			this._renderer._device.queue.writeBuffer(this._lightTexCoordBuffer, offset * LIGHT_TEX_COORD_SIZE | 0, lightTexCoord);
		}

		if (normal !== undefined) {
			if (this._normalBuffer === null) {
				throw new Error(`Cannot write typed array to a missing vertex attribute. Tried writing normals and vertex buffer [${this._name}] does not have normals.`);
			}
			this._renderer._device.queue.writeBuffer(this._normalBuffer, offset * NORMAL_SIZE | 0, normal);
		}

		if (tangent !== undefined) {
			if (this._tangentBuffer === null) {
				throw new Error(`Cannot write typed array to a missing vertex attribute. Tried writing tangents and vertex buffer [${this._name}] does not have tangents.`);
			}
			this._renderer._device.queue.writeBuffer(this._tangentBuffer, offset * TANGENT_SIZE | 0, tangent);
		}

		return this;
	}

	/**
	 * Resize the vertex buffer and/or add or remove vertex attributes,
	 * discarding currently stored data.
	 * @param props Desired buffer properties. Any unspecified property will
	 * stay unchanged.
	 * @returns `this` for chaining
	 */
	resizeDiscard({
		vertexCount = this.vertexCount,
		texCoord = this.hasTexCoord,
		lightTexCoord = this.hasLightTexCoord,
		normal = this.hasNormal,
		tangent = this.hasTangent,
	}: VertexBufferResizeProps): VertexBuffer {

		this._positionBuffer.destroy();
		this._texCoordBuffer?.destroy();
		this._lightTexCoordBuffer?.destroy();
		this._normalBuffer?.destroy();
		this._tangentBuffer?.destroy();

		this._positionBuffer = this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * POSITION_SIZE,
			label: `${this._name}.position`,
		});

		this._texCoordBuffer = texCoord ? this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * TEX_COORD_SIZE,
			label: `${this._name}.texCoord`,
		}) : null;

		this._lightTexCoordBuffer = lightTexCoord ? this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * LIGHT_TEX_COORD_SIZE,
			label: `${this._name}.lightTexCoord`,
		}) : null;

		this._normalBuffer = normal ? this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * NORMAL_SIZE,
			label: `${this._name}.normal`,
		}) : null;

		this._tangentBuffer = tangent ? this._renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
			size: vertexCount * TANGENT_SIZE,
			label: `${this._name}.tangent`,
		}) : null;

		return this;
	}

	/**
	 * Resize the vertex buffer and/or add vertex attributes if it can't hold
	 * provided number of vertices or doesn't have provided attributes,
	 * potentially discarding currently stored data.
	 * @param props Desired buffer properties. Any unspecified property will be
	 * ignored.
	 * @returns `this` for chaining
	 */
	ensureSizeDiscard({
		vertexCount = this.vertexCount,
		texCoord = this.hasTexCoord,
		lightTexCoord = this.hasLightTexCoord,
		normal = this.hasNormal,
		tangent = this.hasTangent,
	}): VertexBuffer {
		const currentVertexCount = this.vertexCount;

		if (currentVertexCount < vertexCount) {
			this._positionBuffer.destroy();
			this._positionBuffer = this._renderer._device.createBuffer({
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
				size: vertexCount * POSITION_SIZE,
				label: `${this._name}.position`,
			});
		}

		if (currentVertexCount < vertexCount || texCoord && !this.hasTexCoord) {
			this._texCoordBuffer?.destroy();
			this._texCoordBuffer = this._renderer._device.createBuffer({
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
				size: vertexCount * TEX_COORD_SIZE,
				label: `${this._name}.texCoord`,
			});
		}

		if (currentVertexCount < vertexCount || lightTexCoord && !this.hasLightTexCoord) {
			this._lightTexCoordBuffer?.destroy();
			this._lightTexCoordBuffer = this._renderer._device.createBuffer({
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
				size: vertexCount * LIGHT_TEX_COORD_SIZE,
				label: `${this._name}.lightTexCoord`,
			});
		}

		if (currentVertexCount < vertexCount || normal && !this.hasNormal) {
			this._normalBuffer?.destroy();
			this._normalBuffer = this._renderer._device.createBuffer({
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
				size: vertexCount * NORMAL_SIZE,
				label: `${this._name}.normal`,
			});
		}

		if (currentVertexCount < vertexCount || tangent && !this.hasTangent) {
			this._tangentBuffer?.destroy();
			this._tangentBuffer = this._renderer._device.createBuffer({
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
				size: vertexCount * TANGENT_SIZE,
				label: `${this._name}.tangent`,
			});
		}

		return this;
	}
}

Object.defineProperty(VertexBuffer.prototype, "type", { value: "VertexBuffer" });

export function isVertexBuffer(value: unknown): value is VertexBuffer {
	return Boolean(value) && (value as VertexBuffer).type === "VertexBuffer";
}
