import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();


init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement)
    renderer.setPixelRatio(devicePixelRatio)

    const plane_geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const plane_material = new THREE.MeshStandardMaterial(0xff0000);
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.receiveShadow = true;
    plane.rotateX( - Math.PI / 2 );
    scene.add(plane);

    const textureloader = new THREE.TextureLoader()
    const textureBasecolor = textureloader.load('img/Concrete_Blocks_011_basecolor.jpg')
    const textureAmbientOcclussion = textureloader.load('img/Concrete_Blocks_011_ambientOcclusion.jpg')
    const textureheight = textureloader.load('img/Concrete_Blocks_011_height.png')
    const texturenormal = textureloader.load('img/Concrete_Blocks_011_normal.jpg')
    const textureroughness = textureloader.load('img/Concrete_Blocks_011_roughness.jpg')


    const cube_geometry = new THREE.BoxGeometry(20, 20, 20, 256, 256)
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

        const cubei = new THREE.Mesh( cube_geometry, cube_material );
        cubei.position.x = Math.floor( Math.random() * 10 - 5 ) * 20;
        cubei.position.y = Math.floor( Math.random() * 4 ) * 20 + 10;
        cubei.position.z = Math.floor( Math.random() * 20 - 5 ) * 10;
        cubei.castShadow = true;
        cubei.receiveShadow = true;

        scene.add( cubei );
        objects.push( cubei );

    };

    const cube = new THREE.Mesh(cube_geometry, cube_material);
    cube.position.set(0, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    renderer.shadowMapSoft = true;
    
    controls = new PointerLockControls( camera ,  document.body );

    document.body.addEventListener( 'click', function () {
    
        controls.lock();
    }, false );


    scene.add( controls.getObject() );
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(0 , 50, 50);

    light.shadow.camera =  new THREE.OrthographicCamera( -100, 100, 100, -100, 0.5, 1000 );
    light.castShadow = true;
    light.shadow.mapSize.width = 100000; 
    light.shadow.mapSize.height = 100000; 
    light.shadow.radius=0.8
    scene.add(light);


    // Definition des controles
    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true ) velocity.y +=250;
                canJump = false;
                break;

        }
    };

    const onKeyUp = function ( event ) {
        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }
    };
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    window.addEventListener( 'resize', onWindowResize );    
};
    
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


    function animate() {

        requestAnimationFrame( animate );
    
        const time = performance.now();
    
        if ( controls.isLocked === true ) {
    
            raycaster.ray.origin.copy( controls.getObject().position );
            raycaster.ray.origin.y -= 10;
    
            const intersections = raycaster.intersectObjects( objects, false );
    
            const onObject = intersections.length > 0;
    
            const delta = ( time - prevTime ) / 1000;
    
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;
    
            velocity.y -= 9.8 * 70.0 * delta; // 100.0 = mass
    
            direction.z = Number( moveForward ) - Number( moveBackward );
            direction.x = Number( moveRight ) - Number( moveLeft );
            direction.normalize(); // this ensures consistent movements in all directions
    
            if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    
            if ( onObject === true ) {
    
                velocity.y = Math.max( 0, velocity.y );
                canJump = true;
    
            }
    
            controls.moveRight( - velocity.x * delta );
            controls.moveForward( - velocity.z * delta );
    
            controls.getObject().position.y += ( velocity.y * delta ); // new behavior
    
            if ( controls.getObject().position.y < 10 ) {
    
                velocity.y = 0;
                controls.getObject().position.y = 10;
    
                canJump = true;
    
            }
    
        }
    
        prevTime = time;
    
        renderer.render( scene, camera );
    
    }
    
    