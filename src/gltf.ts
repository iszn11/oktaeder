/*!
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as data from "./data";

/* INITIAL SUPPORT PLAN
 *
 * Basic properties:
 * - extensionsRequired:
 *   - issues error when any extension not supported at least partially
 * - extensionsUsed: ignored
 * - accessors: used indirectly
 *   - read when converting mesh
 *   - sparse: no support
 *     - issues error
 * - animations: no support
 *   - issues warning
 *   - no animations emitted
 * - asset:
 *   - version: verified
 *   - rest: ignored
 * - buffers: used indirectly
 *   - read when converting mesh
 *   - uri: no support
 *     - issues error
 * - bufferViews: used indirectly
 *   - read when converting mesh
 * - cameras:
 *   - orthographic:
 *     - xmag: ignored
 *     - ymag: converted to halfVerticalSize
 *   - perspective:
 *     - aspectRatio: ignored
 *       - issues warning when provided
 * - images:
 *   - uri: no support
 *     - issues error
 * - materials:
 *   - name: full support
 *   - pbrMetallicRoughness:
 *     - baseColorFactor: full support
 *     - baseColorTexture: partial support
 *       - forced texCoord 0
 *       - issues error when different provided
 *     - metallicFactor: full support
 *     - roughnessFactor: full support
 *     - metallicRoughnessTexture: partial support
 *       - forced texCoord 0
 *       - issues error when different provided
 *   - normalTexture: partial support
 *     - scale: full support
 *     - forced texCoord 0
 *     - issues error when different provided
 *   - occlusionTexture: partial support
 *     - strength: full support
 *     - forced texCoord 1
 *     - issues error when different provided
 *   - emissiveTexture: partial support
 *     - forced texCoord 0
 *     - issues error when different provided
 *   - emissiveFactor: full support
 *   - alphaMode:
 *     - OPAQUE: full support
 *     - MASK: no support
 *       - issues error
 *     - BLEND: partial support
 *       - decoded, but not implemented
 *   - doubleSided: prtial support
 *       - decoded, but not implemented
 *
 * Extensions:
 * - KHR_lights_punctual
 *   - name: full support
 *   - color/intensity: full support
 *     - converted to color = color * intensity
 *   - type:
 *     - directional: full support
 *     - point: full support
 *     - spot: no support
 *       - issues error
 *   - range: no support
 *     - issues warning
 *     - always infite range
 * - KHR_materials_emissive_strength: full support
 *   - converted to emissive = emissive * strength
 * - KHR_materials_ior: full support
 *   - when not provided, glTF's default is used (1.5) intead of oktaeder's (1.45)
 * - KHR_materials_ior: full support
 *   - probably
 */

export interface ParseResult {
	readonly cameras: readonly data.Camera[];
	readonly materials: readonly data.Material[];
	readonly lights: readonly data.Light[];
	readonly scenes: readonly data.Scene[];
	readonly scene: data.Scene | null;

	readonly warnings: readonly ParseError[];
	readonly errors: readonly ParseError[];
}

export interface ParseErrorProps {
	message: string;
	position?: JsonPosition | undefined;
	severity: ParseErrorSeverity;
	options?: ErrorOptions | undefined;
}

export type ParseErrorSeverity =
	| "warning"
	| "error"
	;

export class ParseError extends Error {

	override message: string;
	position: JsonPosition | undefined;
	severity: ParseErrorSeverity;

	constructor({
		message,
		position,
		severity,
		options,
	}: ParseErrorProps) {
		super(message, options);

		this.message = message;
		this.position = position;
		this.severity = severity;
	}
}

export interface JsonPosition {
	readonly line: number;
	readonly column: number;
	readonly path: number;
}

export interface ParseOptions {
	/**
	 * When `true`, the parser will throw with a `ParseError` on the first error
	 * encountered. This includes warnings when `treatWarningsAsErrors` is
	 * `true`. When `false`, the parser will always return `ParseResult` and is
	 * never expected to throw. Failures are then communicated with the
	 * `ParseResult.errors` array.
	 *
	 * When this option is `true`, `stopOnFirstError` has no effect.
	 * @default true
	 */
	readonly throwOnError?: boolean;
	/**
	 * When `true`, the parser will stop processing on the first error
	 * encountered. This includes warnings when `treatWarningsAsErrors` is
	 * `true`. When `false`, the parser will continue processing when it
	 * encounters an error that it consideres recoverable.
	 *
	 * This option has no effect when `throwOnError` is `true`.
	 * @default true
	 */
	readonly stopOnFirstError?: boolean;
	/**
	 * When `true`, the parser will treat any encountered warning as a failure
	 * for the purpose of the other options. Note that regardless of this
	 * option, the warnings will always be returned in the
	 * `ParseResult.warnings` array and they will always have their `severity`
	 * property equal to `"warning"`.
	 * @default false
	 */
	readonly treatWarningsAsErrors?: boolean;
}

