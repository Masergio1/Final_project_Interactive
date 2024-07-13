const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error("WebGL non è supportato dal tuo browser.");
}

// Set the canvas for high resolution
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;
gl.viewport(0, 0, canvas.width, canvas.height);

// Vertex shader source
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vTransformedNormal;
    varying highp vec4 vPosition;

    void main(void) {
        vPosition = uModelViewMatrix * aVertexPosition;
        gl_Position = uProjectionMatrix * vPosition;

        // Check if attributes are enabled before using them
        vTextureCoord = aTextureCoord;
        vTransformedNormal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    }
`;


// Fragment shader source
const fsSource = `
    precision highp float;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vTransformedNormal;
    varying highp vec4 vPosition;

    uniform sampler2D uSampler;
    uniform vec3 uSunPosition;
    uniform vec3 uEmissionColor;  // Emission color

    void main(void) {
        highp vec3 normal = normalize(vTransformedNormal);

        // Calculate direction from surface to Sun
        highp vec3 surfaceToSun = normalize(uSunPosition - vec3(vPosition.xyz));

        // Calculate sunlight
        highp float directional = max(dot(normal, surfaceToSun), 0.0);

        highp vec3 emissionLight = uEmissionColor;
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        // Apply lighting only if the emission color is zero (i.e., not the sun)
        highp vec3 finalColor = texelColor.rgb * (directional + emissionLight);
        gl_FragColor = vec4(finalColor, texelColor.a);
    }
`;

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uNormalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        uSunPosition: gl.getUniformLocation(shaderProgram, 'uSunPosition'),
        uEmissionColor: gl.getUniformLocation(shaderProgram, 'uEmissionColor'),
    },
};

const orbitVertexShaderSource = `
attribute vec4 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main(void) {

    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
}
`;
const orbitFragmentShaderSource = `
void main(void) {
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}
`;

const orbitShaderProgram = initShaderProgram(gl, orbitVertexShaderSource, orbitFragmentShaderSource);

const orbitProgramInfo = {
    program: orbitShaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(orbitShaderProgram, 'aPosition'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(orbitShaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(orbitShaderProgram, 'uModelViewMatrix'),
    },
};

const backgroundVsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

const backgroundFsSource = `
    precision highp float;

    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

const backgroundShaderProgram = initShaderProgram(gl, backgroundVsSource, backgroundFsSource);

