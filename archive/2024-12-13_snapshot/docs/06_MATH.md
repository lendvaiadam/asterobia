# Math & Utils Modul Dokumentáció

> **Fájlok:** SphericalMath.js, MathUtils.js
> 
> Gömb geometria és általános matematikai segédfüggvények.

---

## 📦 SphericalMath.js

Gömb felületen való mozgáshoz szükséges segédfüggvények.

```javascript
export class SphericalMath {
    /**
     * Kiszámolja az ortogonális bázist egy adott quaternionból.
     * @param {THREE.Quaternion} quaternion - Az orientáció
     * @returns {Object} { forward, right, up } - Bázis vektorok
     */
    static getBasis(quaternion) {
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);
        
        return { forward, right, up };
    }
    
    /**
     * Geodézikus távolság két pont között gömb felületen.
     * @param {THREE.Vector3} p1 - Első pont
     * @param {THREE.Vector3} p2 - Második pont
     * @param {number} radius - Gömb sugara
     * @returns {number} Ív hossz
     */
    static geodesicDistance(p1, p2, radius) {
        const n1 = p1.clone().normalize();
        const n2 = p2.clone().normalize();
        const angle = n1.angleTo(n2);
        return angle * radius;
    }
    
    /**
     * Két pont közötti nagy kör interpoláció.
     * @param {THREE.Vector3} p1 - Kezdőpont
     * @param {THREE.Vector3} p2 - Végpont
     * @param {number} t - Interpoláció (0-1)
     * @param {number} radius - Gömb sugara
     * @returns {THREE.Vector3} Interpolált pont
     */
    static slerp(p1, p2, t, radius) {
        const n1 = p1.clone().normalize();
        const n2 = p2.clone().normalize();
        
        const angle = n1.angleTo(n2);
        
        if (angle < 0.0001) return p1.clone();
        
        const sinAngle = Math.sin(angle);
        const a = Math.sin((1 - t) * angle) / sinAngle;
        const b = Math.sin(t * angle) / sinAngle;
        
        return n1.clone().multiplyScalar(a).add(n2.clone().multiplyScalar(b)).multiplyScalar(radius);
    }
    
    /**
     * Kiszámolja a forgatás quaterniont amit az egyik irányból a másikba kell alkalmazni.
     * @param {THREE.Vector3} from - Kezdő irány
     * @param {THREE.Vector3} to - Cél irány
     * @returns {THREE.Quaternion}
     */
    static rotationBetween(from, to) {
        return new THREE.Quaternion().setFromUnitVectors(
            from.clone().normalize(),
            to.clone().normalize()
        );
    }
    
    /**
     * Kiszámolja a tangent irányt egy adott pontban a gömb felületén.
     * @param {THREE.Vector3} position - Pozíció a gömb felületén
     * @param {THREE.Vector3} target - Cél pont
     * @returns {THREE.Vector3} Tangent irány
     */
    static tangentTowards(position, target) {
        const normal = position.clone().normalize();
        const toTarget = target.clone().sub(position);
        
        // Projekció a felületre
        const tangent = toTarget.clone().sub(
            normal.clone().multiplyScalar(toTarget.dot(normal))
        );
        
        return tangent.normalize();
    }
}
```

### Használat

```javascript
// Unit mozgás irányának kiszámítása
const basis = SphericalMath.getBasis(unit.headingQuaternion);
const forward = basis.forward;
const right = basis.right;

// Cél felé fordulás
const tangent = SphericalMath.tangentTowards(unit.position, target);
const dot = forward.dot(tangent);
const cross = right.dot(tangent);
if (Math.abs(cross) > 0.05) {
    turnDirection = Math.sign(cross);
}

// Két pont közötti interpoláció gömbön
const midpoint = SphericalMath.slerp(startPos, endPos, 0.5, planetRadius);
```

---

## 📦 MathUtils.js

Általános matematikai segédfüggvények.

```javascript
export class MathUtils {
    /**
     * Clamp érték min és max közé.
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    /**
     * Lineáris interpoláció.
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Smooth step (ease-in-out).
     */
    static smoothstep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }
    
    /**
     * Quintic ease-in-out.
     */
    static easeInOutQuint(t) {
        return t < 0.5
            ? 16 * t * t * t * t * t
            : 1 - Math.pow(-2 * t + 2, 5) / 2;
    }
    
    /**
     * Fok → Radián konverzió.
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * Radián → Fok konverzió.
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    /**
     * Random szám két érték között.
     */
    static randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    /**
     * Seeded random generator (determinisztikus).
     */
    static seededRandom(seed) {
        let mask = 0xffffffff;
        let m_w = (123456789 + seed) & mask;
        let m_z = (987654321 - seed) & mask;
        
        return function() {
            m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
            m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
            let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
            result /= 4294967296;
            return result;
        };
    }
}
```

### Használat

```javascript
// Easing animációhoz
const t = elapsed / duration;
const eased = MathUtils.easeInOutQuint(t);
position.lerp(targetPosition, eased);

// Smooth color transition
const blend = MathUtils.smoothstep(0, 1, progress);
color.lerpColors(colorA, colorB, blend);

// Determinisztikus random (szikla elhelyezés)
const rng = MathUtils.seededRandom(12345);
for (let i = 0; i < 100; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    // Mindig ugyanazok a pozíciók!
}
```

---

## 🔗 Easing Görbék Összefoglaló

| Függvény | Típus | Használat |
|----------|-------|-----------|
| `lerp` | Linear | Alap interpoláció |
| `smoothstep` | Cubic | UI animációk |
| `easeInOutQuint` | Power-5 | Kamera transitions |
| `easeInOutQuart` | Power-4 | Fly-to mozgás |
| `easeOut` | Exponential | Zoom damping |

---

## 📐 Gömb Geometria Fogalmak

### Normál = Pozíció irány
Gömb felületén a normál vektor = a pozícióból kifelé mutató irány.
```javascript
const normal = position.clone().normalize();
```

### Tangent sík
A gömb felszínhez érintő sík. A mozgás csak ebben a síkban történik.
```javascript
const tangentProjection = vector.clone().sub(
    normal.multiplyScalar(vector.dot(normal))
);
```

### Geodézikus út
A legrövidebb út két pont között a gömb felületén = nagy kör ív.

---

*Generálva: 2024-12-13*
