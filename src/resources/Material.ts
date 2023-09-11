/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Texture2D } from ".";
import { Color, MaterialProps } from "../data";
import { Renderer, _BinaryWriter } from "../oktaeder";

export class Material {

	declare readonly type: "Material";
	_renderer: Renderer;

	_uniformBuffer: GPUBuffer;
	_bindGroup: GPUBindGroup;

	_name: string;

	readonly _baseColor: Color;
	readonly _partialCoverage: number;
	readonly _occlusionTextureStrength: number;
	readonly _metallic: number;
	readonly _roughness: number;
	readonly _normalScale: number;
	readonly _emissive: Color;
	readonly _transmission: Color;
	readonly _collimation: number;
	readonly _ior: number;

	readonly _baseColorPartialCoverageTexture: Texture2D | null;
	readonly _occlusionTexture: Texture2D | null;
	readonly _roughnessMetallicTexture: Texture2D | null;
	readonly _normalTexture: Texture2D | null;
	readonly _emissiveTexture: Texture2D | null;
	readonly _transmissionCollimationTexture: Texture2D | null;

	readonly _transparent: boolean;
	readonly _doubleSided: boolean;

	constructor(renderer: Renderer, {
		name = "",
		baseColor,
		partialCoverage = 1,
		occlusionTextureStrength = 1,
		metallic = 1,
		roughness = 1,
		normalScale = 1,
		emissive,
		transmission,
		collimation = 1,
		ior = 1.45,
		baseColorPartialCoverageTexture = null,
		occlusionTexture = null,
		roughnessMetallicTexture = null,
		normalTexture = null,
		emissiveTexture = null,
		transmissionCollimationTexture = null,
		transparent = false,
		doubleSided = false,
	}: MaterialProps) {
		this._renderer = renderer;

		this._name = name;

		this._baseColor = baseColor !== undefined ? Color.fromObject(baseColor) : Color.white();
		this._partialCoverage = partialCoverage;
		this._occlusionTextureStrength = occlusionTextureStrength;
		this._metallic = metallic;
		this._roughness = roughness;
		this._normalScale = normalScale;
		this._emissive = emissive !== undefined ? Color.fromObject(emissive) : Color.black();
		this._transmission = transmission !== undefined ? Color.fromObject(transmission) : Color.black();
		this._collimation = collimation;
		this._ior = ior;

		this._baseColorPartialCoverageTexture = baseColorPartialCoverageTexture;
		this._occlusionTexture = occlusionTexture;
		this._roughnessMetallicTexture = roughnessMetallicTexture;
		this._normalTexture = normalTexture;
		this._emissiveTexture = emissiveTexture;
		this._transmissionCollimationTexture = transmissionCollimationTexture;

		this._transparent = transparent;
		this._doubleSided = doubleSided;

		this._uniformBuffer = renderer._device.createBuffer({
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
			size: 64,
			label: name,
		});

		const writer = new _BinaryWriter(64);
		writer.writeColorF32(this._baseColor);
		writer.writeF32(this._partialCoverage);
		writer.writeColorF32(this._transmission);
		writer.writeF32(this._collimation);
		writer.writeF32(this._occlusionTextureStrength);
		writer.writeF32(this._roughness);
		writer.writeF32(this._metallic);
		writer.writeF32(this._normalScale);
		writer.writeColorF32(this._emissive);
		writer.writeF32(this._ior);

		renderer._device.queue.writeBuffer(this._uniformBuffer, 0, writer.subarray);

		this._bindGroup = renderer._device.createBindGroup({
			layout: renderer._materialBindGroupLayout,
			entries: [
				{ binding: 0, resource: { buffer: this._uniformBuffer, size: 64 } },
				{ binding: 1, resource: renderer._sampler },
				{ binding: 2, resource: this._baseColorPartialCoverageTexture?._textureView ?? renderer._textureWhite._textureView },
				{ binding: 3, resource: this._occlusionTexture?._textureView ?? renderer._textureWhite._textureView },
				{ binding: 4, resource: this._roughnessMetallicTexture?._textureView ?? renderer._textureWhite._textureView },
				{ binding: 5, resource: this._normalTexture?._textureView ?? renderer._textureNormal._textureView },
				{ binding: 6, resource: this._emissiveTexture?._textureView ?? renderer._textureWhite._textureView },
				{ binding: 7, resource: this._transmissionCollimationTexture?._textureView ?? renderer._textureBlack._textureView },
			],
			label: name,
		});
	}

	/**
	 * Destroys owned GPU resources. The index buffer should not be used after
	 * calling this method.
	 * @returns `this` for chaining
	 */
	dispose(): Material {
		this._uniformBuffer.destroy();
		return this;
	}

	getBaseColor(res: Color): Color {
		return res.setObject(this._baseColor);
	}

	get partialCoverage(): number { return this._partialCoverage; }
	get occlusionTextureStrength(): number { return this._occlusionTextureStrength; }
	get metallic(): number { return this._metallic; }
	get roughness(): number { return this._roughness; }
	get normalScale(): number { return this._normalScale; }

	getEmissive(res: Color): Color {
		return res.setObject(this._emissive);
	}

	getTransmission(res: Color): Color {
		return res.setObject(this._transmission);
	}

	get collimation(): number { return this._collimation; }
	get ior(): number { return this._ior; }
	get baseColorPartialCoverageTexture(): Texture2D | null { return this._baseColorPartialCoverageTexture; }
	get occlusionTexture(): Texture2D | null { return this._occlusionTexture; }
	get roughnessMetallicTexture(): Texture2D | null { return this._roughnessMetallicTexture; }
	get normalTexture(): Texture2D | null { return this._normalTexture; }
	get emissiveTexture(): Texture2D | null { return this._emissiveTexture; }
	get transmissionCollimationTexture(): Texture2D | null { return this._transmissionCollimationTexture; }

	get transparent(): boolean { return this._transparent; }
	get doubleSided(): boolean { return this._doubleSided; }
}

Object.defineProperty(Material.prototype, "type", { value: "Material" });

export function isMaterial(value: unknown): value is Material {
	return Boolean(value) && (value as Material).type === "Material";
}
