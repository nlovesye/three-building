import type { FC } from 'react';
import { memo, useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Editor from '@/Editor';
import Temp from '@/example/Temp';

import styles from './index.less';

const Home: FC = memo(() => {
  const [editor, setEditor] = useState<Editor>();

  const containRefCallback = useCallback((container: HTMLDivElement) => {
    if (container) {
      setEditor(new Editor(container));
    }
  }, []);

  // 退出销毁
  useEffect(
    () => () => {
      editor?.destroy();
    },
    [editor],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container} ref={containRefCallback} />
      {editor && <Temp editor={editor} />}
    </DndProvider>
  );
});

export default Home;
