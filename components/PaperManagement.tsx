"use client";

import { useCallback, useState, useRef, useEffect } from "react";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  setEditorContent,
  setReferencesRedux,
} from "@/app/store/slices/authSlice";
import {
  setPaperNumberRedux,
  setContentUpdatedFromNetwork,
  setIsVip,
  setShowPaperManagement,
} from "@/app/store/slices/stateSlice";
//supabase
import { createClient } from "@/utils/supabase/client";
import {
  getUser,
  getUserPaperNumbers,
  getUserPaper,
  submitPaper,
  deletePaper,
  fetchUserVipStatus,
} from "@/utils/supabase/supabaseutils";
//动画
import { CSSTransition } from "react-transition-group";
// import { animated, useSpring } from "@react-spring/web";

//删除远程论文按钮
import ParagraphDeleteButton from "@/components/ParagraphDeleteInterface";
//vip充值按钮
import BuyVipButton from "@/components/BuyVipButton"; // 假设这是购买VIP的按钮组件
//i18n
import { useTranslation } from "@/app/i18n/client";

const PaperManagement = ({ lng }) => {
  //i18n
  const { t } = useTranslation(lng);
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
  const editorContent = useAppSelector((state) => state.auth.editorContent);
  const referencesRedux = useAppSelector((state) => state.auth.referencesRedux);
  //vip状态
  const isVip = useAppSelector((state) => state.state.isVip);
  //获取的论文数量列表状态
  const [paperNumbers, setPaperNumbers] = useState<string[]>([]);
  //user id的状态设置
  const [userId, setUserId] = useState<string>("");

  //获取用户存储在云端的论文，使用useCallback定义一个记忆化的函数来获取用户论文
  const fetchPapers = useCallback(async () => {
    const user = await getUser();
    if (user && user.id) {
      // console.log("user.id", user.id);
      const numbers = await getUserPaperNumbers(user.id, supabase);
      setPaperNumbers(numbers || []); // 直接在这里更新状态
      setUserId(user.id);
    }
  }, [supabase]); // 依赖项数组中包含supabase，因为它可能会影响到fetchPapers函数的结果

  //获取用户VIP状态
  const initFetchVipStatue = useCallback(async () => {
    const user = await getUser();
    if (user && user.id) {
      const isVip = await fetchUserVipStatus(user.id);
      return isVip;
    }
  }, [supabase]);

  // 使用useEffect在组件挂载后立即获取数据
  useEffect(() => {
    const checkAndFetchPapers = async () => {
      const isVip = await initFetchVipStatue();
      dispatch(setIsVip(isVip));
      console.log("isVip in initFetchVipStatue", isVip);
      if (isVip) {
        fetchPapers();
      }
    };
    checkAndFetchPapers();
  }, [supabase]);

  const handlePaperClick = async (paperNumber: string) => {
    const data = await getUserPaper(userId, paperNumber, supabase); // 假设这个函数异步获取论文内容
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

  function getNextPaperNumber(paperNumbers: string[]) {
    if (paperNumbers.length === 0) {
      return "1";
    } else {
      return String(Math.max(...paperNumbers.map(Number)) + 1);
    }
  }

  const handleAddPaperClick = async () => {
    // 先手动保存本地内容到云端
    // await submitPaper(
    //   supabase,
    //   editorContent,
    //   referencesRedux,
    //   paperNumberRedux
    // );
    // 添加一个新的空白论文
    await submitPaper(
      supabase,
      "This is a blank page",
      [],
      getNextPaperNumber(paperNumbers)
    );
    // 重新获取论文列表
    await fetchPapers();
  };

  // const animations = useSpring({
  //   opacity: showPaperManagement ? 1 : 0,
  //   from: { opacity: 0 },
  // });

  //用于判断点击有没有落在区域中
  const paperManagementRef = useRef(null); // 用于引用PaperManagement组件的根元素
  const handleClickOutside = (event) => {
    if (
      paperManagementRef.current &&
      !paperManagementRef.current.contains(event.target) &&
      showPaperManagement
    ) {
      // 如果点击事件的目标不是PaperManagement组件内的元素
      // 隐藏组件
      console.log("Clicked outside of the PaperManagement component.");
      dispatch(setShowPaperManagement());
    }
  };

  useEffect(() => {
    if (showPaperManagement) {
      // 只有当组件可见时，才添加事件监听器
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 组件卸载或状态改变时移除事件监听器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPaperManagement]); // 依赖项数组包含showPaperManagement状态

  return (
    <CSSTransition
      in={showPaperManagement}
      timeout={2000}
      classNames="slide"
      unmountOnExit
    >
      {/* showPaperManagement ? ( */}
      {/* <animated.div style={animations}> */}
      <>
        <div
          ref={paperManagementRef}
          className="paper-management-container flex flex-col items-center space-y-4"
        >
          <div className="max-w-md w-full bg-blue-gray-100 rounded overflow-hidden shadow-lg mx-auto p-5">
            <h1 className="font-bold text-3xl text-center">
              {" "}
              {t("Paper Management")}
            </h1>
          </div>
          {isVip ? (
            <div>
              <button
                onClick={handleAddPaperClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {t("+ Add Paper")}
              </button>
              <div className="flex flex-col items-center space-y-2">
                <h2 className="text-xl font-semibold">
                  {" "}
                  {t("Your Cloud Papers")}
                </h2>
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
          ) : (
            <BuyVipButton lng={lng} />
          )}
        </div>
      </>
      {/* </animated.div>
    ) : null */}
    </CSSTransition>
  );
};

export default PaperManagement;
