export type Level = {
    name: string;
    difficulty: string;
    blocked: { x: number; y: number }[];
};

export const Levels: Level[] = [
    {
        name: "Level 1: Beginner",
        difficulty: "Beginner",
        blocked: [{x: 7, y: 0}, {x: 7, y: 1}, {x: 7, y: 2}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}]
    },
    {
        name: "Level 2: Easy",
        difficulty: "Easy",
        blocked: [{x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}, {x: 5, y: 7}, {x: 6, y: 7}, {x: 7, y: 7}]
    },
    {
        name: "Level 3: Medium",
        difficulty: "Medium",
        blocked: [{x: 5, y: 3}, {x: 6, y: 3}, {x: 4, y: 5}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 5, y: 7}]
    },
    {
        name: "Level 4: Hard",
        difficulty: "Hard",
        blocked: [{x: 7, y: 0}, {x: 7, y: 1}, {x: 7, y: 2}, {x: 4, y: 6}, {x: 7, y: 6}, {x: 7, y: 7}]
    },
    {
        name: "Level 5: Expert",
        difficulty: "Expert",
        blocked: [{x: 5, y: 3}, {x: 6, y: 3}, {x: 4, y: 5}, {x: 4, y: 6}, {x: 7, y: 6}, {x: 7, y: 7}]
    }
];

export default Levels;
