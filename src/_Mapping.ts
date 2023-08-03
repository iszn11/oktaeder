/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export class _Mapping<T> {
	table: T[];
	map: Map<T, number>;

	constructor() {
		this.table = [];
		this.map = new Map();
	}

	add(item: T) {
		if (this.map.has(item)) {
			return;
		}

		const id = this.table.length;
		this.table.push(item);
		this.map.set(item, id);
	}

	get(item: T): number | undefined {
		return this.map.get(item);
	}
}
