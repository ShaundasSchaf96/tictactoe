function Tile({ className, value, onClick, playerTurn }) {
  return (
    <div onClick={onClick} className={`tile ${className}`}>
      {/* Render the value (X or O) that was placed */}
      {value}
    </div>
  );
}

export default Tile;