// Get the canvas element and the WebGL context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

// Check if WebGL is supported
if (!gl) {
    console.error("WebGL is not supported by your browser.");
}

// Set the canvas resolution for high quality rendering
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;
gl.viewport(0, 0, canvas.width, canvas.height);

// Vertex shader source code
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

        // Pass texture coordinates and normal vector to the fragment shader
        vTextureCoord = aTextureCoord;
        vTransformedNormal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    }
`;

// Fragment shader source code
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

        // Calculate sunlight based on the angle between the normal and light direction
        highp float directional = max(dot(normal, surfaceToSun), 0.0);

        highp vec3 emissionLight = uEmissionColor;
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        // Combine the texture color with lighting effects
        highp vec3 finalColor = texelColor.rgb * (directional + emissionLight);
        gl_FragColor = vec4(finalColor, texelColor.a);
    }
`;

// Initialize the shader program by calling the initShaderProgram function with the WebGL context, 
//vertex shader source code (vsSource), and fragment shader source code (fsSource).
// The initShaderProgram function returns a shader program object that contains information about 
//the compiled shaders and their attribute and uniform locations.

// Create a shader program object and assign it to the shaderProgram variable.
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Define an object called programInfo that contains information about the shader program.
// The programInfo object has three properties: program, attribLocations, and uniformLocations.
// - The program property stores the shader program object.
// - The attribLocations property stores the attribute locations of the vertex position, vertex normal, 
//and texture coordinates.
// - The uniformLocations property stores the uniform locations of the projection matrix, model-view matrix,
// normal matrix, texture sampler, sun position, and emission color.
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

// Vertex shader source code for the orbit program
const orbitVertexShaderSource = `
attribute vec4 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
}
`;

// Fragment shader source code for the orbit program
const orbitFragmentShaderSource = `
void main(void) {
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}
`;

// Initialize the orbit shader program
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

// Vertex shader source code for the background
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

