import { ja } from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useTheme } from "../modules/theme/theme.state";

interface Props {
  onChange: (value: string) => void;
  initialContent?: string | null;
}

export function Editor({ onChange, initialContent }: Props) {
  const editor = useCreateBlockNote({
    dictionary: ja,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
  });
  const { theme } = useTheme();

  return (
    <div>
      <BlockNoteView
        editor={editor}
        // 指定しないと OS の設定に従ってしまうので、アプリのテーマを渡す
        theme={theme}
        onChange={() => onChange(JSON.stringify(editor.document))}
      />
    </div>
  );
}