const backgroundProgramInfo = {
    program: backgroundShaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(backgroundShaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(backgroundShaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(backgroundShaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(backgroundShaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(backgroundShaderProgram, 'uSampler'),
    },
};

const backgroundTexture = loadTexture(gl, 'image/2k_stars_milky_way.jpg');
const backgroundData = createBackgroundSphere(50, 50);
const backgroundBuffers = initBuffers(gl, backgroundData);

const sunData = createSphere(100, 100);
const sunBuffers = initBuffers(gl, sunData);
const sunTexture = loadTexture(gl, 'image/2k_sun.jpg');

const mercuryData = createSphere(50, 50);
const mercuryBuffers = initBuffers(gl, mercuryData);
const mercuryTexture = loadTexture(gl, 'image/2k_mercury.jpg');

const venusData = createSphere(50, 50);
const venusBuffers = initBuffers(gl, venusData);
const venusTexture = loadTexture(gl, 'image/2k_venus_surface.jpg');

const earthData = createSphere(50, 50);
const earthBuffers = initBuffers(gl, earthData);
const earthTexture = loadTexture(gl, 'image/2k_earth_daymap.jpg');

const moonTexture = loadTexture(gl, 'image/2k_moon.jpg');
const moonData = createSphere(30, 30);
const moonBuffers = initBuffers(gl, moonData);

const marsData = createSphere(50, 50);
const marsBuffers = initBuffers(gl, marsData);
const marsTexture = loadTexture(gl, 'image/2k_mars.jpg');

const jupiterData = createSphere(50, 50);
const jupiterBuffers = initBuffers(gl, jupiterData);
const jupiterTexture = loadTexture(gl, 'image/2k_jupiter.jpg');

const saturnData = createSphere(50, 50);
const saturnBuffers = initBuffers(gl, saturnData);
const saturnTexture = loadTexture(gl, 'image/2k_saturn.jpg');

const saturnRingTexture = loadTexture(gl, 'image/2k_saturn_ring_alpha.png');
const saturnRingInnerRadius = 1.2;
const saturnRingOuterRadius = 1.6;
const saturnRingSegments = 50;
const saturnRingRings = 20;
const saturnRingData = createRealisticRing(saturnRingInnerRadius, saturnRingOuterRadius, saturnRingSegments, saturnRingRings);
const saturnRingBuffers = initBuffers(gl, saturnRingData);

const uranusData = createSphere(50, 50);
const uranusBuffers = initBuffers(gl, uranusData);
const uranusTexture = loadTexture(gl, 'image/2k_uranus.jpg');

const neptuneData = createSphere(50, 50);
const neptuneBuffers = initBuffers(gl, neptuneData);
const neptuneTexture = loadTexture(gl, 'image/2k_neptune.jpg');

const planetEmissionColor = [0.3, 0.3, 0.3];
const sphereEmissionColor = [1.0, 1.0, 0.0];
const mercuryEmissionColor = [0.3, 0.3, 0.3];

let cameraLongitudeAngle = 0;
let cameraLatitudeAngle = 0;
const cameraDistance = 30.0;

const maxLatitudeAngle = Math.PI / 2 - 0.01;

let lastMouseX = null;
let lastMouseY = null;
let dragging = false;

canvas.addEventListener('mousedown', function(event) {
    dragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mouseup', function(event) {
    dragging = false;
});

canvas.addEventListener('mousemove', function(event) {
    if (!dragging) {
        return;
    }
    
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    const rotationSpeed = 0.01; // Speed of camera rotation
    cameraLongitudeAngle += deltaX * rotationSpeed;

    const latitudeSpeed = 0.01; // Speed of camera latitude change
    cameraLatitudeAngle -= deltaY * latitudeSpeed;

    cameraLatitudeAngle = Math.max(-maxLatitudeAngle, Math.min(maxLatitudeAngle, cameraLatitudeAngle));

    drawScene();
});

let then = 0;

let mercuryOrbitAngle = 135;
let mercuryRotationAngle = 135;

let venusOrbitAngle = 35;
let venusRotationAngle = 35;

let earthOrbitAngle = 180;
let earthRotationAngle = 180;

let marsOrbitAngle = 285;
let marsRotationAngle = 285;

let jupiterOrbitAngle = 100;
let jupiterRotationAngle = 100;

let saturnOrbitAngle = 130;
let saturnRotationAngle = 130;

let uranusOrbitAngle = 60;
let uranusRotationAngle = 60;

let neptuneOrbitAngle = 85;
let neptuneRotationAngle = 85;

const mercuryOrbitSpeed = 0.071;
const mercuryRotationSpeed = 0.107;

const venusOrbitSpeed = 0.035;
const venusRotationSpeed = 0.002;

const earthOrbitSpeed = 0.017;
const earthRotationSpeed = 0.004;

const marsOrbitSpeed = 0.009;
const marsRotationSpeed = 0.006;

const jupiterOrbitSpeed = 0.001;
const jupiterRotationSpeed = 0.001;

const saturnOrbitSpeed = 0.0005;
const saturnRotationSpeed = 0.0005;

const uranusOrbitSpeed = 0.0002;
const uranusRotationSpeed = 0.0008;

const neptuneOrbitSpeed = 0.0001;
const neptuneRotationSpeed = 0.0005;

let mercuryOrbitRadius = 1.38 * 2;
let venusOrbitRadius = 2 * 2;
let earthOrbitRadius = 3 * 2;
let marsOrbitRadius = 4.4 * 2;
let jupiterOrbitRadius = 8.2 * 2;
let saturnOrbitRadius = 12.58 * 2;
let uranusOrbitRadius = 15.14 * 2;
let neptuneOrbitRadius = 20.28 * 2;

let moonOrbitAngle = 0;
let moonRotationAngle = 0;
const moonOrbitRadius = 0.5;
const moonOrbitSpeed = 0.005;
const moonRotationSpeed = 0.01;

let sunRotationAngle = 0;
const sunRotationSpeed = 0.1; // Adjust the speed as needed

const asteroidTextures = [
    loadTexture(gl, 'image/asteoride.jpg'),
    loadTexture(gl, 'image/asteoride1.jpg'),
    loadTexture(gl, 'image/asteoride2.jpg')
];
const asteroidData = createSphere(10, 10);
const asteroidBuffers = initBuffers(gl, asteroidData);

const numAsteroids = 500;
const asteroids = [];

const asteroidBeltInnerRadius = marsOrbitRadius + 2.0;
const asteroidBeltOuterRadius = jupiterOrbitRadius - 2.0;

for (let i = 0; i < numAsteroids; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = asteroidBeltInnerRadius + Math.random() * (asteroidBeltOuterRadius - asteroidBeltInnerRadius);
    const size = 0.05 + Math.random() * 0.1;  

    asteroids.push({
        angle: angle,
        radius: radius,
        size: size,
        texture: asteroidTextures[Math.floor(Math.random() * asteroidTextures.length)]
    });
}

let speedMultiplier = 1.0;

document.getElementById('speedSlider').addEventListener('input', function(event) {
    speedMultiplier = event.target.value;
});

function render(now) {
    now *= 0.001;  
    const deltaTime = now - then;
    then = now;

    sunRotationAngle += sunRotationSpeed * deltaTime * speedMultiplier;

    mercuryOrbitAngle += mercuryOrbitSpeed * deltaTime * speedMultiplier;
    mercuryRotationAngle += mercuryRotationSpeed * deltaTime * speedMultiplier;

    venusOrbitAngle += venusOrbitSpeed * deltaTime * speedMultiplier;
    venusRotationAngle += venusRotationSpeed * deltaTime * speedMultiplier;

    earthOrbitAngle += earthOrbitSpeed * deltaTime * speedMultiplier;
    earthRotationAngle += earthRotationSpeed * deltaTime * speedMultiplier;

    marsOrbitAngle += marsOrbitSpeed * deltaTime * speedMultiplier;
    marsRotationAngle += marsRotationSpeed * deltaTime * speedMultiplier;

    jupiterOrbitAngle += jupiterOrbitSpeed * deltaTime * speedMultiplier;
    jupiterRotationAngle += jupiterRotationSpeed * deltaTime * speedMultiplier;

    saturnOrbitAngle += saturnOrbitSpeed * deltaTime * speedMultiplier;
    saturnRotationAngle += saturnRotationSpeed * deltaTime * speedMultiplier;

    uranusOrbitAngle += uranusOrbitSpeed * deltaTime * speedMultiplier;
    uranusRotationAngle += uranusRotationSpeed * deltaTime * speedMultiplier;

    neptuneOrbitAngle += neptuneOrbitSpeed * deltaTime * speedMultiplier;
    neptuneRotationAngle += neptuneRotationSpeed * deltaTime * speedMultiplier;

    
    moonOrbitAngle += moonOrbitSpeed * deltaTime * speedMultiplier;
    moonRotationAngle += moonRotationSpeed * deltaTime * speedMultiplier;

    
    for (const asteroid of asteroids) {
        asteroid.angle += 0.0001 * deltaTime * speedMultiplier;  // Slow orbit for asteroids
    }

    drawScene(); // Redraw the scene

    requestAnimationFrame(render); // Continue to animate the frame
}

function createRealisticRing(innerRadius, outerRadius, segments, rings) {
    const positions = [];
    const textureCoords = [];
    const indices = [];

    const step = 2 * Math.PI / segments;
    const ringStep = (outerRadius - innerRadius) / rings;

    for (let r = 0; r <= rings; r++) {
        const radius = innerRadius + r * ringStep;
        for (let i = 0; i <= segments; i++) {
            const angle = i * step;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            positions.push(x, 0.0, z);
            textureCoords.push(i / segments, r / rings);

            if (r < rings && i < segments) {
                const first = r * (segments + 1) + i;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
    }

    return {
        position: positions,
        textureCoord: textureCoords,
        indices: indices,
    };
}

function drawRing(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix) {
    gl.useProgram(programInfo.program);

    // Bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

function createBackgroundSphere(latitudeBands, longitudeBands) {
    const positions = [];
    const normals = [];
    const textureCoords = [];
    const indices = [];

    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            const u = 1 - (longNumber / longitudeBands);
            const v = 1 - (latNumber / latitudeBands);

            normals.push(-x);  // Inverted normals
            normals.push(-y);
            normals.push(-z);
            textureCoords.push(u);
            textureCoords.push(v);
            positions.push(x);
            positions.push(y);
            positions.push(z);
        }
    }



    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return {
        position: positions,
        normal: normals,
        textureCoord: textureCoords,
        indices: indices,
    };
}

function drawBackground(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix) {
    gl.useProgram(programInfo.program);

    // Bind the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

function drawPlanet(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix, sunPosition, scale, rotationAngle, emissionColor) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    const modelViewMatrixCopy = mat4.clone(modelViewMatrix);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationAngle, [0, 1, 0]); // Apply self-rotation
    mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);

    // Calculate normal matrix
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.uNormalMatrix, false, normalMatrix);
    gl.uniform3fv(programInfo.uniformLocations.uSunPosition, sunPosition);
    gl.uniform3fv(programInfo.uniformLocations.uEmissionColor, emissionColor); // Apply emission color

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
        const vertexCount = buffers.vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    mat4.copy(modelViewMatrix, modelViewMatrixCopy);
}

function drawCircle(gl, orbitProgramInfo, buffer, modelViewMatrix, projectionMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
    gl.vertexAttribPointer(orbitProgramInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(orbitProgramInfo.attribLocations.vertexPosition);

    gl.useProgram(orbitProgramInfo.program);

    gl.uniformMatrix4fv(orbitProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(orbitProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.drawArrays(gl.LINE_LOOP, 0, buffer.vertexCount);
}

function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);//Set background color
    gl.clearDepth(1.0);//Clear depth buffer
    gl.enable(gl.DEPTH_TEST);//Enable depth test
    gl.depthFunc(gl.LEQUAL);//Near is less than far
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//Clear color and depth buffer.

    const fieldOfView = 45 * Math.PI / 180;//45 degrees field of view
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;//Aspect ratio of the viewport
    const zNear = 0.1;//Near view
    const zFar = 100.0;//Far view
    const projectionMatrix = mat4.create();//Projection matrix
    
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);//Perspective
    
    const modelViewMatrix = mat4.create();//View matrix

    // Calculate camera position relative to sun (center)
    const sunPosition = [0.0, 0.0, 0.0];//Assuming sun is at the center for simplicity

    const cameraX = sunPosition[0] + cameraDistance * Math.sin(cameraLongitudeAngle) * Math.cos(cameraLatitudeAngle);
    const cameraY = sunPosition[1] + cameraDistance * Math.sin(cameraLatitudeAngle);
    const cameraZ = sunPosition[2] + cameraDistance * Math.cos(cameraLongitudeAngle) * Math.cos(cameraLatitudeAngle);

    mat4.lookAt(modelViewMatrix, [cameraX, cameraY, cameraZ], sunPosition, [0, 1, 0]);

    // Draw the background sphere first
    const modelViewMatrixBackground = mat4.clone(modelViewMatrix);
    mat4.scale(modelViewMatrixBackground, modelViewMatrixBackground, [50, 50, 50]);  // Scale the background sphere to enclose the entire scene
    drawBackground(gl, backgroundProgramInfo, backgroundBuffers, backgroundTexture, modelViewMatrixBackground, projectionMatrix);

    // Draw the orbit of Mercury
    const mercuryCircleData = createCircle(mercuryOrbitRadius, 100);  // Adjust radius based on Mercury's distance from the Sun
    const mercuryCircleBuffer = initCircleBuffer(gl, mercuryCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, mercuryCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Venus
    const venusCircleData = createCircle(venusOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const venusCircleBuffer = initCircleBuffer(gl, venusCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, venusCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Earth
    const earthCircleData = createCircle(earthOrbitRadius, 100);  // Adjust radius based on Earth's distance from the Sun
    const earthCircleBuffer = initCircleBuffer(gl, earthCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, earthCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Mars
    const marsCircleData = createCircle(marsOrbitRadius, 100);  // Adjust radius based on Mars's distance from the Sun
    const marsCircleBuffer = initCircleBuffer(gl, marsCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, marsCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Jupiter
    const jupiterCircleData = createCircle(jupiterOrbitRadius, 100);  // Adjust radius based on Jupiter's distance from the Sun
    const jupiterCircleBuffer = initCircleBuffer(gl, jupiterCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, jupiterCircleBuffer, modelViewMatrix, projectionMatrix);
    
    // Draw the orbit of Saturn
    const saturnCircleData = createCircle(saturnOrbitRadius, 100);  // Adjust radius based on Saturn's distance from the Sun
    const saturnCircleBuffer = initCircleBuffer(gl, saturnCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, saturnCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Uranus
    const uranusCircleData = createCircle(uranusOrbitRadius, 100);  // Adjust radius based on Uranus's distance from the Sun
    const uranusCircleBuffer = initCircleBuffer(gl, uranusCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, uranusCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Neptune
    const neptuneCircleData = createCircle(neptuneOrbitRadius, 100);  // Adjust radius based on Neptune's distance from the Sun
    const neptuneCircleBuffer = initCircleBuffer(gl, neptuneCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, neptuneCircleBuffer, modelViewMatrix, projectionMatrix);

    // Transform the sun position using the model view matrix
    const sunPositionTransformed = vec3.transformMat4(vec3.create(), sunPosition, modelViewMatrix);
    gl.uniform3fv(programInfo.uniformLocations.uSunPosition, sunPositionTransformed);

    const modelViewMatrixSun = mat4.clone(modelViewMatrix);
    mat4.rotate(modelViewMatrixSun, modelViewMatrixSun, sunRotationAngle, [0, 1, 0]);  // Rotate the sun around its Y axis

    drawPlanet(gl, programInfo, sunBuffers, sunTexture, modelViewMatrixSun, projectionMatrix, sunPositionTransformed, 2.0, 0.0, sphereEmissionColor);  // Sphere size, no additional rotation, yellow emission


    // Draw Mercury without emission
    const mercuryPosition = [
        mercuryOrbitRadius * Math.cos(mercuryOrbitAngle),
        0.0,
        mercuryOrbitRadius * Math.sin(mercuryOrbitAngle)
    ];  // Calculate Mercury's position

    const modelViewMatrixMercury = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixMercury, modelViewMatrixMercury, mercuryPosition);  // Translate Mercury to its position

    drawPlanet(gl, programInfo, mercuryBuffers, mercuryTexture, modelViewMatrixMercury, projectionMatrix, sunPositionTransformed, 0.2, mercuryRotationAngle, mercuryEmissionColor);  // Smaller size for Mercury, apply rotation, grey emission

    // Draw Venus without emission
    const venusPosition = [
        venusOrbitRadius * Math.cos(venusOrbitAngle),
        0.0,
        venusOrbitRadius * Math.sin(venusOrbitAngle)
    ];  // Calculate Venus's position

    const modelViewMatrixVenus = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixVenus, modelViewMatrixVenus, venusPosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, venusBuffers, venusTexture, modelViewMatrixVenus, projectionMatrix, sunPositionTransformed, 0.3, venusRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission

    // Draw Earth without emission
    const earthPosition = [
        earthOrbitRadius * Math.cos(earthOrbitAngle),
        0.0,
        earthOrbitRadius * Math.sin(earthOrbitAngle)
    ];  // Calculate Earth's position

    const modelViewMatrixEarth = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixEarth, modelViewMatrixEarth, earthPosition);  // Translate Earth to its position

    drawPlanet(gl, programInfo, earthBuffers, earthTexture, modelViewMatrixEarth, projectionMatrix, sunPositionTransformed, 0.4, earthRotationAngle, mercuryEmissionColor);  // Adjust size for Earth, apply rotation, grey emission

    // Draw the Moon
    const moonPosition = [
        moonOrbitRadius * Math.cos(moonOrbitAngle),
        0.0,
        moonOrbitRadius * Math.sin(moonOrbitAngle)
    ];  // Calculate Moon's position relative to Earth

    const modelViewMatrixMoon = mat4.clone(modelViewMatrixEarth);
    mat4.translate(modelViewMatrixMoon, modelViewMatrixMoon, moonPosition);  // Translate Moon to its position
    drawPlanet(gl, programInfo, moonBuffers, moonTexture, modelViewMatrixMoon, projectionMatrix, sunPositionTransformed, 0.1, moonRotationAngle, mercuryEmissionColor);  // Draw Moon
    
    // Draw Mars without emission
    const marsPosition = [
        marsOrbitRadius * Math.cos(marsOrbitAngle),
        0.0,
        marsOrbitRadius * Math.sin(marsOrbitAngle)
    ];  // Calculate Mars's position

    const modelViewMatrixMars = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixMars, modelViewMatrixMars, marsPosition);  // Translate Mars to its position

    drawPlanet(gl, programInfo, marsBuffers, marsTexture, modelViewMatrixMars, projectionMatrix, sunPositionTransformed, 0.4, marsRotationAngle, mercuryEmissionColor);  // Adjust size for Mars, apply rotation, grey emission

    // Draw Jupiter without emission
    const jupiterPosition = [
        jupiterOrbitRadius * Math.cos(jupiterOrbitAngle),
        0.0,
        jupiterOrbitRadius * Math.sin(jupiterOrbitAngle)
    ];  // Calculate Jupiter's position

    const modelViewMatrixJupiter = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixJupiter, modelViewMatrixJupiter, jupiterPosition);  // Translate Jupiter to its position

    drawPlanet(gl, programInfo, jupiterBuffers, jupiterTexture, modelViewMatrixJupiter, projectionMatrix, sunPositionTransformed, 0.7, jupiterRotationAngle, mercuryEmissionColor);  // Adjust size for Jupiter, apply rotation, grey emission

    // Draw Saturn
    const saturnPosition = [
        saturnOrbitRadius * Math.cos(saturnOrbitAngle),
        0.0,
        saturnOrbitRadius * Math.sin(saturnOrbitAngle)
    ];  // Calculate Saturn's position

    const modelViewMatrixSaturn = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixSaturn, modelViewMatrixSaturn, saturnPosition);  // Translate Saturn to its position
    drawPlanet(gl, programInfo, saturnBuffers, saturnTexture, modelViewMatrixSaturn, projectionMatrix, sunPositionTransformed, 0.6, saturnRotationAngle, mercuryEmissionColor);  // Draw Saturn

    // Draw Saturn's ring
    const modelViewMatrixRing = mat4.clone(modelViewMatrixSaturn);  
    drawRing(gl, programInfo, saturnRingBuffers, saturnRingTexture, modelViewMatrixRing, projectionMatrix);  // Draw Saturn's ring
    
    // Draw Uranus without emission
    const uranusPosition = [
        uranusOrbitRadius * Math.cos(uranusOrbitAngle),
        0.0,
        uranusOrbitRadius * Math.sin(uranusOrbitAngle)
    ];  // Calculate Uranus's position

    const modelViewMatrixUranus = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixUranus, modelViewMatrixUranus, uranusPosition);  // Translate Uranus to its position

    drawPlanet(gl, programInfo, uranusBuffers, uranusTexture, modelViewMatrixUranus, projectionMatrix, sunPositionTransformed, 0.5, uranusRotationAngle, mercuryEmissionColor);  // Adjust size for Uranus, apply rotation, grey emission

    // Draw Neptune without emission
    const neptunePosition = [
        neptuneOrbitRadius * Math.cos(neptuneOrbitAngle),
        0.0,
        neptuneOrbitRadius * Math.sin(neptuneOrbitAngle)
    ];  // Calculate Neptune's position

    const modelViewMatrixNeptune = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixNeptune, modelViewMatrixNeptune, neptunePosition);  // Translate Neptune to its position

    drawPlanet(gl, programInfo, neptuneBuffers, neptuneTexture, modelViewMatrixNeptune, projectionMatrix, sunPositionTransformed, 0.5, neptuneRotationAngle, mercuryEmissionColor);  // Adjust size for Neptune, apply rotation, grey emission

    // Draw the asteroid belt
    for (const asteroid of asteroids) {
        const asteroidPosition = [
            asteroid.radius * Math.cos(asteroid.angle),
            0.0,
            asteroid.radius * Math.sin(asteroid.angle)
        ];

        const modelViewMatrixAsteroid = mat4.clone(modelViewMatrix);
        mat4.translate(modelViewMatrixAsteroid, modelViewMatrixAsteroid, asteroidPosition);
        drawPlanet(gl, programInfo, asteroidBuffers, asteroid.texture, modelViewMatrixAsteroid, projectionMatrix, sunPositionTransformed, asteroid.size, 0, mercuryEmissionColor);  // Draw each asteroid
    }
}

function drawOrbit(radius) {
    const circleData = createCircle(radius, 100);  // Adjust radius based on the planet's distance from the Sun
    const circleBuffer = initCircleBuffer(gl, circleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, circleBuffer, modelViewMatrix, projectionMatrix);
}

function drawPlanetInOrbit(orbitRadius, orbitAngle, rotationAngle, buffers, texture, scale, emissionColor) {
    const planetPosition = [
        orbitRadius * Math.cos(orbitAngle),
        0.0,
        orbitRadius * Math.sin(orbitAngle)
    ];  // Calculate planet's position

    const modelViewMatrixPlanet = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixPlanet, modelViewMatrixPlanet, planetPosition);  // Translate planet to its position

    drawPlanet(gl, programInfo, buffers, texture, modelViewMatrixPlanet, projectionMatrix, sunPositionTransformed, scale, rotationAngle, emissionColor);  // Draw planet with the given parameters
}


