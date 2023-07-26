/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Vector3Object } from "./Vector3";

/* Named colors
 * black       #000000   (0, 0, 0, 1)
 * silver      #C0C0C0   (192 / 255, 192 / 255, 192 / 255, 1)
 * gray        #808080   (128 / 255, 128 / 255, 128 / 255, 1)
 * white       #FFFFFF   (1, 1, 1, 1)
 * maroon      #800000   (128 / 255, 0, 0, 1)
 * red         #FF0000   (1, 0, 0, 1)
 * purple      #800080   (128 / 255, 0, 128 / 255, 1)
 * fuchsia     #FF00FF   (1, 0, 1, 1)
 * green       #008000   (0, 128 / 255, 0, 1)
 * lime        #00FF00   (0, 255, 0, 1)
 * olive       #808000   (128 / 255, 128 / 255, 0, 1)
 * yellow      #FFFF00   (1, 1, 0, 1)
 * navy        #000080   (0, 0, 128 / 255, 1)
 * blue        #0000FF   (0, 0, 1, 1)
 * teal        #008080   (0, 128 / 255, 128 / 255, 1)
 * aqua        #00FFFF   (0, 1, 1, 1)
 * orange      #FFA500   (1, 165 / 255, 0, 1)
 */

export type ColorName =
	| "black"
	| "silver"
	| "gray"
	| "white"
	| "maroon"
	| "red"
	| "purple"
	| "fuchsia"
	| "green"
	| "lime"
	| "olive"
	| "yellow"
	| "navy"
	| "blue"
	| "teal"
	| "aqua"
	| "orange"
	;

export interface ColorObject {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

export type ColorTuple = readonly [r: number, g: number, b: number];

export class Color {

	readonly type!: "Color";

	r: number;
	g: number;
	b: number;

	constructor(r: number, g: number, b: number) {
		Object.defineProperty(this, "type", { value: "Color" });

		this.r = r;
		this.g = g;
		this.b = b;
	}

	static fromObject(object: ColorObject): Color {
		return new Color(object.r, object.g, object.b);
	}

	static fromTuple(tuple: ColorTuple): Color {
		return new Color(...tuple);
	}

	static fromName(name: ColorName): Color {
		switch (name) {
			case "black": return new Color(0, 0, 0);
			case "silver": return new Color(192 / 255, 192 / 255, 192 / 255);
			case "gray": return new Color(128 / 255, 128 / 255, 128 / 255);
			case "white": return new Color(1, 1, 1);
			case "maroon": return new Color(128 / 255, 0, 0);
			case "red": return new Color(1, 0, 0);
			case "purple": return new Color(128 / 255, 0, 128 / 255);
			case "fuchsia": return new Color(1, 0, 1);
			case "green": return new Color(0, 128 / 255, 0);
			case "lime": return new Color(0, 255, 0);
			case "olive": return new Color(128 / 255, 128 / 255, 0);
			case "yellow": return new Color(1, 1, 0);
			case "navy": return new Color(0, 0, 128 / 255);
			case "blue": return new Color(0, 0, 1);
			case "teal": return new Color(0, 128 / 255, 128 / 255);
			case "aqua": return new Color(0, 1, 1);
			case "orange": return new Color(1, 165 / 255, 0);
		}
	}

	static fromVector3(vector: Vector3Object): Color {
		return new Color(vector.x, vector.y, vector.z);
	}

	static white(): Color {
		return new Color(1, 1, 1);
	}

	static black(): Color {
		return new Color(0, 0, 0);
	}

	set(r: number, g: number, b: number): Color {
		this.r = r;
		this.g = g;
		this.b = b;
		return this;
	}

	setObject(object: ColorObject): Color {
		this.r = object.r;
		this.g = object.g;
		this.b = object.b;
		return this;
	}

	setTuple(tuple: ColorTuple): Color {
		this.r = tuple[0];
		this.g = tuple[1];
		this.b = tuple[2];
		return this;
	}

	setName(name: ColorName): Color {
		switch (name) {
			case "black":
				this.r = 0;
				this.g = 0;
				this.b = 0;
				break;
			case "silver":
				this.r = 192 / 255;
				this.g = 192 / 255;
				this.b = 192 / 255;
				break;
			case "gray":
				this.r = 128 / 255;
				this.g = 128 / 255;
				this.b = 128 / 255;
				break;
			case "white":
				this.r = 1;
				this.g = 1;
				this.b = 1;
				break;
			case "maroon":
				this.r = 128 / 255;
				this.g = 0;
				this.b = 0;
				break;
			case "red":
				this.r = 1;
				this.g = 0;
				this.b = 0;
				break;
			case "purple":
				this.r = 128 / 255;
				this.g = 0;
				this.b = 128 / 255;
				break;
			case "fuchsia":
				this.r = 1;
				this.g = 0;
				this.b = 1;
				break;
			case "green":
				this.r = 0;
				this.g = 128 / 255;
				this.b = 0;
				break;
			case "lime":
				this.r = 0;
				this.g = 255;
				this.b = 0;
				break;
			case "olive":
				this.r = 128 / 255;
				this.g = 128 / 255;
				this.b = 0;
				break;
			case "yellow":
				this.r = 1;
				this.g = 1;
				this.b = 0;
				break;
			case "navy":
				this.r = 0;
				this.g = 0;
				this.b = 128 / 255;
				break;
			case "blue":
				this.r = 0;
				this.g = 0;
				this.b = 1;
				break;
			case "teal":
				this.r = 0;
				this.g = 128 / 255;
				this.b = 128 / 255;
				break;
			case "aqua":
				this.r = 0;
				this.g = 1;
				this.b = 1;
				break;
			case "orange":
				this.r = 1;
				this.g = 165 / 255;
				this.b = 0;
				break;
		}
		return this;
	}

	setVector3(vector: Vector3Object): Color {
		this.r = vector.x;
		this.g = vector.y;
		this.b = vector.z;
		return this;
	}

	setWhite(): Color {
		this.r = 1;
		this.g = 1;
		this.b = 1;
		return this;
	}

	setBlack(): Color {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		return this;
	}

	setR(r: number): Color {
		this.r = r;
		return this;
	}

	setG(g: number): Color {
		this.g = g;
		return this;
	}

	setB(b: number): Color {
		this.b = b;
		return this;
	}
}

export function isColor(value: unknown): value is Color {
	return Boolean(value) && (value as Color).type === "Color";
}
