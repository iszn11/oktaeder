/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColorObject } from ".";
import { Texture2D } from "../resources";

export interface MaterialProps {
	name?: string;

	baseColor?: ColorObject;
	partialCoverage?: number;
	transmission?: ColorObject;
	collimation?: number;
	occlusionTextureStrength?: number;
	roughness?: number;
	metallic?: number;
	normalScale?: number;
	emissive?: ColorObject;
	ior?: number;

	baseColorPartialCoverageTexture?: Texture2D | null;
	occlusionTexture?: Texture2D | null;
	roughnessMetallicTexture?: Texture2D | null;
	normalTexture?: Texture2D | null;
	emissiveTexture?: Texture2D | null;
	transmissionCollimationTexture?: Texture2D | null;

	transparent?: boolean;
	doubleSided?: boolean;
}
