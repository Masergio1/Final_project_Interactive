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


// Fragment shader source (updated with float precision)
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
        uEmissionColor: gl.getUniformLocation(shaderProgram, 'uEmissionColor'),  // New uniform for light emission
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

const backgroundTexture = loadTexture(gl, 'image/2k_stars_milky_way.jpg');  // Path to your background texture
const backgroundData = createBackgroundSphere(50, 50);  // Create the background sphere data
const backgroundBuffers = initBuffers(gl, backgroundData);  // Initialize the buffers for the background sphere

const sunData = createSphere(100, 100);  // Data for the Sun
const sunBuffers = initBuffers(gl, sunData);  // Buffers for the Sun
const sunTexture = loadTexture(gl, 'image/2k_sun.jpg');  // Texture for the Sun

const mercuryData = createSphere(50, 50);  // Data for Mercury
const mercuryBuffers = initBuffers(gl, mercuryData);  // Buffers for Mercury
const mercuryTexture = loadTexture(gl, 'image/2k_mercury.jpg');  // Placeholder texture for Mercury

const venusData = createSphere(50, 50);  // Data for Mercury
const venusBuffers = initBuffers(gl, venusData);  // Buffers for Mercury
const venusTexture = loadTexture(gl, 'image/2k_venus_surface.jpg');  // Placeholder texture for Mercury

const earthData = createSphere(50, 50);  // Data for Earth
const earthBuffers = initBuffers(gl, earthData);  // Buffers for Earth
const earthTexture = loadTexture(gl, 'image/2k_earth_daymap.jpg');  // Placeholder texture for Earth

const marsData = createSphere(50, 50);  // Data for Mars
const marsBuffers = initBuffers(gl, marsData);  // Buffers for Mars
const marsTexture = loadTexture(gl, 'image/2k_mars.jpg');  // Placeholder texture for Mars

const jupiterData = createSphere(50, 50);  // Data for Jupiter
const jupiterBuffers = initBuffers(gl, jupiterData);  // Buffers for Jupiter
const jupiterTexture = loadTexture(gl, 'image/2k_jupiter.jpg');  // Placeholder texture for Jupiter

const saturnData = createSphere(50, 50);  // Data for Saturn
const saturnBuffers = initBuffers(gl, saturnData);  // Buffers for Saturn
const saturnTexture = loadTexture(gl, 'image/2k_saturn.jpg');  // Placeholder texture for Saturn

const saturnRingTexture = loadTexture(gl, 'image/2k_saturn_ring_alpha.png');  // Path to your ring texture
const saturnRingInnerRadius = 0.8;
const saturnRingOuterRadius = 1.6;
const saturnRingSegments = 100;
const saturnRingData = createThinRing(saturnRingInnerRadius, saturnRingOuterRadius, saturnRingSegments);
const saturnRingBuffers = initBuffers(gl, saturnRingData);


const uranusData = createSphere(50, 50);  // Data for Uranus
const uranusBuffers = initBuffers(gl, uranusData);  // Buffers for Uranus
const uranusTexture = loadTexture(gl, 'image/2k_uranus.jpg');  // Placeholder texture for Uranus

const neptuneData = createSphere(50, 50);  // Data for Neptune
const neptuneBuffers = initBuffers(gl, neptuneData);  // Buffers for Neptune
const neptuneTexture = loadTexture(gl, 'image/2k_neptune.jpg');  // Placeholder texture for Neptune

const planetEmissionColor = [0.3, 0.3, 0.3];  // Grey color for planet emission
const sphereEmissionColor = [1.0, 1.0, 0.0];  // Yellow color for sphere emission
const mercuryEmissionColor = [0.3, 0.3, 0.3];  // Grey color for Mercury emission

// Variables for controlling camera rotation with mouse
let cameraLongitudeAngle = 0; // Angle around the sun in radians
let cameraLatitudeAngle = 0; // Angle above/below the equator in radians
const cameraDistance = 30.0; // Distance of the camera from the sun

