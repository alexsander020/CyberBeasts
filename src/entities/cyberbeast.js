export const COLORS = {
    BLUE: '#0088ff',   // Encryption (Defense)
    GOLD: '#ffcc00',   // Priority (Fast Attack)
    PURPLE: '#ff00ff', // Glitch (Status)
    WHITE: '#ffffff',  // Standard (Physical)
    RED: '#ff3333',    // Miss (Error)
    CYAN: '#00F2FF',   // UI Neon
    PINK: '#FF0055',   // Highlight
    BG: '#020205'      // Space Black
};

export class CyberBeast {
    constructor(id, data) {
        this.uuid = id || `cb-${Math.random().toString(36).substr(2, 9)}`;
        this.name = data.name;
        this.rarity = data.rarity || 'Common';
        this.mp = data.mp || 2;
        this.wheel = data.wheel || []; // Array of {type, label, size, power, stars}
        this.hp = 1; // In this version, combat is mostly lethal based on wheel/surround
        this.owner = data.owner || 'player'; // 'player' or 'enemy'
        this.currentNode = null;
    }

    // Static helper to create from the new JSON format
    static fromJSON(json, owner) {
        return new CyberBeast(json.uuid, { ...json, owner });
    }
}

// Initial Bench Data Template
export const INITIAL_BEASTS = [
    {
        name: "Megabit Dragon",
        rarity: "EX",
        mp: 2,
        wheel: [
            { type: "white", label: "Data Claw", size: 40, power: 120 },
            { type: "purple", label: "System Crash", size: 24, stars: 3 },
            { type: "blue", label: "Protect", size: 12 },
            { type: "red", label: "Miss", size: 20 }
        ]
    },
    {
        name: "Tank-Shell",
        rarity: "R",
        mp: 1,
        wheel: [
            { type: "white", label: "Heavy Slam", size: 50, power: 140 },
            { type: "blue", label: "Hard Shield", size: 30 },
            { type: "red", label: "Miss", size: 16 }
        ]
    },
    {
        name: "Cyber-Scout",
        rarity: "UC",
        mp: 3,
        wheel: [
            { type: "gold", label: "Quick Jab", size: 30, power: 40 },
            { type: "white", label: "Dagger", size: 30, power: 60 },
            { type: "red", label: "Miss", size: 36 }
        ]
    }
];
