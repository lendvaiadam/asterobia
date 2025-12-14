# World Modul Dokumentáció

> **Fájlok:** Planet.js, Terrain.js, FogOfWar.js, RockSystem.js, RockMeshGenerator.js
> 
> Procedurális bolygó generálás, víz, köd és szikla rendszerek.

---

## 📦 Terrain.js (203 sor)

Procedurális terep generálás simplex noise-zal.

### Konfiguráció

```javascript
this.params = {
    seed: 'rts-planet',
    radius: 60,                // Bolygó alap sugár
    detail: 50,                // Mesh részletesség
    heightMultiplier: 6.0,     // Terep amplitúdó
    waterLevel: 1.5,           // Vízszint (radius felett)
    
    // Színek (height gradient)
    colorLowest: 0x001a33,     // Mélyvíz/abyss
    heightLowest: -3.0,        // Min magasság
    colorWater: 0x3d7faa,      // Sekély víz
    heightWater: -1.0,         // Vízfelszín
    colorMid: 0x4a7c2e,        // Fű/erdő
    heightMid: 1.0,            // Közép magasság
    colorHighest: 0xffffff,    // Hó/csúcs
    heightPeak: 5.0,           // Max magasság
    
    // Noise layers
    noiseType: 'ridged',       // ridged / billow / standard
    domainWarpStrength: 0.0,   // Deformáció erősség
    continentScale: 0.6,       // Nagy földrész skála
    continentStrength: 0.0,    // Kontinens hatás
    mountainScale: 3.0,        // Hegy noise skála
    mountainStrength: 0.5,     // Hegy amplitúdó
    detailScale: 2.5,          // Finom részlet skála
    detailStrength: 0.5,       // Részlet amplitúdó
    ridgePower: 1.5,           // Ridged noise élesség
    erosionStrength: 0.05,     // Erózió szimuláció
};
```

### Magasság Számítás

```javascript
getHeight(x, y, z) {
    // 1. Domain Warping (opcionális deformáció)
    const warped = this.applyDomainWarp(x, y, z);
    
    // 2. Multi-layer noise
    const continent = this.sampleNoise(warped.x, warped.y, warped.z, 
        this.params.continentScale, 3, 0.5) * this.params.continentStrength;
    
    const mountains = this.sampleNoise(warped.x, warped.y, warped.z,
        this.params.mountainScale, 5, 0.5) * this.params.mountainStrength;
    
    const detail = this.sampleNoise(x, y, z,
        this.params.detailScale, 3, 0.4) * this.params.detailStrength;
    
    // 3. Combine + erosion
    let height = continent + mountains * 0.5 + detail;
    const erosion = this.params.erosionStrength;
    height = height * (1 - erosion) + 
        Math.sign(height) * Math.pow(Math.abs(height), 1 + erosion * 0.5) * erosion;
    
    return height * this.params.heightMultiplier;
}

// Sugár lekérdezés adott irányban
getRadiusAt(direction) {
    return this.params.radius + this.getHeight(direction.x, direction.y, direction.z);
}
```

### Noise Típusok

```javascript
sampleNoise(x, y, z, scale, octaves = 4, persistence = 0.5) {
    let value = 0, amplitude = 1, frequency = scale, maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        let sample = this.noise3D(x * frequency, y * frequency, z * frequency);
        
        // RIDGED: Éles gerincek (hegyek)
        if (this.params.noiseType === 'ridged') {
            sample = 1 - Math.abs(sample);
            sample = Math.pow(sample, this.params.ridgePower);
        }
        // BILLOW: Lekerekített dombok
        else if (this.params.noiseType === 'billow') {
            sample = Math.abs(sample) * 2 - 1;
        }
        
        value += sample * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }
    
    return value / maxValue;
}
```

### Biome Színek

