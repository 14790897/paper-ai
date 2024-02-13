import { string } from "slate";

export type JournalInfo = {
  name: string;
  pages: string;
  volume: string;
};

export type Reference = {
  title: string;
  author: string;
  year: number | string;
  url: string;
  venue?: string;
  journal?: JournalInfo;
  journalReference?: string;
};

export interface IndexProps {
  params: {
    lng: string;
  };
}
