export type JournalInfo = {
  name: string;
  pages: string;
  volume: string;
};

export type Reference = {
    title: string;
    author: string;
    year: number;
    url: string;
    venue?: string;
    journal?: JournalInfo;
  };