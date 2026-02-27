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
        this.type = data.type || 'Standard';
        this.rarity = data.rarity || 'Common';
        this.mp = data.mp || 2;
        this.icon = data.icon || '👾';
        this.color = data.color || '#fff';
        this.wheel = data.wheel || [];
        this.hp = 1;
        this.owner = data.owner || 'player';
        this.currentNode = null;
        this.hasActed = false;
        this.status = 'active';
    }

    static fromJSON(json, owner) {
        return new CyberBeast(json.uuid, { ...json, owner });
    }
}

export const INITIAL_BEASTS = [
    {
        name: "Megabit Dragon",
        type: "Striker",
        rarity: "EX",
        mp: 2,
        icon: "🐉",
        color: "#ff3333",
        wheel: [
            { type: "white", label: "Data Claw", size: 36, power: 140 },
            { type: "purple", label: "System Crash", size: 28, stars: 3 },
            { type: "blue", label: "Protect", size: 16 },
            { type: "red", label: "Miss", size: 16 }
        ]
    },
    {
        name: "Tank-Shell",
        type: "Tank",
        rarity: "R",
        mp: 1,
        icon: "🛡️",
        color: "#0088ff",
        wheel: [
            { type: "white", label: "Heavy Slam", size: 40, power: 100 },
            { type: "blue", label: "Hard Shield", size: 40 },
            { type: "purple", label: "Reboot", size: 10, stars: 1 },
            { type: "red", label: "Miss", size: 6 }
        ]
    },
    {
        name: "Cyber-Scout",
        type: "Speedster",
        rarity: "UC",
        mp: 3,
        icon: "⚡",
        color: "#00ffcc",
        wheel: [
            { type: "gold", label: "Quick Jab", size: 45, power: 60 },
            { type: "white", label: "Dagger", size: 25, power: 80 },
            { type: "red", label: "Miss", size: 26 }
        ]
    }
];
