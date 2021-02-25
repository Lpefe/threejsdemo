var initialVertices = [];

var scene;      // used primarily by mainCanvas.js
var sceneCube;
var camera;     // shared between canvases
var cameraCube;
var renderer;   
var controls;
var stats;
var textureLoader;
var cubeTextureLoader;
var exrLoader;
var exrCubeRenderTarget;
var pngEquiRectTexture;
var pngEquiRectTexture2;
var light;

var cubeMesh;

window.addEventListener('load', init);

function init () { // Initialization

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.autoClear = false;    
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( innerWidth, innerHeight );
    renderer.domElement.style.position = "relative";
    document.querySelector(".main-canvas-container").appendChild( renderer.domElement );

    
    // SHOULD BE ACTIVE IN THE DESKTOP VERSION
    // renderer.gammaInput = false;
    // renderer.gammaOutput = true;
    
    // SHOULD BE CONTROLLED WITH DATGUI.js
    // SHOULD BE CONTROLLED WITH DATGUI.js
    // renderer.toneMappingExposure = params.exposure;



	camera = new THREE.PerspectiveCamera( 20, innerWidth / innerHeight, 1, 200 );
	camera.position.z = 80;
	camera.position.y = 20;



    scene = new THREE.Scene();



    sceneCube = new THREE.Scene();
    cameraCube = new THREE.PerspectiveCamera( 70, innerWidth / innerHeight, 1, 1000 );


    // prepare controls (OrbitControls)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxDistance = 2000;
    
    // prepare clock
    clock = new THREE.Clock();
    
    // prepare stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left     = '10px';
    stats.domElement.style.bottom   = '10px';
    stats.domElement.style.zIndex   = 1;
    document.querySelector(".main-canvas-container").appendChild( stats.domElement );




    textureLoader = new THREE.TextureLoader();
    // cubeTextureLoader = new THREE.CubeTextureLoader();
    
    // exrLoader = new THREE.EXRLoader();
    // exrLoader.load( 'assets/envmaps/piz_compressed.exr', function ( texture ) {

    //     texture.minFilter = THREE.NearestFilter;
    //     texture.magFilter = THREE.NearestFilter;
    //     texture.encoding = THREE.LinearEncoding;

    //     var cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, 512 );
    //     var cubeMapTexture = cubemapGenerator.update( renderer );

    //     var pmremGenerator = new THREE.PMREMGenerator( cubeMapTexture );
    //     pmremGenerator.update( renderer );

    //     var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    //     pmremCubeUVPacker.update( renderer );

    //     exrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    //     texture.dispose();
    //     cubemapGenerator.dispose();
    //     pmremGenerator.dispose();
    //     pmremCubeUVPacker.dispose();


    //     // loadModel();
    // } );


    new THREE.TextureLoader().load( 'assets/envmaps/1/the_sky_is_on_fire_2k.jpg', function ( texture ) {

        pngEquiRectTexture = texture;
        pngEquiRectTexture.mapping = THREE.EquirectangularReflectionMapping;
        pngEquiRectTexture.magFilter = THREE.LinearFilter;
        pngEquiRectTexture.minFilter = THREE.LinearMipMapLinearFilter;
        // texture.encoding = THREE.sRGBEncoding;

        var cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, 512 );
        var cubeMapTexture = cubemapGenerator.update( renderer );

        let shader = THREE.ShaderLib.cube;
        shader.uniforms.tCube.value = cubeMapTexture;

        let vshader = `
        varying vec3 vWorldPosition;
        #include <common>
        void main() {
        	// vWorldPosition = transformDirection( position, modelMatrix );
        	vWorldPosition = position;
        	#include <begin_vertex>
        	#include <project_vertex>
        	gl_Position.z = gl_Position.w;
        }`;

        let material = new THREE.ShaderMaterial({
    
            vertexShader: vshader,
            fragmentShader: shader.fragmentShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

    
        cubeMesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 100, 100, 100 ), material );
        // cubeMesh.rotateY(Math.PI);
        cubeMesh.scale.set(-1, 1, 1);
        sceneCube.add( cubeMesh );
    } );


    new THREE.TextureLoader().load( 'assets/envmaps/1/irradiance.jpg', function ( texture ) {

        pngEquiRectTexture = texture;
        pngEquiRectTexture.mapping = THREE.EquirectangularReflectionMapping;
        pngEquiRectTexture.magFilter = THREE.LinearFilter;
        pngEquiRectTexture.minFilter = THREE.LinearMipMapLinearFilter;
        // texture.encoding = THREE.sRGBEncoding;

        var cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, 512 );
        var cubeMapTexture = cubemapGenerator.update( renderer );
    
        mannequinMaterial.uniforms.irradianceMap.value = cubeMapTexture;    
        // shirtMaterial.uniforms.irradianceMap.value = cubeMapTexture;    
    } );

    new THREE.TextureLoader().load( 'assets/envmaps/1/the_sky_is_on_fire_2k.jpg', function ( texture ) {

        pngEquiRectTexture = texture;
        pngEquiRectTexture.mapping = THREE.EquirectangularReflectionMapping;

        var cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, 512 );
        var cubeMapTexture = cubemapGenerator.update( renderer );

        mannequinMaterial.uniforms.spec1.value = cubeMapTexture;
        // shirtMaterial.uniforms.spec1.value = cubeMapTexture;
    } );

    new THREE.TextureLoader().load( 'assets/envmaps/1/radiance2.jpg', function ( texture ) {

        pngEquiRectTexture = texture;
        pngEquiRectTexture.mapping = THREE.EquirectangularReflectionMapping;

        var cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, 512 );
        var cubeMapTexture = cubemapGenerator.update( renderer );

        mannequinMaterial.uniforms.spec2.value = cubeMapTexture;
        // shirtMaterial.uniforms.spec2.value = cubeMapTexture;
    } );

    var geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xaaaaaa} );
    // window.sphereMaterial = new THREE.ShaderMaterial({
    
    //     vertexShader: pbrMVshader,
    //     fragmentShader: pbrMFshader,
    //     uniforms: pbrMUniforms,
    //     // side: THREE.DoubleSide
    // });

    // sphereMaterial.uniforms.uRoughnessMapOffs.value = 0.0;
    // sphereMaterial.uniforms.uMetallicMapOffs.value  = 0.0;
    // sphereMaterial.uniforms.uRoughnessMap.value = (new THREE.TextureLoader()).load( 'assets/textures/spheretest/roughness.jpg' );
    // sphereMaterial.uniforms.uMetallicMap.value  = (new THREE.TextureLoader()).load( 'assets/textures/spheretest/metallic.jpg' );
    // sphereMaterial.uniforms.map.value = (new THREE.TextureLoader()).load( 'assets/textures/spheretest/basecolor2.jpg' );
    // sphereMaterial.uniforms.brdfLUT.value = (new THREE.TextureLoader()).load( 'assets/envmaps/brdf_lut_3.png' );
    // sphereMaterial.uniforms.envMapIntensity.value = 2.5;



    // var sphere = new THREE.Mesh( geometry, sphereMaterial );
    // scene.add( sphere );

    // scene.background = new THREE.Color(0x353535);
    loadModel();


    initGUI();
    animate();
}