export async function parse(gltf: ArrayBufferView, {
	throwOnError = true,
	stopOnFirstError = true,
	treatWarningsAsErrors = false,
}: ParseOptions = {}): Promise<ParseResult> {

	const cameras: data.Camera[] = [];
	const materials: data.Material[] = [];
	const lights: data.Light[] = [];
	const scenes: data.Scene[] = [];
	const scene: data.Scene | null = null;

	const warnings: ParseError[] = [];
	const errors: ParseError[] = [];

	function makeParseResult(): ParseResult {
		return Object.freeze({
			cameras: Object.freeze(cameras),
			materials: Object.freeze(materials),
			lights: Object.freeze(lights),
			scenes: Object.freeze(scenes),
			scene,

			warnings: Object.freeze(warnings),
			errors: Object.freeze(errors),
		});
	}

	let gltfDataView = new DataView(gltf.buffer, gltf.byteOffset, gltf.byteLength);

	// --- GLB HEADER ----------------------------------------------------------

	if (gltfDataView.byteLength < 12) {
		const message = `glTF buffer view is too short to be a valid binary glTF container. Binary glTF begins with a 12-byte header, but the provided buffer view has byte length of ${gltf.byteLength}`;
		const error = new ParseError({ message, severity: "error" });
		if (throwOnError) {
			throw error;
		}

		errors.push(error);
		// unrecoverable error
		return makeParseResult();
	}

	const magic = gltfDataView.getUint32(0, true);
	const version = gltfDataView.getUint32(4, true);
	let length = gltfDataView.getUint32(8, true);

	if (magic !== 0x46546C67) {
		const message = `glTF container has invalid magic bytes. The first four bytes must have a value of 0x46546C67 when read as little endian unsigned integer, but in the provided buffer view they have the value of ${u32toHexString(magic)}`;
		const error = new ParseError({ message, severity: "error" });
		if (throwOnError) {
			throw error;
		}

		errors.push(error);
		/* NOTE This error is considered unrecoverable, because it is very
		 * likely that when the magic bytes are wrong, the provided buffer
		 * view points to a completely different format or garbage data and
		 * it would be pointless to continue parsing in this case.
		 */
		return makeParseResult();
	}

	if (version !== 2) {
		const message = `Unsupported binary glTF container format. The bytes 4-8 define the binary glTF conatiner format version when read as little endian unsigned integer. Only version 2 is supported, but in the provided buffer they have the value of ${version}`;
		const error = new ParseError({ message, severity: "error" });
		if (throwOnError) {
			throw error;
		}

		errors.push(error);
		// unrecoverable error
		return makeParseResult();
	}

	if (length !== gltf.byteLength) {
		const message = `Invalid glTF container length. The bytes 8-12 define the length in bytes of the entirety of the binary glTF container when read as little endian unsigned integer. The container byte length is defined as ${length}, but the provided buffer view has byte length of ${gltf.byteLength}`;
		const error = new ParseError({ message, severity: "error" });
		if (throwOnError) {
			throw error;
		}

		errors.push(error);
		// recovery: use the lower length value and pretend its the actual length
		length = Math.min(length, gltf.byteLength);
		gltfDataView = new DataView(gltf.buffer, gltf.byteOffset, length);
	}

	let rest = new DataView(gltf.buffer, gltf.byteOffset + 12, gltf.byteLength - 12);

	// --- JSON CHUNK ----------------------------------------------------------

	throw new Error("TODO");

	// --- BIN CHUNK -----------------------------------------------------------
}

function u32toHexString(value: number) {
	return "0x" + ("00000000" + value.toString(16)).slice(-8);
}

// --- GLTF DATA STRUCTURES ----------------------------------------------------

export interface Gltf {
	extensionsRequired?: [string, ...string[]];
	accessors?: [Accessor, ...Accessor[]];
	asset: Asset;
	buffers?: [Buffer, ...Buffer[]];
	bufferViews?: [BufferView, ...BufferView[]];
	cameras?: [Camera, ...Camera[]];
	images?: [Image, ...Image[]];
	materials?: [Material, ...Material[]];
	meshes?: [Mesh, ...Mesh[]];
	nodes?: [Node, ...Node[]];
	samplers?: [Sampler, ...Sampler[]];
	scene?: number;
	scenes?: [number, ...number[]];
	textures?: [Texture, ...Texture[]];
}