// Fragment shader source code for the background
const backgroundFsSource = `
    precision highp float;

    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;

// Initialize the background shader program
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

// Load textures for the background and planets
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

// Set emission colors for the planets and Sun
const planetEmissionColor = [0.3, 0.3, 0.3];
const sphereEmissionColor = [1.0, 1.0, 0.0];
const mercuryEmissionColor = [0.3, 0.3, 0.3];

// Set initial camera angles and distance
let cameraLongitudeAngle = 0;
let cameraLatitudeAngle = 0;
const cameraDistance = 30.0;

// Limit the camera latitude angle to prevent flipping
const maxLatitudeAngle = Math.PI / 2 - 0.01;

let lastMouseX = null;
let lastMouseY = null;
let dragging = false;

// Add event listeners for mouse interaction
canvas.addEventListener('mousedown', function(event) {
    dragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

canvas.addEventListener('mouseup', function(event) {
    dragging = false;
});

// In the first part, I check if the mouse has been clicked. If it has, I set the dragging variable to true 
//and save the mouse coordinates. Then, if the mouse is released, I set the dragging variable to false. Using 
//deltaX and deltaY, I calculate the difference between the current mouse position and the previous one. With
// rotationSpeed, I set the rotation speed of the camera. By updating the cameraLongitudeAngle, I adjust the 
// camera's longitude angle based on the mouse movement.
canvas.addEventListener('mousemove', function(event) {
    // Check if dragging is true
    if (!dragging) {
        return;
    }
    
    // Calculate the change in X and Y coordinates
    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    // Set the rotation speed of the camera
    const rotationSpeed = 0.01;

    // Update the camera longitude angle based on the mouse movement
    cameraLongitudeAngle += deltaX * rotationSpeed;

    // Set the latitude speed of the camera
    const latitudeSpeed = 0.01;

    // Update the camera latitude angle based on the mouse movement
    cameraLatitudeAngle -= deltaY * latitudeSpeed;

    // Limit the camera latitude angle to prevent flipping
    cameraLatitudeAngle = Math.max(-maxLatitudeAngle, Math.min(maxLatitudeAngle, cameraLatitudeAngle));

    // Redraw the scene with the updated camera angles
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

// Generate random asteroids and add them to the asteroids array
for (let i = 0; i < numAsteroids; i++) {
    // Generate a random angle between 0 and 2 * PI
    const angle = Math.random() * 2 * Math.PI;
    
    // Generate a random radius within the asteroid belt range
    const radius = asteroidBeltInnerRadius + Math.random() * (asteroidBeltOuterRadius - asteroidBeltInnerRadius);
    
    // Generate a random size for the asteroid
    const size = 0.05 + Math.random() * 0.1;
    
    // Select a random texture for the asteroid from the asteroidTextures array
    const texture = asteroidTextures[Math.floor(Math.random() * asteroidTextures.length)];
    
    // Create an asteroid object with the generated properties and add it to the asteroids array
    asteroids.push({
        angle: angle,
        radius: radius,
        size: size,
        texture: texture
    });
}

let speedMultiplier = 1.0;

// Add an event listener to the 'speedSlider' element to listen for changes in the input value
document.getElementById('speedSlider').addEventListener('input', function(event) {
    // Update the speedMultiplier variable with the new value from the slider
    speedMultiplier = event.target.value;
});

// Define a render function that will be called repeatedly to animate the scene
function render(now) {
    // Convert the current time to seconds
    now *= 0.001;  
    // Calculate the time difference between the current frame and the previous frame
    const deltaTime = now - then;
    // Update the previous frame time to the current frame time
    then = now;

    // Update the rotation angles for the sun and each planet based on the deltaTime and speedMultiplier
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

    // Update the angle for each asteroid in the asteroids array
    for (const asteroid of asteroids) {
        asteroid.angle += 0.01 * deltaTime * speedMultiplier;  // Slow orbit for asteroids
    }

    // Redraw the scene
    drawScene();

    // Request the next animation frame to continue the animation loop
    requestAnimationFrame(render);
}

// This function creates a realistic ring geometry with specified inner radius, 
// outer radius, number of segments, and number of rings
function createRealisticRing(innerRadius, outerRadius, segments, rings) {
    const positions = []; // An array to store the vertex positions of the ring
    const textureCoords = []; // An array to store the texture coordinates of the ring
    const indices = []; // An array to store the indices of the ring vertices

    const step = 2 * Math.PI / segments; // Calculate the angle step between each segment
    const ringStep = (outerRadius - innerRadius) / rings; // Calculate the distance step between each ring

    // Loop through each ring and segment to generate the ring vertices
    for (let r = 0; r <= rings; r++) {
        const radius = innerRadius + r * ringStep; // Calculate the radius of the current ring
        for (let i = 0; i <= segments; i++) {
            const angle = i * step; // Calculate the angle of the current segment
            const x = radius * Math.cos(angle); // Calculate the x-coordinate of the vertex
            const z = radius * Math.sin(angle); // Calculate the z-coordinate of the vertex

            positions.push(x, 0.0, z); // Add the vertex position to the positions array
            textureCoords.push(i / segments, r / rings); // Add the texture coordinates to the textureCoords array

            if (r < rings && i < segments) {
                const first = r * (segments + 1) + i; // Calculate the index of the first vertex of the current quad
                const second = first + segments + 1; // Calculate the index of the second vertex of the current quad

                indices.push(first, second, first + 1); // Add the indices of the first triangle of the quad
                indices.push(second, second + 1, first + 1); // Add the indices of the second triangle of the quad
            }
        }
    }

    // Return an object containing the positions, texture coordinates, and indices of the ring
    return {
        position: positions,
        textureCoord: textureCoords,
        indices: indices,
    };
}

// This function initializes the buffers for a realistic ring geometry
// with the specified inner radius, outer radius, number of segments, and number of rings
// The function returns an object containing the WebGL buffers for the ring geometry
// This function is responsible for drawing a ring in the WebGL context.
function drawRing(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix) {
    // Use the specified shader program
    gl.useProgram(programInfo.program);

    // Bind the position buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Bind the texture coordinate buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    // Bind the texture and set the uniform sampler
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Draw the ring using the specified vertex count, type, and offset
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

// This function creates a background sphere geometry with the specified number of latitude bands and longitude bands
function createBackgroundSphere(latitudeBands, longitudeBands) {
    const positions = []; // An array to store the vertex positions of the background sphere
    const normals = []; // An array to store the vertex normals of the background sphere
    const textureCoords = []; // An array to store the texture coordinates of the background sphere
    const indices = []; // An array to store the indices of the background sphere vertices

    // Loop through each latitude band and longitude band to generate the background sphere vertices
    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
        const theta = latNumber * Math.PI / latitudeBands; // Calculate the latitude angle
        const sinTheta = Math.sin(theta); // Calculate the sine of the latitude angle
        const cosTheta = Math.cos(theta); // Calculate the cosine of the latitude angle

        for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
            const phi = longNumber * 2 * Math.PI / longitudeBands; // Calculate the longitude angle
            const sinPhi = Math.sin(phi); // Calculate the sine of the longitude angle
            const cosPhi = Math.cos(phi); // Calculate the cosine of the longitude angle

            const x = cosPhi * sinTheta; // Calculate the x coordinate of the vertex
            const y = cosTheta; // Calculate the y coordinate of the vertex
            const z = sinPhi * sinTheta; // Calculate the z coordinate of the vertex
            const u = 1 - (longNumber / longitudeBands); // Calculate the u texture coordinate
            const v = 1 - (latNumber / latitudeBands); // Calculate the v texture coordinate

            normals.push(-x); // Store the inverted x component of the vertex normal
            normals.push(-y); // Store the inverted y component of the vertex normal
            normals.push(-z); // Store the inverted z component of the vertex normal
            textureCoords.push(u); // Store the u texture coordinate
            textureCoords.push(v); // Store the v texture coordinate
            positions.push(x); // Store the x coordinate of the vertex
            positions.push(y); // Store the y coordinate of the vertex
            positions.push(z); // Store the z coordinate of the vertex
        }
    }

    // Loop through each latitude band and longitude band to generate the indices of the background sphere vertices
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber; // Calculate the index of the first vertex of the quad
            const second = first + longitudeBands + 1; // Calculate the index of the second vertex of the quad
            indices.push(first); // Store the index of the first vertex of the quad
            indices.push(second); // Store the index of the second vertex of the quad
            indices.push(first + 1); // Store the index of the third vertex of the quad

            indices.push(second); // Store the index of the second vertex of the quad
            indices.push(second + 1); // Store the index of the fourth vertex of the quad
            indices.push(first + 1); // Store the index of the third vertex of the quad
        }
    }

    // Return an object containing the positions, normals, texture coordinates, and indices of the background sphere
    return {
        position: positions,
        normal: normals,
        textureCoord: textureCoords,
        indices: indices,
    };
}

// This function is responsible for drawing the background sphere in the WebGL context.
function drawBackground(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix) {
    // Use the specified shader program
    gl.useProgram(programInfo.program);

    // Bind the position buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Bind the texture coordinate buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    // Bind the texture and set the uniform sampler
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Draw the background sphere using the specified vertex count, type, and offset
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

// This function is responsible for drawing a planet in the WebGL context.
function drawPlanet(gl, programInfo, buffers, texture, modelViewMatrix, projectionMatrix, sunPosition, scale, rotationAngle, emissionColor) {
    // Bind the position buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Bind the normal buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

    // Bind the texture coordinate buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

    // Bind the index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Create a copy of the modelViewMatrix for self-rotation
    const modelViewMatrixCopy = mat4.clone(modelViewMatrix);

    // Apply self-rotation to the modelViewMatrix
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationAngle, [0, 1, 0]);

    // Apply scale to the modelViewMatrix
    mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);

    // Calculate the normal matrix for lighting calculations
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Use the specified shader program
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.uNormalMatrix, false, normalMatrix);
    gl.uniform3fv(programInfo.uniformLocations.uSunPosition, sunPosition);
    gl.uniform3fv(programInfo.uniformLocations.uEmissionColor, emissionColor);

    // Bind the texture and set the uniform sampler
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Draw the planet using the specified vertex count, type, and offset
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

    // Restore the original modelViewMatrix
    mat4.copy(modelViewMatrix, modelViewMatrixCopy);
}

// This function is responsible for drawing a circle in the WebGL context.
function drawCircle(gl, orbitProgramInfo, buffer, modelViewMatrix, projectionMatrix) {
    // Bind the position buffer and specify the vertex attribute pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
    gl.vertexAttribPointer(orbitProgramInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(orbitProgramInfo.attribLocations.vertexPosition);

    // Use the specified shader program
    gl.useProgram(orbitProgramInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(orbitProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(orbitProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    // Draw the circle using gl.LINE_LOOP primitive type
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

// This function creates a circle with the given radius and number of segments
function createCircle(radius, segments) {
    const positions = [];
    const step = 2 * Math.PI / segments;

    // Loop through each segment and calculate the position of each point on the circle
    for (let i = 0; i <= segments; i++) {
        const angle = i * step;
        positions.push(radius * Math.cos(angle)); // Calculate x-coordinate of the point
        positions.push(0.0); // Set y-coordinate of the point to 0
        positions.push(radius * Math.sin(angle)); // Calculate z-coordinate of the point
    }

    // Return an object containing the positions of the points on the circle
    return {
        position: positions,
    };
}

// This function initializes the buffer for the circle
function initCircleBuffer(gl, data) {
    const positionBuffer = gl.createBuffer(); // Create a buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Bind the buffer object to the ARRAY_BUFFER target
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), gl.STATIC_DRAW); // Fill the buffer with the position data

    // Return an object containing the buffer and the number of vertices in the circle
    return {
        position: positionBuffer,
        vertexCount: data.position.length / 3, // Divide the total number of positions by 3 to get the number of vertices
    };
}

// This function creates a sphere with the given number of latitude and longitude bands
function createSphere(latitudeBands, longitudeBands) {
    const positions = []; // Array to store the positions of the vertices
    const normals = []; // Array to store the normals of the vertices
    const textureCoords = []; // Array to store the texture coordinates of the vertices
    const indices = []; // Array to store the indices of the vertices

    // Loop through each latitude band
    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
        const theta = latNumber * Math.PI / latitudeBands; // Calculate the angle theta
        const sinTheta = Math.sin(theta); // Calculate the sine of theta
        const cosTheta = Math.cos(theta); // Calculate the cosine of theta

        // Loop through each longitude band
        for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
            const phi = longNumber * 2 * Math.PI / longitudeBands; // Calculate the angle phi
            const sinPhi = Math.sin(phi); // Calculate the sine of phi
            const cosPhi = Math.cos(phi); // Calculate the cosine of phi

            const x = cosPhi * sinTheta; // Calculate the x-coordinate of the vertex
            const y = cosTheta; // Calculate the y-coordinate of the vertex
            const z = sinPhi * sinTheta; // Calculate the z-coordinate of the vertex
            const u = 1 - (longNumber / longitudeBands); // Calculate the u-coordinate of the texture coordinate
            const v = 1 - (latNumber / latitudeBands); // Calculate the v-coordinate of the texture coordinate

            normals.push(x); // Add the x-coordinate of the normal to the normals array
            normals.push(y); // Add the y-coordinate of the normal to the normals array
            normals.push(z); // Add the z-coordinate of the normal to the normals array
            textureCoords.push(u); // Add the u-coordinate of the texture coordinate to the textureCoords array
            textureCoords.push(v); // Add the v-coordinate of the texture coordinate to the textureCoords array
            positions.push(x); // Add the x-coordinate of the position to the positions array
            positions.push(y); // Add the y-coordinate of the position to the positions array
            positions.push(z); // Add the z-coordinate of the position to the positions array
        }
    }

    // Loop through each latitude band (except the last one)
    for (let latNumber = 0; latNumber < latitudeBands; ++latNumber) {
        // Loop through each longitude band (except the last one)
        for (let longNumber = 0; longNumber < longitudeBands; ++longNumber) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber; // Calculate the index of the first vertex of the quad
            const second = first + longitudeBands + 1; // Calculate the index of the second vertex of the quad
            indices.push(first); // Add the index of the first vertex to the indices array
            indices.push(second); // Add the index of the second vertex to the indices array
            indices.push(first + 1); // Add the index of the next vertex to the indices array

            indices.push(second); // Add the index of the second vertex to the indices array
            indices.push(second + 1); // Add the index of the next vertex to the indices array
            indices.push(first + 1); // Add the index of the next vertex to the indices array
        }
    }

    // Return an object containing the positions, normals, texture coordinates, and indices of the vertices
    return {
        position: positions,
        normal: normals,
        textureCoord: textureCoords,
        indices: indices,
    };
}

// This function initializes the buffers for the WebGL context
function initBuffers(gl, data) {
    const positionBuffer = gl.createBuffer(); // Create a buffer object for the positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Bind the position buffer to the ARRAY_BUFFER target
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.position), gl.STATIC_DRAW); // Fill the position buffer with the position data

    const normalBuffer = gl.createBuffer(); // Create a buffer object for the normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); // Bind the normal buffer to the ARRAY_BUFFER target
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normal), gl.STATIC_DRAW); // Fill the normal buffer with the normal data

    const textureCoordBuffer = gl.createBuffer(); // Create a buffer object for the texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer); // Bind the texture coordinate buffer to the ARRAY_BUFFER target
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textureCoord), gl.STATIC_DRAW); // Fill the texture coordinate buffer with the texture coordinate data

    const indexBuffer = gl.createBuffer(); // Create a buffer object for the indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // Bind the index buffer to the ELEMENT_ARRAY_BUFFER target
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STATIC_DRAW); // Fill the index buffer with the index data

    return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: data.indices.length,
    };
}

// This function loads a texture from the given URL
function loadTexture(gl, url) {
    const texture = gl.createTexture(); // Create a texture object
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the TEXTURE_2D target

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel); // Set a default pixel for the texture

    const image = new Image(); // Create an image object
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the TEXTURE_2D target
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image); // Set the image as the texture

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D); // Generate mipmaps for the texture if the image dimensions are power of 2
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Set the texture wrap mode for S axis
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Set the texture wrap mode for T axis
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture minification filter
        }
    };
    image.src = url; // Set the image source to the given URL

    return texture;
}

// This function checks if a value is a power of 2
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

// This function initializes the shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource); // Load and compile the vertex shader
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // Load and compile the fragment shader

    const shaderProgram = gl.createProgram(); // Create a shader program object
    gl.attachShader(shaderProgram, vertexShader); // Attach the vertex shader to the shader program
    gl.attachShader(shaderProgram, fragmentShader); // Attach the fragment shader to the shader program
    gl.linkProgram(shaderProgram); // Link the shader program

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram)); // Log an error if the shader program failed to initialize
        return null;
    }

    return shaderProgram;
}

// This function loads and compiles a shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type); // Create a shader object
    gl.shaderSource(shader, source); // Set the shader source code
    gl.compileShader(shader); // Compile the shader

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader)); // Log an error if the shader failed to compile
        gl.deleteShader(shader); // Delete the shader object
        return null;
    }

    return shader;
}

// This function updates the orbit radius of Mercury
function updateMercuryOrbitRadius(newRadius) {
    mercuryOrbitRadius = newRadius; // Update the orbit radius of Mercury
    drawScene(); // Redraw the scene
}

requestAnimationFrame(render); // Start the rendering loop