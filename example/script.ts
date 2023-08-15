import { Color, Material, Mesh, Node, PerspectiveCamera, PointLight, Quaternion, Scene, Submesh, Vector3 } from "../src/data/index";
import { Renderer } from "../src/oktaeder";
import "./style.css";

new EventSource("/esbuild").addEventListener("change", () => location.reload());

const canvas = document.createElement("canvas");
window.addEventListener("resize", onResize);
onResize.call(window);

const renderer = await Renderer.init(canvas);

const camera = new PerspectiveCamera({
	verticalFovRad: 50 * (Math.PI / 180),
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

const material = new Material({
	baseColor: Color.white(),
	roughness: 0.5,
	metallic: 0,
});

const node = new Node({ mesh, materials: [material] });

const cameraPitchRad = 15 * (Math.PI / 180);
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
			translation: new Vector3(0, 0.8, -3),
			rotation: new Quaternion(Math.sin(0.5 * cameraPitchRad), 0, 0, Math.cos(0.5 * cameraPitchRad)),
			camera,
		}),
	],
	ambientLight: new Color(0.01, 0.01, 0.01),
});

function onResize(this: Window) {
	canvas.width = this.innerWidth;
	canvas.height = this.innerHeight;
}

const rotation = Quaternion.identity();

function draw(time: number) {
	rotation.y = Math.cos(0.001 * time);
	rotation.w = Math.sin(0.001 * time);
	node.setRotation(rotation);

	renderer.render(scene, camera);
	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

document.body.appendChild(canvas);
