/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Node } from "./Node";

export interface SceneProps {
	readonly name?: string;

	readonly nodes?: Node[];
}

export class Scene {

	readonly type!: "Scene";

	_name: string | undefined;

	_nodes: Node[];

	constructor({
		name = "",
		nodes = [],
	}: SceneProps) {
		Object.defineProperty(this, "type", { value: "Scene" });

		this._name = name;

		this._nodes = nodes;
	}
}

export function isScene(value: unknown): value is Scene {
	return Boolean(value) && (value as Scene).type === "Scene";
}
