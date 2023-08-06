/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IndexBuffer, VertexBuffer } from "../resources";

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
		this._name = name;

		this._vertexBuffer = vertexBuffer;
		this._indexBuffer = indexBuffer
		this._submeshes = submeshes;
	}

	get submeshCount(): number {
		return this._submeshes.length;
	}

	set name(value: string) { this._name = value; }
	get name(): string { return this._name; }

	set vertexBuffer(value: VertexBuffer) { this._vertexBuffer = value; }
	get vertexBuffer(): VertexBuffer { return this._vertexBuffer; }

	set indexBuffer(value: IndexBuffer) { this._indexBuffer = value; }
	get indexBuffer(): IndexBuffer { return this._indexBuffer; }

	setSubmeshes(value: readonly Submesh[]): Mesh {
		this._submeshes.length = 0;
		this._submeshes.push(...value);
		return this;
	}

	getMaterials(res: Submesh[]): Submesh[] {
		res.length = 0;
		res.push(...this._submeshes);
		return res;
	}
}

Object.defineProperty(Mesh.prototype, "type", { value: "Mesh" });

export function isMesh(value: unknown): value is Mesh {
	return Boolean(value) && (value as Mesh).type === "Mesh";
}
