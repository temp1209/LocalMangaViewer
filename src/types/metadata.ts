export type Metadatas = MetadataItem[];

export type MetadataItem = {
  title: string;
  authors: string[];
  groups: string[];
  originals: string[];
  characters: string[];
  tags: string[];
  id: string;
  cover?:{
    path:string;
    isPortrait:boolean;
  };
};

export type SearchableKeys = "authors" | "groups" | "originals" | "characters" | "tags";
