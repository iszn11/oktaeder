export interface ShaderFlags {
	texCoord: boolean;
	lightTexCoord: boolean;
	normal: boolean;
	tangent: boolean;
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
		let roughnessMetallicTexel = texture(_RoughnessMetallic, _Sampler, fragment.texCoord);
		roughness *= roughnessMetallicTexel.g;
		metallic *= roughnessMetallicTexel.b;
		let emissiveTexel = texture(_EmissiveTexture, _Sampler, fragment.texCoord);
		emissive *= emissiveTexel.rgb;
	` : ""}
	${lightTexCoord ? `
		let occlusionTexel = texture(_OcclusionTexture, _Sampler, fragment.lightTexCoord);
		occlusion += _Material.occlusionTextureStrength * (occlusionTexel.r - 1.0);
	` : ""}
}`;
}
