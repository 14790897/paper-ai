import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reference } from "@/utils/global";
export interface APIState {
  apiKey: string;
  referencesRedux: Reference[];
  editorContent: string;
  upsreamUrl: string;
  systemPrompt: string;
  showPaperManagement: boolean;
}

const initialState: APIState = {
  apiKey: "sk-GHuPUV6ERD8wVmmr36FeB8D809D34d93Bb857c009f6aF9Fe", //sk-ffe19ebe9fa44d00884330ff1c18cf82
  referencesRedux: [],
  editorContent: "",
  upsreamUrl: "https://one.paperai.life", //https://api.openai.com  https://one.caifree.com https://chatserver.3211000.xyz https://api.deepseek.com
  systemPrompt: `作为论文写作助手，您的主要任务是根据用户提供的研究主题和上下文，以及相关的研究论文，来撰写和完善学术论文。在撰写过程中，请注意以下要点：
          1.学术格式：请采用标准的学术论文格式进行写作，包括清晰的段落结构、逻辑严谨的论点展开，以及恰当的专业术语使用。
          2.文献引用：只引用与主题紧密相关的论文。在引用文献时，文末应使用方括号内的数字来标注引用来源，如 [1]。。请确保每个引用在文章中都有其对应的编号，*无需在文章末尾提供参考文献列表*。*每个文献对应的序号只应该出现一次，比如说引用了第一篇文献文中就只能出现一次[1]*。
          3.忽略无关文献：对于与主题无关的论文，请不要包含在您的写作中。只关注对理解和阐述主题有实质性帮助的资料。
          4.来源明确：在文章中，清楚地指出每个引用的具体来源。引用的信息应准确无误，确保读者能够追溯到原始文献。
          5.使用用户所说的语言完成回答，不超过五百字
          6.只能对给出的文献进行引用，坚决不能虚构文献。
          返回格式举例：
          在某个方面，某论文实现了以下突破...[1],在另一篇论文中，研究了...[2]`,
  showPaperManagement: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setShowPaperManagement: (state, action: PayloadAction<boolean>) => {
      state.showPaperManagement = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    setUpsreamUrl: (state, action: PayloadAction<string>) => {
      state.upsreamUrl = action.payload;
    },
    setSystemPrompt: (state, action: PayloadAction<string>) => {
      state.systemPrompt = action.payload;
    },
    setEditorContent: (state, action: PayloadAction<string>) => {
      state.editorContent = action.payload;
    },
    addReferenceRedux: (state, action: PayloadAction<Reference>) => {
      state.referencesRedux.push(action.payload);
    },
    addReferencesRedux: (
      state,
      action: PayloadAction<{ references: Reference[]; position?: number }>
    ) => {
      const { references, position } = action.payload;
      const insertPosition =
        position !== undefined ? position : state.referencesRedux.length;
      state.referencesRedux.splice(insertPosition, 0, ...references);
    },
    removeReferenceRedux: (state, action: PayloadAction<number>) => {
      state.referencesRedux = state.referencesRedux.filter(
        (_, i) => i !== action.payload
      );
    },
    clearReferencesRedux: (state) => {
      state.referencesRedux = [];
    },
    setReferencesRedux: (state, action: PayloadAction<Reference[]>) => {
      state.referencesRedux = action.payload;
    },
    swapReferencesRedux: (
      state,
      action: PayloadAction<{ indexA: number; indexB: number }>
    ) => {
      console.log("moveReference", state.referencesRedux); // 调试输出

      const { indexA, indexB } = action.payload;
      if (
        indexA >= 0 &&
        indexA < state.referencesRedux.length &&
        indexB >= 0 &&
        indexB < state.referencesRedux.length
      ) {
        const newReferences = [...state.referencesRedux];
        const temp = newReferences[indexA];
        newReferences[indexA] = newReferences[indexB];
        newReferences[indexB] = temp;
        state.referencesRedux = newReferences;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setShowPaperManagement,
  setApiKey,
  setUpsreamUrl,
  addReferenceRedux,
  addReferencesRedux,
  removeReferenceRedux,
  clearReferencesRedux,
  setEditorContent,
  setReferencesRedux,
  setSystemPrompt,
  swapReferencesRedux,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
