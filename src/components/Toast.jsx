export default function Toast({ type, message, onClose, onUndo }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <span>{message}</span>

      {type === "undo" && (
        <button
          onClick={onUndo}
          className="text-indigo-400 hover:underline"
        >
          Undo
        </button>
      )}

      <button onClick={onClose}>✕</button>
    </div>
  );
}
