import { create } from "zustand";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import useFile from "./useFile";

interface JsonActions {
  setJson: (json: string) => void;
  getJson: () => string;
  clear: () => void;
  syncFromFile: () => void;
}

const useJson = create<{
  json: string;
  loading: boolean;
} & JsonActions>()((set, get) => ({
  json: useFile.getState().contents || "{}", // initialize from Monaco editor
  loading: false,

  getJson: () => get().json,

  setJson: json => {
    set({ json, loading: false });

    useGraph.getState().setGraph(json);

    useFile.getState().setContents({ contents: json, skipUpdate: true });
  },

  syncFromFile: () => {
    const contents = useFile.getState().contents;
    if (contents && contents !== get().json) {
      set({ json: contents });
      useGraph.getState().setGraph(contents);
    }
  },

  clear: () => {
    set({ json: "{}", loading: false });
    useGraph.getState().clearGraph();
    useFile.getState().setContents({ contents: "{}", skipUpdate: true });
  },
}));

export default useJson;


if (typeof window !== "undefined") {
  (window as any).__JSONCRACK__ = (window as any).__JSONCRACK__ || {};
  (window as any).__JSONCRACK__.stores = (window as any).__JSONCRACK__.stores || {};
  (window as any).__JSONCRACK__.stores.useJson = useJson;
}
