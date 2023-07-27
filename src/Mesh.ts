/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IndexBuffer } from "./IndexBuffer";
import { VertexBuffer } from "./VertexBuffer";

export type Submesh = {
	start: number,
	length: number,
};

export interface MeshProps {
	readonly name?: string;

	readonly vertexBuffer: VertexBuffer;
	readonly indexBuffer: IndexBuffer;
	readonly submeshes: Submesh[];
}

export class Mesh {

	readonly type!: "Mesh"

	_name: string;

	_vertexBuffer: VertexBuffer;
	_indexBuffer: IndexBuffer;
	_submeshes: Submesh[];

	constructor({
		name = "",
		vertexBuffer,
		indexBuffer,
		submeshes,
	}: MeshProps) {
		Object.defineProperty(this, "type", { value: "Mesh" });

		this._name = name;

		this._vertexBuffer = vertexBuffer;
		this._indexBuffer = indexBuffer
		this._submeshes = submeshes;
	}

	get submeshCount(): number {
		return this._submeshes.length;
	}
}

export function isMesh(value: unknown): value is Mesh {
	return Boolean(value) && (value as Mesh).type === "Mesh";
}