function createCircle(radius, segments) {
    const positions = [];
    const step = 2 * Math.PI / segments;

    for (let i = 0; i <= segments; i++) {
        const angle = i * step;
        positions.push(radius * Math.cos(angle));
        positions.push(0.0);
        positions.push(radius * Math.sin(angle));
    }

    return {
        position: positions,
    };
}

function initCircleBuffer(gl, data) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        vertexCount: data.position.length / 3,
    };
}

function createSphere(latitudeBands, longitudeBands) {
    const positions = [];
    const normals = [];
    const textureCoords = [];
    const indices = [];

    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            const u = 1 - (longNumber / longitudeBands);
            const v = 1 - (latNumber / latitudeBands);

            normals.push(x);
            normals.push(y);
            normals.push(z);
            textureCoords.push(u);
            textureCoords.push(v);
            positions.push(x);
            positions.push(y);
            positions.push(z);
        }
    }

    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    return {
        position: positions,
        normal: normals,
        textureCoord: textureCoords,
        indices: indices,
    };
}

function initBuffers(gl, data) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normal), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textureCoord), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: data.indices.length,
    };
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Impossibile inizializzare il programma shader:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Errore durante la compilazione del shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function updateMercuryOrbitRadius(newRadius) {
    mercuryOrbitRadius = newRadius;
    drawScene();
}

requestAnimationFrame(render);