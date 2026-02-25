export class CyberBeast {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type; // Striker, Tank, etc.
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.mov = stats.mov;
        this.wheel = stats.wheel; // Probabilities
        this.position = { r: 0, c: 0 };
        this.isOverclocked = false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.handleDeath();
        }
    }

    handleDeath() {
        console.log(`${this.name} DELETADO.`);
        // Placeholder for Dissolve effect logic
    }
}

export const CLASS_STATS = {
    Striker: { hp: 100, mov: 2, wheel: { attack: 0.6, miss: 0.2, skill: 0.1, evol: 0.1 } },
    Tank: { hp: 160, mov: 1, wheel: { attack: 0.3, guard: 0.4, miss: 0.2, evol: 0.1 } },
    Support: { hp: 90, mov: 2, wheel: { heal: 0.3, guard: 0.3, buff: 0.2, miss: 0.2 } },
    Speedster: { hp: 80, mov: 3, wheel: { attack: 0.4, dodge: 0.3, miss: 0.2, evol: 0.1 } },
    Controller: { hp: 110, mov: 2, wheel: { debuff: 0.4, attack: 0.3, miss: 0.2, skill: 0.1 } }
};
