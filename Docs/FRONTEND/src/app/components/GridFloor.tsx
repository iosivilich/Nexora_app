export function GridFloor() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(37, 99, 235, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(37, 99, 235, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center center',
        }}
      />
      
      {/* Glow Effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Secondary Purple Glow */}
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #6D5EF3 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
