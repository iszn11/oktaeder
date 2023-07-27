/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Renderer } from "./Renderer";

export interface Texture2DProps {
	name?: string;

	width: number;
	height: number;

	sRGB?: boolean;
}

export class Texture2D {

	readonly type!: "Texture2D";
	_renderer: Renderer;

	_name: string;

	_texture: GPUTexture;
	_textureView: GPUTextureView;

	constructor(renderer: Renderer, {
		name = "",
		width,
		height,
		sRGB = false,
	}: Texture2DProps) {
		Object.defineProperty(this, "type", { value: "Texture2D" });

		this._renderer = renderer;

		this._name = name;

		this._renderer = renderer;
		this._texture = renderer._device.createTexture({
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			size: { width, height },
			format: sRGB ? "rgba8unorm-srgb" : "rgba8unorm",
		});
		this._textureView = this._texture.createView({
			format: sRGB ? "rgba8unorm-srgb" : "rgba8unorm",
			dimension: "2d",
		});
	}

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

	writeTypedArray(data: Uint8Array): Texture2D {
		this._renderer._device.queue.writeTexture(
			{ texture: this._texture },
			data,
			{ bytesPerRow: 4 * this._texture.width },
			{ width: this._texture.width, height: this._texture.height },
		);
		return this;
	}
}

export function isTexture2D(value: unknown): value is Texture2D {
	return Boolean(value) && (value as Texture2D).type === "Texture2D";
}
