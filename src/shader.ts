import { Renderer } from "./oktaeder";

export type ShaderFlagKey = number;

export interface ShaderFlags {
	readonly texCoord: boolean;
	readonly lightTexCoord: boolean;
	readonly normal: boolean;
	readonly tangent: boolean;
}

export function shaderFlagsKey({
	texCoord,
	lightTexCoord,
	normal,
	tangent,
}: ShaderFlags): ShaderFlagKey {
	let key = 0;
	key |= Number(texCoord) << 0;
	key |= Number(lightTexCoord) << 1;
	key |= Number(normal) << 2;
	key |= Number(tangent) << 3;
	return key;
}

export function createPipeline(renderer: Renderer, {
	texCoord,
	lightTexCoord,
	normal,
	tangent,
}: ShaderFlags): GPURenderPipeline {
	const shaderCode = createShaderCode({ texCoord, lightTexCoord, normal, tangent });

	const shaderModule = renderer._device.createShaderModule({
		code: shaderCode,
		hints: {
			"vert": { layout: renderer._pipelineLayout },
			"frag": { layout: renderer._pipelineLayout },
		},
	});

	let vertexLocation = 0;

	const pipeline = renderer._device.createRenderPipeline({
		layout: renderer._pipelineLayout,
		vertex: {
			entryPoint: "vert",
			module: shaderModule,
			buffers: [
				{
					arrayStride: 12,
					attributes: [{
						shaderLocation: vertexLocation++,
						format: "float32x3",
						offset: 0,
					}],
				},
				...(texCoord ? [{
					arrayStride: 8,
					attributes: [{
						shaderLocation: vertexLocation++,
						format: "float32x2",
						offset: 0,
					}],
				} satisfies GPUVertexBufferLayout] : []),
				...(lightTexCoord ? [{
					arrayStride: 8,
					attributes: [{
						shaderLocation: vertexLocation++,
						format: "float32x2",
						offset: 0,
					}],
				} satisfies GPUVertexBufferLayout] : []),
				...(normal ? [{
					arrayStride: 12,
					attributes: [{
						shaderLocation: vertexLocation++,
						format: "float32x3",
						offset: 0,
					}],
				} satisfies GPUVertexBufferLayout] : []),
				...(tangent ? [{
					arrayStride: 16,
					attributes: [{
						shaderLocation: vertexLocation++,
						format: "float32x4",
						offset: 0,
					}],
				} satisfies GPUVertexBufferLayout] : []),
			],
		},
		fragment: {
			entryPoint: "frag",
			module: shaderModule,
			targets: [{
				format: renderer._format,
				blend: {
					color: {
						operation: "add",
						srcFactor: "one",
						dstFactor: "one-minus-src-alpha",
					},
					alpha: {
						operation: "add",
						srcFactor: "one",
						dstFactor: "one-minus-src-alpha",
					},
				},
				writeMask: GPUColorWrite.ALL,
			}],
		},
		depthStencil: {
			depthCompare: "greater",
			depthWriteEnabled: true,
			format: "depth32float",
		},
		primitive: {
			cullMode: "back",
			frontFace: "ccw",
			topology: "triangle-list",
		},
	});

	return pipeline;
}

