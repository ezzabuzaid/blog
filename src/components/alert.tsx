export function Alert(props: { title: string; content: string }) {
  return (
    <>
      <div
        className="bg-blue-200  border-2 border-black px-4 py-2 relative rounded shadow-xl"
        role="alert"
      >
        <h5 className="text-lg mt-2">{props.title}</h5>
        <p className="text-sm text-gray-800 mt-2">{props.content}</p>
      </div>
    </>
  );
}