```javascript
getBiomeColor(height, moisture, temperature, slope) {
    const smoothstep = (edge0, edge1, x) => {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    };
    
    const lowestColor = new THREE.Color(this.params.colorLowest);
    const waterColor = new THREE.Color(this.params.colorWater);
    const midColor = new THREE.Color(this.params.colorMid);
    const highestColor = new THREE.Color(this.params.colorHighest);
    
    // Height-based lerp
    if (height < this.params.heightWater) {
        const t = smoothstep(this.params.heightLowest, this.params.heightWater, height);
        return lowestColor.lerp(waterColor, t);
    } else if (height < this.params.heightMid) {
        const t = smoothstep(this.params.heightWater, this.params.heightMid, height);
        return waterColor.lerp(midColor, t);
    } else {
        const t = smoothstep(this.params.heightMid, this.params.heightPeak, height);
        return midColor.lerp(highestColor, t);
    }
}
```

### Normál Számítás

```javascript
getNormalAt(position) {
    const epsilon = 0.01;
    const normal = position.clone().normalize();
    
    // Tangent vektorok kiszámítása
    let tangent1 = new THREE.Vector3(0, 1, 0).cross(normal);
    if (tangent1.lengthSq() < 0.001) 
        tangent1 = new THREE.Vector3(1, 0, 0).cross(normal);
    tangent1.normalize();
    
    const tangent2 = normal.clone().cross(tangent1).normalize();
    
    // Szomszédos pontok
    const p1Dir = position.clone().add(tangent1.clone().multiplyScalar(epsilon)).normalize();
    const p2Dir = position.clone().add(tangent2.clone().multiplyScalar(epsilon)).normalize();
    
    const v0 = normal.clone().multiplyScalar(this.getRadiusAt(normal));
    const v1 = p1Dir.clone().multiplyScalar(this.getRadiusAt(p1Dir));
    const v2 = p2Dir.clone().multiplyScalar(this.getRadiusAt(p2Dir));
    
    // Cross product = normál
    const edge1 = v1.clone().sub(v0);
    const edge2 = v2.clone().sub(v0);
    
    return edge1.clone().cross(edge2).normalize();
}
```

---

## 📦 Planet.js

A bolygó mesh-ek és víz shader létrehozása.

```javascript
export class Planet {
    constructor() {
        this.terrain = new Terrain();
        
        // 1. TEREP MESH
        const geometry = new THREE.IcosahedronGeometry(
            this.terrain.params.radius,
            this.terrain.params.detail
        );
        
        // Vertex-ek deformálása height alapján
        const positions = geometry.attributes.position;
        const colors = [];
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const dir = new THREE.Vector3(x, y, z).normalize();
            const height = this.terrain.getHeight(dir.x, dir.y, dir.z);
            const radius = this.terrain.params.radius + height;
            
            positions.setXYZ(i, dir.x * radius, dir.y * radius, dir.z * radius);
            
            // Vertex color
            const color = this.terrain.getBiomeColor(height, 0, 0, 0);
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        
        this.mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.9,
            metalness: 0.1
        }));
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // 2. VÍZ MESH (külön shader)
        this.createWaterMesh();
        
        // 3. STARFIELD (csillagok a vízen tükröződve)
        this.createStarField();
    }
}
```

### Víz Shader (csillag tükröződés)

```javascript
createWaterMesh() {
    const waterGeometry = new THREE.IcosahedronGeometry(
        this.terrain.params.radius + this.terrain.params.waterLevel,
        30
    );
    
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uWaterColor: { value: new THREE.Color(0x1a4e6e) },
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            void main() {
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vNormal = normalMatrix * normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uWaterColor;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            
            // Star reflection
            float starPattern(vec2 uv) {
                vec2 cell = floor(uv * 100.0);
                float hash = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
                
                if (hash > 0.85) { // 15% density
                    vec2 cellUV = fract(uv * 100.0) - 0.5;
                    float dist = length(cellUV);
                    float starSize = 0.08 + hash * 0.05;
                    return smoothstep(starSize, 0.0, dist);
                }
                return 0.0;
            }
            
            void main() {
                // UV from sphere position
                vec3 dir = normalize(vWorldPosition);
                float u = 0.5 + atan(dir.z, dir.x) / (2.0 * 3.14159);
                float v = 0.5 + asin(dir.y) / 3.14159;
                
                // Animated ripples
                vec2 rippleUV = vec2(u, v) * 20.0 + uTime * 0.1;
                float ripple = sin(rippleUV.x * 10.0) * sin(rippleUV.y * 10.0) * 0.02;
                
                // Stars on water surface
                float stars = starPattern(vec2(u + ripple, v));
                
                vec3 finalColor = uWaterColor + stars * 0.8;
                gl_FragColor = vec4(finalColor, 0.7);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
}
```

