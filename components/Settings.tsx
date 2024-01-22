// Settings.tsx
import { useAppDispatch, useAppSelector } from "@/app/store";
import { setApiKey } from "@/app/store/slices/authSlice";

const Settings = () => {
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((state) => state.auth.apiKey);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="api-key"
        >
          API Key:
        </label>
        <input
          id="api-key"
          type="text"
          value={apiKey}
          onChange={(event) => dispatch(setApiKey(event.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
    </div>
  );
};

export default Settings;
