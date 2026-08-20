const ButtonBank = ({
  text,
  colour,
  action,
}: {
  text: string;
  colour: string;
  action: () => void;
}) => {
  return (
    <button
      onClick={action}
      className={`${colour} p-2 text-white px-5 border rounded-xl`}
    >
      {text}
    </button>
  );
};

export default ButtonBank;