var cshader = `
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldPosition;
void main() {
	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ), 5.0 );
	gl_FragColor.a *= opacity;
}
`;



// Animate the scene
function animate() {
    requestAnimationFrame(animate);


    controls.update(clock.getDelta());
    stats.update();

    
    cameraCube.rotation.copy( camera.rotation );

    renderer.render( sceneCube, cameraCube);
    renderer.render( scene, camera );
}

function loadModel() {
    var loader = new THREE.CTMLoader();
    
    loader.load( "assets/models/alperson.ctm", function( geometry ) {

        window.mannequinMaterial = mobilePBRmaterial({
            // map: (new THREE.TextureLoader()).load( 'assets/textures/spheretest/basecolor2.jpg' ),
            color: [0.1, 0.05, 0.1],
            roughness: 0.05,
            metallic: 0.0,
            envMapIntensity: 1.5,
        });
        callbackModel( geometry, 0.5, mannequinMaterial, 0, -20, 0, 0, 0 );

    }, { useWorker: false } );


    loader.load( "assets/models/cloth.ctm", function( geometry ) {

        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

        window.shirtMaterial = mobilePBRmaterial({
            map: (new THREE.TextureLoader()).load( 'assets/textures/cloth.jpg' ),
            // color: [0.1, 0.05, 0.1],
            roughness: 0.8,
            metallic: 0.0,
            envMapIntensity: 1.5,
        });
        callbackModel( geometry, 0.5, shirtMaterial, 0, -20, 0, 0, 0 );

    }, { useWorker: false } );
}

function callbackModel( geometry, s, material, x, y, z, rx, ry ) {
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.set( x, y, z );
    mesh.scale.set( s, s, s );
    mesh.rotation.x = rx;
    mesh.rotation.z = ry;

    // mesh.castShadow = true;
    // mesh.receiveShadow = true;

    scene.add( mesh );
}


function initGUI() {
    var controller = {
        lightPosZ: 8,
        lightIntensity: 0,
        lightDecay: 2.8,
        lightColor: "#ffaa23",
        roughness: 0,
        roughnessOffs: 0,
        metallic: 0,
        metallicOffs: 0,
        reflectivity: 0.9,
        envMapIntensity: 2.5,
        clearCoat: 0.0,
        clearCoatRoughness: 0.0,
        aoMapIntensity: 1.3,
    };

    var gui = new dat.GUI();
    // var f1 = gui.addFolder('Light Setup');
    var f2 = gui.addFolder('PBR Material');

    // f1.add(controller, 'lightPosZ', 0, 200).onChange(function(value) {
    //     // light.position.set( 0, 50, value );   
    // });
    // f1.add(controller, 'lightIntensity', 0, 10).onChange(function(value) {
    //     // light.power = value;
    // });
    // f1.add(controller, 'lightDecay', 0, 10).onChange(function(value) {
    //     // light.decay = value;
    // });
    // f1.addColor(controller, 'lightColor').onChange(function(value) {
    //     // light.color = new THREE.Color(value);
    // });


    f2.add(controller, 'roughnessOffs', -1, 1).onChange(function(value) {
        sphereMaterial.uniforms.uRoughnessMapOffs.value = value;
    });   
    f2.add(controller, 'metallicOffs', -1, 1).onChange(function(value) {
        sphereMaterial.uniforms.uMetallicMapOffs.value = value;
    });  
    f2.add(controller, 'roughness', 0, 1).onChange(function(value) {
        sphereMaterial.uniforms.uRoughness.value = value;
    });   
    f2.add(controller, 'metallic', 0, 1).onChange(function(value) {
        sphereMaterial.uniforms.uMetallic.value = value;
    });  
    // f2.add(controller, 'reflectivity', 0, 1).onChange(function(value) {
    // });
    f2.add(controller, 'envMapIntensity', 0, 5).onChange(function(value) {
        sphereMaterial.uniforms.envMapIntensity.value = value;
    });
    // f2.add(controller, 'clearCoat', 0, 1).onChange(function(value) {
    // });
    // f2.add(controller, 'clearCoatRoughness', 0, 1).onChange(function(value) {
    // });
    // f2.add(controller, 'aoMapIntensity', 0, 3).onChange(function(value) {
    // });

    // f1.open();
    // f2.open();
}
