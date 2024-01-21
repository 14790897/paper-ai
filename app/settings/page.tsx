import SettingsWrapper from "../SettingsWrapper";

export default function settings() {
  return (
    <div className="h-screen w-full flex">
      <div className="m-auto">
        <h1 className="font-bold text-3xl">settings</h1>
        <br />
        <SettingsWrapper />
      </div>
    </div>
  );
}