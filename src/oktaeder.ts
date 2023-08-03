/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export * from "./_BinaryWriter";
export * from "./shader";

import { _BinaryWriter as BinaryWriter } from "./_BinaryWriter";
import { _Mapping as Mapping } from "./_Mapping";
import { Camera, Material, Node, Scene, preOrder } from "./data";
import { IndexBuffer, IndexBufferProps, Texture2D, Texture2DProps, VertexBuffer, VertexBufferProps } from "./resources";
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
	_uniformBuffer: GPUBuffer;
	_directionalLightBuffer: GPUBuffer;
	_pointLightBuffer: GPUBuffer;

	_sampler: GPUSampler;

	_objectBindGroup: GPUBindGroup;

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
		this._uniformBuffer = device.createBuffer({
			size: 4 * 1024 * 1024,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			label: "Uniform",
		});
		this._directionalLightBuffer = device.createBuffer({
			size: 1024 * 32,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
		});
		this._pointLightBuffer = device.createBuffer({
			size: 1024 * 32,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
		});

		this._sampler = device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			addressModeW: "repeat",
			magFilter: "linear",
			minFilter: "linear",
			mipmapFilter: "linear",
			maxAnisotropy: 16,
		});

		this._objectBindGroup = device.createBindGroup({
			layout: this._objectBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: this._uniformBuffer } },
			],
			label: "Object",
		});
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
		this._uniformBuffer.destroy();
		this._directionalLightBuffer.destroy();
		this._pointLightBuffer.destroy();
		return this;
	}

	createIndexBuffer(props: IndexBufferProps): IndexBuffer {
		return new IndexBuffer(this, props);
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

		this._uniformWriter.clear();

		// material gather

		const materialMapping = new Mapping<Material>();
		for (const node of preOrder(scene._nodes)) {
			for (const material of node._materials) {
				materialMapping.add(material);
			}
		}

		const materialBindGroups = materialMapping.table.map((material) => {
			const offset = this._uniformWriter._length;
			this._uniformWriter.writeColorF32(material._baseColor);
			this._uniformWriter.writeF32(material._partialCoverage);
			this._uniformWriter.writeColorF32(material._transmission);
			this._uniformWriter.writeF32(material._collimation);
			this._uniformWriter.writeF32(material._occlusionTextureStrength);
			this._uniformWriter.writeF32(material._roughness);
			this._uniformWriter.writeF32(material._metallic);
			this._uniformWriter.writeF32(material._normalScale);
			this._uniformWriter.writeColorF32(material._emissive);
			this._uniformWriter.writeF32(material._ior);

			const bindGroup = this._device.createBindGroup({
				layout: this._materialBindGroupLayout,
				entries: [
					{ binding: 0, resource: { buffer: this._uniformBuffer } },
					{ binding: 1, resource: this._sampler },
					{ binding: 2, resource: material._baseColorPartialCoverageTexture?._textureView ?? this._textureWhite._textureView },
					{ binding: 3, resource: material._occlusionTexture?._textureView ?? this._textureWhite._textureView },
					{ binding: 4, resource: material._roughnessMetallicTexture?._textureView ?? this._textureWhite._textureView },
					{ binding: 5, resource: material._normalTexture?._textureView ?? this._textureNormal._textureView },
					{ binding: 6, resource: material._emissiveTexture?._textureView ?? this._textureWhite._textureView },
					{ binding: 7, resource: material._transmissionCollimationTexture?._textureView ?? this._textureBlack._textureView },
				],
				label: material._name,
			});
			return { offset, bindGroup };
		});

		// object gather

		const objectMapping = new Mapping<Node>();
		for (const node of preOrder(scene._nodes)) {
			if (node._mesh !== null) {
				objectMapping.add(node);
			}
		}

		const objectOffsets = objectMapping.table.map((object) => {
			const offset = this._uniformWriter._length;
			object._updateWorldMatrix();
			this._uniformWriter.writeMatrix4x4(object._worldMatrix);

			return offset;
		});

		void materialBindGroups;
		void objectOffsets;

		pass.end();

		const commandBuffer = encoder.finish();
		this._device.queue.submit([commandBuffer]);

		return this;
	}
}
