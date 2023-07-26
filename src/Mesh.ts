/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IndexBuffer } from "./IndexBuffer";
import { VertexBuffer } from "./VertexBuffer";

export interface MeshProps {
	readonly name?: string;

	readonly vertexBuffer: VertexBuffer;
	readonly indexBuffer: IndexBuffer;
}

export class Mesh {

	readonly type!: "Mesh"

	_name: string;

	_vertexBuffer: VertexBuffer;
	_indexBuffer: IndexBuffer;

	constructor({
		name = "",
		vertexBuffer,
		indexBuffer,
	}: MeshProps) {
		Object.defineProperty(this, "type", { value: "Mesh" });

		this._name = name;

		this._vertexBuffer = vertexBuffer;
		this._indexBuffer = indexBuffer
	}
}

export function isMesh(value: unknown): value is Mesh {
	return Boolean(value) && (value as Mesh).type === "Mesh";
}
