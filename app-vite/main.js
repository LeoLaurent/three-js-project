import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, renderer, camera;

const objects = [];

init();
rend();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, -40);
    camera.lookAt(0, 10, -40);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement)
    renderer.setPixelRatio(devicePixelRatio)

    const plane_geometry = new THREE.PlaneGeometry(500, 500);
    const plane_material = new THREE.MeshStandardMaterial(0xff0000);
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.receiveShadow = true;
    plane.position.set(0, 0, 0);
    plane.rotation.x -= Math.PI/2;
    scene.add(plane);

    const textureloader = new THREE.TextureLoader()
    const textureBasecolor = textureloader.load('img/Concrete_Blocks_011_basecolor.jpg')
    const textureAmbientOcclussion = textureloader.load('img/Concrete_Blocks_011_ambientOcclusion.jpg')
    const textureheight = textureloader.load('img/Concrete_Blocks_011_height.png')
    const texturenormal = textureloader.load('img/Concrete_Blocks_011_normal.jpg')
    const textureroughness = textureloader.load('img/Concrete_Blocks_011_roughness.jpg')

    const cube_geometry = new THREE.BoxGeometry(20, 20, 20, 512, 512)
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

    for ( let i = 0; i < 20; i ++ ) {

        const cube = new THREE.Mesh( cube_geometry, cube_material );
        cube.position.x = Math.floor( Math.random() * 10 - 5 ) * 20;
        cube.position.y = Math.floor( Math.random() * 4 ) * 20 + 10;
        cube.position.z = Math.floor( Math.random() * 10 - 5 ) * 20;
        cube.castShadow = true;
        cube.receiveShadow = true;

        scene.add( cube );
        objects.push( cube );

    }

    const cube = new THREE.Mesh(cube_geometry, cube_material);
    cube.position.set(0, 0, 0);
    cube.castShadow = true;
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambientLight );

    const light = new THREE.DirectionalLight(0xffffff, 1, 100)
    light.position.set(1, 1, 1);
    light.castShadow = true;
    light.shadowMapWidth = 1024; // default is 512
    light.shadowMapHeight = 1024; // default is 512
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
}

function rend(){
    renderer.render(scene,camera);
    requestAnimationFrame(rend)
}