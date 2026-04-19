//这里是settings页面
import SettingsWrapper from "@/components/SettingsWrapper";
//i18n
import { IndexProps } from "@/utils/global";

export default async function settings(props: IndexProps) {
  const params = await props.params;

  const {
    lng
  } = params;

  return (
    <div className="h-screen w-full ">
      <SettingsWrapper lng={lng} />
    </div>
  );
}