export interface Accessor {
	bufferView?: number;
	/** @default 0 */
	byteOffset?: number;
	componentType: ComponentType;
	/** @default false */
	normalized?: boolean;
	count: number;
	type: AccessorType;
}

export enum ComponentType {
	Byte = 5120,
	UnsignedByte = 5121,
	Short = 5122,
	UnsignedShort = 5123,
	UnsignedInt = 5125,
	Float = 5126,
}

export type AccessorType =
	| "SCALAR"
	| "VEC2"
	| "VEC3"
	| "VEC4"
	| "MAT2"
	| "MAT3"
	| "MAT4"
	;

export interface Asset {
	version: `${string}.${string}`;
	minVersion: `${string}.${string}`;
}

export interface Buffer {
	uri?: string;
	byteLength: number;
}

export interface BufferView {
	buffer: number;
	/** @default 0 */
	byteOffset?: number;
	byteLength: number;
	byteStride?: number;
}

export type Camera =
	| CameraOrthographic
	| CameraPerspective
	;

export interface CameraOrthographic {
	orthographic: Orthographic;
	type: "orthographic";
}

export interface CameraPerspective {
	orthographic: Perspective;
	type: "perspective";
}

export interface Orthographic {
	xmag: number;
	ymag: number;
	zfar: number;
	znear: number;
}

export interface Perspective {
	aspectRatio?: number;
	yfov: number;
	zfar?: number;
	znear: number;
}

export interface Image {
	uri?: string;
	mimeType?: ImageMimeType;
	bufferView?: number;
	name?: string;
}

export type ImageMimeType =
	| "image/jpeg"
	| "image/png"
	;

export interface Material {
	name?: string;
	extensions?: MaterialExtensions;
	pbrMetallicRoughness?: MaterialPbrMetallicRoughness;
	normalTexture?: NormalTextureInfo;
	occlusionTexture?: OcclusionTextureInfo;
	emissiveTexture?: TextureInfo;
	emissiveFactor?: [r: number, g: number, b: number];
	alphaMode?: AlphaMode;
	/** @default false */
	doubleSided?: boolean;
}

export interface MaterialExtensions {
	KHR_materials_emissive_strength?: KHR_materials_emissive_strength;
	KHR_materials_ior?: KHR_materials_ior;
}

export interface KHR_materials_emissive_strength {
	/** @default 1 */
	emissiveStrength?: number;
}

export interface KHR_materials_ior {
	/** @default 1.5 */
	ior?: number;
}

export interface MaterialPbrMetallicRoughness {
	/** @default [1, 1, 1, 1] */
	baseColorFactor?: [r: number, b: number, g: number, partialCoverage: number];
	baseColorTexture?: TextureInfo;
	/** @default 1 */
	metallicFactor?: number;
	/** @default 1 */
	roughnessFactor?: number;
	metallicRoughnessTexture?: TextureInfo;
}

export interface TextureInfo {
	index: number;
	/** @default 0 */
	texCoord?: number;
}

export interface NormalTextureInfo extends TextureInfo {
	/** @default 1 */
	scale?: number;
}

export interface OcclusionTextureInfo extends TextureInfo {
	/** @default 1 */
	strength?: number;
}

export type AlphaMode =
	| "OPAQUE"
	| "MASK"
	| "BLEND"
	;

export interface Mesh {
	primitives: [Primitive, ...Primitive[]];
	name?: string;
}

export interface Primitive {
	attributes: {
		POSITION?: number,
		NORMAL?: number,
		TANGENT?: number,
		TEXCOORD_0?: number,
		TEXCOORD_1?: number,
	};
	indices?: number;
	material?: number;
	/** @default PrimitiveMode.Triangles */
	mode?: PrimitiveMode;
}

export enum PrimitiveMode {
	Points = 0,
	Lines = 1,
	LineLoop = 2,
	LineStrip = 3,
	Triangles = 4,
	TriangleStrip = 5,
	TriangleFan = 6,
}

export interface Sampler {
	magFilter?: MagFilter;
	minFilter?: MinFilter;
	/** @default WrappingMode.Repeat */
	wrapS?: WrappingMode;
	/** @default WrappingMode.Repeat */
	wrapT?: WrappingMode;
}

export enum MagFilter {
	Nearest = 9728,
	Linear = 9729,
}

export enum MinFilter {
	Nearest = 9728,
	Linear = 9729,
	NearestMipmapNearest = 9984,
	LinearMipmapNearest = 9985,
	NearestMipmapLinear = 9986,
	LinearMipmapLinear = 9987,
}

export enum WrappingMode {
	ClampToEdge = 33071,
	MirroredRepeat = 33648,
	Repeat = 10497,
}

export interface Texture {
	sampler?: number;
	source?: number;
	name?: string;
}
