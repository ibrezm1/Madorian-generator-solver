type PieceDefinition = {
    width: number,
    height: number,
    color: string,
    gradientClass: string
};

const PieceRegistry:PieceDefinition[] = [
    {width: 4, height: 3, color: '#eab308', gradientClass: 'from-yellow-400 to-yellow-600 bg-yellow-500'},
    {width: 3, height: 3, color: '#f8fafc', gradientClass: 'from-slate-50 to-slate-200 bg-slate-100 border border-slate-300'},
    {width: 5, height: 2, color: '#ef4444', gradientClass: 'from-red-500 to-red-650 bg-red-650'},
    {width: 4, height: 2, color: '#f97316', gradientClass: 'from-orange-500 to-orange-600 bg-orange-500'},
    {width: 3, height: 2, color: '#7f1d1d', gradientClass: 'from-red-800 to-red-950 bg-red-900'},
    {width: 2, height: 2, color: '#94a3b8', gradientClass: 'from-slate-400 to-slate-500 bg-slate-450'},
    {width: 5, height: 1, color: '#3b82f6', gradientClass: 'from-blue-500 to-blue-600 bg-blue-500'},
    {width: 4, height: 1, color: '#1d4ed8', gradientClass: 'from-blue-700 to-blue-900 bg-blue-800'}
];

export default PieceRegistry;