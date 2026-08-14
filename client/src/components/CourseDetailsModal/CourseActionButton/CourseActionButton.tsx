const ButtonBank = ({ text, colour }: { text: string; colour: string }) => {
  return (
    <button className={`${colour} p-2 text-white px-5 border rounded-xl`}>
      {text}
    </button>
  );
};

export default ButtonBank;
