/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export * from "./_BinaryWriter";
export * from "./shader";

import { _BinaryWriter as BinaryWriter } from "./_BinaryWriter";
import { Camera, Scene } from "./data";
import { IndexBuffer, IndexBufferProps, Material, MaterialProps, Texture2D, Texture2DProps, VertexBuffer, VertexBufferProps } from "./resources";
import { ShaderFlagKey, ShaderFlags, createPipeline, shaderFlagsKey } from "./shader";

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

	_depthBuffer: Texture2D;

	_globalBindGroupLayout: GPUBindGroupLayout;
	_materialBindGroupLayout: GPUBindGroupLayout;
	_objectBindGroupLayout: GPUBindGroupLayout;
	_pipelineLayout: GPUPipelineLayout;

	_pipelineCache: Map<ShaderFlagKey, GPURenderPipeline>;

	_uniformWriter: BinaryWriter;

	/**
	 * This constructor is intended primarily for internal use. Consider using
	 * `Renderer.createIndexBuffer` instead.
	 */
	private constructor(
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
			name: "White",
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureWhite.writeFull(new Uint8Array([255, 255, 255, 255]));

		this._textureBlack = new Texture2D(this, {
			name: "Black",
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureBlack.writeFull(new Uint8Array([0, 0, 0, 255]));

		this._textureNormal = new Texture2D(this, {
			name: "Normal",
			width: 1,
			height: 1,
			format: "linear",
		});
		this._textureNormal.writeFull(new Uint8Array([128, 128, 128, 255]));

		const framebufferTexture = this._context.getCurrentTexture();
		this._depthBuffer = new Texture2D(this, {
			name: "Depth Buffer",
			width: framebufferTexture.width,
			height: framebufferTexture.height,
			format: "depth",
		});

		this._globalBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						hasDynamicOffset: true,
						type: "uniform",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						hasDynamicOffset: true,
						type: "read-only-storage",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						hasDynamicOffset: true,
						type: "read-only-storage",
					},
				},
			],
			label: "Global",
		});
		this._materialBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
						hasDynamicOffset: true,
						type: "uniform",
					},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: { type: "filtering" },
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
				{
					binding: 3,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
				{
					binding: 4,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
				{
					binding: 5,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
				{
					binding: 6,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
				{
					binding: 7,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {
						sampleType: "float",
						viewDimension: "2d",
					},
				},
			],
			label: "Material",
		});
		this._objectBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {
						hasDynamicOffset: true,
						type: "uniform",
					},
				},
			],
			label: "Object",
		});

		this._pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [
				this._globalBindGroupLayout,
				this._materialBindGroupLayout,
				this._objectBindGroupLayout,
			],
		});

		this._pipelineCache = new Map();

		this._uniformWriter = new BinaryWriter();
	}

	static async init(canvas: HTMLCanvasElement): Promise<Renderer> {
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

		return new Renderer(adapter, device, context, format);
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
		this._depthBuffer.dispose();
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

	_getOrCreatePipeline(flags: ShaderFlags): GPURenderPipeline {
		const key = shaderFlagsKey(flags);

		let pipeline = this._pipelineCache.get(key);
		if (pipeline !== undefined) {
			return pipeline;
		}

		pipeline = createPipeline(this, flags);
		this._pipelineCache.set(key, pipeline);
		return pipeline;
	}

	render(scene: Scene, camera: Camera): Renderer {
		const { width, height } = this._context.getCurrentTexture();
		if (this._depthBuffer.width !== width || this._depthBuffer.height !== height) {
			this._depthBuffer.resizeDiscard({
				width,
				height,
			});
		}

		const encoder = this._device.createCommandEncoder();

		const pass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this._context.getCurrentTexture().createView(),
				loadOp: "clear",
				storeOp: "store",
			}],
			depthStencilAttachment: {
				view: this._depthBuffer._textureView,
				depthClearValue: 0,
				depthLoadOp: "clear",
				depthStoreOp: "store",
			},
		});

		void scene;
		void camera;

		pass.end();

		const commandBuffer = encoder.finish();
		this._device.queue.submit([commandBuffer]);

		return this;
	}
}
