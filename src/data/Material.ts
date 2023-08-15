/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Color, ColorObject } from ".";
import { Texture2D } from "../resources";

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
	roughnessMetallicTexture?: Texture2D | null;
	normalTexture?: Texture2D | null;
	emissiveTexture?: Texture2D | null;
	transmissionCollimationTexture?: Texture2D | null;

	transparent?: boolean;
	doubleSided?: boolean;
}

export class Material {

	declare readonly type: "Material";

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
	_roughnessMetallicTexture: Texture2D | null;
	_normalTexture: Texture2D | null;
	_emissiveTexture: Texture2D | null;
	_transmissionCollimationTexture: Texture2D | null;

	_transparent: boolean;
	_doubleSided: boolean;

	constructor({
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
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	setBaseColor(value: ColorObject): Material {
		this._baseColor.setObject(value);
		return this;
	}
	getBaseColor(res: Color): Color {
		return res.setObject(this._baseColor);
	}

	set partialCoverage(value: number) { this._partialCoverage = value; }
	get partialCoverage(): number { return this._partialCoverage; }

	set occlusionTextureStrength(value: number) { this._occlusionTextureStrength = value; }
	get occlusionTextureStrength(): number { return this._occlusionTextureStrength; }

	set metallic(value: number) { this._metallic = value; }
	get metallic(): number { return this._metallic; }

	set roughness(value: number) { this._roughness = value; }
	get roughness(): number { return this._roughness; }

	set normalScale(value: number) { this._normalScale = value; }
	get normalScale(): number { return this._normalScale; }

	setEmissive(value: ColorObject): Material {
		this._emissive.setObject(value);
		return this;
	}
	getEmissive(res: Color): Color {
		return res.setObject(this._emissive);
	}

	setTransmission(value: ColorObject): Material {
		this._transmission.setObject(value);
		return this;
	}
	getTransmission(res: Color): Color {
		return res.setObject(this._transmission);
	}

	set collimation(value: number) { this._collimation = value; }
	get collimation(): number { return this._collimation; }

	set ior(value: number) { this._ior = value; }
	get ior(): number { return this._ior; }

	set baseColorPartialCoverageTexture(value: Texture2D | null) { this._baseColorPartialCoverageTexture = value;}
	get baseColorPartialCoverageTexture(): Texture2D | null { return this._baseColorPartialCoverageTexture; }

	set occlusionTexture(value: Texture2D | null) { this._occlusionTexture = value;}
	get occlusionTexture(): Texture2D | null { return this._occlusionTexture; }

	set roughnessMetallicTexture(value: Texture2D | null) { this._roughnessMetallicTexture = value;}
	get roughnessMetallicTexture(): Texture2D | null { return this._roughnessMetallicTexture; }

	set normalTexture(value: Texture2D | null) { this._normalTexture = value;}
	get normalTexture(): Texture2D | null { return this._normalTexture; }

	set emissiveTexture(value: Texture2D | null) { this._emissiveTexture = value;}
	get emissiveTexture(): Texture2D | null { return this._emissiveTexture; }

	set transmissionCollimationTexture(value: Texture2D | null) { this._transmissionCollimationTexture = value;}
	get transmissionCollimationTexture(): Texture2D | null { return this._transmissionCollimationTexture; }

	set transparent(value: boolean) { this._transparent = value; }
	get transparent(): boolean { return this._transparent; }

	set doubleSided(value: boolean) { this._doubleSided = value; }
	get doubleSided(): boolean { return this._doubleSided; }
}

Object.defineProperty(Material.prototype, "type", { value: "Material" });

export function isMaterial(value: unknown): value is Material {
	return Boolean(value) && (value as Material).type === "Material";
}
