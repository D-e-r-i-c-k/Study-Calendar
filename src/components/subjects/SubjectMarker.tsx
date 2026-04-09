// Support for dynamic tailwind classes and custom Hexadecimal strings
export default function SubjectMarker({ color }: { color: string }) {
  const isHex = color?.startsWith("#");

  return (
    <span 
      className={`inline-block w-2.5 h-2.5 ${isHex ? "" : color}`} 
      style={isHex ? { backgroundColor: color } : {}}
    />
  );
}
