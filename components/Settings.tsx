// Settings.tsx
import { useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { setApiKey } from "@/app/store/slices/authSlice";

const Settings = () => {
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector((state: any) => state.auth.apiKey);
  console.log(apiKey);

  // const handleSubmit = (event: FormEvent) => {
  //   event.preventDefault();
  //   // 在这里，你可以将apiKey保存到你想要的地方，例如发送到服务器，或保存到localStorage
  //   dispatch(setApiKey(apiKey));

  //   console.log(apiKey);
  // };

  return (
    <div>
      {/* <form onSubmit={handleSubmit}> */}
      <label>
        API Key:
        <input
          type="text"
          value={apiKey}
          onChange={(event) => dispatch(setApiKey(event.target.value))}
        />
      </label>
      {/* <button type="submit">Save</button>
      </form> */}
    </div>
  );
};

export default Settings;