export function createShaderCode({
	texCoord,
	lightTexCoord,
	normal,
	tangent,
}: ShaderFlags): string {
	let vertexLocation = 0;
	let varyingLocation = 0;

	return `
struct Vertex {
	@location(${vertexLocation++}) positionOS: vec3<f32>,
	${texCoord ? `@location(${vertexLocation++}) texCoord: vec2<f32>,` : ""}
	${lightTexCoord ? `@location(${vertexLocation++}) lightTexCoord: vec2<f32>,` : ""}
	${normal ? `@location(${vertexLocation++}) normalOS: vec3<f32>,` : ""}
	${normal && tangent ? `@location(${vertexLocation++}) tangentOS: vec4<f32>,` : ""}
}

struct Varyings {
	@builtin(position) positionCS: vec4<f32>,
	@location(${varyingLocation++}) positionVS: vec4<f32>,
	${texCoord ? `@location(${varyingLocation++}) texCoord: vec2<f32>,` : ""}
	${lightTexCoord ? `@location(${varyingLocation++}) lightTexCoord: vec2<f32>,` : ""}
	${normal ? `@location(${varyingLocation++}) normalVS: vec3<f32>,` : ""}
	${normal && tangent ? `@location(${varyingLocation++}) tangentVS: vec3<f32>,` : ""}
	${normal && tangent ? `@location(${varyingLocation++}) bitangentVS: vec3<f32>,` : ""}
}

struct PointLight {
	positionWS: vec3<f32>,
	color: vec3<f32>,
}

struct DirectionalLight {
	directionWS: vec3<f32>,
	color: vec3<f32>,
}

struct GlobalUniforms {
	matrixWStoVS: mat4x4<f32>,
	matrixVStoCS: mat4x4<f32>,
	ambientLight: vec3<f32>,
	pointLightCount: u32,
	directionalLightCount: u32,
}

struct MaterialUniforms {
	baseColor: vec3<f32>,
	partialCoverage: f32,
	transmission: vec3<f32>,
	collimation: f32,
	occlusionTextureStrength: f32,
	roughness: f32,
	metallic: f32,
	normalScale: f32,
	emissive: vec3<f32>,
	ior: f32,
}

struct ObjectUniforms {
	matrixOStoWS: mat4x4<f32>,
	matrixOStoWSNormal: mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> _Global: GlobalUniforms;
@group(1) @binding(0) var<uniform> _Material: MaterialUniforms;
@group(2) @binding(0) var<uniform> _Object: ObjectUniforms;

@group(0) @binding(1) var<storage> _PointLights: array<PointLight>;
@group(0) @binding(2) var<storage> _DirectionalLights: array<DirectionalLight>;

@group(1) @binding(1) var _Sampler: sampler;
@group(1) @binding(2) var _BaseColorPartialCoverageTexture: texture_2d<f32>;
@group(1) @binding(3) var _OcclusionTexture: texture_2d<f32>;
@group(1) @binding(4) var _RoughnessMetallicTexture: texture_2d<f32>;
@group(1) @binding(5) var _NormalTexture: texture_2d<f32>;
@group(1) @binding(6) var _EmissiveTexture: texture_2d<f32>;
@group(1) @binding(7) var _TransmissionCollimationTexture: texture_2d<f32>;

fn screenSpaceMatrixTStoVS(positionVS: vec3<f32>, normalVS: vec3<f32>, texCoord: vec2<f32>) -> mat3x3<f32> {
	let q0 = dpdx(positionVS);
	let q1 = dpdy(positionVS);
	let uv0 = dpdx(texCoord);
	let uv1 = dpdy(texCoord);

	let q1perp = cross(q1, normalVS);
	let q0perp = cross(normalVS, q0);

	let tangentVS = q1perp * uv0.x + q0perp * uv1.x;
	let bitangentVS = q1perp * uv0.y + q0perp * uv1.y;

	let det = max(dot(tangentVS, tangentVS), dot(bitangentVS, bitangentVS));
	let scale = (det == 0.0) ? 0.0 : inserseSqrt(det);

	return mat3x3(tangentVS * scale, bitangentVS * scale, normalVS);
}

@vertex
fn vert(vertex: Vertex) -> Varyings {
	var output: Varyings;
	let positionWS = (_Object.matrixOStoWS * vec4(vertex.positionOS, 1.0)).xyz;
	let positionVS = (_Global.matrixWStoVS * vec4(positionWS, 1.0)).xyz;
	let positionCS = _Global.matrixVStoCS * vec4(positionVS, 1.0);
	output.positionCS = positionCS;
	output.positionVS = positionVS;
	${normal ? `
		let normalWS = normalize((_Object.matrixOStoWSNormal * vec4(vertex.normalOS, 0.0)).xyz);
		let normalVS = normalize((_Global.matrixWStoVS * vec4(normalWS, 0.0)).xyz);
		output.normalVS = normalVS;
		${tangent ? `
			let tangentWS = normalize((_Object.matrixOStoWS * vec4(vertex.tangentOS.xyz, 0.0)).xyz);
			let tangentVS = normalize((_Global.matrixWStoVS * vec4(tangentWS, 0.0)).xyz);
			let bitangentVS = vertex.tangentOS.w * normalize(cross(normalVS, tangentVS));
			output.tangentVS = tangentVS;
			output.bitangentVS = bitangentVS;
		` : ""}
	` : ""}
	${texCoord ? "output.texCoord = vertex.texCoord;" : ""}
	${lightTexCoord ? "output.lightTexCoord = vertex.lightTexCoord;" : ""}
}

@fragment
fn frag(fragment: Varyings) -> @location(0) vec2<f32> {
	var baseColor = _Material.baseColor;
	var partialCoverage = _Material.partialCoverage;
	var occlusion = 1.0;
	var roughness = _Material.roughness;
	var metallic = _Material.metallic;
	var normalScale = _Material.normalScale;
	var emissive = _Material.emissive;
	var ior = _Material.ior;
	${texCoord ? `
		let baseColorPartialCoverageTexel = texture(_BaseColorPartialCoverageTexture, _Sampler, fragment.texCoord);
		baseColor *= baseColorPartialCoverageTexel.rgb;
		partialCoverage *= baseColorPartialCoverageTexel.a;
		let roughnessMetallicTexel = texture(_RoughnessMetallicTexture, _Sampler, fragment.texCoord);
		roughness *= roughnessMetallicTexel.g;
		metallic *= roughnessMetallicTexel.b;
		let emissiveTexel = texture(_EmissiveTexture, _Sampler, fragment.texCoord);
		emissive *= emissiveTexel.rgb;
	` : ""}
	${lightTexCoord ? `
		let occlusionTexel = texture(_OcclusionTexture, _Sampler, fragment.lightTexCoord);
		occlusion += _Material.occlusionTextureStrength * (occlusionTexel.r - 1.0);
	` : ""}

	let positionVS = fragment.positionVS;
	${normal ? `
		let geometricNormalVS = fragment.normalVS;
	` : `
		let dPositionVSdx = dpdx(positionVS);
		let dPositionVSdy = dpdy(positionVS);
		let geometricNormalVS = normalize(cross(dPositionVSdx, dPositionVSdy));
	`}
	${texCoord ? `
		${tangent ? `
			let tangentVS = normalize(fragment.tangentVS);
			let bitangentVS = normalize(fragment.bitangentVS);
			let matrixTStoVS = mat3x3(tangentVS, bitangentVS, geometricNormalVS);
		` : `
			let matrixTStoVS = screenSpaceMatrixTStoVS(positionVS, geometricNormalVS, fragment.texCoord);
		`}
		let normalTextureTexel = texture(_NormalTexture, _Sampler, fragment.texCoord);
		var normalTS = normalTextureTexel.xyz * 2.0 - 1.0;
		normalTS.xy *= _Material.normalScale;
		let actualNormalVS = normalize(matrixTStoVS * geometricNormalVS);
	` : `
		let actualNormalVS = geometricNormalVS;
	`}
}`;
}
