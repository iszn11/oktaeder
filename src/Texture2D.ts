/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface Texture2DProps {
	name?: string;
	device: GPUDevice;
	width: number;
	height: number;
}

export class Texture2D {

	readonly type!: "Texture2D";

	_name: string;

	_device: GPUDevice;
	_texture: GPUTexture;
	_textureView: GPUTextureView;

	constructor({
		name = "",
		device,
		width,
		height,
	}: Texture2DProps) {
		Object.defineProperty(this, "type", { value: "Texture2D" });

		this._name = name;

		this._device = device;
		this._texture = device.createTexture({
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			size: { width, height },
			format: "rgba8unorm",
		});
		this._textureView = this._texture.createView({
			format: "rgba8unorm",
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
		this._device.queue.writeTexture(
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
