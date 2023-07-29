/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Camera, Matrix4x4, Mesh, Quaternion, QuaternionObject, Vector3, Vector3Object } from ".";
import { Material } from "../resources";

export interface NodeProps {
	readonly name?: string;

	readonly translation?: Vector3Object;
	readonly rotation?: QuaternionObject;
	readonly scale?: Vector3Object;

	readonly camera?: Camera | null;
	readonly mesh?: Mesh | null;
	readonly materials?: Material[];

	readonly children?: Node[];
}

export class Node {

	readonly type!: "Node";

	_name: string;

	_translation: Vector3;
	_rotation: Quaternion;
	_scale: Vector3;

	/** unique */
	_camera: Camera | null;
	/** shared */
	_mesh: Mesh | null;
	/** shared */
	_materials: Material[];

	/** unique */
	_children: Node[];

	/** backreference */
	_parent: Node | null;

	_localMatrix: Matrix4x4;
	_worldMatrix: Matrix4x4;

	constructor({
		name = "",
		translation,
		rotation,
		scale,
		camera = null,
		mesh = null,
		materials = [],
		children = [],
	}: NodeProps) {
		this._name = name;

		this._translation = translation !== undefined ? Vector3.fromObject(translation) : Vector3.zero();
		this._rotation = rotation !== undefined ? Quaternion.fromObject(rotation) : Quaternion.identity();
		this._scale = scale !== undefined ? Vector3.fromObject(scale) : Vector3.one();

		this._camera = camera;
		this._mesh = mesh;
		this._materials = materials;

		this._children = children;

		this._parent = null;

		this._localMatrix = Matrix4x4.fromTRS(this._translation, this._rotation, this._scale);
		this._worldMatrix = Matrix4x4.fromObject(this._localMatrix);

		if (this._camera !== null) {
			this._camera._node = this;
		}

		if (this._children !== null) {
			for (const child of this._children) {
				child._parent = this;
			}
		}
	}
}

Object.defineProperty(Node.prototype, "type", { value: "Node" });

export function isNode(value: unknown): value is Node {
	return Boolean(value) && (value as Node).type === "Node";
}
