
export const simulatePetMovement = (initialPosition: [number, number]) => {
  let currentPosition = [...initialPosition];

  const move = () => {
    const latChange = (Math.random() - 0.5) * 0.0001;
    const lngChange = (Math.random() - 0.5) * 0.0001;

    currentPosition[0] += latChange;
    currentPosition[1] += lngChange;

    return [...currentPosition];
  };

  return { move };
};
