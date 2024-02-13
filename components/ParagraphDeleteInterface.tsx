import { faL } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Swal from "sweetalert2";

// 定义Props类型
interface SweetAlertComponentProps {
  index: number;
  removeReferenceUpdateIndex: (index: number, rmPg: boolean) => void;
}

const ParagraphDeleteButton: React.FC<any> = ({
  index,
  removeReferenceUpdateIndex,
  isRemovePaper = false,
  title = "需要同时删除与文献相关的整个段落吗？",
  text = "根据周围的换行符来判断是否是同一个段落",
}) => {
  //这里传递函数的时候应该把参数先提前弄好 2.7
  const showAlert = async () => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });
    if (result.isConfirmed) {
      if (isRemovePaper) {
        removeReferenceUpdateIndex(index, true);
      } else {
        removeReferenceUpdateIndex();
      }
      // Swal.fire("Deleted!", "Your file has been deleted.", "success");
    } else {
      if (isRemovePaper) removeReferenceUpdateIndex(index, false);
      // Swal.fire("Cancelled", "Your imaginary file is safe :)", "error");
    }
  };

  return (
    <button
      className="text-red-500 hover:text-red-700 ml-4"
      onClick={showAlert} // 直接使用showAlert而不传递参数
    >
      X
    </button>
  );
};

export default ParagraphDeleteButton;
