/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Texture2D } from ".";
import { Color, ColorObject } from "../data";
import { Renderer } from "../oktaeder";

export const UNIFORM_BUFFER_SIZE = 64;

export interface MaterialProps {
	name?: string;

	baseColor?: ColorObject;
	partialCoverage?: number;
	transmission?: ColorObject;
	collimation?: number;
	occlusionTextureStrength?: number;
	roughness?: number;
	metallic?: number;
	normalScale?: number;
	emissive?: ColorObject;
	ior?: number;

	baseColorPartialCoverageTexture?: Texture2D | null;
	occlusionTexture?: Texture2D | null;
	metallicRoughnessTexture?: Texture2D | null;
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
	_occlusionTexture: Texture2D | null;
	_metallicRoughnessTexture: Texture2D | null;
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
		occlusionTexture = null,
		metallicRoughnessTexture = null,
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
		this._metallicRoughnessTexture = metallicRoughnessTexture;
		this._normalTexture = normalTexture;
		this._emissiveTexture = emissiveTexture;
		this._transmissionCollimationTexture = transmissionCollimationTexture;

		this._transparent = transparent;
		this._doubleSided = doubleSided;
	}

	/**
	 * Destroys owned GPU resources. The material should not be used after
	 * calling this method.
	 * @returns `this` for chaining
	 */
	dispose(): Material {
		return this;
	}
}

Object.defineProperty(Material.prototype, "type", { value: "Material" });

export function isMaterial(value: unknown): value is Material {
	return Boolean(value) && (value as Material).type === "Material";
}
