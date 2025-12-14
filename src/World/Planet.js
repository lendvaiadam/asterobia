import * as THREE from 'three';
import { Terrain } from './Terrain.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export class Planet {
    constructor(scene) {
        this.scene = scene;
        this.terrain = new Terrain();
        this.meshResolution = 308;
        this.mesh = this.createMesh();
        this.mesh.receiveShadow = true;
        this.waterMesh = this.createWaterMesh();
        this.starField = this.createStarField(30000);
    }
    
    createWaterMesh() {
        const waterLevel = this.terrain.params.waterLevel;
        const waterRadius = this.terrain.params.radius + waterLevel;
        
        const geometry = new THREE.SphereGeometry(waterRadius, 64, 64);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x4488aa,
            transparent: true,
            opacity: 0.5,
            roughness: 0.1,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uFogTexture = { value: null };
            shader.uniforms.uVisibleTexture = { value: null };
            shader.uniforms.uUVScale = { value: new THREE.Vector2(1, 1) };
            shader.uniforms.uUVOffset = { value: new THREE.Vector2(0, 0) };
            shader.uniforms.uDebugMode = { value: 0 };
            shader.uniforms.uFowColor = { value: new THREE.Color(0x000000) };
            shader.uniforms.uStarDensity = { value: 0.85 }; // 0.5 = 50% dense, 0.95 = 5% sparse

            shader.fragmentShader = `
                uniform sampler2D uFogTexture;
                uniform sampler2D uVisibleTexture;
                uniform vec2 uUVScale;
                uniform vec2 uUVOffset;
                uniform int uDebugMode;
                uniform vec3 uFowColor;
                uniform float uStarDensity;
            ` + shader.fragmentShader;
            
            shader.vertexShader = `
                varying vec3 vWorldPosition;
            ` + shader.vertexShader;
            
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `
                #include <worldpos_vertex>
                vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                `
            );
            
            shader.fragmentShader = `
                varying vec3 vWorldPosition;
            ` + shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                vec3 dir = normalize(vWorldPosition); 
                float u = 0.5 + atan(dir.z, dir.x) / (2.0 * 3.14159265);
                float v = 0.5 + asin(dir.y) / 3.14159265;
                
                u = u * uUVScale.x + uUVOffset.x;
                v = v * uUVScale.y + uUVOffset.y;
                
                if (uDebugMode == 1) {
                    gl_FragColor = vec4(u, v, 0.0, 1.0);
                    return;
                }

                vec4 explored = texture2D(uFogTexture, vec2(u, v));
                vec4 visible = texture2D(uVisibleTexture, vec2(u, v));
                
                float isVisible = visible.r; 
                float isExplored = explored.r;
                
                if (uDebugMode == 2) {
                    gl_FragColor = vec4(isVisible, isExplored, 0.0, 1.0); 
                    return;
                }
                
                vec3 finalColor = gl_FragColor.rgb;
                
                if (isVisible > 0.1) {
                    // Visible - brighter, more vibrant water
                    finalColor = finalColor * 1.2;
                } else if (isExplored > 0.1) {
                    // Explored but not visible - darker "memory" with blue tint
                    float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
                    gray = pow(gray, 1.8); // Stronger contrast curve
                    vec3 desaturated = vec3(gray);
                    vec3 nightColor = vec3(0.01, 0.02, 0.05); // Darker blue night tint
                    // Even darker: 0.15 multiplier (was 0.2)
                    finalColor = mix(finalColor, desaturated, 0.9) * 0.15 + nightColor * 0.15;
                } else {
                    // UNEXPLORED WATER - COMPLETELY INVISIBLE
                    // Water in unexplored areas should not be visible at all
                    discard;
                }
                
                // Preserve alpha for water transparency
                float finalAlpha = gl_FragColor.a;
                
                gl_FragColor = vec4(finalColor, finalAlpha);
                #include <dithering_fragment>
                `
            );
            
            material.materialShader = shader;
        };
        
        return new THREE.Mesh(geometry, material);
    }

    createMesh() {
        const resolution = this.meshResolution;
        let geometry = new THREE.BoxGeometry(1, 1, 1, resolution, resolution, resolution);
        geometry.deleteAttribute('normal');
        geometry.deleteAttribute('uv');
        geometry = mergeVertices(geometry);
        
        const positions = geometry.attributes.position;
        const colors = [];
        const v3 = new THREE.Vector3();

        for (let i = 0; i < positions.count; i++) {
            v3.set(positions.getX(i), positions.getY(i), positions.getZ(i));
            v3.normalize();
            
            const heightOffset = this.terrain.getHeight(v3.x, v3.y, v3.z);
            const radius = this.terrain.params.radius + heightOffset;
            
            const newPos = v3.clone().multiplyScalar(radius);
            positions.setXYZ(i, newPos.x, newPos.y, newPos.z);

            const moisture = this.terrain.getMoisture(v3.x, v3.y, v3.z);
            const temperature = this.terrain.getTemperature(v3.x, v3.y, v3.z, heightOffset);
            const biomeColor = this.terrain.getBiomeColor(heightOffset, moisture, temperature);
            colors.push(biomeColor.r, biomeColor.g, biomeColor.b);
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: false
        });

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uFogTexture = { value: null };
            shader.uniforms.uVisibleTexture = { value: null };
            shader.uniforms.uUVScale = { value: new THREE.Vector2(1, 1) };
            shader.uniforms.uUVOffset = { value: new THREE.Vector2(0, 0) };
            shader.uniforms.uDebugMode = { value: 0 };
            shader.uniforms.uFowColor = { value: new THREE.Color(0x000000) };

            shader.fragmentShader = `
                uniform sampler2D uFogTexture;
                uniform sampler2D uVisibleTexture;
                uniform vec2 uUVScale;
                uniform vec2 uUVOffset;
                uniform int uDebugMode;
                uniform vec3 uFowColor;
            ` + shader.fragmentShader;
            
            shader.vertexShader = `
                varying vec3 vWorldPosition;
            ` + shader.vertexShader;
            
            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `
                #include <worldpos_vertex>
                vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                `
            );
            
            shader.fragmentShader = `
                varying vec3 vWorldPosition;
            ` + shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                vec3 dir = normalize(vWorldPosition); 
                float u = 0.5 + atan(dir.z, dir.x) / (2.0 * 3.14159265);
                float v = 0.5 + asin(dir.y) / 3.14159265;
                
                u = u * uUVScale.x + uUVOffset.x;
                v = v * uUVScale.y + uUVOffset.y;
                
                if (uDebugMode == 1) {
                    gl_FragColor = vec4(u, v, 0.0, 1.0);
                    return;
                }

                vec4 explored = texture2D(uFogTexture, vec2(u, v));
                vec4 visible = texture2D(uVisibleTexture, vec2(u, v));
                
                float isVisible = visible.r; 
                float isExplored = explored.r;
                
                if (uDebugMode == 2) {
                    gl_FragColor = vec4(isVisible, isExplored, 0.0, 1.0); 
                    return;
                }
                
                vec3 finalColor = gl_FragColor.rgb;
                
                if (isVisible > 0.1) {
                    // Visible - keep original water color
                } else if (isExplored > 0.1) {
                    // Explored but not visible - darker, higher contrast "memory"
                    float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
                    // Boost contrast by applying a power curve
                    gray = pow(gray, 1.5);
                    vec3 desaturated = vec3(gray);
                    vec3 nightColor = vec3(0.02, 0.04, 0.08); 
                    // Much darker: 0.2 multiplier (was 0.4), more desaturated (0.95 vs 0.8)
                    finalColor = mix(finalColor, desaturated, 0.95) * 0.2 + nightColor * 0.1;
                } else {
                    // Unexplored terrain - SOLID BLACK (stars render on top)
                    finalColor = vec3(0.0, 0.0, 0.0);
                }
                
                gl_FragColor = vec4(finalColor, 1.0);
                #include <dithering_fragment>
                `
            );
            
            material.materialShader = shader;
        };

        return new THREE.Mesh(geometry, material);
    }

    regenerate() {
        const oldMesh = this.mesh;
        const oldWater = this.waterMesh;
        
        this.mesh = this.createMesh();
        this.waterMesh = this.createWaterMesh();
        
        if (oldMesh.parent) {
            oldMesh.parent.add(this.mesh);
            oldMesh.parent.remove(oldMesh);
        }
        
        if (oldWater && oldWater.parent) {
            oldWater.parent.add(this.waterMesh);
            oldWater.parent.remove(oldWater);
        }
        
        oldMesh.geometry.dispose();
        oldMesh.material.dispose();
        
        if (oldWater) {
            oldWater.geometry.dispose();
            oldWater.material.dispose();
        }
    }
    
    createStarField(count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        
        // Place stars on terrain surface
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const dir = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            );
            
            // Get terrain height and place star just above surface
            const terrainRadius = this.terrain.getRadiusAt(dir);
            const pos = dir.clone().multiplyScalar(terrainRadius + 0.1);
            
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Custom shader material that reads FOW texture
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uFogTexture: { value: null },
                uStarSize: { value: 1.2 }
            },
            vertexShader: `
                uniform sampler2D uFogTexture;
                uniform float uStarSize;
                varying float vVisible;
                
                void main() {
                    // Calculate UV from position (spherical mapping)
                    vec3 dir = normalize(position);
                    float u = 0.5 + atan(dir.z, dir.x) / (2.0 * 3.14159265);
                    float v = 0.5 + asin(dir.y) / 3.14159265;
                    
                    // Read FOW texture - if explored, hide star
                    vec4 fog = texture2D(uFogTexture, vec2(u, v));
                    vVisible = 1.0 - fog.r; // visible if NOT explored
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = uStarSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vVisible;
                
                void main() {
                    // Hide if explored
                    if (vVisible < 0.5) discard;
                    
                    // Soft circular star
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.9);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(geometry, material);
        stars.renderOrder = 10; // Render ABOVE terrain (black) so stars show
        
        console.log(`Created ${count} terrain stars (THREE.Points, FOW-aware)`);
        return stars;
    }

    getHeightAt(position) {
        return this.terrain.getRadiusAt(position.clone().normalize());
    }
}
