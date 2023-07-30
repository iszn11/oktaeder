/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Vector2Object, Vector2Tuple } from "../data";
import { Renderer } from "../oktaeder";

export type Texture2DFormat =
	| "linear"
	| "srgb"
	| "hdr"
	| "depth"
	;

export interface Texture2DProps {
	readonly name?: string;

	readonly width: number;
	readonly height: number;

	readonly format: Texture2DFormat;
}

export interface Texture2DResizeProps {
	readonly width?: number;
	readonly height?: number;
	readonly format?: Texture2DFormat;
}

export interface Texture2DAdvancedWriteProps {
	readonly origin: Vector2Object | Vector2Tuple,
	readonly data: BufferSource | SharedArrayBuffer,
	readonly bytesPerRow: number,
	readonly width: number,
	readonly height: number,
}

export class Texture2D {

	readonly type!: "Texture2D";
	_renderer: Renderer;

	_name: string;

	_texture: GPUTexture;
	_textureView: GPUTextureView;
	_format: Texture2DFormat;

	constructor(renderer: Renderer, {
		name = "",
		width,
		height,
		format,
	}: Texture2DProps) {
		this._renderer = renderer;

		this._name = name;

		const gpuFormat = gpuTextureFormat(format);

		this._renderer = renderer;
		this._texture = renderer._device.createTexture({
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			size: { width, height },
			format: gpuFormat,
			label: name
		});
		this._textureView = this._texture.createView({
			format: gpuFormat,
			dimension: "2d",
			label: `${name}.textureView`,
		});
		this._format = format;
	}

	/**
	 * Destroys owned GPU resources. The texture should not be used after
	 * calling this method.
	 * @returns `this` for chaining
	 */
	dispose(): Texture2D {
		this._texture.destroy();
		return this;
	}

	get width(): number {
		return this._texture.width;
	}

	get height(): number {
		return this._texture.height;
	}

	get bytesPerSample(): number {
		return sampleSize(this._format);
	}

	get samplesPerPixel(): number {
		return sampleCount(this._format);
	}

	writeFull(data: BufferSource | SharedArrayBuffer): Texture2D {
		const bytesPerSample = this.bytesPerSample;
		const samplesPerPixel = this.samplesPerPixel;
		const bytesPerRow = this.width * samplesPerPixel * bytesPerSample;
		const byteLength = this.height * bytesPerRow;

		if (data.byteLength !== byteLength) {
			throw new Error(`Cannot fully write to a texture with different byte length. Source data has byte length of ${data.byteLength}. Texture [${this._name}] is ${this.width}×${this.height} pixels in size, uses ${this._format} format at ${bytesPerSample} ${bytesPerSample === 1 ? "byte" : "bytes"} per sample and ${samplesPerPixel} ${samplesPerPixel === 1 ? "sample" : "samples"} per pixel, which makes its byte length equal to ${byteLength}.`);
		}

		this._renderer._device.queue.writeTexture(
			{ texture: this._texture },
			data,
			{ bytesPerRow },
			{ width: this.width, height: this.height },
		);
		return this;
	}

	writePartial({
		origin,
		data,
		bytesPerRow,
		width,
		height,
	}: Texture2DAdvancedWriteProps): Texture2D {
		this._renderer._device.queue.writeTexture(
			{ texture: this._texture, origin },
			data,
			{ bytesPerRow },
			{ width, height },
		);
		return this;
	}

	/**
	 * Resize the texture and/or change its format, discarding currently stored
	 * data.
	 * @param props Desired texture properties. Any unspecified property will
	 * stay unchanged.
	 * @returns `this` for chaining
	 */
	resizeDiscard({
		width = this._texture.width,
		height = this._texture.height,
		format = this._format,
	}: Texture2DResizeProps): Texture2D {
		this._texture.destroy();

		const gpuFormat = gpuTextureFormat(format);

		this._texture = this._renderer._device.createTexture({
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			size: { width, height },
			format: gpuFormat,
			label: this._name
		});
		this._textureView = this._texture.createView({
			format: gpuFormat,
			dimension: "2d",
			label: `${this._name}.textureView`,
		});
		return this;
	}
}

Object.defineProperty(Texture2D.prototype, "type", { value: "Texture2D" });

export function isTexture2D(value: unknown): value is Texture2D {
	return Boolean(value) && (value as Texture2D).type === "Texture2D";
}

function gpuTextureFormat(format: Texture2DFormat): GPUTextureFormat {
	switch (format) {
		case "linear": return "rgba8unorm";
		case "srgb": return "rgba8unorm-srgb";
		case "hdr": return "rgba16float";
		case "depth": return "depth32float";
	}
}

function sampleCount(format: Texture2DFormat): number {
	switch (format) {
		case "linear": return 4;
		case "srgb": return 4;
		case "hdr": return 4;
		case "depth": return 1;
	}
}

function sampleSize(format: Texture2DFormat): number {
	switch (format) {
		case "linear": return 1;
		case "srgb": return 1;
		case "hdr": return 2;
		case "depth": return 4;
	}
}