---

## 📦 FogOfWar.js

Render target alapú Fog of War rendszer.

```javascript
export class FogOfWar {
    constructor(renderer, planetRadius) {
        this.renderer = renderer;
        this.planetRadius = planetRadius;
        
        // Render targets (explored vs visible)
        this.exploredTarget = new THREE.WebGLRenderTarget(512, 512);
        this.visibleTarget = new THREE.WebGLRenderTarget(512, 512);
        
        // FOW camera (orthographic, top-down UV projection)
        this.fowCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    }
    
    updateVisibility(position, radius) {
        // Rajzol egy kört az exploredTarget-re
        // A terrain shader ezt UV-ként olvassa
    }
}
```

---

## 📦 RockSystem.js (256 sor)

Sziklák elhelyezése a bolygón.

```javascript
export class RockSystem {
    constructor(game, planet) {
        this.game = game;
        this.planet = planet;
        this.rocks = [];
        this.rockGroup = new THREE.Group();
        
        this.params = {
            count: 40,
            seed: 12345,
            minScale: 1.0,
            maxScale: 3.0,
            radius: 1.2,
            detail: 2
        };
        
        // Material with FOW integration
        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Shader injection for FOW
        this.material.onBeforeCompile = (shader) => {
            shader.uniforms.uFogTexture = { value: this.game.fogOfWar.exploredTarget.texture };
            // ... fragment shader modification ...
        };
    }
    
    generateRocks() {
        // Clear existing
        this.rocks = [];
        
        // Seeded random
        const rng = seedRandom(this.params.seed);
        
        for (let i = 0; i < this.params.count; i++) {
            // Random position on sphere
            const u = rng();
            const v = rng();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            const dir = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            );
            
            // Terrain height at position
            const terrainRadius = this.planet.terrain.getRadiusAt(dir);
            
            // Generate unique rock mesh
            const scaleVal = this.params.minScale + rng() * (this.params.maxScale - this.params.minScale);
            const { geometry } = this.generator.generate({ radius: this.params.radius, detail: this.params.detail });
            
            const mesh = new THREE.Mesh(geometry, this.material);
            
            // Position (sunk slightly into ground)
            const sinkDepth = scaleVal * 0.15;
            mesh.position.copy(dir.clone().multiplyScalar(terrainRadius - sinkDepth));
            
            // Align to surface normal
            const up = mesh.position.clone().normalize();
            const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
            mesh.quaternion.copy(quaternion);
            
            // Random rotation
            mesh.rotateY(rng() * Math.PI * 2);
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // CONTACT SHADOW (blob under rock)
            // ... shader material for soft shadow ...
            
            this.rockGroup.add(mesh);
            this.rocks.push(mesh);
        }
    }
}
```

---

## 🔗 Kapcsolatok

```
Planet
├── Terrain (height/normal/color calculations)
├── mesh (deformed icosahedron)
├── waterMesh (shader with star reflections)
└── starField

RockSystem
├── rocks[] (mesh references for collision)
├── generator (RockMeshGenerator)
└── FOW shader integration

FogOfWar
└── exploredTarget, visibleTarget (render textures)
```

---

*Generálva: 2024-12-13*