const maxLatitudeAngle = Math.PI / 2 - 0.01; // Maximum angle to avoid the poles

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

    // Clamp the latitude angle to avoid reaching the poles
    cameraLatitudeAngle = Math.max(-maxLatitudeAngle, Math.min(maxLatitudeAngle, cameraLatitudeAngle));

    drawScene();
});

let then = 0;
let mercuryOrbitAngle = 135;  // Angle for Mercury's orbit around the Sun
let mercuryRotationAngle = 135;  // Angle for Mercury's self-rotation
let venusOrbitAngle = 35;  // Angle for Venus's orbit around the Sun
let venusRotationAngle = 35;  // Angle for Venus's self-rotation
let earthOrbitAngle = 180;  // Angle for Earth's orbit around the Sun
let earthRotationAngle = 180;  // Angle for Earth's self-rotation
let marsOrbitAngle = 285;  // Angle for Mars's orbit around the Sun
let marsRotationAngle = 285;  // Angle for Mars's self-rotation
let jupiterOrbitAngle = 100;  // Angle for Jupiter's orbit around the Sun
let jupiterRotationAngle = 100;  // Angle for Jupiter's self-rotation
let saturnOrbitAngle = 130;  // Angle for Saturn's orbit around the Sun
let saturnRotationAngle = 130;  // Angle for Saturn's self-rotation
let uranusOrbitAngle = 60;  // Angle for Uranus's orbit around the Sun
let uranusRotationAngle = 60;  // Angle for Uranus's self-rotation
let neptuneOrbitAngle = 85;  // Angle for Neptune's orbit around the Sun
let neptuneRotationAngle = 85;  // Angle for Neptune's self-rotation

const mercuryOrbitSpeed = 0.071;  // Speed of Mercury's orbit (radians per second)
const mercuryRotationSpeed = 0.107;  // Speed of Mercury's self-rotation (radians per second)

const venusOrbitSpeed = 0.035;  // Speed of Venus's orbit (radians per second)
const venusRotationSpeed = 0.002;  // Speed of Venus's self-rotation (radians per second)

const earthOrbitSpeed = 0.017;  // Speed of Earth's orbit (radians per second)
const earthRotationSpeed = 0.004;  // Speed of Earth's self-rotation (radians per second)

const marsOrbitSpeed = 0.009;  // Speed of Mars's orbit (radians per second)
const marsRotationSpeed = 0.006;  // Speed of Mars's self-rotation (radians per second)

const jupiterOrbitSpeed = 0.001;  // Speed of Jupiter's orbit (radians per second)
const jupiterRotationSpeed = 0.001;  // Speed of Jupiter's self-rotation (radians per second)

const saturnOrbitSpeed = 0.0005;  // Speed of Saturn's orbit (radians per second)
const saturnRotationSpeed = 0.0005;  // Speed of Saturn's self-rotation (radians per second)

const uranusOrbitSpeed = 0.0002;  // Speed of Uranus's orbit (radians per second)
const uranusRotationSpeed = 0.0008;  // Speed of Uranus's self-rotation (radians per second)

const neptuneOrbitSpeed = 0.0001;  // Speed of Neptune's orbit (radians per second)
const neptuneRotationSpeed = 0.0005;  // Speed of Neptune's self-rotation (radians per second)

let mercuryOrbitRadius = 1.38 * 2;  // Initial distance of Mercury from the Sun
let venusOrbitRadius = 2 * 2;  // Initial distance of Venus from the Sun
let earthOrbitRadius = 3 * 2;  // Initial distance of Earth from the Sun
let marsOrbitRadius = 4.4 * 2;  // Initial distance of Mars from the Sun
let jupiterOrbitRadius = 8.2 * 2;  // Initial distance of Jupiter from the Sun
let saturnOrbitRadius = 12.58 * 2;  // Initial distance of Saturn from the Sun
let uranusOrbitRadius = 15.14 * 2;  // Initial distance of Uranus from the Sun
let neptuneOrbitRadius = 20.28 * 2;  // Initial distance of Neptune from the Sun

