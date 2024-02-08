"use client";

import { useCallback, useState, useEffect } from "react";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  setEditorContent,
  setReferencesRedux,
} from "@/app/store/slices/authSlice";
import {
  setPaperNumberRedux,
  setContentUpdatedFromNetwork,
} from "@/app/store/slices/stateSlice";
//supabase
import { createClient } from "@/utils/supabase/client";
import {
  getUser,
  getUserPaperNumbers,
  getUserPaper,
  submitPaper,
  deletePaper,
} from "@/utils/supabase/supabaseutils";
//动画
import { CSSTransition } from "react-transition-group";
//删除远程论文按钮
import ParagraphDeleteButton from "@/components/ParagraphDeleteInterface";

const PaperManagement = () => {
  //supabase
  const supabase = createClient();
  //redux
  const dispatch = useAppDispatch();
  const paperNumberRedux = useAppSelector(
    (state) => state.state.paperNumberRedux
  );
  const showPaperManagement = useAppSelector(
    (state) => state.state.showPaperManagement
  );
  //状态
  const [paperNumbers, setPaperNumbers] = useState<string[]>([]);
  //user id的状态设置
  const [userId, setUserId] = useState<string>("");

  //获取用户存储在云端的论文
  // 使用useCallback定义一个记忆化的函数来获取用户论文
  const fetchPapers = useCallback(async () => {
    const user = await getUser(supabase);
    if (user && user.id) {
      const numbers = await getUserPaperNumbers(user.id);
      setPaperNumbers(numbers || []); // 直接在这里更新状态
      setUserId(user.id);
    }
  }, [supabase]); // 依赖项数组中包含supabase，因为它可能会影响到fetchPapers函数的结果

  // 使用useEffect在组件挂载后立即获取数据
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handlePaperClick = async (paperNumber: string) => {
    const data = await getUserPaper(userId, paperNumber); // 假设这个函数异步获取论文内容
    if (!data) {
      throw new Error("查询出错");
    }
    console.log("paperNumber", paperNumber);
    // 更新状态以反映选中的论文内容
    dispatch(setEditorContent(data.paper_content)); // 更新 Redux store
    dispatch(setReferencesRedux(JSON.parse(data.paper_reference))); // 清空引用列表
    dispatch(setPaperNumberRedux(paperNumber)); // 更新当前论文编号
    //从网络请求中更新editorContent时，同时设置contentUpdatedFromNetwork为true
    dispatch(setContentUpdatedFromNetwork(true)); // 更新 Redux store
  };

  const handleAddPaperClick = async () => {
    // 添加一个新的空白论文
    await submitPaper(
      supabase,
      "This is a blank page",
      [],
      String(Math.max(...paperNumbers.map(Number)) + 1)
    );
    // 重新获取论文列表
    await fetchPapers();
  };

  const noop = (...args: any) => {};

  return (
    <CSSTransition
      in={showPaperManagement}
      timeout={2000}
      classNames="slide"
      unmountOnExit
    >
      <>
        <div className="paper-management-container flex flex-col items-center space-y-4">
          <div className="max-w-md w-full bg-blue-gray-100 rounded overflow-hidden shadow-lg mx-auto p-5">
            <h1 className="font-bold text-3xl text-center">Paper Management</h1>
          </div>
          <button
            onClick={handleAddPaperClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + Add Paper
          </button>
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-xl font-semibold">Your Papers</h2>
            {paperNumbers.length > 0 ? (
              <ul className="list-disc">
                {[...paperNumbers]
                  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                  .map((number, index) => (
                    <li
                      key={index}
                      className={`bg-white w-full max-w-md mx-auto rounded shadow p-4 cursor-pointer ${
                        number === paperNumberRedux ? "bg-yellow-200" : ""
                      }`}
                      onClick={() => handlePaperClick(number)}
                    >
                      <span>Paper {number}</span>
                      <ParagraphDeleteButton
                        index={index}
                        removeReferenceUpdateIndex={async () => {
                          await deletePaper(supabase, userId, number);
                          const numbers = await getUserPaperNumbers(
                            userId,
                            supabase
                          );
                          setPaperNumbers(numbers || []); // 直接在这里更新状态
                        }}
                        isRemovePaper={true}
                        title="Do you want to delete this paper?"
                        text="This action cannot be undone"
                      ></ParagraphDeleteButton>
                      {/* <input
                      type="text"
                      value={paper.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      placeholder="Enter paper title"
                      className="mt-2 p-2 border rounded"
                    /> */}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No papers found.</p>
            )}
          </div>
        </div>
      </>
    </CSSTransition>
  );
};

export default PaperManagement;
