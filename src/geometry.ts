/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

export function degToRad(angleDeg: number): number {
	return angleDeg * Math.PI / 180;
}

export function radToDeg(angleRad: number): number {
	return angleRad * 180 / Math.PI;
}
