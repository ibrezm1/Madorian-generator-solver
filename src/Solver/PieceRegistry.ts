type PieceDefinition = {
    width: number,
    height: number,
    color: String
};

const PieceRegistry:PieceDefinition[] = [
    {width: 4, height: 3, color: '#FF0'},
    {width: 3, height: 3, color: '#FFF'},
    {width: 5, height: 2, color: '#F00'},
    {width: 4, height: 2, color: '#C33'},
    {width: 3, height: 2, color: '#600'},
    {width: 2, height: 2, color: '#DDD'},
    {width: 5, height: 1, color: '#00F'},
    {width: 4, height: 1, color: '#00C'}
];

export default PieceRegistry;