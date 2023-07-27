/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Color, ColorObject } from "./Color";
import { Renderer } from "./Renderer";
import { Texture2D } from "./Texture2D";

export const UNIFORM_BUFFER_SIZE = 64;

export interface MaterialProps {
	name?: string;

	baseColor?: ColorObject;
	partialCoverage?: number;
	occlusionTextureStrength?: number;
	metallic?: number;
	roughness?: number;
	normalScale?: number;
	emissive?: ColorObject;
	transmission?: ColorObject;
	collimation?: number;
	ior?: number;

	baseColorPartialCoverageTexture?: Texture2D | null;
	occlusionMetallicRoughnessTexture?: Texture2D | null;
	normalTexture?: Texture2D | null;
	emissiveTexture?: Texture2D | null;
	transmissionCollimationTexture?: Texture2D | null;

	transparent?: boolean;
	doubleSided?: boolean;
}

export class Material {

	readonly type!: "Material";
	_renderer: Renderer;

	_name: string;

	_baseColor: Color;
	_partialCoverage: number;
	_occlusionTextureStrength: number;
	_metallic: number;
	_roughness: number;
	_normalScale: number;
	_emissive: Color;
	_transmission: Color;
	_collimation: number;
	_ior: number;

	_baseColorPartialCoverageTexture: Texture2D | null;
	_occlusionMetallicRoughnessTexture: Texture2D | null;
	_normalTexture: Texture2D | null;
	_emissiveTexture: Texture2D | null;
	_transmissionCollimationTexture: Texture2D | null;

	_transparent: boolean;
	_doubleSided: boolean;

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
		occlusionMetallicRoughnessTexture = null,
		normalTexture = null,
		emissiveTexture = null,
		transmissionCollimationTexture = null,
		transparent = false,
		doubleSided = false,
	}: MaterialProps) {
		Object.defineProperty(this, "type", { value: "Material" });

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
		this._occlusionMetallicRoughnessTexture = occlusionMetallicRoughnessTexture;
		this._normalTexture = normalTexture;
		this._emissiveTexture = emissiveTexture;
		this._transmissionCollimationTexture = transmissionCollimationTexture;

		this._transparent = transparent;
		this._doubleSided = doubleSided;
	}

	dispose(): Material {
		return this;
	}
}

export function isMaterial(value: unknown): value is Material {
	return Boolean(value) && (value as Material).type === "Material";
}
