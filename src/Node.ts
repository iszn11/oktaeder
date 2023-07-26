/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Camera } from "./Camera";
import { Mesh } from "./Mesh";
import { Quaternion, QuaternionObject } from "./Quaternion";
import { Vector3, Vector3Object } from "./Vector3";

export interface NodeProps {
	readonly name?: string;

	readonly translation?: Vector3Object;
	readonly rotation?: QuaternionObject;
	readonly scale?: Vector3Object;

	readonly camera?: Camera;
	readonly mesh?: Mesh;

	readonly children?: Node[];
}

export class Node {

	readonly type!: "Node";

	_name: string;

	_translation: Vector3;
	_rotation: Quaternion;
	_scale: Vector3;

	/** unique */
	_camera: Camera | undefined;
	/** shared */
	_mesh: Mesh | undefined;

	/** unique */
	_children: Node[];

	/** backreference */
	_parent: Node | undefined;

	constructor({
		name = "",
		translation,
		rotation,
		scale,
		camera,
		mesh,
		children = [],
	}: NodeProps) {
		Object.defineProperty(this, "type", { value: "Node" });

		this._name = name;

		this._translation = translation !== undefined ? Vector3.fromObject(translation) : Vector3.zero();
		this._rotation = rotation !== undefined ? Quaternion.fromObject(rotation) : Quaternion.identity();
		this._scale = scale !== undefined ? Vector3.fromObject(scale) : Vector3.one();

		this._camera = camera;
		this._mesh = mesh;

		this._children = children;

		this._parent = undefined;

		if (this._camera !== undefined) {
			this._camera._node = this;
		}

		if (this._children !== undefined) {
			for (const child of this._children) {
				child._parent = this;
			}
		}
	}
}

export function isNode(value: unknown): value is Node {
	return Boolean(value) && (value as Node).type === "Node";
}
