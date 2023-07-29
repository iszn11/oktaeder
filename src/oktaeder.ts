/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IndexBuffer, IndexBufferProps, Material, MaterialProps, Texture2D, Texture2DProps, VertexBuffer, VertexBufferProps } from "./resources";

export class Renderer {

	_adapter: GPUAdapter;
	_device: GPUDevice;
	_context: GPUCanvasContext;
	_format: GPUTextureFormat;

	/** 1×1 rgba8unorm texture of [255, 255, 255, 255] */
	_textureWhite: Texture2D;
	/** 1×1 rgba8unorm texture of [0, 0, 0, 255] */
	_textureBlack: Texture2D;
	/** 1×1 rgba8unorm texture of [128, 128, 128, 255] */
	_textureNormal: Texture2D;

	/**
	 * This constructor is intended primarily for internal use. Consider using
	 * `Renderer.createIndexBuffer` instead.
	 */
	private constructor (
		adapter: GPUAdapter,
		device: GPUDevice,
		context: GPUCanvasContext,
		format: GPUTextureFormat,
	) {
		this._adapter = adapter;
		this._device = device;
		this._context = context;
		this._format = format;

		this._textureWhite = new Texture2D(this, {
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureWhite.writeFull(new Uint8Array([255, 255, 255, 255]));

		this._textureBlack = new Texture2D(this, {
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureBlack.writeFull(new Uint8Array([0, 0, 0, 255]));

		this._textureNormal = new Texture2D(this, {
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureNormal.writeFull(new Uint8Array([128, 128, 128, 255]));
	}

	static async init(canvas: HTMLCanvasElement) {
		if (!navigator.gpu) {
			throw new Error("WebGPU is not supported");
		}

		const adapter = await navigator.gpu.requestAdapter({
			powerPreference: "high-performance",
		});
		if (adapter === null) {
			throw new Error("GPUAdapter is not available");
		}

		const device = await adapter.requestDevice();

		const context = canvas.getContext("webgpu");
		if (context === null) {
			throw new Error("GPUCanvasContext is not available");
		}

		const format = navigator.gpu.getPreferredCanvasFormat();
		context.configure({ device, format });
	}

	/**
	 * Disposes resources internal to the renderer. Doesn't dispose any objects
	 * created with this renderer. The renderer should not be used after calling
	 * this method.
	 * @returns `this` for chaining
	 */
	dispose(): Renderer {
		this._textureWhite.dispose();
		this._textureBlack.dispose();
		this._textureNormal.dispose();
		return this;
	}

	createIndexBuffer(props: IndexBufferProps): IndexBuffer {
		return new IndexBuffer(this, props);
	}

	createMaterial(props: MaterialProps): Material {
		return new Material(this, props);
	}

	createTexture(props: Texture2DProps): Texture2D {
		return new Texture2D(this, props);
	}

	createVertexBuffer(props: VertexBufferProps): VertexBuffer {
		return new VertexBuffer(this, props);
	}
}
