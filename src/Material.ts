/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Color, ColorObject } from "./Color";

export interface MaterialProps {
	name?: string;

	baseColor?: ColorObject;
	metallic?: number;
	roughness?: number;
	emissive?: ColorObject;
	partialCoverage?: number;
	transmission?: ColorObject;
	collimation?: number;
	ior?: number;

	doubleSided?: boolean;
}

export class Material {

	readonly type!: "Material";

	_name: string;

	_baseColor: Color;
	_metallic: number;
	_roughness: number;
	_emissive: Color;
	_partialCoverage: number;
	_transmission: Color;
	_collimation: number;
	_ior: number;

	_doubleSided: boolean;

	constructor({
		name = "",
		baseColor,
		metallic = 1,
		roughness = 1,
		emissive,
		partialCoverage = 1,
		transmission,
		collimation = 1,
		ior = 1.45,
		doubleSided = false,
	}: MaterialProps) {
		Object.defineProperty(this, "type", { value: "Material" });

		this._name = name;

		this._baseColor = baseColor !== undefined ? Color.fromObject(baseColor) : Color.white();
		this._metallic = metallic;
		this._roughness = roughness;
		this._emissive = emissive !== undefined ? Color.fromObject(emissive) : Color.black();
		this._partialCoverage = partialCoverage;
		this._transmission = transmission !== undefined ? Color.fromObject(transmission) : Color.black();
		this._collimation = collimation;
		this._ior = ior;

		this._doubleSided = doubleSided;
	}

	get isTransparent(): boolean {
		return this._partialCoverage < 1 || this._transmission.r > 0 || this._transmission.g > 0 || this._transmission.b > 0;
	}
}

export function isMaterial(value: unknown): value is Material {
	return Boolean(value) && (value as Material).type === "Material";
}