function render(now) {
    now *= 0.001;  // Convert to seconds
    const deltaTime = now - then;
    then = now;

    // Update the angles for all planets' orbits and self-rotations
    mercuryOrbitAngle += mercuryOrbitSpeed * deltaTime;
    mercuryRotationAngle += mercuryRotationSpeed * deltaTime;

    venusOrbitAngle += venusOrbitSpeed * deltaTime;
    venusRotationAngle += venusRotationSpeed * deltaTime;

    earthOrbitAngle += earthOrbitSpeed * deltaTime;
    earthRotationAngle += earthRotationSpeed * deltaTime;

    marsOrbitAngle += marsOrbitSpeed * deltaTime;
    marsRotationAngle += marsRotationSpeed * deltaTime;

    jupiterOrbitAngle += jupiterOrbitSpeed * deltaTime;
    jupiterRotationAngle += jupiterRotationSpeed * deltaTime;

    saturnOrbitAngle += saturnOrbitSpeed * deltaTime;
    saturnRotationAngle += saturnRotationSpeed * deltaTime;

    uranusOrbitAngle += uranusOrbitSpeed * deltaTime;
    uranusRotationAngle += uranusRotationSpeed * deltaTime;

    neptuneOrbitAngle += neptuneOrbitSpeed * deltaTime;
    neptuneRotationAngle += neptuneRotationSpeed * deltaTime;

    drawScene(); // Redraw the scene

    requestAnimationFrame(render); // Continue to animate the frame
}

