/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export * from "./_BinaryWriter";
export * from "./geometry";
export * from "./shader";

import { _BinaryWriter as BinaryWriter } from "./_BinaryWriter";
import { _Mapping as Mapping } from "./_Mapping";
import { Camera, Material, Matrix4x4, Node, Scene, Vector3, isDirectionalLight, isPointLight, preOrder } from "./data";
import { IndexBuffer, IndexBufferProps, Texture2D, Texture2DProps, VertexBuffer, VertexBufferProps } from "./resources";
import { GLOBAL_UNIFORMS_SIZE, MATERIAL_UNIFORMS_SIZE, OBJECT_UNIFORMS_SIZE, ShaderFlagKey, ShaderFlags, _createPipeline, _shaderFlagsKey } from "./shader";

const _matrixOStoWSNormal = new Matrix4x4(
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
);

const _matrixWStoVS = new Matrix4x4(
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
);

const _matrixVStoCS = new Matrix4x4(
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
	NaN, NaN, NaN, NaN,
);

const _directionWS = new Vector3(NaN, NaN, NaN);
const _positionWS = new Vector3(NaN, NaN, NaN);

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

	_lightWriter: BinaryWriter;
	_pointLightBuffer: GPUBuffer;
	_directionalLightBuffer: GPUBuffer;

	_sampler: GPUSampler;

	_globalBindGroup: GPUBindGroup;
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
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
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
						type: "read-only-storage",
					},
				},
				{
					binding: 2,
					visibility: GPUShaderStage.FRAGMENT,
					buffer: {
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

		this._lightWriter = new BinaryWriter();
		this._pointLightBuffer = device.createBuffer({
			size: 1024 * 32,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
		});
		this._directionalLightBuffer = device.createBuffer({
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

		this._globalBindGroup = device.createBindGroup({
			layout: this._globalBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: this._uniformBuffer, size: GLOBAL_UNIFORMS_SIZE } },
				{ binding: 1, resource: { buffer: this._pointLightBuffer } },
				{ binding: 2, resource: { buffer: this._directionalLightBuffer } },
			],
			label: "Global",
		});
		this._objectBindGroup = device.createBindGroup({
			layout: this._objectBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: this._uniformBuffer, size: OBJECT_UNIFORMS_SIZE } },
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
		const key = _shaderFlagsKey(flags);

		let pipeline = this._pipelineCache.get(key);
		if (pipeline !== undefined) {
			return pipeline;
		}

		pipeline = _createPipeline(this, flags);
		this._pipelineCache.set(key, pipeline);
		return pipeline;
	}

	render(scene: Scene, camera: Camera): Renderer {
		const cameraNode = camera._node;
		if (cameraNode === null) {
			throw new Error(`Cannot render with a detached camera. Camera [${camera._name}] is not attached to a node.`);
		}

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

		// gather materials

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
			this._uniformWriter.padToAlign(256);

			const bindGroup = this._device.createBindGroup({
				layout: this._materialBindGroupLayout,
				entries: [
					{ binding: 0, resource: { buffer: this._uniformBuffer, size: MATERIAL_UNIFORMS_SIZE } },
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

		// gather objects

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
			this._uniformWriter.writeMatrix4x4(_matrixOStoWSNormal.setObject(object._worldMatrix).inverseTransposeAffine());
			this._uniformWriter.padToAlign(256);
			return offset;
		});

		// gather point lights

		this._lightWriter.clear();
		let pointLightCount = 0;
		for (const node of preOrder(scene._nodes)) {
			const light = node._light;
			if (!isPointLight(light)) continue;

			node._updateWorldMatrix();
			_positionWS.set(node._worldMatrix.tx, node._worldMatrix.ty, node._worldMatrix.tz);

			this._lightWriter.writeVector3(_positionWS);
			this._lightWriter.writeU32(0);
			this._lightWriter.writeColorF32(light._color);
			this._lightWriter.writeU32(0);

			pointLightCount += 1;
		}

		this._device.queue.writeBuffer(this._pointLightBuffer, 0, this._lightWriter.subarray);

		// gather directional lights

		this._lightWriter.clear();
		let directionalLightCount = 0;
		for (const node of preOrder(scene._nodes)) {
			const light = node._light;
			if (!isDirectionalLight(light)) continue;

			node._updateWorldMatrix();
			_directionWS.set(-node._worldMatrix.kx, -node._worldMatrix.ky, -node._worldMatrix.kz);
			_directionWS.normalize();

			this._lightWriter.writeVector3(_directionWS);
			this._lightWriter.writeU32(0);
			this._lightWriter.writeColorF32(light._color);
			this._lightWriter.writeU32(0);

			directionalLightCount += 1;
		}

		this._device.queue.writeBuffer(this._directionalLightBuffer, 0, this._lightWriter.subarray);

		// global uniforms

		const globalUniformsOffset = this._uniformWriter._length;
		cameraNode._updateWorldMatrix();
		_matrixWStoVS.setObject(cameraNode._worldMatrix).inverseAffine();
		camera.computeProjectionMatrix(width / height, _matrixVStoCS);

		this._uniformWriter.writeMatrix4x4(_matrixWStoVS);
		this._uniformWriter.writeMatrix4x4(_matrixVStoCS);
		this._uniformWriter.writeColorF32(scene._ambientLight);
		this._uniformWriter.writeU32(pointLightCount);
		this._uniformWriter.writeU32(directionalLightCount);
		this._uniformWriter.padToAlign(256);

		// upload uniforms

		this._device.queue.writeBuffer(this._uniformBuffer, 0, this._uniformWriter.subarray);

		// render

		pass.setBindGroup(0, this._globalBindGroup, [globalUniformsOffset]);

		for (let oi = 0; oi < objectMapping.table.length; ++oi) {
			const object = objectMapping.table[oi]!;
			const objectOffset = objectOffsets[oi]!;
			const mesh = object.mesh!;
			const { _vertexBuffer: vertexBuffer, _indexBuffer: indexBuffer } = mesh;

			const flags: ShaderFlags = {
				texCoord: vertexBuffer._texCoordBuffer !== null,
				lightTexCoord: vertexBuffer._lightTexCoordBuffer !== null,
				normal: vertexBuffer._normalBuffer !== null,
				tangent: vertexBuffer._tangentBuffer !== null,
			};

			const renderPipeline = this._getOrCreatePipeline(flags);

			pass.setPipeline(renderPipeline);

			/* WORKAROUND
			 *
			 * As of writing, Chrome doesn't support passing null as the second
			 * argument. We could (and should) bind the buffers unconditionally
			 * for increased safety. For now, we only do this when they are not
			 * null.
			 */
			pass.setVertexBuffer(0, vertexBuffer._positionBuffer);
			if (vertexBuffer._texCoordBuffer !== null) pass.setVertexBuffer(1, vertexBuffer._texCoordBuffer);
			if (vertexBuffer._lightTexCoordBuffer !== null) pass.setVertexBuffer(2, vertexBuffer._lightTexCoordBuffer);
			if (vertexBuffer._normalBuffer !== null) pass.setVertexBuffer(3, vertexBuffer._normalBuffer);
			if (vertexBuffer._tangentBuffer !== null) pass.setVertexBuffer(4, vertexBuffer._tangentBuffer);
			pass.setIndexBuffer(indexBuffer._buffer, indexBuffer._indexFormat);

			pass.setBindGroup(2, this._objectBindGroup, [objectOffset]);

			for (let si = 0; si < mesh._submeshes.length; ++si) {
				const submesh = mesh._submeshes[si]!;
				const material = object._materials[si]!;
				const { bindGroup: materialBindGroup, offset: materialOffset } = materialBindGroups[materialMapping.get(material)!]!;

				pass.setBindGroup(1, materialBindGroup, [materialOffset]);
				pass.drawIndexed(submesh.length, 1, submesh.start, 0, 0);
			}
		}

		pass.end();

		const commandBuffer = encoder.finish();
		this._device.queue.submit([commandBuffer]);

		return this;
	}
}
