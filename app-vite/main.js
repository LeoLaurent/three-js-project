import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Définition des variables globales

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

// Appel des fonctions
init();
animate();

// Initialisation
function init() {
    // Création scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEFA)

    const color = 0x87CEFA;  // white
    const near = 1;
    const far = 200;
    const density = 0.1;
    scene.fog = new THREE.Fog(color, near, far);
  
    
    // Création Caméra
    camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10


    // Création renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement)
    renderer.setPixelRatio(devicePixelRatio)

    // Création texture sol
    const textureloaderWood = new THREE.TextureLoader()
    const textureBasecolorWood = textureloaderWood.load('img/Wood_Floor_009_basecolor.jpg')
    const textureAmbientOcclussionWood = textureloaderWood.load('img/Wood_Floor_009_ambientOcclusion.jpg')
    const textureheightWood = textureloaderWood.load('img/Wood_Floor_009_height.png')
    const texturenormalWood = textureloaderWood.load('img/Wood_Floor_009_normal.jpg')
    const textureroughnessWood = textureloaderWood.load('img/Wood_Floor_009_roughness.jpg')

    // Répétition texture sol pour recouvrement
    textureBasecolorWood.wrapS = textureBasecolorWood.wrapT=THREE.RepeatWrapping
    textureBasecolorWood.repeat.set(15,15)
    textureAmbientOcclussionWood.wrapS = textureAmbientOcclussionWood.wrapT=THREE.RepeatWrapping
    textureAmbientOcclussionWood.repeat.set(15,15)
    textureheightWood.wrapS = textureheightWood.wrapT=THREE.RepeatWrapping
    textureheightWood.repeat.set(15,15)
    texturenormalWood.wrapS = texturenormalWood.wrapT=THREE.RepeatWrapping
    texturenormalWood.repeat.set(15,15)
    textureroughnessWood.wrapS = textureroughnessWood.wrapT=THREE.RepeatWrapping
    textureroughnessWood.repeat.set(15,15 )

    // Création sol
    const plane_geometry = new THREE.PlaneGeometry(1000, 1000);
    const plane_material = new THREE.MeshStandardMaterial(
        {
            map: textureBasecolorWood,
            normalMap: texturenormalWood,
            bumpMap: textureheightWood,
            roughnessMap: textureroughnessWood,
            roughness: 0.05,
            aoMap: textureAmbientOcclussionWood
        }
    );
    const plane = new THREE.Mesh(plane_geometry, plane_material);
    plane.receiveShadow = true;
    plane.rotateX( - Math.PI / 2 );
    scene.add(plane);

    // Création texture cube
    const textureloader = new THREE.TextureLoader()
    const textureBasecolor = textureloader.load('img/Concrete_Blocks_011_basecolor.jpg')
    const texturenormal = textureloader.load('img/Concrete_Blocks_011_ambientOcclusion.jpg')
    const textureheight = textureloader.load('img/Concrete_Blocks_011_height.png')
    const textureroughness = textureloader.load('img/Concrete_Blocks_011_normal.jpg')
    const textureAmbientOcclussion = textureloader.load('img/Concrete_Blocks_011_roughness.jpg')

    // Création Geometry et material du cube
    const cube_geometry = new THREE.BoxGeometry(10, 10, 10, 512/2, 512/2)
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
    

    // Création des cubes
    for ( let i = 0; i < 100; i ++ ) {

        const cube = new THREE.Mesh( cube_geometry, cube_material );
        cube.position.x = Math.floor( Math.random() * 20 - 10 ) * 10;
        cube.position.y = Math.floor( Math.random() * 20 ) * 5 + 5;
        cube.position.z = Math.floor( Math.random() * 20 - 10 ) * 10;
        cube.castShadow = true;
        cube.receiveShadow = true;

        scene.add( cube );
        objects.push( cube );

    };

    // Ombre douce
    renderer.shadowMapSoft = true;
    
    // Création des controles
    controls = new PointerLockControls( camera ,  document.body );

    document.body.addEventListener( 'click', function () {
    
        controls.lock();
    }, false );
    scene.add( controls.getObject() );

    // Création des lumiètes
    const light = new THREE.DirectionalLight(0xffffff, 1, 100);
    light.position.set(20, 400,200);
    light.castShadow = true;
    light.shadowMapWidth = 512*8; // default is 512
    light.shadowMapHeight = 512*8; // default is 512
    light.shadow.camera = new THREE.OrthographicCamera( -400,  400, 400, -400, 0.5, 1000 );
    light.shadow.radius = 4;
    light.target = plane;
    scene.add(light);
    const ambientlight = new THREE.AmbientLight(0xffffff,0.3)
    scene.add(ambientlight)

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

    // Initialisation des "pieds"
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    window.addEventListener( 'resize', onWindowResize );    
};

// Responsiveness
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Animation (personnage)
    function animate() {

        requestAnimationFrame( animate );
        // Création de time pour avoir le temps entre chaque rendu et recalculer
        const time = performance.now();
        // Verification si control locked
        if ( controls.isLocked === true ) {
    
            raycaster.ray.origin.copy( controls.getObject().position );
            raycaster.ray.origin.y -= 10;
            
            // Constante pour connaitre intersection des pieds
            const intersections = raycaster.intersectObjects( objects, false );
    
            const onObject = intersections.length > 0;
    
            const delta = ( time - prevTime ) / 1000;
    
            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;
    
            velocity.y -= 6* 100.0 * delta; // 100.0 = masse
            
            // Transfo du bool en 1 0 -1
            direction.z = Number( moveForward ) - Number( moveBackward );
            direction.x = Number( moveRight ) - Number( moveLeft );
            console.log(direction.x)
            direction.normalize();

            
            // Choix de la vitesse
            if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
            if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
            
            // Si sur objet, on peut sauter
            if ( onObject === true ) {
    
                velocity.y = Math.max( 0, velocity.y );
                canJump = true;
    
            }
            
            // Application de la vitesse pour bouger
            controls.moveRight( - velocity.x * delta );
            controls.moveForward( - velocity.z * delta );
            
            // Saut
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
    
    