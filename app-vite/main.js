import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, renderer, camera;

init();
rend();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -2.5, 2.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement)
    renderer.setPixelRatio(devicePixelRatio)

    const plane_geometry = new THREE.PlaneGeometry(5, 5);
    const plane_material = new THREE.MeshStandardMaterial(0xff0000);
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.receiveShadow = true
    scene.add(plane);

    const textureloader = new THREE.TextureLoader()
    const textureBasecolor = textureloader.load('img/Concrete_Blocks_011_basecolor.jpg')
    const textureAmbientOcclussion = textureloader.load('img/Concrete_Blocks_011_ambientOcclusion.jpg')
    const textureheight = textureloader.load('img/Concrete_Blocks_011_height.png')
    const texturenormal = textureloader.load('img/Concrete_Blocks_011_normal.jpg')
    const textureroughness = textureloader.load('img/Concrete_Blocks_011_roughness.jpg')

    const cube_geometry = new THREE.BoxGeometry(1, 1, 1, 512, 512)
    const cube_material = new THREE.MeshStandardMaterial(
        {
            map: textureBasecolor,
            normalMap: texturenormal,
            bumpMap: textureheight,
            roughnessMap: textureroughness,
            roughness: 0.05,
            aoMap: textureAmbientOcclussion
        }
    );

    const cube = new THREE.Mesh(cube_geometry, cube_material);
    cube.position.set(0, 0, 1);
    cube.castShadow = true;
    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1, 100)
    light.position.set(-2, -2, 5);
    light.castShadow = true;
    light.shadowMapWidth = 1024; // default is 512
    light.shadowMapHeight = 1024; // default is 512
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();
}

function rend(){
    renderer.render(scene,camera);
    requestAnimationFrame(rend)
}