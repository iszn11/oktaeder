import { Color, DirectionalLight, Mesh, Node, PerspectiveCamera, PointLight, Quaternion, Scene, Submesh, Vector3 } from "../src/data/index";
import { Renderer, degToRad } from "../src/oktaeder";
import "./style.css";

new EventSource("/esbuild").addEventListener("change", () => location.reload());

const canvas = document.createElement("canvas");
window.addEventListener("resize", onResize);
onResize.call(window);

const renderer = await Renderer.init(canvas);

const camera = new PerspectiveCamera({
	verticalFovRad: degToRad(50),
	nearPlane: 0.001,
	farPlane: Infinity,
});

const vertexBuffer = renderer.createVertexBuffer({ vertexCount: 6 });
vertexBuffer.writeTypedArray(0, {
	position: new Float32Array([
		-1, 0, 0,
		1, 0, 0,
		0, -1, 0,
		0, 1, 0,
		0, 0, -1,
		0, 0, 1,
	]),
});

const indexBuffer = renderer.createIndexBuffer({ indexCount: 24, indexFormat: "uint16" });
indexBuffer.writeArray(0, [
	0, 4, 3,
	4, 1, 3,
	1, 5, 3,
	5, 0, 3,
	4, 0, 2,
	1, 4, 2,
	5, 1, 2,
	0, 5, 2,
]);

const submesh: Submesh = { start: 0, length: 24 };

const mesh = new Mesh({ vertexBuffer, indexBuffer, submeshes: [submesh] });

const material = renderer.createMaterial({
	baseColor: Color.white(),
	roughness: 0.5,
	metallic: 1,
});

const node = new Node({ mesh, materials: [material] });

const scene = new Scene({
	nodes: [
		node,
		new Node({
			translation: new Vector3(-1, 1, 0),
			light: new PointLight({ color: new Color(1, 0, 0) }),
		}),
		new Node({
			translation: new Vector3(0, 1, -1),
			light: new PointLight({ color: new Color(0, 1, 0) }),
		}),
		new Node({
			translation: new Vector3(1, 1, 0),
			light: new PointLight({ color: new Color(0, 0, 1) }),
		}),
		new Node({
			translation: new Vector3(0, 1, 1),
			light: new PointLight({ color: new Color(1, 1, 0) }),
		}),
		new Node({
			rotation: Quaternion.fromRotationYZ(degToRad(-90)),
			light: new DirectionalLight({ color: new Color(0.5, 0.5, 0.5) }),
		}),
		new Node({
			translation: new Vector3(0, 0.8, -3),
			rotation: Quaternion.fromRotationYZ(degToRad(15)),
			camera,
		}),
	],
	ambientLight: new Color(0.01, 0.01, 0.01),
});

function onResize(this: Window) {
	canvas.width = this.innerWidth;
	canvas.height = this.innerHeight;
}

const _quaternion = Quaternion.identity();

function draw(timeMs: number) {
	const time = 0.001 * timeMs;
	node.setRotation(_quaternion.setRotationZX(-0.5 * time));

	renderer.render(scene, camera);
	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

document.body.appendChild(canvas);
