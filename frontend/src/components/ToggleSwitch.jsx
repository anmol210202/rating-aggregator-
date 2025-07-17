const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-10 h-5 bg-gray-400 rounded-full shadow-inner transition-colors ${checked ? 'bg-green-500' : ''}`} />
        <div className={`dot absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  );
};
export default ToggleSwitch;