function createThinRing(innerRadius, outerRadius, segments) {
    const positions = [];
    const textureCoords = [];
    const indices = [];

    const step = 2 * Math.PI / segments;

    for (let i = 0; i <= segments; i++) {
        const angle = i * step;

        const xInner = innerRadius * Math.cos(angle);
        const zInner = innerRadius * Math.sin(angle);
        const xOuter = outerRadius * Math.cos(angle);
        const zOuter = outerRadius * Math.sin(angle);

        positions.push(xInner, 0.0, zInner);
        positions.push(xOuter, 0.0, zOuter);

        textureCoords.push(i / segments, 1.0);
        textureCoords.push(i / segments, 0.0);

        if (i < segments) {
            const first = i * 2;
            const second = first + 1;
            const third = first + 2;
            const fourth = first + 3;

            indices.push(first, second, third);
            indices.push(second, fourth, third);
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Set background color
    gl.clearDepth(1.0);  // Clear depth buffer
    gl.enable(gl.DEPTH_TEST);  // Enable depth test
    gl.depthFunc(gl.LEQUAL);  // Near is less than far
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffer.

    const fieldOfView = 45 * Math.PI / 180;   // 45 degrees field of view
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;  // Aspect ratio of the viewport
    const zNear = 0.1;  // Near view
    const zFar = 100.0;  // Far view
    const projectionMatrix = mat4.create();  // Projection matrix
    
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);  // Perspective
    
    const modelViewMatrix = mat4.create();  // View matrix

    // Calculate camera position relative to sun (center)
    const sunPosition = [0.0, 0.0, 0.0];  // Assuming sun is at the center for simplicity

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
    const earthCircleData = createCircle(earthOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const earthCircleBuffer = initCircleBuffer(gl, earthCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, earthCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Mars
    const marsCircleData = createCircle(marsOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const marsCircleBuffer = initCircleBuffer(gl, marsCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, marsCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Jupiter
    const jupiterCircleData = createCircle(jupiterOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const jupiterCircleBuffer = initCircleBuffer(gl, jupiterCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, jupiterCircleBuffer, modelViewMatrix, projectionMatrix);
    
    // Draw the orbit of Saturn
    const saturnCircleData = createCircle(saturnOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const saturnCircleBuffer = initCircleBuffer(gl, saturnCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, saturnCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Uranus
    const uranusCircleData = createCircle(uranusOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const uranusCircleBuffer = initCircleBuffer(gl, uranusCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, uranusCircleBuffer, modelViewMatrix, projectionMatrix);

    // Draw the orbit of Saturn
    const neptuneCircleData = createCircle(neptuneOrbitRadius, 100);  // Adjust radius based on Venus's distance from the Sun
    const neptuneCircleBuffer = initCircleBuffer(gl, neptuneCircleData);  // Initialize buffer with the new circle data
    drawCircle(gl, orbitProgramInfo, neptuneCircleBuffer, modelViewMatrix, projectionMatrix);

    // Transform the sun position using the model view matrix
    const sunPositionTransformed = vec3.transformMat4(vec3.create(), sunPosition, modelViewMatrix);
    gl.uniform3fv(programInfo.uniformLocations.uSunPosition, sunPositionTransformed);
    drawPlanet(gl, programInfo, sunBuffers, sunTexture, modelViewMatrix, projectionMatrix, sunPositionTransformed, 2.0, 0.0, sphereEmissionColor);  // Sphere size, no rotation, yellow emission

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
    ];  // Calculate Venus's position

    const modelViewMatrixearth = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixearth, modelViewMatrixearth, earthPosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, earthBuffers, earthTexture, modelViewMatrixearth, projectionMatrix, sunPositionTransformed, 0.4, earthRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission

    // Draw Mars without emission
    const marsPosition = [
        marsOrbitRadius * Math.cos(marsOrbitAngle),
        0.0,
        marsOrbitRadius * Math.sin(marsOrbitAngle)
    ];  // Calculate Venus's position

    const modelViewMatrixmars = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixmars, modelViewMatrixmars, marsPosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, marsBuffers, marsTexture, modelViewMatrixmars, projectionMatrix, sunPositionTransformed, 0.4, marsRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission

    // Draw Jupiter without emission
    const jupiterPosition = [
        jupiterOrbitRadius * Math.cos(jupiterOrbitAngle),
        0.0,
        jupiterOrbitRadius * Math.sin(jupiterOrbitAngle)
    ];  // Calculate Venus's position

    const modelViewMatrixjupiter = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixjupiter, modelViewMatrixjupiter, jupiterPosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, jupiterBuffers, jupiterTexture, modelViewMatrixjupiter, projectionMatrix, sunPositionTransformed, 0.7, jupiterRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission

    // Draw Saturn's ring
    const saturnPosition = [
        saturnOrbitRadius * Math.cos(saturnOrbitAngle),
        0.0,
        saturnOrbitRadius * Math.sin(saturnOrbitAngle)
    ];  // Calculate Saturn's position

    const modelViewMatrixSaturn = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixSaturn, modelViewMatrixSaturn, saturnPosition);  // Translate Saturn to its position
    drawPlanet(gl, programInfo, saturnBuffers, saturnTexture, modelViewMatrixSaturn, projectionMatrix, sunPosition, 0.6, saturnRotationAngle, mercuryEmissionColor);  // Draw Saturn

    const modelViewMatrixRing = mat4.clone(modelViewMatrixSaturn);
    mat4.rotate(modelViewMatrixRing, modelViewMatrixRing, Math.PI / 2, [1, 0, 0]);  // Rotate ring to be horizontal
    drawRing(gl, programInfo, saturnRingBuffers, saturnRingTexture, modelViewMatrixRing, projectionMatrix);  // Draw Saturn's ring

    // Draw Uranus without emission
    const uranusPosition = [
        uranusOrbitRadius * Math.cos(uranusOrbitAngle),
        0.0,
        uranusOrbitRadius * Math.sin(uranusOrbitAngle)
    ];  // Calculate Venus's position

    const modelViewMatrixuranus = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixuranus, modelViewMatrixuranus, uranusPosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, uranusBuffers, uranusTexture, modelViewMatrixuranus, projectionMatrix, sunPositionTransformed, 0.5, uranusRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission

    // Draw Neptune without emission
    const neptunePosition = [
        neptuneOrbitRadius * Math.cos(neptuneOrbitAngle),
        0.0,
        neptuneOrbitRadius * Math.sin(neptuneOrbitAngle)
    ];  // Calculate Venus's position

    const modelViewMatrixneptune = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrixneptune, modelViewMatrixneptune, neptunePosition);  // Translate Venus to its position

    drawPlanet(gl, programInfo, neptuneBuffers, neptuneTexture, modelViewMatrixneptune, projectionMatrix, sunPositionTransformed, 0.5, neptuneRotationAngle, mercuryEmissionColor);  // Adjust size for Venus, apply rotation, grey emission
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