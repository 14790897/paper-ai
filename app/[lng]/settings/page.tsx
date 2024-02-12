//这里是settings页面
import SettingsWrapper from "@/components/SettingsWrapper";
//i18n
import { IndexProps } from "@/utils/global";

export default function settings({ params: { lng } }: IndexProps) {
  return (
    <div className="h-screen w-full ">
      <SettingsWrapper lng={lng} />
    </div>
  );
}
