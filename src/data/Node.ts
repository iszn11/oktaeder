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

	_localMatrixNeedsUpdate: boolean;
	_localMatrix: Matrix4x4;

	_worldMatrixNeedsUpdate: boolean;
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

		this._localMatrixNeedsUpdate = true;
		this._localMatrix = new Matrix4x4(
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
		);

		this._worldMatrixNeedsUpdate = true;
		this._worldMatrix = new Matrix4x4(
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
			NaN, NaN, NaN, NaN,
		);

		if (this._camera !== null) {
			this._camera._node = this;
		}

		if (this._children !== null) {
			for (const child of this._children) {
				child._parent = this;
			}
		}
	}

	setTranslation(value: Vector3Object): Node {
		this._translation.setObject(value);
		this._localMatrixNeedsUpdate = true;
		this._setWorldMatrixNeedsUpdateRecursive(true);
		return this;
	}

	getTranslation(res: Vector3): Vector3 {
		res.setObject(this._translation);
		return res;
	}

	setRotation(value: QuaternionObject): Node {
		this._rotation.setObject(value);
		this._localMatrixNeedsUpdate = true;
		this._setWorldMatrixNeedsUpdateRecursive(true);
		return this;
	}

	getRotation(res: Quaternion): Quaternion {
		res.setObject(this._rotation);
		return res;
	}

	setScale(value: Vector3Object): Node {
		this._scale.setObject(value);
		this._localMatrixNeedsUpdate = true;
		this._setWorldMatrixNeedsUpdateRecursive(true);
		return this;
	}

	getScale(res: Vector3): Vector3 {
		res.setObject(this._scale);
		return res;
	}

	set camera(value: Camera | null) {
		if (value !== null) {
			this.attachCamera(value);
		} else {
			this.detachCamera();
		}
	}
	get camera(): Camera | null { return this._camera; }

	attachCamera(camera: Camera): Node {
		if (this._camera !== null) {
			this._camera._node = null;
		}

		this._camera = camera;

		if (camera._node !== null) {
			camera._node._camera = null;
		}

		camera._node = this;
		this._camera = camera;
		return this;
	}

	detachCamera(): Node {
		if (this._camera === null) {
			return this;
		}

		this._camera._node = null;
		this._camera = null;
		return this;
	}

	set mesh(value: Mesh | null) { this._mesh = value; }
	get mesh(): Mesh | null { return this._mesh; }

	setMaterials(value: readonly Material[]): Node {
		this._materials.length = 0;
		this._materials.push(...value);
		return this;
	}

	getMaterials(res: Material[]): Material[] {
		res.length = 0;
		res.push(...this._materials);
		return res;
	}

	// TODO children

	set parent(value: Node | null) {
		if (value !== null) {
			this.attach(value);
		} else {
			this.detach();
		}
	}
	get parent(): Node | null { return this._parent; }

	attach(node: Node): Node {
		if (this._parent !== null) {
			this._parent._children.splice(this._parent._children.indexOf(this), 1);
		}

		node._children.push(this);
		this._parent = node;
		this._setWorldMatrixNeedsUpdateRecursive(true);
		return this;
	}

	detach(): Node {
		if (this._parent === null) {
			return this;
		}

		this._parent._children.splice(this._parent._children.indexOf(this), 1);
		this._parent = null;
		this._setWorldMatrixNeedsUpdateRecursive(true);
		return this;
	}

	getLocalMatrix(res: Matrix4x4): Matrix4x4 {
		this._updateLocalMatrix();
		res.setObject(this._localMatrix);
		return res;
	}

	getWorldMatrix(res: Matrix4x4): Matrix4x4 {
		this._updateWorldMatrix();
		res.setObject(this._worldMatrix);
		return res;
	}

	_updateLocalMatrix(): Node {
		if (!this._localMatrixNeedsUpdate) {
			return this;
		}
		this._localMatrix.setTranslationRotationScale(this._translation, this._rotation, this._scale);
		this._localMatrixNeedsUpdate = false;
		return this;
	}

	_updateWorldMatrix(): Node {
		if (!this._worldMatrixNeedsUpdate) {
			return this;
		}
		this._updateLocalMatrix();
		if (this._parent !== null) {
			this._parent.getWorldMatrix(this._worldMatrix);
			this._worldMatrix.premulMatrix(this._localMatrix);
		} else {
			this._worldMatrix.setObject(this._localMatrix);
		}
		return this;
	}

	_setWorldMatrixNeedsUpdateRecursive(value: boolean): Node {
		this._localMatrixNeedsUpdate = true;
		for (const child of this._children) {
			child._setWorldMatrixNeedsUpdateRecursive(value);
		}
		return this;
	}
}

Object.defineProperty(Node.prototype, "type", { value: "Node" });

export function isNode(value: unknown): value is Node {
	return Boolean(value) && (value as Node).type === "Node";
}
